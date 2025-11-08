package com.polarix.backend.services;

import com.polarix.backend.configurations.KeycloakAdminClientConfig;
import jakarta.ws.rs.core.Response;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class KeycloakUserService {
    private final Keycloak keycloak;
    private final KeycloakAdminClientConfig config;

    public KeycloakUserService(Keycloak keycloak, KeycloakAdminClientConfig config) {
        this.keycloak = keycloak;
        this.config = config;
    }

    private RealmResource getRealm() {
        return keycloak.realm(config.getRealm());
    }

    private UsersResource getUsersResource() {
        return getRealm().users();
    }

    // Get all users
    public List<UserRepresentation> getAllUsers() {
        return getUsersResource().list();
    }

    // Get paginated users
    public List<UserRepresentation> getUsersPaginated(int firstResult, int maxResults) {
        return getUsersResource().list(firstResult, maxResults);
    }

    // Search users
    public List<UserRepresentation> searchUsers(String search) {
        return getUsersResource().search(search);
    }

    // Search users with pagination
    public List<UserRepresentation> searchUsersPaginated(String search, int firstResult, int maxResults) {
        return getUsersResource().search(search, firstResult, maxResults);
    }

    // Search by username
    public List<UserRepresentation> searchByUsername(String username) {
        return getUsersResource().searchByUsername(username, true);
    }

    // Search by email
    public List<UserRepresentation> searchByEmail(String email) {
        return getUsersResource().searchByEmail(email, true);
    }

    // Get user by ID
    public UserRepresentation getUserById(String userId) {
        return getUsersResource().get(userId).toRepresentation();
    }

    // Get user resource by ID
    public UserResource getUserResourceById(String userId) {
        return getUsersResource().get(userId);
    }

    // Create user
    public Response createUser(UserRepresentation user) {
        return getUsersResource().create(user);
    }

    // Create user with password
    public String createUserWithPassword(String username, String email, String firstName,
                                         String lastName, String password) {
        UserRepresentation user = new UserRepresentation();
        user.setUsername(username);
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEnabled(true);
        user.setEmailVerified(false);

        CredentialRepresentation credential = new CredentialRepresentation();
        credential.setType(CredentialRepresentation.PASSWORD);
        credential.setValue(password);
        credential.setTemporary(false);
        user.setCredentials(Arrays.asList(credential));

        try (Response response = getUsersResource().create(user)) {
            if (response.getStatus() == 201) {
                // Extract user ID from location header
                String location = response.getLocation().getPath();
                String userId = location.substring(location.lastIndexOf('/') + 1);
                log.info("User created successfully in Keycloak with ID: {}", userId);
                return userId;
            } else {
                String errorMessage = "Failed to create user in Keycloak. Status: " + response.getStatus() + ", Response: " + response.readEntity(String.class);
                log.error(errorMessage);
                throw new RuntimeException(errorMessage);
            }
        }
    }

    // Update user
    public void updateUser(String userId, UserRepresentation user) {
        getUsersResource().get(userId).update(user);
        log.info("User with ID {} updated successfully in Keycloak.", userId);
    }

    // Delete user
    public void deleteUser(String userId) {
        getUsersResource().get(userId).remove();
        log.info("User with ID {} deleted successfully from Keycloak.", userId);
    }

    // Reset password
    public void resetPassword(String userId, String newPassword) {
        CredentialRepresentation credential = new CredentialRepresentation();
        credential.setType(CredentialRepresentation.PASSWORD);
        credential.setValue(newPassword);
        credential.setTemporary(false);

        getUsersResource().get(userId).resetPassword(credential);
        log.info("Password for user with ID {} has been reset.", userId);
    }

    // Get user count
    public Integer getUsersCount() {
        return getUsersResource().count();
    }

    // Enable/disable user
    public void setUserEnabled(String userId, boolean enabled) {
        UserRepresentation user = getUserById(userId);
        user.setEnabled(enabled);
        updateUser(userId, user);
        log.info("User with ID {} has been {}.", userId, enabled ? "enabled" : "disabled");
    }

    // Check if user exists by username
    public boolean userExistsByUsername(String username) {
        return !getUsersResource().searchByUsername(username, true).isEmpty();
    }

    // Check if user exists by email
    public boolean userExistsByEmail(String email) {
        return !getUsersResource().searchByEmail(email, true).isEmpty();
    }

    // Find user by username (returns Optional)
    public Optional<UserRepresentation> findUserByUsername(String username) {
        List<UserRepresentation> users = getUsersResource().searchByUsername(username, true);
        return users.isEmpty() ? Optional.empty() : Optional.of(users.get(0));
    }

    // Find user by email (returns Optional)
    public Optional<UserRepresentation> findUserByEmail(String email) {
        List<UserRepresentation> users = getUsersResource().searchByEmail(email, true);
        return users.isEmpty() ? Optional.empty() : Optional.of(users.get(0));
    }
}