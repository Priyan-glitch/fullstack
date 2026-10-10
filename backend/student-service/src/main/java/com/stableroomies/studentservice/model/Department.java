package com.stableroomies.studentservice.model;

public enum Department {
    COMPUTER_SCIENCE("Computer Science"),
    INFORMATION_TECHNOLOGY("Information Technology"),
    ELECTRONICS("Electronics"),
    MECHANICAL("Mechanical"),
    CIVIL("Civil"),
    BIOMEDICAL("Biomedical"),
    ELECTRICAL("Electrical"),
    CHEMICAL("Chemical");

    private final String displayName;

    Department(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    /**
     * Get enum from display name (for backward compatibility with existing data)
     */
    public static Department fromDisplayName(String displayName) {
        for (Department dept : Department.values()) {
            if (dept.displayName.equalsIgnoreCase(displayName)) {
                return dept;
            }
        }
        throw new IllegalArgumentException("Unknown department: " + displayName);
    }

    @Override
    public String toString() {
        return displayName;
    }
}
