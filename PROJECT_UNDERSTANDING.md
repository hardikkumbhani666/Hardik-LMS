# Leave Management System (LMS) - Complete Project Understanding

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack & Why](#technology-stack--why)
4. [Database Design](#database-design)
5. [API Architecture](#api-architecture)
6. [Authentication & Authorization Flow](#authentication--authorization-flow)
7. [Core Features & Business Logic](#core-features--business-logic)
8. [Data Flow Diagrams](#data-flow-diagrams)
9. [Security Considerations](#security-considerations)
10. [Project Structure](#project-structure)

---

## 🎯 Project Overview

### What is LMS?
A **Leave Management System** is an enterprise application that automates the process of:
- Employees requesting time off
- Managers approving/rejecting requests
- HR managing policies and generating reports
- Tracking leave balances and preventing conflicts

### Key Problems It Solves
1. **Manual Process Elimination**: No more paper forms or email chains
2. **Overlap Prevention**: System prevents double-booking leaves
3. **Balance Tracking**: Automatic calculation of remaining leave days
4. **Audit Trail**: Complete history of who did what and when
5. **Role-Based Access**: Different permissions for Employee, Manager, HR

---

## 🏗️ System Architecture

### High-Level Architecture (3-Tier)

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (React)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│
│  │ Employee │  │ Manager  │  │   HR     │  │  Admin   ││
│  │ Dashboard│  │ Dashboard│  │ Dashboard│  │  Panel   ││
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘│
└─────────────────────────────────────────────────────────┘
                          │
                    HTTP/REST API
                          │
┌─────────────────────────────────────────────────────────┐
│                 APPLICATION LAYER (Node.js)              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│
│  │   Auth   │  │  Leave   │  │  User    │  │  Audit   ││
│  │ Controller│ │ Controller│ │ Controller│ │ Controller││
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘│
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│
│  │   Auth   │  │  Leave   │  │  User   │  │  Report   ││
│  │  Service │  │  Service │  │ Service │  │  Service  ││
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘│
└─────────────────────────────────────────────────────────┘
                          │
                    MongoDB Driver
                          │
┌─────────────────────────────────────────────────────────┐
│                    DATA LAYER (MongoDB)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│
│  │  Users   │  │  Leaves  │  │  Audit   │  │  Policies││
│  │ Collection│ │ Collection│ │ Collection│ │ Collection││
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘│
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack & Why

### Backend Stack

#### 1. **Node.js + Express.js**
- **Why**: 
  - JavaScript everywhere (as per requirement)
  - Fast, non-blocking I/O for handling multiple requests
  - Large ecosystem (npm packages)
  - Easy to learn and maintain

#### 2. **MongoDB**
- **Why**:
  - NoSQL - flexible schema for evolving requirements
  - Document-based - perfect for nested data (leave balances, audit trails)
  - Easy horizontal scaling
  - Local MongoDB Compass for development

#### 3. **Mongoose ODM**
- **Why**:
  - Schema validation
  - Middleware (pre/post hooks)
  - Built-in query building
  - Type casting

#### 4. **JWT (jsonwebtoken)**
- **Why**:
  - Stateless authentication
  - No server-side session storage needed
  - Secure token-based auth
  - Refresh tokens for better security

#### 5. **bcrypt**
- **Why**:
  - Industry-standard password hashing
  - Salt rounds for security
  - One-way hashing (can't reverse)

#### 6. **express-validator / Zod**
- **Why**:
  - Input validation and sanitization
  - Prevents injection attacks
  - Type-safe validation

#### 7. **dotenv**
- **Why**:
  - Environment variable management
  - Separate configs for dev/prod
  - Security (no hardcoded secrets)

### Frontend Stack

#### 1. **React**
- **Why**:
  - Component-based architecture
  - Reusable UI components
  - Virtual DOM for performance
  - Large community

#### 2. **React Router**
- **Why**:
  - Client-side routing
  - Protected routes
  - Navigation without page reload

#### 3. **React Query (TanStack Query)**
- **Why**:
  - Automatic caching
  - Background refetching
  - Loading/error states
  - Reduces boilerplate

#### 4. **Axios**
- **Why**:
  - HTTP client for API calls
  - Request/response interceptors
  - Better than fetch API

#### 5. **Tailwind CSS / Material UI**
- **Why**:
  - Rapid UI development
  - Responsive design
  - Modern, professional look

---

## 🗄️ Database Design

### Collections & Schemas

#### 1. **Users Collection**
```javascript
{
  _id: ObjectId,
  email: String (unique, indexed),
  password: String (hashed),
  name: String,
  role: String (enum: ['employee', 'manager', 'hr']),
  employeeId: String (unique),
  managerId: ObjectId (ref: User), // For employees
  department: String,
  leaveBalances: {
    casual: Number,
    sick: Number,
    earned: Number,
    unpaid: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `email`: unique
- `employeeId`: unique
- `managerId`: for quick manager queries

#### 2. **LeaveRequests Collection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, indexed),
  startDate: Date (indexed),
  endDate: Date (indexed),
  type: String (enum: ['casual', 'sick', 'earned', 'unpaid']),
  reason: String,
  totalDays: Number,
  status: String (enum: ['pending', 'approved', 'rejected', 'cancelled']),
  managerId: ObjectId (ref: User),
  managerComment: String,
  hrComment: String,
  auditTrail: [{
    action: String,
    by: ObjectId (ref: User),
    at: Date,
    meta: Object
  }],
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `userId`: for user's leave history
- `startDate`, `endDate`: for overlap queries
- Compound: `{userId: 1, status: 1}` for quick filtering
- `createdAt`: for sorting

#### 3. **AuditLogs Collection** (Optional - can be embedded or separate)
```javascript
{
  _id: ObjectId,
  action: String,
  entityType: String,
  entityId: ObjectId,
  userId: ObjectId (ref: User),
  changes: Object,
  ipAddress: String,
  userAgent: String,
  timestamp: Date (indexed)
}
```

#### 4. **LeavePolicies Collection**
```javascript
{
  _id: ObjectId,
  leaveType: String,
  maxDays: Number,
  carryForward: Boolean,
  requiresDocument: Boolean,
  businessDaysOnly: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔌 API Architecture

### RESTful Endpoints Structure

```
/api/auth
  POST   /register          - User registration
  POST   /login             - User login
  POST   /refresh           - Refresh JWT token
  POST   /logout            - Logout (optional)

/api/users
  GET    /profile           - Get current user profile
  PUT    /profile           - Update profile
  GET    /balance           - Get leave balance

/api/leaves
  POST   /                  - Create leave request
  GET    /                  - Get leaves (filtered by role)
  GET    /:id               - Get single leave request
  PUT    /:id               - Update leave (only pending)
  DELETE /:id               - Cancel leave (only pending)
  POST   /:id/approve       - Approve leave (Manager/HR)
  POST   /:id/reject        - Reject leave (Manager/HR)
  GET    /overlap           - Check for overlaps

/api/reports
  GET    /export/csv        - Export CSV report
  GET    /export/pdf        - Export PDF report
  GET    /summary           - Get summary statistics

/api/admin (HR only)
  PUT    /users/:id/balance - Update leave balance
  PUT    /policies          - Update leave policies
  GET    /audit             - Get audit logs
```

---

## 🔐 Authentication & Authorization Flow

### JWT Flow

```
1. User Login
   └─> POST /api/auth/login
       └─> Verify email/password
           └─> Generate JWT (access token)
               └─> Generate Refresh Token
                   └─> Return tokens + user info

2. Protected Route Access
   └─> Client sends: Authorization: Bearer <token>
       └─> Middleware verifies token
           └─> Extract user info from token
               └─> Attach to req.user
                   └─> Route handler checks role

3. Token Refresh
   └─> POST /api/auth/refresh
       └─> Verify refresh token
           └─> Generate new access token
```

### Role-Based Access Control (RBAC)

```
Employee:
  ✅ Apply for leave
  ✅ View own leaves
  ✅ Edit/cancel pending leaves
  ✅ View own balance
  ❌ Approve/reject leaves
  ❌ View others' leaves

Manager:
  ✅ All Employee permissions
  ✅ View team members' leaves
  ✅ Approve/reject team leaves
  ✅ Add comments
  ❌ Override HR decisions
  ❌ Manage policies

HR:
  ✅ All Manager permissions
  ✅ View all leaves
  ✅ Override any decision
  ✅ Manage leave balances
  ✅ Manage policies
  ✅ Export reports
  ✅ View audit logs
```

---

## ⚙️ Core Features & Business Logic

### 1. Leave Application Flow

```
Employee Action:
  1. Fill form (startDate, endDate, type, reason)
  2. Frontend calculates totalDays
  3. POST /api/leaves
     └─> Backend validates:
         ├─> Check date range (startDate ≤ endDate)
         ├─> Check leave balance (if not unpaid)
         ├─> Check for overlapping approved leaves (ATOMIC)
         ├─> Check duplicate pending requests
         └─> Create leave request (status: 'pending')
             └─> Add audit entry
                 └─> Return success
```

### 2. Overlap Prevention (Critical Logic)

**Problem**: Prevent two approved leaves from overlapping dates.

**Solution**: Atomic query check before approval/creation.

```javascript
// Pseudo-code
const overlapCheck = {
  userId: req.user.id,
  status: { $in: ['approved', 'pending'] }, // Check approved + pending
  $or: [
    // Case 1: New leave starts during existing leave
    { startDate: { $lte: newEndDate, $gte: newStartDate } },
    // Case 2: New leave ends during existing leave
    { endDate: { $gte: newStartDate, $lte: newEndDate } },
    // Case 3: New leave completely covers existing leave
    { startDate: { $gte: newStartDate }, endDate: { $lte: newEndDate } }
  ]
};

const existingLeave = await LeaveRequest.findOne(overlapCheck);
if (existingLeave) {
  throw new Error('Overlapping leave exists');
}
```

### 3. Leave Balance Check

```javascript
// When applying
if (leaveType !== 'unpaid') {
  const balance = user.leaveBalances[leaveType];
  if (balance < totalDays) {
    throw new Error('Insufficient leave balance');
  }
}

// When approving (use transaction)
const session = await mongoose.startSession();
session.startTransaction();
try {
  // Update leave status
  await LeaveRequest.updateOne(
    { _id: leaveId },
    { status: 'approved' },
    { session }
  );
  
  // Deduct balance
  await User.updateOne(
    { _id: userId },
    { $inc: { [`leaveBalances.${leaveType}`]: -totalDays } },
    { session }
  );
  
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
}
```

### 4. Business Days Calculation

```javascript
function calculateBusinessDays(startDate, endDate) {
  let count = 0;
  const current = new Date(startDate);
  const end = new Date(endDate);
  
  while (current <= end) {
    const dayOfWeek = current.getDay();
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}
```

### 5. Approval Cascade

```
1. Employee applies → status: 'pending'
2. Manager approves → status: 'approved'
   └─> Deduct balance
   └─> Add audit entry
3. HR can override:
   └─> Change status (approve/reject)
   └─> Add HR comment
   └─> Restore balance if rejecting approved leave
```

### 6. Audit Trail

Every action logs:
```javascript
{
  action: 'leave_created' | 'leave_approved' | 'leave_rejected' | 'leave_cancelled',
  by: userId,
  at: new Date(),
  meta: {
    leaveId: leaveId,
    previousStatus: 'pending',
    newStatus: 'approved',
    comment: 'Manager comment'
  }
}
```

---

## 🔄 Data Flow Diagrams

### Leave Application Flow

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│ Employee │         │ Frontend │         │ Backend  │
└────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                    │
     │ 1. Fill Form       │                    │
     ├───────────────────>│                    │
     │                    │                    │
     │                    │ 2. POST /leaves    │
     │                    ├───────────────────>│
     │                    │                    │
     │                    │                    │ 3. Validate
     │                    │                    │    - Dates
     │                    │                    │    - Balance
     │                    │                    │    - Overlap
     │                    │                    │
     │                    │                    │ 4. Create Leave
     │                    │                    │    - Save to DB
     │                    │                    │    - Add Audit
     │                    │                    │
     │                    │ 5. Response        │
     │                    │<───────────────────┤
     │ 6. Show Success    │                    │
     │<───────────────────┤                    │
```

### Approval Flow

```
┌──────────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐
│ Manager  │         │ Frontend │         │ Backend  │         │  MongoDB │
└────┬─────┘         └────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                    │                    │
     │ 1. View Requests   │                    │                    │
     ├───────────────────>│                    │                    │
     │                    │ GET /leaves         │                    │
     │                    ├───────────────────>│                    │
     │                    │                    │ Query DB           │
     │                    │                    ├───────────────────>│
     │                    │                    │<───────────────────┤
     │                    │<───────────────────┤                    │
     │ 2. Show List       │                    │                    │
     │<───────────────────┤                    │                    │
     │                    │                    │                    │
     │ 3. Click Approve   │                    │                    │
     ├───────────────────>│                    │                    │
     │                    │ POST /leaves/:id/approve                │
     │                    ├───────────────────>│                    │
     │                    │                    │ Start Transaction  │
     │                    │                    ├───────────────────>│
     │                    │                    │ Update Leave       │
     │                    │                    ├───────────────────>│
     │                    │                    │ Deduct Balance     │
     │                    │                    ├───────────────────>│
     │                    │                    │ Add Audit         │
     │                    │                    ├───────────────────>│
     │                    │                    │ Commit Transaction │
     │                    │                    ├───────────────────>│
     │                    │<───────────────────┤                    │
     │ 4. Success         │                    │                    │
     │<───────────────────┤                    │                    │
```

---

## 🔒 Security Considerations

### 1. **Password Security**
- Hash with bcrypt (salt rounds: 10-12)
- Never store plain passwords
- Enforce strong password policy

### 2. **JWT Security**
- Short-lived access tokens (15-30 min)
- Longer refresh tokens (7 days)
- Store in httpOnly cookies (better) or localStorage
- Validate token on every request

### 3. **Input Validation**
- Validate all inputs (express-validator/Zod)
- Sanitize to prevent XSS
- Type checking

### 4. **Authorization**
- Check role on every protected route
- Middleware: `requireRole(['manager', 'hr'])`
- Don't trust client-side role checks

### 5. **Database Security**
- Use parameterized queries (Mongoose does this)
- Index sensitive fields
- Limit query results (pagination)

### 6. **API Security**
- Rate limiting (express-rate-limit)
- CORS configuration
- Helmet.js for headers

---

## 📁 Project Structure

### Backend Structure
```
backend/
├── config/
│   ├── database.js          # MongoDB connection
│   └── jwt.js               # JWT config
├── controllers/
│   ├── authController.js
│   ├── leaveController.js
│   ├── userController.js
│   └── reportController.js
├── models/
│   ├── User.js
│   ├── LeaveRequest.js
│   ├── AuditLog.js
│   └── LeavePolicy.js
├── routes/
│   ├── authRoutes.js
│   ├── leaveRoutes.js
│   ├── userRoutes.js
│   └── reportRoutes.js
├── middleware/
│   ├── auth.js              # JWT verification
│   ├── roleCheck.js         # Role-based access
│   ├── validator.js         # Input validation
│   └── errorHandler.js      # Error handling
├── services/
│   ├── leaveService.js      # Business logic
│   ├── balanceService.js
│   └── overlapService.js
├── utils/
│   ├── calculateDays.js
│   ├── dateHelpers.js
│   └── logger.js
├── scripts/
│   ├── seed.js              # Seed database
│   └── migrate.js           # Migrations
├── tests/
│   ├── unit/
│   └── integration/
├── .env.example
├── .gitignore
├── package.json
├── server.js                # Entry point
└── README.md
```

### Frontend Structure
```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Loading.jsx
│   │   ├── auth/
│   │   │   └── LoginForm.jsx
│   │   ├── employee/
│   │   │   ├── LeaveForm.jsx
│   │   │   └── LeaveList.jsx
│   │   ├── manager/
│   │   │   └── ApprovalList.jsx
│   │   └── hr/
│   │       └── ReportExport.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── EmployeeDashboard.jsx
│   │   ├── ManagerDashboard.jsx
│   │   └── HRDashboard.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useLeaves.js
│   ├── services/
│   │   └── api.js           # Axios instance
│   ├── utils/
│   │   ├── constants.js
│   │   └── helpers.js
│   ├── App.jsx
│   ├── index.jsx
│   └── index.css
├── package.json
└── README.md
```

---

## 🎯 Key Implementation Points

### 1. **Atomic Operations**
- Use MongoDB transactions for balance deduction
- Single query for overlap checks
- Prevent race conditions

### 2. **Error Handling**
- Try-catch blocks everywhere
- Custom error classes
- Meaningful error messages
- Proper HTTP status codes

### 3. **Validation**
- Frontend validation (UX)
- Backend validation (Security)
- Schema validation (Mongoose)

### 4. **Performance**
- Database indexes
- Pagination
- Query optimization
- Caching (optional)

### 5. **Testing**
- Unit tests (Jest)
- Integration tests
- API tests (Supertest)

---

## 🚀 Next Steps

Now that you understand the complete architecture:

1. **Backend Setup** (Next)
   - Initialize Node.js project
   - Setup MongoDB connection
   - Create models
   - Implement authentication
   - Build leave management APIs

2. **Frontend Setup** (After Backend)
   - Initialize React app
   - Setup routing
   - Implement authentication
   - Build dashboards
   - Connect to backend APIs

3. **Testing & Deployment**
   - Write tests
   - Deploy backend
   - Deploy frontend
   - Documentation

---

## 📝 Summary

This LMS is a **production-ready** system with:
- ✅ Secure authentication (JWT)
- ✅ Role-based access control
- ✅ Atomic operations (no data corruption)
- ✅ Complete audit trail
- ✅ Overlap prevention
- ✅ Balance management
- ✅ Professional code structure
- ✅ Error handling
- ✅ Input validation

**Ready to build?** Let's start with the backend! 🚀

