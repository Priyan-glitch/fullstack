package com.stableroomies.authservice.service;

import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.stableroomies.authservice.dto.AuthResponse;
import com.stableroomies.authservice.dto.LoginRequest;
import com.stableroomies.authservice.dto.RegisterRequest;
import com.stableroomies.authservice.dto.UserResponse;
import com.stableroomies.authservice.exception.ApiException;
import com.stableroomies.authservice.model.AppUser;
import com.stableroomies.authservice.model.Role;
import com.stableroomies.authservice.repository.AppUserRepository;

@Service
public class AuthService {

    /**
     * A well-formed BCrypt hash compared against when no account matches, so a
     * failed login costs roughly the same time whether or not the email is
     * registered — otherwise response timing leaks which emails exist.
     */
    private static final String DUMMY_HASH = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

    private static final String BAD_CREDENTIALS = "Invalid email or password.";

    private final AppUserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(AppUserRepository users, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalize(request.email());

        if (users.existsByEmail(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "An account with that email already exists.");
        }

        AppUser user = new AppUser();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName().trim());
        // Always STUDENT: admin is granted out-of-band, never self-assigned.
        user.setRole(Role.STUDENT);

        users.save(user);
        return respond(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        AppUser user = users.findByEmail(normalize(request.email())).orElse(null);

        String hash = user != null ? user.getPasswordHash() : DUMMY_HASH;
        boolean matches = passwordEncoder.matches(request.password(), hash);

        if (user == null || !matches) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, BAD_CREDENTIALS);
        }

        return respond(user);
    }

    /** Resolves the account behind a validated token. */
    @Transactional(readOnly = true)
    public UserResponse currentUser(String authorizationHeader) {
        String subject = jwtService.parse(extractBearer(authorizationHeader)).getPayload().getSubject();

        if (subject == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Token is missing its subject.");
        }

        long userId;
        try {
            userId = Long.parseLong(subject);
        } catch (NumberFormatException ex) {
            // A token we signed always carries a numeric id, so this means the token
            // was minted elsewhere against the same secret.
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Token contains an unrecognised subject.");
        }

        AppUser user = users.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "That account no longer exists."));

        return UserResponse.from(user);
    }

    private AuthResponse respond(AppUser user) {
        return AuthResponse.of(jwtService.issue(user), jwtService.expirySeconds(), UserResponse.from(user));
    }

    private static String extractBearer(String header) {
        if (header == null || !header.regionMatches(true, 0, "Bearer ", 0, 7)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Missing bearer token.");
        }
        return header.substring(7).trim();
    }

    private static String normalize(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
