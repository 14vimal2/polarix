package com.polarix.backend.services;

import com.polarix.backend.configurations.KeycloakAdminClientConfig;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.AuthorizationResource;
import org.keycloak.representations.idm.authorization.ScopeRepresentation;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ScopeService {

    private final Keycloak keycloak;
    private final KeycloakAdminClientConfig keycloakConfig;
    private String internalClientId; // Cache

    public ScopeService(Keycloak keycloak, KeycloakAdminClientConfig keycloakConfig) {
        this.keycloak = keycloak;
        this.keycloakConfig = keycloakConfig;
    }

    public ScopeRepresentation createScope(String scopeName, String displayName) {
        AuthorizationResource authorizationResource = getAuthorizationResource();
        
        ScopeRepresentation newScope = new ScopeRepresentation();
        newScope.setName(scopeName);
        newScope.setDisplayName(displayName);

        // The create method returns a JAX-RS Response, so we handle it to get the created object
        try (var response = authorizationResource.scopes().create(newScope)) {
            // After creation, we find the scope by name to return its representation
            return authorizationResource.scopes().findByName(scopeName);
        }
    }
    
    public List<ScopeRepresentation> getAllScopes() {
        return getAuthorizationResource().scopes().scopes();
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