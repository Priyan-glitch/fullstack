package com.stableroomies.studentservice.controller;

import com.stableroomies.studentservice.dto.AdminDashboardStats;
import com.stableroomies.studentservice.dto.LoginRequest;
import com.stableroomies.studentservice.dto.LoginResponse;
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
    public ResponseEntity<List<StudentDTO>> searchStudents(@RequestParam String query) {
        return ResponseEntity.ok(studentService.searchStudents(query));
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

    // Simple login endpoint for testing - will be replaced by Clerk authentication
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        // Hardcoded admin check (temporary - will be replaced by Clerk)
        if ("admin".equalsIgnoreCase(request.getRole()) && 
            "admin@college.edu".equals(request.getEmail()) && 
            "admin123".equals(request.getPassword())) {
            LoginResponse response = new LoginResponse(true, "Admin login successful", "admin", null);
            return ResponseEntity.ok(response);
        }

        // Student authentication
        if ("student".equalsIgnoreCase(request.getRole())) {
            Student student = studentService.authenticateStudent(request.getEmail(), request.getPassword());
            if (student != null) {
                StudentDTO dto = studentService.convertToDTO(student);
                LoginResponse response = new LoginResponse(true, "Login successful", "student", dto);
                return ResponseEntity.ok(response);
            }
        }

        LoginResponse response = new LoginResponse(false, "Invalid credentials");
        return ResponseEntity.status(401).body(response);
    }

    // Admin Dashboard Statistics
    @GetMapping("/admin/stats")
    public ResponseEntity<AdminDashboardStats> getAdminStats() {
        return ResponseEntity.ok(studentService.getDashboardStats());
    }
}
