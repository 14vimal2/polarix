package com.polarix.backend.services;

import com.polarix.backend.dtos.RequestUserDto;
import com.polarix.backend.dtos.ResponseUserDto;
import com.polarix.backend.exceptions.ResourceNotFoundException;
import com.polarix.backend.mappers.UserMapper;
import com.polarix.backend.models.User;
import com.polarix.backend.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.dao.DataIntegrityViolationException;

@Service
@AllArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final KeycloakUserService keycloakUserService;

    @Transactional
    public ResponseUserDto createUser(RequestUserDto requestUserDto) {
        // Step 1: Check if user already exists in the local database BEFORE any other action
        userRepository.findByUsername(requestUserDto.getUsername()).ifPresent(u -> {
            throw new DataIntegrityViolationException("User with username '" + requestUserDto.getUsername() + "' already exists.");
        });
        userRepository.findByEmail(requestUserDto.getEmail()).ifPresent(u -> {
            throw new DataIntegrityViolationException("User with email '" + requestUserDto.getEmail() + "' already exists.");
        });

        // Step 2: Check if user already exists in Keycloak
        Optional<UserRepresentation> existingKeycloakUser = keycloakUserService.findUserByEmail(requestUserDto.getEmail());

        String keycloakUserId;
        if (existingKeycloakUser.isPresent()) {
            // User exists in Keycloak, so we'll link them
            keycloakUserId = existingKeycloakUser.get().getId();
            log.info("User with email {} already exists in Keycloak. Linking to local user.", requestUserDto.getEmail());
        } else {
            // User does not exist in Keycloak, so create them
            keycloakUserId = keycloakUserService.createUserWithPassword(
                    requestUserDto.getUsername(),
                    requestUserDto.getEmail(),
                    requestUserDto.getFirstName(),
                    requestUserDto.getLastName(),
                    requestUserDto.getPassword()
            );
        }

        // Step 3: Create user in the local database (now safe from duplicates)
        User user = userMapper.toEntity(requestUserDto);
        user.setKeycloakId(keycloakUserId);
        user.setEnabled(true); // Assuming users are enabled by default

        User savedUser = userRepository.save(user);
        log.info("User created locally with ID: {}", savedUser.getId());

        return userMapper.toDto(savedUser);
    }

    @Transactional
    public ResponseUserDto updateUser(UUID id, RequestUserDto requestUserDto) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));

        // Update local user entity
        userMapper.updateEntityFromDto(requestUserDto, existingUser);

        // Update Keycloak user
        if (existingUser.getKeycloakId() != null) {
            UserRepresentation keycloakUser = keycloakUserService.getUserById(existingUser.getKeycloakId());
            keycloakUser.setFirstName(requestUserDto.getFirstName());
            keycloakUser.setLastName(requestUserDto.getLastName());
            keycloakUser.setEmail(requestUserDto.getEmail());
            // Note: Username updates might be restricted in Keycloak
            // keycloakUser.setUsername(requestUserDto.getUsername());

            keycloakUserService.updateUser(existingUser.getKeycloakId(), keycloakUser);
        }

        User updatedUser = userRepository.save(existingUser);
        log.info("User with ID {} updated in both systems.", id);
        return userMapper.toDto(updatedUser);
    }

    @Transactional
    public ResponseUserDto patchUser(UUID id, RequestUserDto requestUserDto) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));

        // Patch local user entity
        userMapper.patchEntityFromDto(requestUserDto, existingUser);

        // Patch Keycloak user
        if (existingUser.getKeycloakId() != null) {
            UserRepresentation keycloakUser = keycloakUserService.getUserById(existingUser.getKeycloakId());
            if (requestUserDto.getFirstName() != null) keycloakUser.setFirstName(requestUserDto.getFirstName());
            if (requestUserDto.getLastName() != null) keycloakUser.setLastName(requestUserDto.getLastName());
            if (requestUserDto.getEmail() != null) keycloakUser.setEmail(requestUserDto.getEmail());

            keycloakUserService.updateUser(existingUser.getKeycloakId(), keycloakUser);
        }

        User updatedUser = userRepository.save(existingUser);
        log.info("User with ID {} patched in both systems.", id);
        return userMapper.toDto(updatedUser);
    }

    public Optional<ResponseUserDto> getUserById(UUID id) {
        return userRepository.findById(id).map(userMapper::toDto);
    }

    public Optional<ResponseUserDto> getUserByUsername(String username) {
        return userRepository.findByUsername(username).map(userMapper::toDto);
    }

    @Transactional
    public void deleteUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));

        // Delete from Keycloak
        if (user.getKeycloakId() != null) {
            try {
                keycloakUserService.deleteUser(user.getKeycloakId());
            } catch (Exception e) {
                log.error("Failed to delete user from Keycloak with ID: {}. Error: {}", user.getKeycloakId(), e.getMessage());
                // Continue to delete from local DB
            }
        }

        // Delete from local database
        userRepository.delete(user);
        log.info("User with ID {} deleted from both systems.", id);
    }

    public List<ResponseUserDto> findAll() {
        return userRepository.findAll().stream()
                .map(userMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public Page<ResponseUserDto> searchUsers(Map<String, String> filters, int page, int size, String sortBy, String sortDir) {
        int firstResult = page * size;

        System.out.println("firstResult " + firstResult);
        System.out.println("page " + page);
        System.out.println("size " + size);
        

        // Step 1: Fetch users from Keycloak
        List<UserRepresentation> keycloakUsers;
        String searchTerm = filters.getOrDefault("search", "");

        if (!searchTerm.isEmpty()) {
            keycloakUsers = keycloakUserService.searchUsersPaginated(searchTerm, firstResult, size);
        } else {
            keycloakUsers = keycloakUserService.getUsersPaginated(firstResult, size);
        }

        System.out.println("keycloakUsers " + keycloakUsers.size());
        

        // Apply client-side filtering and sorting
        List<UserRepresentation> filteredAndSortedUsers = keycloakUsers.stream()
                .filter(user -> applyClientSideFilters(user, filters))
                .sorted(getComparator(sortBy, sortDir))
                .collect(Collectors.toList());

                System.out.println("filteredAndSortedUsers " + filteredAndSortedUsers.size());

        // Step 2: Provision missing users locally (Just-In-Time Provisioning)
        provisionUsersLocally(filteredAndSortedUsers);



        // Step 3: Fetch all corresponding local users to ensure we have IDs for everyone
        List<String> keycloakIds = filteredAndSortedUsers.stream()
                .map(UserRepresentation::getId)
                .collect(Collectors.toList());

                System.out.println("keycloakIds " + keycloakIds.size());
            

        Map<String, User> localUsersMap = userRepository.findAllByKeycloakIdIn(keycloakIds).stream()
                .collect(Collectors.toMap(User::getKeycloakId, Function.identity()));

        // Get total count
        int totalUsers = keycloakUserService.getUsersCount(); // This might not be accurate with filters

        // Step 4: Convert to DTOs, now with guaranteed local ID
        List<ResponseUserDto> userDtos = filteredAndSortedUsers.stream()
                .map(keycloakUser -> {
                    User localUser = localUsersMap.get(keycloakUser.getId());
                    return convertToResponseUserDto(keycloakUser, localUser);
                })
                .collect(Collectors.toList());

                System.out.println("userDtos " + userDtos.size());

        return new PageImpl<>(userDtos, PageRequest.of(page, size), totalUsers);
    }

    @Transactional
    public ResponseUserDto syncWithKeycloak(UUID userId) {
        User localUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + userId));

        if (localUser.getKeycloakId() == null) {
            throw new IllegalStateException("User does not have a Keycloak ID and cannot be synced.");
        }

        UserRepresentation keycloakUser = keycloakUserService.getUserById(localUser.getKeycloakId());

        // Sync fields from Keycloak to local DB
        localUser.setUsername(keycloakUser.getUsername());
        localUser.setEmail(keycloakUser.getEmail());
        localUser.setFirstName(keycloakUser.getFirstName());
        localUser.setLastName(keycloakUser.getLastName());
        localUser.setEnabled(keycloakUser.isEnabled());

        User updatedUser = userRepository.save(localUser);
        log.info("User with ID {} synced with Keycloak.", userId);
        return userMapper.toDto(updatedUser);
    }

    public void resetPassword(String keycloakUserId, String newPassword) {
        keycloakUserService.resetPassword(keycloakUserId, newPassword);
    }

    public void setUserEnabled(String keycloakUserId, boolean enabled) {
        keycloakUserService.setUserEnabled(keycloakUserId, enabled);
    }

    // Helper Methods

    private void provisionUsersLocally(List<UserRepresentation> keycloakUsers) {
        if (keycloakUsers.isEmpty()) {
            return;
        }

        List<String> keycloakIds = keycloakUsers.stream().map(UserRepresentation::getId).collect(Collectors.toList());
        Set<String> existingUserIds = userRepository.findAllByKeycloakIdIn(keycloakIds).stream()
                .map(User::getKeycloakId)
                .collect(Collectors.toSet());

        List<User> newUsersToCreate = keycloakUsers.stream()
                .filter(keycloakUser -> !existingUserIds.contains(keycloakUser.getId()))
                .map(keycloakUser -> {
                    User newUser = new User();
                    newUser.setKeycloakId(keycloakUser.getId());
                    newUser.setUsername(keycloakUser.getUsername());
                    newUser.setEmail(keycloakUser.getEmail());
                    newUser.setFirstName(keycloakUser.getFirstName());
                    newUser.setLastName(keycloakUser.getLastName());
                    newUser.setEnabled(keycloakUser.isEnabled());
                    // Fulfilling the non-null constraint for a password we don't manage
                    newUser.setHashedPassword("KEYCLOAK_MANAGED");
                    return newUser;
                })
                .collect(Collectors.toList());

        if (!newUsersToCreate.isEmpty()) {
            userRepository.saveAll(newUsersToCreate);
            log.info("Provisioned {} new users from Keycloak.", newUsersToCreate.size());
        }
    }

    private boolean applyClientSideFilters(UserRepresentation user, Map<String, String> filters) {
        if (filters == null || filters.isEmpty()) {
            return true;
        }

        return filters.entrySet().stream().allMatch(entry -> {
            String key = entry.getKey();
            String value = entry.getValue();
            if (value == null || value.isEmpty()) return true;

            switch (key.toLowerCase()) {
                case "enabled":
                    return user.isEnabled() == Boolean.parseBoolean(value);
                case "emailverified":
                    return user.isEmailVerified() == Boolean.parseBoolean(value);
                case "firstname":
                    return user.getFirstName() != null && user.getFirstName().toLowerCase().contains(value.toLowerCase());
                case "lastname":
                    return user.getLastName() != null && user.getLastName().toLowerCase().contains(value.toLowerCase());
                // "search" is handled by Keycloak API, so we can ignore it here
                case "search":
                    return true;
                default:
                    return true; // Or true if you want to ignore unknown filters
            }
        });
    }

    private Comparator<UserRepresentation> getComparator(String sortBy, String sortDir) {
        Comparator<UserRepresentation> comparator;
        switch (sortBy.toLowerCase()) {
            case "username":
                comparator = Comparator.comparing(u -> u.getUsername() != null ? u.getUsername().toLowerCase() : "", Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
                break;
            case "email":
                comparator = Comparator.comparing(u -> u.getEmail() != null ? u.getEmail().toLowerCase() : "", Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
                break;
            case "firstname":
                comparator = Comparator.comparing(u -> u.getFirstName() != null ? u.getFirstName().toLowerCase() : "", Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
                break;
            case "lastname":
                comparator = Comparator.comparing(u -> u.getLastName() != null ? u.getLastName().toLowerCase() : "", Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
                break;
            case "createdtimestamp":
                comparator = Comparator.comparing(UserRepresentation::getCreatedTimestamp, Comparator.nullsLast(Long::compareTo));
                break;
            default:
                // Default to username sorting
                comparator = Comparator.comparing(u -> u.getUsername() != null ? u.getUsername().toLowerCase() : "", Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
        }

        if ("desc".equalsIgnoreCase(sortDir)) {
            return comparator.reversed();
        }
        return comparator;
    }

    private ResponseUserDto convertToResponseUserDto(UserRepresentation user, User localUser) {
        ResponseUserDto.ResponseUserDtoBuilder builder = ResponseUserDto.builder()
                .keycloakId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .enabled(user.isEnabled())
                .emailVerified(user.isEmailVerified())
                .createdAt(user.getCreatedTimestamp() != null ? new Date(user.getCreatedTimestamp()).toInstant() : null);

        if (localUser != null) {
            builder.id(localUser.getId());
            builder.dateOfBirth(localUser.getDateOfBirth());
        }

        return builder.build();
    }

    private ResponseUserDto convertToResponseUserDto(UserRepresentation user) {
        return convertToResponseUserDto(user, null);
    }
}