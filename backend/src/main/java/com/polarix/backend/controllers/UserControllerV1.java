package com.polarix.backend.controllers;

import com.polarix.backend.dtos.PageResponse;
import com.polarix.backend.dtos.RequestUserDto;
import com.polarix.backend.dtos.ResponseUserDto;
import com.polarix.backend.exceptions.ResourceNotFoundException;
import com.polarix.backend.services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@Tag(name = "User")
@RestController
@RequestMapping("/api/v1/user")
public class UserControllerV1 {

    private final UserService userService;

    public UserControllerV1(UserService userService) {
        this.userService = userService;
    }

    @Operation(operationId = "searchUsers")
    @GetMapping
    public ResponseEntity<PageResponse<ResponseUserDto>> searchUsers(
            @RequestParam Map<String, String> filters,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {



        Page<ResponseUserDto> userPage = userService.searchUsers(filters, page, size, sortBy, sortDir);

        return ResponseEntity.ok(
                new PageResponse<>(
                        userPage.getContent(),
                        userPage.getNumber(),
                        userPage.getSize(),
                        userPage.getTotalElements(),
                        userPage.getTotalPages()
                )
        );
    }

    @Operation(operationId = "getCurrentUser")
    @GetMapping("/me")
    public ResponseEntity<ResponseUserDto> getCurrentUser(@AuthenticationPrincipal Jwt principal) {
        UUID userId = UUID.fromString(principal.getSubject());
        String email = principal.getClaim("email");
        String username = principal.getClaim("preferred_username");
        String firstName = principal.getClaim("given_name");
        String lastName = principal.getClaim("family_name");

        ResponseUserDto responseUserDto = ResponseUserDto.builder()
                .id(userId)
                .username(username)
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .build();

        return ResponseEntity.status(HttpStatus.OK).body(responseUserDto);
    }

    @Operation(operationId = "getUserById")
    @GetMapping("/{id}")
    public ResponseUserDto getUserByIdV1(@PathVariable UUID id) {
        return userService.getUserById(id).orElseThrow(() -> new ResourceNotFoundException("User not found with id = " + id.toString()));
    }

    @Operation(operationId = "createUser")
    @PostMapping
    public ResponseEntity<ResponseUserDto> createUserV1(@RequestBody @Valid RequestUserDto requestUserDto) {

        ResponseUserDto savedUser = userService.createUser(requestUserDto);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);

    }

    @Operation(operationId = "updateUser")
    @PutMapping("/{id}")
    public ResponseEntity<ResponseUserDto> updateUserV1(
            @PathVariable UUID id,
            @RequestBody @Valid RequestUserDto requestUserDto) {

        ResponseUserDto updatedUser = userService.updateUser(id, requestUserDto);

        return ResponseEntity.ok(updatedUser);
    }

    @Operation(operationId = "patchUser")
    @PatchMapping("/{id}")
    public ResponseEntity<ResponseUserDto> patchUserV1(
            @PathVariable UUID id,
            @RequestBody RequestUserDto requestUserDto) {

        ResponseUserDto updatedUser = userService.patchUser(id, requestUserDto);
        return ResponseEntity.ok(updatedUser);
    }

    @Operation(operationId = "deleteUser")
    @DeleteMapping("/{id}")
    public void deleteUserV1(@PathVariable UUID id) {
        this.userService.deleteUserById(id);
    }


}
