package com.polarix.backend.configurations;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class KeycloakAdminClientConfig {
    private String serverUrl;
    private String realm;
    private String clientId;
    private String clientSecret;
}