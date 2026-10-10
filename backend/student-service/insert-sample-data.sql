-- Run this SQL script manually after the service starts for the first time
-- This inserts 10 sample students with passwords for testing

-- Student 1: Rahul Kumar
INSERT INTO students (register_number, first_name, last_name, email, password, phone, gender, date_of_birth, blood_group, department, year, semester, address, city, state, pincode, guardian_name, guardian_phone, guardian_relation, emergency_contact, profile_complete, profile_completion_percent, active, created_at, updated_at)
VALUES ('2024CSE001', 'Rahul', 'Kumar', 'rahul.kumar@college.edu', 'student123', '9876543210', 'Male', '2005-03-15', 'O+', 'Computer Science', 1, 1, '123, MG Road', 'Bangalore', 'Karnataka', '560001', 'Rajesh Kumar', '9876543211', 'Father', '9876543211', true, 100, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Student 2: Priya Sharma
INSERT INTO students (register_number, first_name, last_name, email, password, phone, gender, date_of_birth, blood_group, department, year, semester, address, city, state, pincode, guardian_name, guardian_phone, guardian_relation, emergency_contact, profile_complete, profile_completion_percent, active, created_at, updated_at)
VALUES ('2024CSE002', 'Priya', 'Sharma', 'priya.sharma@college.edu', 'student123', '9876543220', 'Female', '2005-07-22', 'A+', 'Computer Science', 1, 1, '456, Brigade Road', 'Bangalore', 'Karnataka', '560002', 'Suresh Sharma', '9876543221', 'Father', '9876543221', true, 100, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Student 3: Arjun Reddy
INSERT INTO students (register_number, first_name, last_name, email, password, phone, gender, date_of_birth, blood_group, department, year, semester, address, city, state, pincode, guardian_name, guardian_phone, guardian_relation, emergency_contact, profile_complete, profile_completion_percent, active, created_at, updated_at)
VALUES ('2024ECE001', 'Arjun', 'Reddy', 'arjun.reddy@college.edu', 'student123', '9876543230', 'Male', '2005-11-08', 'B+', 'Electronics', 1, 1, '789, Koramangala', 'Bangalore', 'Karnataka', '560034', 'Venkat Reddy', '9876543231', 'Father', '9876543231', true, 100, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Student 4: Ananya Iyer
INSERT INTO students (register_number, first_name, last_name, email, password, phone, gender, date_of_birth, blood_group, department, year, semester, address, city, state, pincode, guardian_name, guardian_phone, guardian_relation, emergency_contact, profile_complete, profile_completion_percent, active, created_at, updated_at)
VALUES ('2024ECE002', 'Ananya', 'Iyer', 'ananya.iyer@college.edu', 'student123', '9876543240', 'Female', '2005-01-30', 'AB+', 'Electronics', 1, 1, '321, Indiranagar', 'Bangalore', 'Karnataka', '560038', 'Ramesh Iyer', '9876543241', 'Father', '9876543241', true, 100, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Student 5: Vikram Singh (Incomplete Profile)
INSERT INTO students (register_number, first_name, last_name, email, password, phone, gender, date_of_birth, department, year, semester, profile_complete, profile_completion_percent, active, created_at, updated_at)
VALUES ('2024ME001', 'Vikram', 'Singh', 'vikram.singh@college.edu', 'student123', '9876543250', 'Male', '2005-09-12', 'Mechanical', 1, 1, false, 60, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Student 6: Sneha Patel (Incomplete Profile)
INSERT INTO students (register_number, first_name, last_name, email, password, phone, gender, date_of_birth, blood_group, department, year, semester, address, city, state, profile_complete, profile_completion_percent, active, created_at, updated_at)
VALUES ('2024ME002', 'Sneha', 'Patel', 'sneha.patel@college.edu', 'student123', '9876543260', 'Female', '2005-04-18', 'O-', 'Mechanical', 1, 1, '654, Whitefield', 'Bangalore', 'Karnataka', false, 70, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Student 7: Aditya Gupta
INSERT INTO students (register_number, first_name, last_name, email, password, phone, gender, date_of_birth, blood_group, department, year, semester, address, city, state, pincode, guardian_name, guardian_phone, guardian_relation, emergency_contact, profile_complete, profile_completion_percent, active, created_at, updated_at)
VALUES ('2024CSE003', 'Aditya', 'Gupta', 'aditya.gupta@college.edu', 'student123', '9876543270', 'Male', '2005-12-25', 'A-', 'Computer Science', 1, 1, '987, HSR Layout', 'Bangalore', 'Karnataka', '560102', 'Manoj Gupta', '9876543271', 'Father', '9876543271', true, 100, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Student 8: Meera Krishnan
INSERT INTO students (register_number, first_name, last_name, email, password, phone, gender, date_of_birth, blood_group, department, year, semester, address, city, state, pincode, guardian_name, guardian_phone, guardian_relation, emergency_contact, profile_complete, profile_completion_percent, active, created_at, updated_at)
VALUES ('2024CSE004', 'Meera', 'Krishnan', 'meera.krishnan@college.edu', 'student123', '9876543280', 'Female', '2005-06-10', 'B-', 'Computer Science', 1, 1, '147, Jayanagar', 'Bangalore', 'Karnataka', '560041', 'Krishna Murthy', '9876543281', 'Father', '9876543281', true, 100, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Student 9: Rohan Nair (Year 2)
INSERT INTO students (register_number, first_name, last_name, email, password, phone, gender, date_of_birth, blood_group, department, year, semester, address, city, state, pincode, guardian_name, guardian_phone, guardian_relation, emergency_contact, profile_complete, profile_completion_percent, active, created_at, updated_at)
VALUES ('2023CSE015', 'Rohan', 'Nair', 'rohan.nair@college.edu', 'student123', '9876543290', 'Male', '2004-08-05', 'O+', 'Computer Science', 2, 3, '258, Malleshwaram', 'Bangalore', 'Karnataka', '560003', 'Sunil Nair', '9876543291', 'Father', '9876543291', true, 100, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Student 10: Ishita Verma (Year 2)
INSERT INTO students (register_number, first_name, last_name, email, password, phone, gender, date_of_birth, blood_group, department, year, semester, address, city, state, pincode, guardian_name, guardian_phone, guardian_relation, emergency_contact, profile_complete, profile_completion_percent, active, created_at, updated_at)
VALUES ('2023ECE020', 'Ishita', 'Verma', 'ishita.verma@college.edu', 'student123', '9876543300', 'Female', '2004-02-14', 'A+', 'Electronics', 2, 3, '369, BTM Layout', 'Bangalore', 'Karnataka', '560076', 'Rakesh Verma', '9876543301', 'Father', '9876543301', true, 100, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

