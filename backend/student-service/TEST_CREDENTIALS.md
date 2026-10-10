# Test Credentials for Development

**⚠️ IMPORTANT**: These are plaintext passwords for testing only. Clerk authentication will be integrated later with proper security.

## Quick Test Credentials

### Admin Login
- **Email**: `admin@college.edu`
- **Password**: `admin123`
- **Role**: Admin

### Student Login (Any of these)
- **Email**: Any student email below
- **Password**: `student123` (same for all students)
- **Role**: Student

---

## Student Test Accounts

### First Year Students (Complete Profiles - 100%)

| Register Number | Name | Email | Password | Department | Gender |
|----------------|------|-------|----------|------------|--------|
| 2024CSE001 | Rahul Kumar | rahul.kumar@college.edu | student123 | Computer Science | Male |
| 2024CSE002 | Priya Sharma | priya.sharma@college.edu | student123 | Computer Science | Female |
| 2024ECE001 | Arjun Reddy | arjun.reddy@college.edu | student123 | Electronics | Male |
| 2024ECE002 | Ananya Iyer | ananya.iyer@college.edu | student123 | Electronics | Female |
| 2024CSE003 | Aditya Gupta | aditya.gupta@college.edu | student123 | Computer Science | Male |
| 2024CSE004 | Meera Krishnan | meera.krishnan@college.edu | student123 | Computer Science | Female |

### First Year Students (Incomplete Profiles - for testing profile completion)

| Register Number | Name | Email | Password | Department | Profile % |
|----------------|------|-------|----------|------------|-----------|
| 2024ME001 | Vikram Singh | vikram.singh@college.edu | student123 | Mechanical | 60% |
| 2024ME002 | Sneha Patel | sneha.patel@college.edu | student123 | Mechanical | 70% |

### Second Year Students (Complete Profiles - 100%)

| Register Number | Name | Email | Password | Department | Gender |
|----------------|------|-------|----------|------------|--------|
| 2023CSE015 | Rohan Nair | rohan.nair@college.edu | student123 | Computer Science | Male |
| 2023ECE020 | Ishita Verma | ishita.verma@college.edu | student123 | Electronics | Female |

---

## API Testing

### Login Endpoint

**POST** `http://localhost:8081/api/students/login`

**Request Body**:
```json
{
  "email": "rahul.kumar@college.edu",
  "password": "student123",
  "role": "student"
}
```

**Admin Login Request**:
```json
{
  "email": "admin@college.edu",
  "password": "admin123",
  "role": "admin"
}
```

**Success Response**:
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
    "department": "Computer Science",
    ...
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "message": "Invalid credentials",
  "role": null,
  "student": null
}
```

### Other API Endpoints

**Get All Students**:
```bash
curl http://localhost:8081/api/students
```

**Get Student by ID**:
```bash
curl http://localhost:8081/api/students/1
```

**Get Student by Register Number**:
```bash
curl http://localhost:8081/api/students/register/2024CSE001
```

**Get Student by Email**:
```bash
curl http://localhost:8081/api/students/email/rahul.kumar@college.edu
```

---

## Frontend Integration

Update your LoginPage.jsx to call the login API:

```javascript
const handleLogin = async (e) => {
  e.preventDefault();
  
  try {
    const response = await fetch('http://localhost:8081/api/students/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
        role: selectedRole
      })
    });

    const data = await response.json();

    if (data.success) {
      // Store user data in localStorage or context
      localStorage.setItem('user', JSON.stringify(data.student));
      localStorage.setItem('role', data.role);
      
      // Redirect based on role
      if (data.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('Login failed. Please try again.');
  }
};
```

---

## Migration to Clerk

When Clerk is integrated, we will:

1. **Remove** the `password` column from the `students` table
2. **Remove** the `/login` endpoint
3. **Replace** with Clerk's authentication hooks
4. **Use** Clerk user IDs to link to student records
5. **Implement** proper JWT validation

**Current Flow** (Testing):
```
Login Page → POST /api/students/login → Check password → Return student data
```

**Future Flow** (Clerk):
```
Login Page → Clerk Auth → JWT Token → Protected API → Validate token → Return student data
```

---

## Notes

- ✅ All passwords are `student123` for easy testing
- ✅ Admin credentials: `admin@vit.ac.in` / `admin123`
- ⚠️ Passwords are stored in **plaintext** (NOT secure - for testing only)
- ⚠️ No password hashing implemented (will be removed with Clerk)
- ⚠️ No JWT tokens (will be added with Clerk)
- ✅ CORS enabled for local frontend development
- ✅ All students are `active: true`
- ✅ Complete profiles have all required fields filled
