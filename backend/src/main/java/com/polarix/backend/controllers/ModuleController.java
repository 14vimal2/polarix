package com.polarix.backend.controllers;

import com.polarix.backend.services.ModuleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.keycloak.representations.idm.authorization.ResourceRepresentation;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Permissions - Modules")
@RestController
@RequestMapping("/api/v1/modules")
public class ModuleController {

    private final ModuleService moduleService;

    public ModuleController(ModuleService moduleService) {
        this.moduleService = moduleService;
    }

    @Operation(operationId = "createModule", summary = "Create a new module (resource)")
    @PostMapping
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<ResourceRepresentation> createModule(@RequestBody ModuleRequest request) {
        ResourceRepresentation createdModule = moduleService.createModule(request.getName(), request.getDisplayName(), request.getActions());
        return ResponseEntity.status(201).body(createdModule);
    }

    @Operation(operationId = "updateModuleActions", summary = "Update the actions (scopes) for a module")
    @PutMapping("/{moduleName}/actions")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<Void> updateModuleActions(@PathVariable String moduleName, @RequestBody List<String> actions) {
        moduleService.updateModuleScopes(moduleName, actions);
        return ResponseEntity.noContent().build();
    }

    @Operation(operationId = "getAllModules", summary = "Get all available modules")
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ResourceRepresentation>> getAllModules() {
        return ResponseEntity.ok(moduleService.getAllModules());
    }

    @Operation(operationId = "getModuleByName", summary = "Get a single module by its unique name")
    @GetMapping("/{moduleName}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ResourceRepresentation> getModuleByName(@PathVariable String moduleName) {
        return moduleService.getModuleByName(moduleName)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    static class ModuleRequest {
        private String name;
        private String displayName;
        private List<String> actions;

        // getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDisplayName() { return displayName; }
        public void setDisplayName(String displayName) { this.displayName = displayName; }
        public List<String> getActions() { return actions; }
        public void setActions(List<String> actions) { this.actions = actions; }
    }
}