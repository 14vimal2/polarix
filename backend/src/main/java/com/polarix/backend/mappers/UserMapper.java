package com.polarix.backend.mappers;

import com.polarix.backend.dtos.RequestUserDto;
import com.polarix.backend.dtos.ResponseUserDto;
import com.polarix.backend.models.User;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface UserMapper {

    // ----------------------
    // Entity → Response DTO
    // ----------------------
    ResponseUserDto toDto(User user);

    // ----------------------
    // Request DTO → Entity (basic mapping)
    // ----------------------
    @Mapping(target = "hashedPassword", source = "password", qualifiedByName = "hashPassword")
    @Mapping(target = "email", source = "email")
    User toEntity(RequestUserDto requestUserDto);

    // ----------------------
    // PUT update: overwrite all fields
    // ----------------------
    default void updateEntityFromDto(RequestUserDto dto, @MappingTarget User user) {
        if (dto.getFirstName() != null) user.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) user.setLastName(dto.getLastName());
        if (dto.getUsername() != null) user.setUsername(dto.getUsername());
        if (dto.getEmail() != null) user.setEmail(dto.getEmail());
        if (dto.getPassword() != null) user.setHashedPassword(hash(dto.getPassword()));
        if (dto.getDateOfBirth() != null) user.setDateOfBirth(dto.getDateOfBirth());
    }

    // ----------------------
    // PATCH update: only update non-null fields
    // ----------------------
    default void patchEntityFromDto(RequestUserDto dto, @MappingTarget User user) {
        if (dto.getFirstName() != null) user.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) user.setLastName(dto.getLastName());
        if (dto.getUsername() != null) user.setUsername(dto.getUsername());
        if (dto.getEmail() != null) user.setEmail(dto.getEmail());
        if (dto.getPassword() != null) user.setHashedPassword(hash(dto.getPassword()));
        if (dto.getDateOfBirth() != null) user.setDateOfBirth(dto.getDateOfBirth());
    }

    // ----------------------
    // After mapping hook: always trim strings
    // ----------------------
    @AfterMapping
    default void sanitize(RequestUserDto dto, @MappingTarget User user) {
        if (user.getFirstName() != null) user.setFirstName(user.getFirstName().trim());
        if (user.getLastName() != null) user.setLastName(user.getLastName().trim());
        if (user.getUsername() != null) user.setUsername(user.getUsername().trim());
        if (user.getEmail() != null) user.setEmail(user.getEmail().trim());
    }

    // ----------------------
    // Password hashing logic
    // ----------------------
    @Named("hashPassword")
    default String hash(String password) {
        // Replace with real hashing logic (BCrypt, Argon2, etc.)
        return "hashed_" + password;
    }
}
