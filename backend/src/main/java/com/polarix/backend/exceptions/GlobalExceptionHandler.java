package com.polarix.backend.exceptions;

import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import com.polarix.backend.dtos.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.dao.DataIntegrityViolationException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleJsonParseError(HttpMessageNotReadableException ex) {
        Map<String, String> errors = new HashMap<>();

        Throwable cause = ex.getCause();
        if (cause instanceof InvalidFormatException ife) {
            Class<?> targetType = ife.getTargetType();
            String fieldName = ife.getPath().isEmpty() ? "unknown" : ife.getPath().get(0).getFieldName();

            if (targetType.equals(LocalDate.class)) {
                errors.put(fieldName, "Invalid date format, expected yyyy-MM-dd");
            } else if (targetType.isEnum()) {
                errors.put(fieldName, "Invalid value, must be one of: " +
                        Arrays.toString(targetType.getEnumConstants()));
            } else {
                errors.put(fieldName, "Invalid value type, expected " + targetType.getSimpleName());
            }
        } else if (cause instanceof DateTimeParseException) {
            errors.put("date", "Invalid date format, expected yyyy-MM-dd");
        } else {
            errors.put("request", "Malformed JSON request");
        }

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Invalid request payload",
                LocalDateTime.now(),
                errors);

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    // Handle validation errors (400)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult().getFieldErrors()
                .forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Validation failed",
                LocalDateTime.now(),
                errors);

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    // 404 Not Found
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException exception, WebRequest request) {
        return new ResponseEntity<>(
                new ErrorResponse(
                        HttpStatus.NOT_FOUND.value(),
                        exception.getMessage(),
                        LocalDateTime.now()),
                HttpStatus.NOT_FOUND);
    }

    // 409 Conflict for database constraint violations
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(DataIntegrityViolationException ex,
            WebRequest request) {
        // Prioritize the specific message from the thrown exception, which our service
        // now provides.
        String message = ex.getMessage();

        // Provide a fallback for generic database-level errors that don't have a clean
        // message.
        if (message == null || message.isBlank() || message.contains("could not execute statement")) {
            message = "A database constraint was violated. This is likely due to a duplicate entry for a unique field (e.g., username or email).";

            // Try to get a slightly more specific message from the root cause
            if (ex.getCause() != null && ex.getCause().getMessage() != null) {
                String causeMessage = ex.getCause().getMessage().toLowerCase();
                if (causeMessage.contains("unique constraint") || causeMessage.contains("duplicate key")) {
                    message = "An entry with one of the unique fields (like username or email) already exists.";
                }
            }
        }

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.CONFLICT.value(),
                message,
                LocalDateTime.now());

        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }

    // 400 Bad Request
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(IllegalArgumentException exception, WebRequest request) {
        return new ResponseEntity<>(
                new ErrorResponse(
                        HttpStatus.BAD_REQUEST.value(),
                        exception.getMessage(),
                        LocalDateTime.now()),
                HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            org.springframework.security.access.AccessDeniedException ex) {
        return new ResponseEntity<>(
                new ErrorResponse(
                        HttpStatus.FORBIDDEN.value(),
                        "Access denied: " + ex.getMessage(),
                        LocalDateTime.now()),
                HttpStatus.FORBIDDEN);
    }

    // Handle exceptions from Keycloak/JAX-RS client
    @ExceptionHandler(jakarta.ws.rs.WebApplicationException.class)
    public ResponseEntity<ErrorResponse> handleWebApplicationException(jakarta.ws.rs.WebApplicationException ex) {
        int status = ex.getResponse().getStatus();
        HttpStatus httpStatus = HttpStatus.resolve(status);
        if (httpStatus == null)
            httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;

        String message = ex.getMessage();
        if (status == 404) {
            message = "Keycloak resource not found. Ensure 'Authorization' is enabled for the configured client. Detail: "
                    + ex.getMessage();
        }

        ErrorResponse errorResponse = new ErrorResponse(
                status,
                message,
                LocalDateTime.now());

        return new ResponseEntity<>(errorResponse, httpStatus);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(Exception ex, WebRequest request) {
        // Log the exception for server-side debugging
        ex.printStackTrace();

        ErrorResponse error = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                ex.getClass().getSimpleName() + ": " + ex.getMessage(),
                LocalDateTime.now());
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
