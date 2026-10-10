package com.stableroomies.allocationservice.model;

/**
 * Template model for roommate information
 */
public class Roommate {
    
    private Long studentId;
    private String name;
    private String registerNumber;
    private String department;
    private Integer year;
    private String email;
    private String phone;

    // Constructors
    public Roommate() {
    }

    public Roommate(Long studentId, String name, String registerNumber, String department, Integer year) {
        this.studentId = studentId;
        this.name = name;
        this.registerNumber = registerNumber;
        this.department = department;
        this.year = year;
    }

    // Getters and Setters
    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRegisterNumber() {
        return registerNumber;
    }

    public void setRegisterNumber(String registerNumber) {
        this.registerNumber = registerNumber;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}
