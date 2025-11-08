package com.polarix.backend.repository;

import com.polarix.backend.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID>, JpaSpecificationExecutor<User> {

    Optional<User> findByUsername(String username);

    List<User> findAllByKeycloakIdIn(List<String> keycloakIds);
    Optional<User> findByEmail(String email);

}
