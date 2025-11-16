# LMS Backend API

Leave Management System Backend built with Node.js, Express, and MongoDB.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local MongoDB Compass or MongoDB Atlas)
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create `.env` file**
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables**
   Edit `.env` file with your settings:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/lms_db
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRE=30m
   JWT_REFRESH_SECRET=your_super_secret_refresh_key
   JWT_REFRESH_EXPIRE=7d
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system (default: `mongodb://localhost:27017`)

5. **Seed database** (Optional - creates test users)
   ```bash
   npm run seed
   ```

6. **Start server**
   ```bash
   # Development (with nodemon)
   npm run dev

   # Production
   npm start
   ```

Server will run on `http://localhost:5000`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user (Protected)

### Users
- `GET /api/users/profile` - Get user profile (Protected)
- `PUT /api/users/profile` - Update profile (Protected)
- `GET /api/users/balance` - Get leave balance (Protected)
- `PUT /api/users/:userId/balance` - Update balance (HR only)
- `GET /api/users` - Get all users (Manager/HR)

### Leaves
- `POST /api/leaves` - Create leave request (Employee)
- `GET /api/leaves` - Get leave requests (Filtered by role)
- `GET /api/leaves/:id` - Get single leave request
- `PUT /api/leaves/:id` - Update leave (Employee, pending only)
- `DELETE /api/leaves/:id` - Cancel leave (Employee, pending only)
- `POST /api/leaves/:id/approve` - Approve leave (Manager/HR)
- `POST /api/leaves/:id/reject` - Reject leave (Manager/HR)
- `PUT /api/leaves/:id/override` - Override leave (HR only)

### Reports
- `GET /api/reports/summary` - Get summary statistics (Manager/HR)
- `GET /api/reports/export/csv` - Export CSV report (Manager/HR)
- `GET /api/reports/export/pdf` - Export PDF report (Manager/HR)

## 🔐 Authentication

All protected routes require JWT token in header:
```
Authorization: Bearer <token>
```

## 🧪 Test Users (After Seeding)

**HR User:**
- Email: `hr@lms.com`
- Password: `hr123456`

**Manager User:**
- Email: `manager@lms.com`
- Password: `manager123`

**Employee Users:**
- Email: `employee1@lms.com` | Password: `emp123456`
- Email: `employee2@lms.com` | Password: `emp123456`
- Email: `employee3@lms.com` | Password: `emp123456`

## 📁 Project Structure

```
backend/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # MongoDB models
├── routes/          # API routes
├── services/        # Business logic services
├── utils/           # Utility functions
├── scripts/         # Database scripts
├── tests/           # Test files
├── server.js        # Entry point
└── package.json
```

## 🔧 Features

- ✅ JWT Authentication
- ✅ Role-based Access Control (Employee, Manager, HR)
- ✅ Leave Request Management
- ✅ Overlap Prevention (Atomic)
- ✅ Leave Balance Tracking
- ✅ Approval Workflow
- ✅ Audit Trail
- ✅ Report Export (CSV/PDF)
- ✅ Input Validation
- ✅ Error Handling
- ✅ Security (Helmet, CORS, Rate Limiting)

## 📝 Notes

- MongoDB transactions are used for atomic operations
- Leave balance is checked before approval
- Overlapping leaves are prevented atomically
- All actions are logged in audit trail
- Business days calculation can be configured per leave type

## 🐛 Troubleshooting

**MongoDB Connection Error:**
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Verify MongoDB Compass connection

**Port Already in Use:**
- Change `PORT` in `.env`
- Or kill process using port 5000

**JWT Errors:**
- Check `JWT_SECRET` is set in `.env`
- Ensure token is sent in `Authorization` header

