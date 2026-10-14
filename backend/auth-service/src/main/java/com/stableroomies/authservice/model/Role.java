package com.stableroomies.authservice.model;

/**
 * Application role, carried in the JWT `role` claim and used by the frontend to
 * gate student vs warden screens.
 */
public enum Role {
    STUDENT,
    ADMIN
}
