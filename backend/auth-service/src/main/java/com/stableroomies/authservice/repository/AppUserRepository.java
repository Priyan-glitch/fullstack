package com.stableroomies.authservice.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.stableroomies.authservice.model.AppUser;
import com.stableroomies.authservice.model.Role;

@Repository
public interface AppUserRepository extends JpaRepository<AppUser, Long> {

    /** Email is always stored lower-cased, so callers must lower-case too. */
    Optional<AppUser> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByRole(Role role);
}
