# Postman API Testing Guide

Complete guide for testing all LMS Backend APIs using Postman.

## 🔧 Setup

1. **Base URL**: `http://localhost:5000`
2. **Content-Type**: `application/json`
3. **Authentication**: JWT token in `Authorization` header

## 📋 Test Users (After Running Seed Script)

| Role | Email | Password |
|------|-------|----------|
| HR | hr@lms.com | hr123456 |
| Manager | manager@lms.com | manager123 |
| Employee | employee1@lms.com | emp123456 |

---

## 1. Authentication APIs

### 1.1 Register User
**POST** `/api/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "newuser@lms.com",
  "password": "password123",
  "name": "New User",
  "role": "employee",
  "department": "Engineering",
  "managerId": null
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "email": "newuser@lms.com",
      "name": "New User",
      "role": "employee",
      "employeeId": "EMP004",
      "leaveBalances": {...}
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "..."
  }
}
```

---

### 1.2 Login
**POST** `/api/auth/login`

**Body:**
```json
{
  "email": "employee1@lms.com",
  "password": "emp123456"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {...},
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "..."
  }
}
```

**💡 Save the `token` from response for subsequent requests!**

---

### 1.3 Get Current User
**GET** `/api/auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "employee1@lms.com",
      "name": "Alice Employee",
      "role": "employee",
      ...
    }
  }
}
```

---

### 1.4 Refresh Token
**POST** `/api/auth/refresh`

**Body:**
```json
{
  "refreshToken": "<refresh_token_from_login>"
}
```

---

## 2. User APIs

### 2.1 Get Profile
**GET** `/api/users/profile`

**Headers:**
```
Authorization: Bearer <employee_token>
```

---

### 2.2 Update Profile
**PUT** `/api/users/profile`

**Headers:**
```
Authorization: Bearer <employee_token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Updated Name",
  "department": "Updated Department"
}
```

---

### 2.3 Get Leave Balance
**GET** `/api/users/balance`

**Headers:**
```
Authorization: Bearer <employee_token>
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "balances": {
      "casual": 12,
      "sick": 10,
      "earned": 15,
      "unpaid": 0
    }
  }
}
```

---

### 2.4 Update Balance (HR Only)
**PUT** `/api/users/:userId/balance`

**Headers:**
```
Authorization: Bearer <hr_token>
Content-Type: application/json
```

**Body:**
```json
{
  "leaveType": "casual",
  "days": 15
}
```

**Note:** Replace `:userId` with actual user ID

---

### 2.5 Get All Users (Manager/HR)
**GET** `/api/users`

**Headers:**
```
Authorization: Bearer <manager_token>
```

**Query Params (Optional):**
- `role`: employee, manager, hr
- `department`: Engineering, Sales, etc.
- `search`: Search by name, email, or employeeId

---

## 3. Leave APIs

### 3.1 Create Leave Request
**POST** `/api/leaves`

**Headers:**
```
Authorization: Bearer <employee_token>
Content-Type: application/json
```

**Body:**
```json
{
  "startDate": "2024-12-20",
  "endDate": "2024-12-22",
  "type": "casual",
  "reason": "Personal work"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Leave request created successfully",
  "data": {
    "leaveRequest": {
      "_id": "...",
      "userId": "...",
      "startDate": "2024-12-20T00:00:00.000Z",
      "endDate": "2024-12-22T00:00:00.000Z",
      "type": "casual",
      "reason": "Personal work",
      "totalDays": 3,
      "status": "pending",
      ...
    }
  }
}
```

**💡 Test Cases:**
- ✅ Valid request
- ❌ Overlapping dates (should fail)
- ❌ Insufficient balance (should fail)
- ❌ End date before start date (should fail)

---

### 3.2 Get Leave Requests
**GET** `/api/leaves`

**Headers:**
```
Authorization: Bearer <employee_token>
```

**Query Params (Optional):**
- `status`: pending, approved, rejected, cancelled
- `type`: casual, sick, earned, unpaid
- `startDate`: 2024-01-01
- `endDate`: 2024-12-31
- `page`: 1
- `limit`: 10

**Expected Response:**
```json
{
  "success": true,
  "count": 2,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "pages": 1
  },
  "data": {
    "leaves": [...]
  }
}
```

---

### 3.3 Get Single Leave Request
**GET** `/api/leaves/:id`

**Headers:**
```
Authorization: Bearer <employee_token>
```

**Note:** Replace `:id` with actual leave request ID

---

### 3.4 Update Leave Request (Pending Only)
**PUT** `/api/leaves/:id`

**Headers:**
```
Authorization: Bearer <employee_token>
Content-Type: application/json
```

**Body:**
```json
{
  "startDate": "2024-12-21",
  "endDate": "2024-12-23",
  "type": "casual",
  "reason": "Updated reason"
}
```

**Note:** Only pending leaves can be updated

---

### 3.5 Cancel Leave Request
**DELETE** `/api/leaves/:id`

**Headers:**
```
Authorization: Bearer <employee_token>
```

**Note:** Only pending leaves can be cancelled

---

### 3.6 Approve Leave Request
**POST** `/api/leaves/:id/approve`

