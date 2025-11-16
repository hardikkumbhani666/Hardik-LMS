<<<<<<< HEAD
# 🏢 Leave Management System (LMS)

A full-stack Leave Management System built with Node.js, Express, MongoDB, React, and Tailwind CSS. This system provides comprehensive leave management functionality for employees, managers, and HR personnel.

## ✨ Features

### 👤 Employee Features
- Apply for leave with date range selection
- View leave balance (Casual, Sick, Earned, Unpaid)
- Track leave request status (Pending, Approved, Rejected)
- Edit pending leave requests
- Cancel pending leave requests
- Upload medical certificates/attachments
- View personal audit trail

### 👨‍💼 Manager Features
- Review team leave requests
- Approve or reject leave requests
- Bulk approve all pending leaves
- View team members
- View team audit trail
- Add comments on leave decisions

### 👔 HR Features
- View all leave requests across the organization
- Approve or reject any leave request
- Override manager decisions
- Manage user leave balances
- Export reports (CSV, PDF)
- View comprehensive analytics
- View organization-wide audit trail

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
# 🏢 Leave Management System (LMS)

A full-stack Leave Management System built with Node.js, Express, MongoDB, React, and Tailwind CSS. This system provides comprehensive leave management functionality for employees, managers, and HR personnel.

## ✨ Features

### 👤 Employee Features
- Apply for leave with date range selection
- View leave balance (Casual, Sick, Earned, Unpaid)
- Track leave request status (Pending, Approved, Rejected)
- Edit pending leave requests
- Cancel pending leave requests
- Upload medical certificates/attachments
- View personal audit trail

### 👨‍💼 Manager Features
- Review team leave requests
- Approve or reject leave requests
- Bulk approve all pending leaves
- View team members
- View team audit trail
- Add comments on leave decisions

### 👔 HR Features
- View all leave requests across the organization
- Approve or reject any leave request
- Override manager decisions
- Manage user leave balances
- Export reports (CSV, PDF)
- View comprehensive analytics
- View organization-wide audit trail

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, Rate Limiting
- **File Upload**: Multer
- **PDF Generation**: PDFKit
- **CSV Export**: csv-writer

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **Routing**: React Router v7
- **State Management**: React Query (TanStack Query)
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns

## 📁 Project Structure

```
Hardik-LMS/
├── backend/
│   ├── config/          # Database and JWT configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth, validation, error handling
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic
│   ├── scripts/         # Database seeding
│   ├── uploads/         # File uploads storage
│   ├── utils/           # Helper functions
│   └── server.js        # Entry point
│
├── frontend/
│   ├── public/          # Static assets
│   └── src/
│       ├── components/  # React components
│       ├── context/     # React context (Auth)
│       ├── pages/       # Page components
│       ├── services/    # API services
│       └── main.jsx     # Entry point
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/hardikkumbhani666/Hardik-LMS.git
   cd Hardik-LMS
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Create .env file
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secrets
   
   # Seed the database (optional)
   npm run seed
   
   # Start development server
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   
   # Start development server
   npm run dev
   ```

### Environment Variables

#### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lms
JWT_SECRET=722930
JWT_REFRESH_SECRET=722930
JWT_EXPIRE=30m
JWT_REFRESH_EXPIRE=7d
NODE_ENV=development
```

#### Frontend
The frontend uses Vite proxy configuration. Update `vite.config.js` if your backend runs on a different port.

## 📝 Default Test Accounts

After running the seed script, you can use these accounts:

### Employee
- Email: `employee1@lms.com`
- Password: `emp123456`

### Manager
- Email: `manager@lms.com`
- Password: `manager123456`

### HR
- Email: `hr@lms.com`
- Password: `hr123456`

## 🔐 Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Input validation and sanitization
- Rate limiting on API endpoints
- Helmet.js for security headers
- CORS configuration
- File upload validation (size and type)

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token

### Leaves
- `GET /api/leaves` - Get leaves (role-based)
- `POST /api/leaves` - Create leave request
- `PUT /api/leaves/:id` - Update leave request
- `DELETE /api/leaves/:id` - Cancel leave request
- `POST /api/leaves/:id/approve` - Approve leave
- `POST /api/leaves/:id/reject` - Reject leave
- `POST /api/leaves/:id/override` - Override decision (HR)
- `POST /api/leaves/bulk-approve` - Bulk approve

### Users
- `GET /api/users` - Get users (role-based)
- `GET /api/users/profile` - Get user profile
- `GET /api/users/balance` - Get leave balance
- `PUT /api/users/:id/balance` - Update balance (HR)

### Reports
- `GET /api/reports/summary` - Get summary statistics
- `GET /api/reports/export/csv` - Export CSV report
- `GET /api/reports/export/pdf` - Export PDF report

### Audit
- `GET /api/audit` - Get audit logs (role-based)

## 🎨 Design Features

- Fully responsive design (mobile, tablet, desktop)
- Modern UI with Tailwind CSS
- Smooth animations and transitions
- Professional color scheme
- Accessible components
- Toast notifications
- Loading states
- Error handling

## 📱 Responsive Design

The application is fully responsive and works seamlessly on:
- 📱 Mobile devices (320px+)
- 📱 Tablets (768px+)
- 💻 Laptops (1024px+)
- 🖥️ Desktops (1280px+)

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📦 Building for Production

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Hardik Kumbhani**
- GitHub: [@hardikkumbhani666](https://github.com/hardikkumbhani666)

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- MongoDB for the flexible database solution
- All open-source contributors

---

⭐ If you find this project helpful, please give it a star!

