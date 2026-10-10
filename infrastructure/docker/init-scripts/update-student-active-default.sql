-- Update students table to ensure active column defaults to TRUE
-- This script should be run after the student_db tables are created by Hibernate

-- First, update any existing NULL or FALSE values to TRUE
UPDATE students SET active = true WHERE active IS NULL OR active = false;

-- Then add the DEFAULT constraint for future inserts
ALTER TABLE students ALTER COLUMN active SET DEFAULT true;

-- Also ensure the column is NOT NULL
ALTER TABLE students ALTER COLUMN active SET NOT NULL;