**Headers:**
```
Authorization: Bearer <manager_token>
Content-Type: application/json
```

**Body:**
```json
{
  "comment": "Approved. Enjoy your leave!"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Leave request approved successfully",
  "data": {
    "leaveRequest": {
      "status": "approved",
      "managerComment": "Approved. Enjoy your leave!",
      ...
    }
  }
}
```

**💡 Test Cases:**
- ✅ Manager approves team member's leave
- ❌ Manager tries to approve non-team member (should fail)
- ❌ Approve overlapping leave (should fail)
- ❌ Approve with insufficient balance (should fail)

---

### 3.7 Reject Leave Request
**POST** `/api/leaves/:id/reject`

**Headers:**
```
Authorization: Bearer <manager_token>
Content-Type: application/json
```

**Body:**
```json
{
  "comment": "Cannot approve due to project deadline"
}
```

---

### 3.8 HR Override Leave Request
**PUT** `/api/leaves/:id/override`

**Headers:**
```
Authorization: Bearer <hr_token>
Content-Type: application/json
```

**Body:**
```json
{
  "status": "approved",
  "comment": "HR override - special circumstances"
}
```

**Note:** HR can override any leave status

---

## 4. Report APIs

### 4.1 Get Summary Statistics
**GET** `/api/reports/summary`

**Headers:**
```
Authorization: Bearer <manager_token>
```

**Query Params (Optional):**
- `startDate`: 2024-01-01
- `endDate`: 2024-12-31
- `department`: Engineering

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "byStatus": {
        "pending": { "count": 5, "totalDays": 12 },
        "approved": { "count": 10, "totalDays": 30 },
        "rejected": { "count": 2, "totalDays": 5 }
      },
      "byType": {
        "casual": { "count": 8, "totalDays": 20 },
        "sick": { "count": 5, "totalDays": 12 }
      },
      "total": {
        "requests": 17,
        "days": 47
      }
    }
  }
}
```

---

### 4.2 Export CSV
**GET** `/api/reports/export/csv`

**Headers:**
```
Authorization: Bearer <hr_token>
```

**Query Params (Optional):**
- `startDate`, `endDate`, `status`, `type`, `department`

**Expected Response:** CSV file download

---

### 4.3 Export PDF
**GET** `/api/reports/export/pdf`

**Headers:**
```
Authorization: Bearer <hr_token>
```

**Query Params (Optional):**
- `startDate`, `endDate`, `status`, `type`, `department`

**Expected Response:** PDF file download

---

## 🧪 Complete Testing Flow

### Step 1: Setup
1. Start MongoDB
2. Run seed script: `npm run seed`
3. Start server: `npm run dev`

### Step 2: Login as Employee
```
POST /api/auth/login
Body: { "email": "employee1@lms.com", "password": "emp123456" }
Save token as: employee_token
```

### Step 3: Create Leave Request
```
POST /api/leaves
Headers: Authorization: Bearer <employee_token>
Body: {
  "startDate": "2024-12-25",
  "endDate": "2024-12-27",
  "type": "casual",
  "reason": "Christmas holidays"
}
Save leave_id from response
```

### Step 4: Login as Manager
```
POST /api/auth/login
Body: { "email": "manager@lms.com", "password": "manager123" }
Save token as: manager_token
```

### Step 5: View Pending Leaves
```
GET /api/leaves?status=pending
Headers: Authorization: Bearer <manager_token>
```

### Step 6: Approve Leave
```
POST /api/leaves/:leave_id/approve
Headers: Authorization: Bearer <manager_token>
Body: { "comment": "Approved!" }
```

### Step 7: Verify Balance Deducted
```
GET /api/users/balance
Headers: Authorization: Bearer <employee_token>
Check casual balance reduced by 3 days
```

### Step 8: Login as HR
```
POST /api/auth/login
Body: { "email": "hr@lms.com", "password": "hr123456" }
Save token as: hr_token
```

### Step 9: Get Summary
```
GET /api/reports/summary
Headers: Authorization: Bearer <hr_token>
```

### Step 10: Export Report
```
GET /api/reports/export/csv
Headers: Authorization: Bearer <hr_token>
```

---

## ❌ Error Testing

### Test Overlap Prevention
1. Create leave: Dec 20-22
2. Try to create another: Dec 21-23 (should fail)

### Test Balance Check
1. Set balance to 2 days
2. Try to apply for 5 days (should fail)

### Test Access Control
1. Employee tries to approve leave (should fail - 403)
2. Manager tries to approve non-team member (should fail - 403)
3. Access without token (should fail - 401)

---

## 📝 Postman Collection Variables

Set these variables in Postman:
- `base_url`: http://localhost:5000
- `employee_token`: (from login)
- `manager_token`: (from login)
- `hr_token`: (from login)
- `leave_id`: (from create leave)

Then use: `{{base_url}}/api/leaves` in requests

---

## ✅ Success Criteria

All APIs should:
- ✅ Return proper status codes
- ✅ Validate input data
- ✅ Enforce role-based access
- ✅ Prevent overlapping leaves
- ✅ Check balance before approval
- ✅ Deduct balance atomically
- ✅ Log audit trail
- ✅ Handle errors gracefully

