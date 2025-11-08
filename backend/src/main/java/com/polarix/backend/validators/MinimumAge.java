package com.polarix.backend.validators;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = MinimumAgeValidator.class)
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface MinimumAge {
    int value();
    String message() default "User must be at least {value} years old";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
