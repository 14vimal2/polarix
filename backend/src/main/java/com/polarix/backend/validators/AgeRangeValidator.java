package com.polarix.backend.validators;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.time.LocalDate;
import java.time.Period;

public class AgeRangeValidator implements ConstraintValidator<AgeRange, LocalDate> {
    private int min;
    private int max;

    @Override
    public void initialize(AgeRange constraintAnnotation) {
        this.min = constraintAnnotation.min();
        this.max = constraintAnnotation.max();
    }

    @Override
    public boolean isValid(LocalDate dob, ConstraintValidatorContext context) {
        if (dob == null) return true; // handled by @NotNull if needed
        int age = Period.between(dob, LocalDate.now()).getYears();
        return age >= min && age <= max;
    }
}
