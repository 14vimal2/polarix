package com.polarix.backend.controllers;

import com.polarix.backend.services.ScopeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.keycloak.representations.idm.authorization.ScopeRepresentation;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Permissions - Scopes")
@RestController
@RequestMapping("/api/v1/scopes")
public class ScopeController {

    private final ScopeService scopeService;

    public ScopeController(ScopeService scopeService) {
        this.scopeService = scopeService;
    }

    @Operation(operationId = "createScope", summary = "Create a new action (scope)")
    @PostMapping
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<ScopeRepresentation> createScope(@RequestBody ScopeRequest request) {
        ScopeRepresentation createdScope = scopeService.createScope(request.getName(), request.getDisplayName());
        return ResponseEntity.status(201).body(createdScope);
    }

    @Operation(operationId = "getAllScopes", summary = "Get all available scopes")
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ScopeRepresentation>> getAllScopes() {
        return ResponseEntity.ok(scopeService.getAllScopes());
    }

    static class ScopeRequest {
        private String name;
        private String displayName;
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDisplayName() { return displayName; }
        public void setDisplayName(String displayName) { this.displayName = displayName; }
    }
}