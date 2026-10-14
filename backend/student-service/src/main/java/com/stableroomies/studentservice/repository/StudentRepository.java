package com.stableroomies.studentservice.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.stableroomies.studentservice.model.Department;
import com.stableroomies.studentservice.model.Student;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByEmail(String email);

    Optional<Student> findByRegisterNumber(String registerNumber);

    List<Student> findByDepartment(Department department);

    List<Student> findByYear(Integer year);

    List<Student> findByDepartmentAndYear(Department department, Integer year);

    List<Student> findByActive(Boolean active);

    @Query("SELECT s FROM Student s WHERE " +
           "LOWER(s.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(s.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(s.registerNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(s.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Student> searchStudents(@Param("searchTerm") String searchTerm);

    Boolean existsByEmail(String email);

    Boolean existsByRegisterNumber(String registerNumber);

    Long countByDepartment(Department department);

    Long countByYear(Integer year);

    @Query("SELECT COUNT(s) FROM Student s WHERE s.profileComplete = true")
    Long countProfilesComplete();

    @Query("SELECT COUNT(s) FROM Student s WHERE s.active = true")
    Long countActiveStudents();
    
    Long countByActive(Boolean active);

    Long countByRoomNumberIsNotNull();

    List<Student> findByRoomNumber(String roomNumber);
}
