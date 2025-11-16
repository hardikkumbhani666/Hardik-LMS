# 🔐 Test Credentials & Access Guide

## 📋 Quick Reference

### Default Test Accounts

After running `npm run seed` in the backend, use these credentials:

#### 🔴 HR Account (Administrator)
```
Email: hr@lms.com
Password: hr123456
Role: HR/Admin
Access: 
  - View all leave requests
  - Approve/Reject/Override
  - Manage users & policies
  - Export reports (CSV/PDF)
  - View audit logs
  - Update leave balances
```

#### 🟡 Manager Account
```
Email: manager@lms.com
Password: manager123
Role: Manager
Access:
  - View team leave requests
  - Approve/Reject team leaves
  - Add comments
  - View team members
  - Bulk approve functionality
```

#### 🟢 Employee Accounts (3 available)

**Employee 1:**
```
Email: employee1@lms.com
Password: emp123456
Role: Employee
Reports to: manager@lms.com
Initial Leave Balance:
  - Casual: 12 days
  - Sick: 8 days
  - Earned: 5 days
  - Unpaid: Unlimited
```

**Employee 2:**
```
Email: employee2@lms.com
Password: emp123456
Role: Employee
Reports to: manager@lms.com
Initial Leave Balance:
  - Casual: 12 days
  - Sick: 8 days
  - Earned: 5 days
  - Unpaid: Unlimited
```

**Employee 3:**
```
Email: employee3@lms.com
Password: emp123456
Role: Employee
Reports to: manager@lms.com
Initial Leave Balance:
  - Casual: 12 days
  - Sick: 8 days
  - Earned: 5 days
  - Unpaid: Unlimited
```

---

## 🔄 Self-Signup Feature

Users can also register via the signup page:

### Signup Process
1. Click "Don't have an account? Register here" on login page
2. Fill in details:
   - Full Name
   - Email (unique)
   - Password (must be strong)
   - Confirm Password
3. Click Register
4. New user gets default 'employee' role
5. Can login immediately

### After Signup
- Role defaults to: **Employee**
- Leave Balance defaults to:
  - Casual: 12 days
  - Sick: 8 days
  - Earned: 5 days
- HR can assign Manager role via User Management

---

## 🧪 Testing Scenarios

### Scenario 1: Employee Apply for Leave
```
1. Login as: employee1@lms.com / emp123456
2. Go to: Employee Dashboard → Apply Leave
3. Fill:
   - Start Date: (Future date)
   - End Date: (Future date)
   - Type: Casual
   - Reason: "Vacation"
   - Attachment: (Optional)
4. Click Submit
5. Status: Pending (shown on dashboard)
```

### Scenario 2: Manager Approve Leave
```
1. Login as: manager@lms.com / manager123
2. Go to: Manager Dashboard → Team Leaves
3. Find leave from employee1
4. Click "Approve"
5. Add comment: (Optional)
6. Confirm approval
7. Result: Leave status changes to Approved
           Employee balance decreases
```

### Scenario 3: HR Override Decision
```
1. Login as: hr@lms.com / hr123456
2. Go to: HR Dashboard → All Leaves
3. Find any leave request
4. Click "Override"
5. Select new status (Approve/Reject)
6. Add HR comment
7. Confirm action
8. Result: Action logged in audit trail
```

### Scenario 4: Prevent Overlapping Leaves
```
1. Login as: employee1@lms.com / emp123456
2. Go to: Apply Leave
3. Apply for: Dec 20-25, 2025 (Casual)
4. Get approved by manager
5. Try applying again for: Dec 23-27, 2025
6. Result: System shows error: "Overlapping leave exists"
```

### Scenario 5: Insufficient Balance Check
```
1. Login as: employee2@lms.com / emp123456
2. Go to: Apply Leave
3. Current Casual balance: 12 days
4. Try applying for: 15 days (Casual)
5. Result: System shows error: "Insufficient leave balance"
```

### Scenario 6: Export Report (HR)
```
1. Login as: hr@lms.com / hr123456
2. Go to: HR Dashboard → Reports
3. Select:
   - Date Range: (Custom dates)
   - Leave Type: (All/Specific)
   - Status: (All/Approved/Rejected)
4. Click "Export as CSV" or "Export as PDF"
5. Result: Report downloads with selected data
```

