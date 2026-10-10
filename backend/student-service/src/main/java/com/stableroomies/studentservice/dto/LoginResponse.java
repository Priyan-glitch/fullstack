package com.stableroomies.studentservice.dto;

public class LoginResponse {
    private boolean success;
    private String message;
    private String role;
    private StudentDTO student;

    // Constructors
    public LoginResponse() {
    }

    public LoginResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public LoginResponse(boolean success, String message, String role, StudentDTO student) {
        this.success = success;
        this.message = message;
        this.role = role;
        this.student = student;
    }

    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public StudentDTO getStudent() {
        return student;
    }

    public void setStudent(StudentDTO student) {
        this.student = student;
    }
}
