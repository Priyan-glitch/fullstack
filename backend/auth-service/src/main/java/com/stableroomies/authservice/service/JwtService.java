package com.stableroomies.authservice.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Date;
import java.util.Locale;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.stableroomies.authservice.model.AppUser;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

/**
 * Issues and parses the HS256 tokens that the API gateway verifies with the same
 * shared secret. Everything the frontend needs for gating — id, email, role — is
 * in the claims so it never has to call /me just to render the shell.
 */
@Service
public class JwtService {

    private final SecretKey key;
    private final long expiryMinutes;
    private final String issuer;

    public JwtService(
            @Value("${auth.jwt.secret}") String secret,
            @Value("${auth.jwt.expiry-minutes}") long expiryMinutes,
            @Value("${auth.jwt.issuer}") String issuer) {

        // The gateway decodes this value as base64 (caddy-jwt's sign_key is
        // "secret_key_bytes_in_base64_format"), so the raw key here must be the
        // base64 *decoding* of the same string. Using it verbatim would produce a
        // different key and every token would fail signature verification.
        byte[] bytes;
        try {
            bytes = Base64.getDecoder().decode(secret.trim());
        } catch (IllegalArgumentException ex) {
            throw new IllegalStateException(
                    "auth.jwt.secret must be base64-encoded so the gateway can decode it too. "
                            + "Generate one with: openssl rand -base64 32",
                    ex);
        }

        // HS256 needs >= 256 bits of key material. Failing at startup with a clear
        // message beats every request 401-ing for a reason nobody can see.
        if (bytes.length < 32) {
            throw new IllegalStateException(
                    "auth.jwt.secret must decode to at least 32 bytes for HS256, got " + bytes.length
                            + ". Set JWT_SECRET in .env.");
        }

        this.key = Keys.hmacShaKeyFor(bytes);
        this.expiryMinutes = expiryMinutes;
        this.issuer = issuer;
    }

    public String issue(AppUser user) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(String.valueOf(user.getId()))
                .issuer(issuer)
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name().toLowerCase(Locale.ROOT))
                .claim("name", (user.getFirstName() + " " + user.getLastName()).trim())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(expiryMinutes, ChronoUnit.MINUTES)))
                .signWith(key, Jwts.SIG.HS256)
                .compact();
    }

    /** @throws JwtException if the signature, issuer or expiry does not check out. */
    public Jws<Claims> parse(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .requireIssuer(issuer)
                .build()
                .parseSignedClaims(token);
    }

    public long expirySeconds() {
        return expiryMinutes * 60;
    }
}
