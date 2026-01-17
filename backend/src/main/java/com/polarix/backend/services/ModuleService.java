package com.polarix.backend.services;

import com.polarix.backend.configurations.KeycloakAdminClientConfig;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.AuthorizationResource;
import org.keycloak.representations.idm.authorization.ResourceRepresentation;
import org.keycloak.representations.idm.authorization.ScopeRepresentation;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ModuleService {

    private final Keycloak keycloak;
    private final KeycloakAdminClientConfig keycloakConfig;
    private String internalClientId; // Cache for the client's internal ID

    public ModuleService(Keycloak keycloak, KeycloakAdminClientConfig keycloakConfig) {
        this.keycloak = keycloak;
        this.keycloakConfig = keycloakConfig;
    }

    public ResourceRepresentation createModule(String moduleName, String displayName, List<String> scopeNames) {
        var authorizationResource = getAuthorizationResource();
        var resourcesResource = authorizationResource.resources();

        ResourceRepresentation newResource = new ResourceRepresentation();
        newResource.setName(moduleName);
        newResource.setDisplayName(displayName != null && !displayName.isBlank() ? displayName : moduleName);

        if (scopeNames != null && !scopeNames.isEmpty()) {
            Set<ScopeRepresentation> scopes = scopeNames.stream()
                .map(scopeName -> authorizationResource.scopes().findByName(scopeName))
                .filter(scope -> scope != null)
                .collect(Collectors.toSet());
            newResource.setScopes(scopes);
        }
        
        try (var response = resourcesResource.create(newResource)) {
            return resourcesResource.findByName(moduleName).get(0);
        }
    }

    public void updateModuleScopes(String moduleName, List<String> scopeNames) {
        var authorizationResource = getAuthorizationResource();
        var resourcesResource = authorizationResource.resources();

        ResourceRepresentation resourceToUpdate = resourcesResource.findByName(moduleName).stream().findFirst()
            .orElseThrow(() -> new RuntimeException("Module not found: " + moduleName));

        Set<ScopeRepresentation> scopes = scopeNames.stream()
            .map(scopeName -> authorizationResource.scopes().findByName(scopeName))
            .filter(scope -> scope != null)
            .collect(Collectors.toSet());
        
        resourceToUpdate.setScopes(scopes);
        resourcesResource.resource(resourceToUpdate.getId()).update(resourceToUpdate);
    }

    public List<ResourceRepresentation> getAllModules() {
        return getAuthorizationResource().resources().resources();
    }

    public Optional<ResourceRepresentation> getModuleByName(String moduleName) {
        return getAuthorizationResource().resources().findByName(moduleName).stream().findFirst();
    }
    
    private AuthorizationResource getAuthorizationResource() {
        return keycloak.realm(keycloakConfig.getRealm()).clients().get(getInternalClientId()).authorization();
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