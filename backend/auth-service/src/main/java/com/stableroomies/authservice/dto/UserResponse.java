package com.stableroomies.authservice.dto;

import java.util.Locale;

import com.stableroomies.authservice.model.AppUser;

/**
 * The only shape in which a user ever leaves this service — deliberately has no
 * password field.
 *
 * `role` is lower-cased to match the `student` / `admin` strings the frontend
 * already uses for routing.
 */
public record UserResponse(
        Long id,
        String email,
        String firstName,
        String lastName,
        String role) {

    public static UserResponse from(AppUser user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().name().toLowerCase(Locale.ROOT));
    }
}
