package com.stableroomies.studentservice.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.stableroomies.studentservice.dto.AdminDashboardStats;
import com.stableroomies.studentservice.dto.StudentDTO;
import com.stableroomies.studentservice.model.Department;
import com.stableroomies.studentservice.model.Student;
import com.stableroomies.studentservice.repository.StudentPreferenceRepository;
import com.stableroomies.studentservice.repository.StudentRepository;

@Service
@Transactional
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private StudentPreferenceRepository preferenceRepository;

    public List<StudentDTO> getAllStudents() {
        return studentRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public StudentDTO getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));
        return convertToDTO(student);
    }

    public StudentDTO getStudentByEmail(String email) {
        Optional<Student> studentOpt = studentRepository.findByEmail(email);
        if (studentOpt.isPresent()) {
            return convertToDTO(studentOpt.get());
        }

        // Auto-provision a student profile for a newly signed-in account
        Student newStudent = new Student();
        newStudent.setEmail(email);
        String prefix = (email != null && email.contains("@"))
                ? email.substring(0, email.indexOf("@")).replaceAll("[^a-zA-Z]", " ")
                : "Student";
        prefix = prefix.trim();
        String firstName = prefix.isEmpty() ? "Student" : Character.toUpperCase(prefix.charAt(0)) + (prefix.length() > 1 ? prefix.substring(1) : "");
        newStudent.setFirstName(firstName);
        newStudent.setLastName("User");

        // Generate unique register number e.g. 2024REGxxxx
        String regNum = "2024REG" + String.format("%04d", (int)(Math.random() * 9000 + 1000));
        while (studentRepository.existsByRegisterNumber(regNum)) {
            regNum = "2024REG" + String.format("%04d", (int)(Math.random() * 9000 + 1000));
        }
        newStudent.setRegisterNumber(regNum);
        newStudent.setDepartment(Department.COMPUTER_SCIENCE);
        newStudent.setYear(1);
        newStudent.setSemester(1);
        newStudent.setGender("Male");
        newStudent.setActive(true);
        newStudent.setProfileComplete(false);
        newStudent.setProfileCompletionPercent(40);

        Student saved = studentRepository.save(newStudent);
        return convertToDTO(saved);
    }

    public StudentDTO getStudentByRegisterNumber(String registerNumber) {
        Student student = studentRepository.findByRegisterNumber(registerNumber)
                .orElseThrow(() -> new RuntimeException("Student not found with register number: " + registerNumber));
        return convertToDTO(student);
    }

    public List<StudentDTO> getStudentsByDepartment(String department) {
        // Convert string to enum
        Department dept = Department.fromDisplayName(department);
        return studentRepository.findByDepartment(dept).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<StudentDTO> getStudentsByYear(Integer year) {
        return studentRepository.findByYear(year).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<StudentDTO> searchStudents(String searchTerm) {
        return searchStudents(searchTerm, null);
    }

    public List<StudentDTO> searchStudents(String searchTerm, String gender) {
        return studentRepository.searchStudents(searchTerm).stream()
                .filter(s -> gender == null || gender.isBlank() || (s.getGender() != null && s.getGender().equalsIgnoreCase(gender.trim())))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public StudentDTO createStudent(StudentDTO studentDTO) {
        // Check if email already exists
        if (studentRepository.existsByEmail(studentDTO.getEmail())) {
            throw new RuntimeException("Student with email " + studentDTO.getEmail() + " already exists");
        }

        // Check if register number already exists
        if (studentRepository.existsByRegisterNumber(studentDTO.getRegisterNumber())) {
            throw new RuntimeException("Student with register number " + studentDTO.getRegisterNumber() + " already exists");
        }

        Student student = convertToEntity(studentDTO);
        Student savedStudent = studentRepository.save(student);
        return convertToDTO(savedStudent);
    }

    public StudentDTO updateStudent(Long id, StudentDTO studentDTO) {
        Student existingStudent = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));

        // Update fields
        updateStudentFields(existingStudent, studentDTO);
        
        // Calculate profile completion
        existingStudent.setProfileCompletionPercent(calculateProfileCompletion(existingStudent));
        existingStudent.setProfileComplete(existingStudent.getProfileCompletionPercent() == 100);

        Student updatedStudent = studentRepository.save(existingStudent);
        return convertToDTO(updatedStudent);
    }

    public void deleteStudent(Long id) {
        if (!studentRepository.existsById(id)) {
            throw new RuntimeException("Student not found with id: " + id);
        }
        studentRepository.deleteById(id);
    }

    public StudentDTO toggleStudentActive(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));
        student.setActive(!student.getActive());
        Student updatedStudent = studentRepository.save(student);
        return convertToDTO(updatedStudent);
    }

    // Helper methods
    public StudentDTO convertToDTO(Student student) {
        StudentDTO dto = new StudentDTO();
        dto.setId(student.getId());
        dto.setRegisterNumber(student.getRegisterNumber());
        dto.setFirstName(student.getFirstName());
        dto.setLastName(student.getLastName());
        dto.setEmail(student.getEmail());
        // Note: Password is not included in DTO for security
        dto.setPhone(student.getPhone());
        dto.setDepartment(student.getDepartment() != null ? student.getDepartment().getDisplayName() : null);
        dto.setYear(student.getYear());
        dto.setSemester(student.getSemester());
        dto.setDateOfBirth(student.getDateOfBirth());
        dto.setBloodGroup(student.getBloodGroup());
        dto.setGender(student.getGender());
        dto.setAddress(student.getAddress());
        dto.setCity(student.getCity());
        dto.setState(student.getState());
        dto.setPincode(student.getPincode());
        dto.setGuardianName(student.getGuardianName());
        dto.setGuardianPhone(student.getGuardianPhone());
        dto.setGuardianRelation(student.getGuardianRelation());
        dto.setEmergencyContact(student.getEmergencyContact());
        dto.setActive(student.getActive());
        dto.setProfileComplete(student.getProfileComplete());
        dto.setProfileCompletionPercent(student.getProfileCompletionPercent());
        dto.setRoomNumber(student.getRoomNumber());
        dto.setHostelBlock(student.getHostelBlock());
        dto.setCreatedAt(student.getCreatedAt());
        dto.setUpdatedAt(student.getUpdatedAt());
        return dto;
    }

    private Student convertToEntity(StudentDTO dto) {
        Student student = new Student();
        student.setRegisterNumber(dto.getRegisterNumber());
        student.setFirstName(dto.getFirstName());
        student.setLastName(dto.getLastName());
        student.setEmail(dto.getEmail());
        // Password update handled separately for security
        student.setPhone(dto.getPhone());
        student.setDepartment(dto.getDepartment() != null ? Department.fromDisplayName(dto.getDepartment()) : null);
        student.setYear(dto.getYear());
        student.setSemester(dto.getSemester());
        student.setDateOfBirth(dto.getDateOfBirth());
        student.setBloodGroup(dto.getBloodGroup());
        student.setGender(dto.getGender());
        student.setAddress(dto.getAddress());
        student.setCity(dto.getCity());
        student.setState(dto.getState());
        student.setPincode(dto.getPincode());
        student.setGuardianName(dto.getGuardianName());
        student.setGuardianPhone(dto.getGuardianPhone());
        student.setGuardianRelation(dto.getGuardianRelation());
        student.setEmergencyContact(dto.getEmergencyContact());
        student.setActive(dto.getActive() != null ? dto.getActive() : true);
        student.setRoomNumber(dto.getRoomNumber());
        student.setHostelBlock(dto.getHostelBlock());
        return student;
    }

    private void updateStudentFields(Student student, StudentDTO dto) {
        if (dto.getFirstName() != null) student.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) student.setLastName(dto.getLastName());
        if (dto.getPhone() != null) student.setPhone(dto.getPhone());
        if (dto.getDateOfBirth() != null) student.setDateOfBirth(dto.getDateOfBirth());
        if (dto.getBloodGroup() != null) student.setBloodGroup(dto.getBloodGroup());
        if (dto.getGender() != null) student.setGender(dto.getGender());
        if (dto.getAddress() != null) student.setAddress(dto.getAddress());
        if (dto.getCity() != null) student.setCity(dto.getCity());
        if (dto.getState() != null) student.setState(dto.getState());
        if (dto.getPincode() != null) student.setPincode(dto.getPincode());
        if (dto.getGuardianName() != null) student.setGuardianName(dto.getGuardianName());
        if (dto.getGuardianPhone() != null) student.setGuardianPhone(dto.getGuardianPhone());
        if (dto.getGuardianRelation() != null) student.setGuardianRelation(dto.getGuardianRelation());
        if (dto.getEmergencyContact() != null) student.setEmergencyContact(dto.getEmergencyContact());
        if (dto.getRoomNumber() != null) student.setRoomNumber(dto.getRoomNumber());
        if (dto.getHostelBlock() != null) student.setHostelBlock(dto.getHostelBlock());
    }

    private Integer calculateProfileCompletion(Student student) {
        int totalFields = 15;
        int completedFields = 0;

        if (student.getFirstName() != null && !student.getFirstName().isEmpty()) completedFields++;
        if (student.getLastName() != null && !student.getLastName().isEmpty()) completedFields++;
        if (student.getEmail() != null && !student.getEmail().isEmpty()) completedFields++;
        if (student.getPhone() != null && !student.getPhone().isEmpty()) completedFields++;
        if (student.getDateOfBirth() != null) completedFields++;
        if (student.getBloodGroup() != null && !student.getBloodGroup().isEmpty()) completedFields++;
        if (student.getGender() != null && !student.getGender().isEmpty()) completedFields++;
        if (student.getAddress() != null && !student.getAddress().isEmpty()) completedFields++;
        if (student.getCity() != null && !student.getCity().isEmpty()) completedFields++;
        if (student.getState() != null && !student.getState().isEmpty()) completedFields++;
        if (student.getPincode() != null && !student.getPincode().isEmpty()) completedFields++;
        if (student.getGuardianName() != null && !student.getGuardianName().isEmpty()) completedFields++;
        if (student.getGuardianPhone() != null && !student.getGuardianPhone().isEmpty()) completedFields++;
        if (student.getGuardianRelation() != null && !student.getGuardianRelation().isEmpty()) completedFields++;
        if (student.getEmergencyContact() != null && !student.getEmergencyContact().isEmpty()) completedFields++;

        return (completedFields * 100) / totalFields;
    }

    // Removed: authenticateStudent. It compared passwords in plaintext against
    // students.password, and its only caller was the deleted POST /login.
    // auth-service owns credential verification (BCrypt).

    // Admin Dashboard Statistics
    public AdminDashboardStats getDashboardStats() {
        Long total = studentRepository.count();
        Long active = studentRepository.countByActive(true);
        Long inactive = studentRepository.countByActive(false);

        Long allocated = studentRepository.countByRoomNumberIsNotNull();
        Long pending = total - allocated;

        // Count room sharing preferences
        Long twoSharing = preferenceRepository.countByRoomType("2_SHARING");
        Long threeSharing = preferenceRepository.countByRoomType("3_SHARING");

        return new AdminDashboardStats(total, allocated, pending, active, inactive, twoSharing, threeSharing);
    }
}
