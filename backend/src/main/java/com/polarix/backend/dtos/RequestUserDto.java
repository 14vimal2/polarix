package com.polarix.backend.dtos;

import com.polarix.backend.validators.AgeRange;
import io.swagger.v3.oas.annotations.extensions.Extension;
import io.swagger.v3.oas.annotations.extensions.ExtensionProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@Builder
@Schema(name = "UserInput")
public class RequestUserDto {

    private UUID id;

    @NotBlank(message = "First name cannot be blank")
    @Size(max = 50, message = "First name must be at most 50 characters")
    protected String firstName;

    @Size(max = 50, message = "Last name must be at most 50 characters")
    protected String lastName;

    @NotBlank(message = "Username cannot be blank")
    @Size(max = 50, message = "Username must be at most 50 characters")
    protected String username;

    @NotBlank(message = "Password cannot be blank")
    @Size(min = 6, max = 64, message = "Password must be between 6 and 64 characters")
    private String password;

    private String email;

//    @Schema(
//            description = "Date of birth",
//            type = "string",
//            format = "date",
//            example = "1990-01-01",
//            extensions = {
//                    @Extension(name = "x-validation", properties = {
//                            @ExtensionProperty(name = "past", value = "true"),
//                            @ExtensionProperty(name = "age-min", value = "18"),
//                            @ExtensionProperty(name = "age-max", value = "100")
//                    })
//            }
//    )
    @Past(message = "Date of birth must be in the past")
    @AgeRange(min = 18, max = 100, message = "Age must be between 18 to 100 years")
    protected LocalDate dateOfBirth;
}
