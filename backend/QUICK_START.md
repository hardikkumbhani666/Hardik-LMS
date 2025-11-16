# 🚀 Quick Start Guide

## Step 1: Install Dependencies
```bash
cd backend
npm install
```

## Step 2: Setup Environment
The `.env` file is already created. Verify it contains:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/lms_db
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=30m
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this_in_production
JWT_REFRESH_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

## Step 3: Start MongoDB
Make sure MongoDB is running on your system:
- Open MongoDB Compass
- Connect to: `mongodb://localhost:27017`
- Or start MongoDB service if using command line

## Step 4: Seed Database (Optional but Recommended)
This creates test users for testing:
```bash
npm run seed
```

**Test Users Created:**
- HR: `hr@lms.com` / `hr123456`
- Manager: `manager@lms.com` / `manager123`
- Employees: `employee1@lms.com` / `emp123456` (and 2 more)

## Step 5: Start Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will start on: `http://localhost:5000`

## Step 6: Test API
Open Postman and test the login endpoint:

**POST** `http://localhost:5000/api/auth/login`
```json
{
  "email": "employee1@lms.com",
  "password": "emp123456"
}
```

You should receive a token in response!

## 📚 Next Steps
1. Read `POSTMAN_TESTING.md` for complete API testing guide
2. Read `README.md` for detailed documentation
3. Test all endpoints using Postman collection

## ✅ Verification Checklist
- [ ] MongoDB is running
- [ ] Dependencies installed (`node_modules` exists)
- [ ] `.env` file configured
- [ ] Database seeded (optional)
- [ ] Server starts without errors
- [ ] Login API works in Postman

## 🐛 Troubleshooting

**Error: Cannot connect to MongoDB**
- Check if MongoDB is running
- Verify `MONGODB_URI` in `.env`
- Try connecting via MongoDB Compass first

**Error: Port 5000 already in use**
- Change `PORT` in `.env` to another port (e.g., 5001)
- Or kill the process using port 5000

**Error: Module not found**
- Run `npm install` again
- Check `package.json` has all dependencies

**Error: JWT secret not found**
- Ensure `.env` file exists
- Check `JWT_SECRET` is set in `.env`

