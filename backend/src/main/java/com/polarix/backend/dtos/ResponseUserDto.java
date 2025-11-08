package com.polarix.backend.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;

@Getter
@Setter
@SuperBuilder
@Schema(name = "User")
public class ResponseUserDto extends BaseResponseDto {

    private String firstName;

    private String lastName;

    private String username;

    private String email;

    private LocalDate dateOfBirth;

    private boolean enabled;

    private boolean emailVerified;

    private String keycloakId;

    @Override
    public String toString() {
        return "ResponseUserDto{" +
                "firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", dateOfBirth=" + dateOfBirth +
                ", enabled=" + enabled +
                ", emailVerified=" + emailVerified +
                ", keycloakId='" + keycloakId + '\'' +
                '}';
    }

}
