package com.stableroomies.authservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Note there is deliberately no `role` field: registration always creates a
 * STUDENT. Accepting a role here would let anyone self-promote to admin.
 */
public record RegisterRequest(
        @NotBlank @Email @Size(max = 150) String email,

        // 72 is BCrypt's limit — anything longer is silently truncated, so reject it
        // rather than let two different passwords hash to the same value.
        @NotBlank @Size(min = 8, max = 72) String password,

        @NotBlank @Size(max = 100) String firstName,
        @NotBlank @Size(max = 100) String lastName) {
}