### Scenario 7: View Audit Trail
```
1. Login with any role
2. Navigate to: Dashboard → Audit Trail
3. View:
   - All actions performed
   - By whom
   - When
   - What changed
4. Result: Complete history visible
```

---

## 🚀 How to Get Test Credentials

### Method 1: Use Pre-seeded Accounts (Recommended)
```bash
cd backend
npm run seed
# Wait for "✅ Database seeded successfully"
# Use credentials above
```

### Method 2: Self-register & Assign Role
```bash
1. Go to http://localhost:5173
2. Click "Register"
3. Fill signup form:
   - Name: Test Manager
   - Email: testmanager@example.com
   - Password: TestPass123!
   - Confirm: TestPass123!
4. Click Register
5. You'll be created as 'employee'
6. Login as HR (hr@lms.com) 
7. Go to Users Management
8. Find your user and change role to 'manager'
9. Logout and login with new credentials
```

---

## 🔐 Security Notes

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&*)

### Security Best Practices
- ✅ Never share credentials publicly
- ✅ Change password after first login in production
- ✅ Use HTTPS in production
- ✅ Store tokens in httpOnly cookies (production)
- ✅ Use strong JWT secret

### JWT Token Details
- **Access Token**: Valid for 30 minutes
- **Refresh Token**: Valid for 7 days
- **Storage**: localStorage (dev) / httpOnly cookies (prod)
- **Header**: `Authorization: Bearer <token>`

---

## 📱 Account Features by Role

### Employee Dashboard
```
- 📊 Profile: View name, email, role
- 💰 Balance: See leave balance by type
- 📝 Apply Leave: Create new leave request
- 📋 My Leaves: View submitted requests
- 📁 Attachments: Upload/download files
- 📜 Audit Trail: View own actions
- 🔄 Edit/Cancel: Only pending leaves
```

### Manager Dashboard
```
- 👥 Team Members: View team
- 📋 Team Leaves: View team requests
- ✅ Approve/Reject: Team leaves only
- 💬 Comments: Add decision comments
- 📊 Analytics: Team statistics
- 📜 Audit Trail: Team actions
- 🔄 Bulk Approve: Multiple at once
```

### HR Dashboard
```
- 🌍 All Leaves: Organization-wide
- 👥 Users Management: CRUD users
- 💼 Assign Roles: Employee/Manager/HR
- 💰 Update Balances: Manual adjustments
- 📊 Reports: CSV/PDF export
- 📈 Analytics: Full organization stats
- 📜 Audit Trail: All system actions
- ⚙️ Policies: Manage leave policies
- 🔐 Settings: System configuration
```

---

## 🆘 Troubleshooting Credentials

### Issue: Can't login with credentials
**Solution:**
1. Verify backend is running: `npm start` in backend folder
2. Check MongoDB connection
3. Confirm seed script was run: `npm run seed`
4. Check credentials in database: `mongosh > use lms > db.users.find()`

### Issue: Seed script fails
**Solution:**
```bash
# Delete old database
# Windows: Delete data folder manually
# macOS/Linux: mongosh > use lms > db.dropDatabase()

# Reseed
npm run seed
```

### Issue: Token expired error
**Solution:**
1. The access token expires after 30 minutes
2. System will auto-refresh token if available
3. If still fails, login again
4. Accept new tokens on login page

### Issue: Role-based access denied
**Solution:**
1. Verify you're using correct account
2. Check role assignment in HR dashboard
3. Refresh browser (Ctrl+R or Cmd+R)
4. Clear browser cache if persists

---

## 📞 Support

For issues with credentials:
1. Check this document first
2. Review seed script: `backend/scripts/seed.js`
3. Check user model: `backend/models/User.js`
4. Review GitHub issues
5. Create new issue with details

---

## ✅ Credentials Checklist

Before testing, ensure:
- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:5173
- [ ] MongoDB connected and seeded
- [ ] Seed script completed successfully
- [ ] Browser console has no errors
- [ ] Can access http://localhost:5173/login

---

**Last Updated**: November 16, 2025  
**Credentials Status**: ✅ Ready for Testing  
**Seed Script Status**: ✅ Functional
