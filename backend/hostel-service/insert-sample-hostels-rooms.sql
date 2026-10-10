-- Sample Hostels and Rooms Data
-- Run this after hostel-service creates the tables

-- ========== HOSTELS ==========

-- Boys Hostels
INSERT INTO hostels (name, address, total_capacity, available_capacity, gender_type, amenities, warden_name, warden_phone, active, created_at, updated_at)
VALUES 
('Maple Boys Hostel', 'Block A, College Campus, Bangalore', 150, 150, 'MALE', 'WiFi, Gym, Common Room, Laundry, 24/7 Security', 'Mr. Rajesh Kumar', '9876543210', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Oak Boys Hostel', 'Block B, College Campus, Bangalore', 120, 120, 'MALE', 'WiFi, Study Room, Indoor Games, Laundry', 'Mr. Suresh Babu', '9876543211', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Girls Hostels
INSERT INTO hostels (name, address, total_capacity, available_capacity, gender_type, amenities, warden_name, warden_phone, active, created_at, updated_at)
VALUES 
('Rose Girls Hostel', 'Block C, College Campus, Bangalore', 100, 100, 'FEMALE', 'WiFi, Gym, Beauty Parlor, Common Room, Laundry, 24/7 Security', 'Mrs. Lakshmi Devi', '9876543212', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Jasmine Girls Hostel', 'Block D, College Campus, Bangalore', 80, 80, 'FEMALE', 'WiFi, Study Room, Indoor Games, Laundry, CCTV', 'Mrs. Priya Sharma', '9876543213', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ========== ROOMS ==========

-- Maple Boys Hostel (ID: 1) - 150 capacity
-- Ground Floor (20 rooms: 10x2-sharing, 10x3-sharing)
INSERT INTO rooms (hostel_id, room_number, floor, block, room_type, capacity, occupied_count, status, amenities, created_at, updated_at)
VALUES
-- 2-Sharing rooms (101-110)
(1, '101', 0, 'A', '2-SHARING', 2, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '102', 0, 'A', '2-SHARING', 2, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '103', 0, 'A', '2-SHARING', 2, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '104', 0, 'A', '2-SHARING', 2, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '105', 0, 'A', '2-SHARING', 2, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '106', 0, 'A', '2-SHARING', 2, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '107', 0, 'A', '2-SHARING', 2, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '108', 0, 'A', '2-SHARING', 2, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '109', 0, 'A', '2-SHARING', 2, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '110', 0, 'A', '2-SHARING', 2, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- 3-Sharing rooms (111-120)
(1, '111', 0, 'A', '3-SHARING', 3, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '112', 0, 'A', '3-SHARING', 3, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '113', 0, 'A', '3-SHARING', 3, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '114', 0, 'A', '3-SHARING', 3, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '115', 0, 'A', '3-SHARING', 3, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '116', 0, 'A', '3-SHARING', 3, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '117', 0, 'A', '3-SHARING', 3, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '118', 0, 'A', '3-SHARING', 3, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '119', 0, 'A', '3-SHARING', 3, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '120', 0, 'A', '3-SHARING', 3, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- First Floor (Same pattern for rooms 201-220)
INSERT INTO rooms (hostel_id, room_number, floor, block, room_type, capacity, occupied_count, status, amenities, created_at, updated_at)
VALUES
-- 2-Sharing rooms (201-210)
(1, '201', 1, 'A', '2-SHARING', 2, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '202', 1, 'A', '2-SHARING', 2, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '203', 1, 'A', '2-SHARING', 2, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '204', 1, 'A', '2-SHARING', 2, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '205', 1, 'A', '2-SHARING', 2, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '206', 1, 'A', '2-SHARING', 2, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '207', 1, 'A', '2-SHARING', 2, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '208', 1, 'A', '2-SHARING', 2, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '209', 1, 'A', '2-SHARING', 2, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '210', 1, 'A', '2-SHARING', 2, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- 3-Sharing rooms (211-220)
(1, '211', 1, 'A', '3-SHARING', 3, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '212', 1, 'A', '3-SHARING', 3, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '213', 1, 'A', '3-SHARING', 3, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '214', 1, 'A', '3-SHARING', 3, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '215', 1, 'A', '3-SHARING', 3, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '216', 1, 'A', '3-SHARING', 3, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '217', 1, 'A', '3-SHARING', 3, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '218', 1, 'A', '3-SHARING', 3, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '219', 1, 'A', '3-SHARING', 3, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '220', 1, 'A', '3-SHARING', 3, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Rose Girls Hostel (ID: 3) - Sample rooms
INSERT INTO rooms (hostel_id, room_number, floor, block, room_type, capacity, occupied_count, status, amenities, created_at, updated_at)
VALUES
-- 2-Sharing rooms
(3, '101', 0, 'C', '2-SHARING', 2, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe, Mirror', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, '102', 0, 'C', '2-SHARING', 2, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe, Mirror', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, '103', 0, 'C', '2-SHARING', 2, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe, Mirror', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, '104', 0, 'C', '2-SHARING', 2, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe, Mirror', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, '105', 0, 'C', '2-SHARING', 2, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe, Mirror', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- 3-Sharing rooms
(3, '111', 0, 'C', '3-SHARING', 3, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe, Mirror', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, '112', 0, 'C', '3-SHARING', 3, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe, Mirror', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, '113', 0, 'C', '3-SHARING', 3, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe, Mirror', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, '114', 0, 'C', '3-SHARING', 3, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe, Mirror', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, '115', 0, 'C', '3-SHARING', 3, 0, 'AVAILABLE', 'Attached Bathroom, Beds, Study Table, Wardrobe, Mirror', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
