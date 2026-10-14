package com.stableroomies.authservice.config;

import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.stableroomies.authservice.model.AppUser;
import com.stableroomies.authservice.model.Role;
import com.stableroomies.authservice.repository.AppUserRepository;

/**
 * Creates the first warden account so there is a way into the admin screens
 * without hand-editing the database.
 *
 * Only runs when no ADMIN exists, and never modifies an existing user — changing
 * the env values later will not silently reset a live password. Regular signups
 * are always STUDENT, so without this the admin role would be unreachable.
 */
@Component
public class AdminBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);

    private final AppUserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;

    public AdminBootstrap(
            AppUserRepository users,
            PasswordEncoder passwordEncoder,
            @Value("${auth.admin.email:}") String adminEmail,
            @Value("${auth.admin.password:}") String adminPassword) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (users.existsByRole(Role.ADMIN)) {
            return;
        }

        if (adminEmail.isBlank() || adminPassword.isBlank()) {
            log.warn("No ADMIN account exists and AUTH_ADMIN_EMAIL/AUTH_ADMIN_PASSWORD are unset — "
                    + "the admin screens are unreachable until one is created.");
            return;
        }

        String email = adminEmail.trim().toLowerCase(Locale.ROOT);

        if (users.existsByEmail(email)) {
            // Someone signed up with this address first. Promoting them would change
            // an account they control, so leave it alone and say so.
            log.warn("Cannot bootstrap admin: {} is already registered as a student. "
                    + "Promote it via SQL if intended.", email);
            return;
        }

        AppUser admin = new AppUser();
        admin.setEmail(email);
        admin.setPasswordHash(passwordEncoder.encode(adminPassword));
        admin.setFirstName("Hostel");
        admin.setLastName("Warden");
        admin.setRole(Role.ADMIN);
        users.save(admin);

        log.info("Bootstrapped admin account {}", email);
    }
}
