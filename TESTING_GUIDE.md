# Stable Roomies - Testing Guide

## Prerequisites

### 1. Start PostgreSQL Database
```bash
cd infrastructure/docker
docker-compose -f docker-compose-dev.yml up -d
```

### 2. Insert Sample Data
Once the database is running, insert test data:

```bash
docker exec -i stable-roomies-postgres-student psql -U postgres -d student_db < backend/student-service/insert-sample-data.sql
```

Or manually:
```bash
docker exec -it stable-roomies-postgres-student psql -U postgres -d student_db
# Then paste the INSERT statements from insert-sample-data.sql
```

### 3. Start Backend Service
```bash
cd backend/student-service
mvn spring-boot:run
```

Backend will run on: `http://localhost:8081`

### 4. Start Frontend
```bash
cd frontend
npm run dev
```

Frontend will run on: `http://localhost:5173`

---

## Test Credentials

### Admin Login
- **Email**: `admin@college.edu`
- **Password**: `admin123`
- **Role**: Select "Admin"

### Student Logins

All students use the same password: **`student123`**

| Name | Email | Role | Profile Status |
|------|-------|------|----------------|
| Rahul Kumar | rahul.kumar@college.edu | Student | Complete (100%) |
| Priya Sharma | priya.sharma@college.edu | Student | Complete (100%) |
| Arjun Reddy | arjun.reddy@college.edu | Student | Complete (100%) |
| Ananya Iyer | ananya.iyer@college.edu | Student | Complete (100%) |
| Vikram Singh | vikram.singh@college.edu | Student | Incomplete (60%) |
| Sneha Patel | sneha.patel@college.edu | Student | Incomplete (70%) |
| Aditya Gupta | aditya.gupta@college.edu | Student | Complete (100%) |
| Meera Krishnan | meera.krishnan@college.edu | Student | Complete (100%) |
| Rohan Nair | rohan.nair@college.edu | Student | Complete (100%) |
| Ishita Verma | ishita.verma@college.edu | Student | Complete (100%) |

---

## Testing Workflow

### 1. Test Student Login
1. Go to `http://localhost:5173/login`
2. Select "Student" role
3. Enter: `rahul.kumar@college.edu` / `student123`
4. Click "Sign in as Student"
5. Should redirect to `/student/dashboard`
6. Check if user name appears in top right (Rahul Kumar)
7. Test logout button

### 2. Test Admin Login
1. Go to `http://localhost:5173/login`
2. Select "Admin" role
3. Enter: `admin@college.edu` / `admin123`
4. Click "Sign in as Admin"
5. Should redirect to `/admin/dashboard`

### 3. Test Invalid Login
1. Try wrong password → Should show "Invalid credentials"
2. Try empty fields → Should show "Please fill in all fields"
3. Try non-existent email → Should show "Invalid credentials"

### 4. Test API Directly (Postman/cURL)

**Login Request:**
```bash
curl -X POST http://localhost:8081/api/students/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rahul.kumar@college.edu",
    "password": "student123",
    "role": "student"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "role": "student",
  "student": {
    "id": 1,
    "registerNumber": "2024CSE001",
    "firstName": "Rahul",
    "lastName": "Kumar",
    "email": "rahul.kumar@college.edu",
    "phone": "9876543210",
    "department": "Computer Science",
    "year": 1,
    "semester": 1,
    "gender": "Male",
    "profileComplete": true,
    "profileCompletionPercent": 100,
    "active": true
  }
}
```

**Get All Students:**
```bash
curl http://localhost:8081/api/students
```

**Get Student by Email:**
```bash
curl http://localhost:8081/api/students/email/rahul.kumar@college.edu
```

---

## Features to Test

### Student Dashboard
- [ ] View allocation status
- [ ] View profile completion percentage
- [ ] Navigate to profile page
- [ ] Navigate to preferences page
- [ ] Navigate to room allocation page
- [ ] Logout functionality

### Admin Dashboard
- [ ] View student statistics
- [ ] View room distribution
- [ ] Navigate to students management
- [ ] Navigate to hostels management
- [ ] Navigate to rooms management
- [ ] Navigate to allocation page

---

## Common Issues & Solutions

### Issue: "Unable to connect to server"
**Solution**: Make sure the backend is running on port 8081
```bash
curl http://localhost:8081/api/students
```

### Issue: "Invalid credentials" for correct password
**Solution**: Check if sample data is inserted
```bash
docker exec stable-roomies-postgres-student psql -U postgres -d student_db -c "SELECT email, password FROM students LIMIT 5;"
```

### Issue: Frontend not loading
**Solution**: Check if frontend is running
```bash
cd frontend
npm run dev
```

### Issue: CORS errors
**Solution**: Backend has CORS enabled with `@CrossOrigin(origins = "*")` - should work automatically

### Issue: Database connection error
**Solution**: Verify PostgreSQL is running
```bash
docker ps | grep postgres-student
docker logs stable-roomies-postgres-student
```

---

## Database Access

### Connect to PostgreSQL:
```bash
docker exec -it stable-roomies-postgres-student psql -U postgres -d student_db
```

### Useful SQL Commands:
```sql
-- View all students
SELECT id, register_number, first_name, last_name, email FROM students;

-- Check passwords
SELECT email, password FROM students;

-- Reset a password
UPDATE students SET password = 'newpass123' WHERE email = 'rahul.kumar@college.edu';

-- Delete all students
DELETE FROM students;
```

---

## Architecture Overview

```
Frontend (React)          Backend (Spring Boot)       Database (PostgreSQL)
http://localhost:5173 ←→ http://localhost:8081    ←→ localhost:5432

LoginPage.jsx
  ↓ POST /api/students/login
StudentController.java
  ↓ authenticateStudent()
StudentService.java
  ↓ findByEmail()
StudentRepository.java
  ↓ SQL Query
student_db.students table
```

---

## Next Steps

After verifying login works:
1. Create Student Preferences entity and table
2. Build preference submission endpoints
3. Connect preferences page to backend
4. Implement other microservices (hostel, allocation, notification)
5. Integrate Clerk authentication (replace current password system)

---

## Security Notes

⚠️ **IMPORTANT**: Current implementation is for testing only!

- Passwords are stored in **plaintext** (NOT secure)
- No password hashing (bcrypt will be added)
- No JWT tokens (will be added with Clerk)
- No rate limiting
- No input validation/sanitization
- CORS is wide open (`origins = "*"`)

**All of this will be replaced when Clerk is integrated.**
