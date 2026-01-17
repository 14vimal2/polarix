package com.polarix.backend.controllers;

import com.polarix.backend.services.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.keycloak.representations.idm.RoleRepresentation;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Permissions - Roles")
@RestController
@RequestMapping("/api/v1/roles")
public class RoleController {

    private final RoleService roleService;

    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    @Operation(operationId = "createRole", summary = "Create a new role")
    @PostMapping
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<Void> createRole(@RequestBody RoleRequest request) {
        roleService.createRole(request.getName(), request.getDescription());
        return ResponseEntity.status(201).build();
    }

    @Operation(operationId = "getAllRoles", summary = "Get all available roles")
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<RoleRepresentation>> getAllRoles() {
        return ResponseEntity.ok(roleService.getAllRoles());
    }

    @Operation(operationId = "assignPermissionsToRole", summary = "Assign a set of actions on a module to a role")
    @PostMapping("/{roleName}/permissions")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<Void> assignPermissionsToRole(@PathVariable String roleName,
            @RequestBody PermissionRequest request) {
        roleService.assignPermissionsToRole(roleName, request.getModuleName(), request.getActions());
        return ResponseEntity.noContent().build();
    }

    @Operation(operationId = "getRolePermissions", summary = "Get all permissions assigned to a role")
    @GetMapping("/{roleName}/permissions")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<java.util.Map<String, java.util.List<String>>> getRolePermissions(
            @PathVariable String roleName) {
        return ResponseEntity.ok(roleService.getRolePermissions(roleName));
    }

    static class RoleRequest {
        private String name;
        private String description;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }

    static class PermissionRequest {
        private String moduleName;
        private List<String> actions;

        public String getModuleName() {
            return moduleName;
        }

        public void setModuleName(String moduleName) {
            this.moduleName = moduleName;
        }

        public List<String> getActions() {
            return actions;
        }

        public void setActions(List<String> actions) {
            this.actions = actions;
        }
    }
}