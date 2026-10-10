-- Add student_preferences table to student_db
-- Run this manually after the database is initialized

\c student_db;

CREATE TABLE IF NOT EXISTS student_preferences (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL UNIQUE,
    
    -- Room preferences
    room_type VARCHAR(20) NOT NULL,
    
    -- Lifestyle preferences
    sleep_schedule VARCHAR(50),
    cleanliness VARCHAR(50),
    noise_level VARCHAR(50),
    study_time VARCHAR(50),
    social_preference VARCHAR(50),
    
    -- Additional preferences
    guest_policy VARCHAR(50),
    music_preference VARCHAR(50),
    sharing_items BOOLEAN DEFAULT FALSE,
    
    -- Dietary and lifestyle
    food_preference VARCHAR(50),
    smoking BOOLEAN DEFAULT FALSE,
    ac_preference VARCHAR(50),
    
    -- Free text
    additional_comments TEXT,
    
    -- Status
    submitted BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    
    -- Foreign key
    CONSTRAINT fk_student
        FOREIGN KEY (student_id) 
        REFERENCES students(id) 
        ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX idx_student_preferences_student_id ON student_preferences(student_id);
CREATE INDEX idx_student_preferences_submitted ON student_preferences(submitted);

-- Add comments for documentation
COMMENT ON TABLE student_preferences IS 'Stores student lifestyle and room preferences for allocation';
COMMENT ON COLUMN student_preferences.room_type IS 'Preferred room type: 2-Sharing or 3-Sharing';
COMMENT ON COLUMN student_preferences.sleep_schedule IS 'Sleep pattern: Early Bird, Night Owl, or Flexible';
COMMENT ON COLUMN student_preferences.cleanliness IS 'Cleanliness preference: Very Clean, Moderate, or Relaxed';
COMMENT ON COLUMN student_preferences.submitted IS 'Whether preferences have been submitted';

-- Sample data for testing (optional)
-- INSERT INTO student_preferences (student_id, room_type, sleep_schedule, cleanliness, noise_level, study_time, social_preference, submitted) 
-- VALUES (1, '2-Sharing', 'Night Owl', 'Very Clean', 'Quiet', 'Night', 'Moderately Social', true);

COMMENT ON DATABASE student_db IS 'Database updated with student_preferences table';
