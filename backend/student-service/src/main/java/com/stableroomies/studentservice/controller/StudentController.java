package com.stableroomies.studentservice.controller;

import com.stableroomies.studentservice.dto.AdminDashboardStats;
import com.stableroomies.studentservice.dto.StudentDTO;
import com.stableroomies.studentservice.model.Department;
import com.stableroomies.studentservice.model.Student;
import com.stableroomies.studentservice.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @GetMapping
    public ResponseEntity<List<StudentDTO>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentDTO> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<StudentDTO> getStudentByEmail(@PathVariable String email) {
        return ResponseEntity.ok(studentService.getStudentByEmail(email));
    }

    @GetMapping("/register-number/{registerNumber}")
    public ResponseEntity<StudentDTO> getStudentByRegisterNumber(@PathVariable String registerNumber) {
        return ResponseEntity.ok(studentService.getStudentByRegisterNumber(registerNumber));
    }

    @GetMapping("/department/{department}")
    public ResponseEntity<List<StudentDTO>> getStudentsByDepartment(@PathVariable String department) {
        return ResponseEntity.ok(studentService.getStudentsByDepartment(department));
    }

    @GetMapping("/year/{year}")
    public ResponseEntity<List<StudentDTO>> getStudentsByYear(@PathVariable Integer year) {
        return ResponseEntity.ok(studentService.getStudentsByYear(year));
    }

    @GetMapping("/search")
    public ResponseEntity<List<StudentDTO>> searchStudents(
            @RequestParam String query,
            @RequestParam(required = false) String gender) {
        return ResponseEntity.ok(studentService.searchStudents(query, gender));
    }

    @GetMapping("/departments")
    public ResponseEntity<List<String>> getAllDepartments() {
        List<String> departments = Arrays.stream(Department.values())
                .map(Department::getDisplayName)
                .collect(Collectors.toList());
        return ResponseEntity.ok(departments);
    }

    @PostMapping
    public ResponseEntity<StudentDTO> createStudent(@RequestBody StudentDTO studentDTO) {
        StudentDTO createdStudent = studentService.createStudent(studentDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdStudent);
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentDTO> updateStudent(
            @PathVariable Long id,
            @RequestBody StudentDTO studentDTO) {
        return ResponseEntity.ok(studentService.updateStudent(id, studentDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<StudentDTO> toggleStudentActive(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.toggleStudentActive(id));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }

    // Removed: POST /login.
    //
    // It returned administrator access for three hardcoded values — role
    // "admin", admin@college.edu, admin123 — with no token check in front of it.
    // It was reachable unauthenticated on the service port, bypassing the
    // gateway entirely, and it compared student passwords in plaintext. Nothing
    // in the frontend ever called it. Authentication is auth-service's job.

    // Admin Dashboard Statistics
    @GetMapping("/admin/stats")
    public ResponseEntity<AdminDashboardStats> getAdminStats() {
        return ResponseEntity.ok(studentService.getDashboardStats());
    }
}
