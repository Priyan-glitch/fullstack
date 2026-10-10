package com.stableroomies.studentservice.repository;

import com.stableroomies.studentservice.model.StudentPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentPreferenceRepository extends JpaRepository<StudentPreference, Long> {
    Optional<StudentPreference> findByStudentId(Long studentId);
    boolean existsByStudentId(Long studentId);
    long countByRoomType(String roomType);
}
