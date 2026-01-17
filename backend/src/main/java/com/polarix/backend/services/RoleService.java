package com.polarix.backend.services;

import com.polarix.backend.configurations.KeycloakAdminClientConfig;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RolesResource;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.authorization.*;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RoleService {

    private final Keycloak keycloak;
    private final KeycloakAdminClientConfig keycloakConfig;
    private String internalClientId; // Cache

    public RoleService(Keycloak keycloak, KeycloakAdminClientConfig keycloakConfig) {
        this.keycloak = keycloak;
        this.keycloakConfig = keycloakConfig;
    }

    public void createRole(String roleName, String description) {
        RolesResource rolesResource = keycloak.realm(keycloakConfig.getRealm()).roles();

        RoleRepresentation newRole = new RoleRepresentation();
        newRole.setName(roleName);
        newRole.setDescription(description);

        rolesResource.create(newRole);
    }

    public List<RoleRepresentation> getAllRoles() {
        return keycloak.realm(keycloakConfig.getRealm()).roles().list();
    }

    public Map<String, List<String>> getRolePermissions(String roleName) {
        var realm = keycloak.realm(keycloakConfig.getRealm());
        var authorizationResource = realm.clients().get(getInternalClientId()).authorization();

        // 1. Get all scope permissions
        List<ScopePermissionRepresentation> permissions = authorizationResource.permissions().scope().findAll(null,
                null, null, -1, -1);

        Map<String, List<String>> rolePermissions = new HashMap<>();

        for (ScopePermissionRepresentation permission : permissions) {
            // Check if this permission is named after our convention:
            // "{roleName}-{moduleName}-permission"
            if (permission.getName().startsWith(roleName + "-") && permission.getName().endsWith("-permission")) {
                // Extract module name from name: "{roleName}-{moduleName}-permission"
                String moduleName = permission.getName()
                        .substring(roleName.length() + 1, permission.getName().length() - "-permission".length());

                // Get scope names from IDs
                List<String> actions = permission.getScopes().stream()
                        .map(scopeId -> authorizationResource.scopes().scope(scopeId).toRepresentation().getName())
                        .collect(Collectors.toList());

                rolePermissions.put(moduleName, actions);
            }
        }

        return rolePermissions;
    }

    public void assignPermissionsToRole(String roleName, String moduleName, List<String> actions) {
        var realm = keycloak.realm(keycloakConfig.getRealm());
        var authorizationResource = realm.clients().get(getInternalClientId()).authorization();

        // 1. Find the role
        RoleRepresentation role = realm.roles().get(roleName).toRepresentation();

        // 2. Find the resource (module)
        ResourceRepresentation resource = authorizationResource.resources().findByName(moduleName).stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Module not found: " + moduleName));

        // 3. Find the scopes (actions) and safely collect their IDs
        Set<String> scopeIds = actions.stream()
                .map(action -> authorizationResource.scopes().findByName(action))
                .filter(Objects::nonNull) // FIX: This prevents NullPointerException
                .map(ScopeRepresentation::getId)
                .collect(Collectors.toSet());

        if (scopeIds.isEmpty()) {
            // Optional: You might want to throw an error if no valid actions were found
            // For now, we'll just return without creating an empty permission.
            return;
        }

        // 4. Create a Policy for this role
        RolePolicyRepresentation policy = new RolePolicyRepresentation();
        policy.setName(String.format("%s-%s-policy", roleName, moduleName));
        policy.addRole(role.getName());

        var createdPolicy = authorizationResource.policies().role().create(policy)
                .readEntity(RolePolicyRepresentation.class);

        // 5. Create a Permission linking the policy, resource, and scope IDs
        ScopePermissionRepresentation permission = new ScopePermissionRepresentation();
        permission.setName(String.format("%s-%s-permission", roleName, moduleName));
        permission.addResource(resource.getId());
        permission.addPolicy(createdPolicy.getId());
        permission.setScopes(scopeIds); // CLEANER: Set all scope IDs at once

        authorizationResource.permissions().scope().create(permission);
    }

    private String getInternalClientId() {
        if (this.internalClientId == null) {
            this.internalClientId = keycloak.realm(keycloakConfig.getRealm())
                    .clients()
                    .findByClientId(keycloakConfig.getClientId())
                    .get(0)
                    .getId();
        }
        return this.internalClientId;
    }
}