package com.stableroomies.studentservice.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * JPA Converter to store Department enum as display name in database
 * This maintains backward compatibility with existing "Computer Science", "Electronics", "Mechanical" values
 */
@Converter(autoApply = true)
public class DepartmentConverter implements AttributeConverter<Department, String> {

    @Override
    public String convertToDatabaseColumn(Department department) {
        if (department == null) {
            return null;
        }
        return department.getDisplayName();
    }

    @Override
    public Department convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return null;
        }
        try {
            return Department.fromDisplayName(dbData);
        } catch (IllegalArgumentException e) {
            // Log warning and return null or throw exception based on requirements
            System.err.println("Warning: Unknown department value in database: " + dbData);
            throw e; // Or return null if you want to be lenient
        }
    }
}
