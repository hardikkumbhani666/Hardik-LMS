# 🚀 Leave Management System - Development Setup Guide

Complete setup guide for developers to get the Leave Management System running locally.

## 📋 Prerequisites

Before you begin, ensure you have installed:

### Required Software
- **Node.js** (v18.x or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) - verify with `npm --version`
- **Git** - [Download](https://git-scm.com/)
- **MongoDB** (Local or Cloud)
  - **Local**: [Download MongoDB Community](https://www.mongodb.com/try/download/community)
  - **Cloud**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Recommended for production)

### System Requirements
- **OS**: Windows, macOS, or Linux
- **RAM**: Minimum 4GB
- **Disk Space**: Minimum 2GB
- **Port Availability**: 5000 (Backend), 5173 (Frontend)

## 📥 Installation Steps

### Step 1: Clone the Repository

```bash
git clone https://github.com/hardikkumbhani666/Hardik-LMS.git
cd Hardik-LMS
```

### Step 2: Setup Backend

#### 2.1 Navigate to Backend Directory
```bash
cd backend
```

#### 2.2 Install Backend Dependencies
```bash
npm install
```

#### 2.3 Create Environment Configuration

Copy `.env.example` to `.env`:

**Windows (Command Prompt):**
```cmd
copy .env.example .env
```

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**macOS/Linux:**
```bash
cp .env.example .env
```

#### 2.4 Configure Backend Environment

Edit `backend/.env` and update the following:

```env
# Database (Use local MongoDB or MongoDB Atlas)
MONGODB_URI=mongodb://localhost:27017/lms

# JWT Secret (Generate a secure random string)
JWT_SECRET=your_super_secret_key_here_change_this

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

#### 2.5 Setup MongoDB

**Option A: Local MongoDB**
1. Install MongoDB Community Edition
2. Start MongoDB service:
   - **Windows**: MongoDB should auto-start or run `mongod` in cmd
   - **macOS**: `brew services start mongodb-community`
   - **Linux**: `sudo systemctl start mongod`

**Option B: MongoDB Atlas (Cloud)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a cluster
4. Get connection string
5. Update `MONGODB_URI` in `.env` with your connection string

#### 2.6 Seed Database (Optional - Initial Data)

```bash
npm run seed
```

This will populate the database with:
- Sample users (Employee, Manager, HR)
- Sample leave policies
- Sample leave requests

### Step 3: Setup Frontend

#### 3.1 Navigate to Frontend Directory (from project root)

```bash
cd frontend
```

#### 3.2 Install Frontend Dependencies

```bash
npm install
```

#### 3.3 Create Environment Configuration

Copy `.env.example` to `.env.local`:

**Windows (Command Prompt):**
```cmd
copy .env.example .env.local
```

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env.local
```

**macOS/Linux:**
```bash
cp .env.example .env.local
```

#### 3.4 Configure Frontend Environment

Edit `frontend/.env.local`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## 🎯 Running the Application

### Terminal Setup

You need **2 terminals** open:

#### Terminal 1: Start Backend Server

```bash
cd backend
npm start
# or for development with auto-reload:
npm run dev
```

Expected output:
```
Server running on http://localhost:5000
Connected to MongoDB
```

#### Terminal 2: Start Frontend Development Server

```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

## 👤 Default Test Credentials

After running `npm run seed` in backend, use these credentials:

### Employee Account
- **Email**: `employee1@example.com`
- **Password**: `password123`
- **Role**: Employee

### Manager Account
- **Email**: `manager1@example.com`
- **Password**: `password123`
- **Role**: Manager

### HR Account
- **Email**: `hr1@example.com`
- **Password**: `password123`
- **Role**: HR

## 🔧 Available Scripts

### Backend Scripts

```bash
npm start          # Start server in production mode
npm run dev        # Start server with auto-reload (development)
npm run seed       # Seed database with sample data
npm test           # Run tests (if available)
```

### Frontend Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build locally
```

## 📁 Project Structure

```
Hardik-LMS/
├── backend/
│   ├── config/           # Database & JWT configuration
│   ├── controllers/       # Route controllers
│   ├── models/           # MongoDB Mongoose models
│   ├── routes/           # Express routes
│   ├── middleware/       # Custom middleware (auth, validation)
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   ├── scripts/          # Setup scripts (seed.js)
│   ├── uploads/          # File uploads directory
│   ├── .env.example      # Environment variables template
│   ├── package.json      # Backend dependencies
│   └── server.js         # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── context/      # React Context for state
│   │   ├── services/     # API service calls
│   │   ├── App.jsx       # Main app component
│   │   └── main.jsx      # Entry point
│   ├── .env.example      # Environment variables template
│   ├── package.json      # Frontend dependencies
│   └── vite.config.js    # Vite configuration
│
├── .gitignore           # Git ignore rules
├── README.md            # Project overview
└── SETUP.md             # This file
```

## 🐛 Troubleshooting

### Issue: "Cannot connect to MongoDB"

**Solution:**
1. Verify MongoDB is running: `mongosh` (or `mongo` for older versions)
2. Check `MONGODB_URI` in `.env`
3. For MongoDB Atlas, verify IP whitelist and connection string
4. Check port 27017 is available

### Issue: "Port 5000 already in use"

**Solution:**
```bash
# Find process using port 5000
# Windows:
netstat -ano | findstr :5000

# macOS/Linux:
lsof -i :5000

# Kill the process (Windows):
taskkill /PID <PID> /F

# Kill the process (macOS/Linux):
kill -9 <PID>
```

Then restart the backend server.

### Issue: "Port 5173 already in use"

**Solution:**
Same as above, or change port in `vite.config.js`:
```javascript
export default {
  server: {
    port: 5174  // Change to another port
  }
}
```

### Issue: "npm install fails"

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: "Module not found" errors

**Solution:**
1. Ensure all dependencies are installed: `npm install`
2. Verify Node.js version: `node --version` (should be v18+)
3. Clear `.vite` cache: `rm -rf .vite`
4. Restart development server

### Issue: "CORS errors in console"

**Solution:**
1. Verify backend is running on `http://localhost:5000`
2. Check `FRONTEND_URL` in backend `.env`
3. Verify `VITE_API_BASE_URL` in frontend `.env.local`
4. Both should match for CORS to work

## 🔐 Security Best Practices

### For Development

1. **Never commit `.env` files** - only commit `.env.example`
2. **Generate new JWT secrets** - Don't use example values in production
3. **Use strong passwords** - For all accounts
4. **Local MongoDB** - Use for development, MongoDB Atlas for production
5. **Disable debug mode** - In production (`VITE_ENABLE_DEBUG_MODE=false`)

### Before Production Deployment

1. Update all environment variables
2. Use strong JWT secrets (32+ characters)
3. Enable HTTPS
4. Setup proper database backups
5. Configure rate limiting
6. Implement request logging
7. Setup monitoring and alerting

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [React Router Documentation](https://reactrouter.com/)

## 📞 Support

For issues or questions:
1. Check [Issues](https://github.com/hardikkumbhani666/Hardik-LMS/issues)
2. Review project documentation
3. Create a new issue with detailed information

## ✅ Verification Checklist

After setup, verify:

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can login with test credentials
- [ ] Can view dashboard
- [ ] Can apply for leave
- [ ] Can approve/reject leaves (as manager/HR)
- [ ] No console errors in browser
- [ ] No errors in backend terminal

## 🎉 Ready to Develop!

You're all set! Start building amazing features for the Leave Management System.

Happy coding! 🚀
