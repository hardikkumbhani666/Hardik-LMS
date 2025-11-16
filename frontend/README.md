# LMS Frontend

Leave Management System Frontend built with React, Vite, and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create `.env` file** (optional)
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

Frontend will run on `http://localhost:3000`

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable components
│   │   ├── employee/   # Employee-specific components
│   │   ├── manager/    # Manager-specific components
│   │   └── hr/         # HR-specific components
│   ├── context/        # React contexts (Auth)
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── hooks/          # Custom hooks
│   ├── utils/          # Utility functions
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
├── public/             # Static assets
└── package.json
```

## 🎨 Features

### Authentication
- ✅ Login/Register pages
- ✅ JWT token management
- ✅ Protected routes based on roles
- ✅ Auto-redirect based on user role

### Employee Features
- ✅ Dashboard with leave balance
- ✅ Apply for leave
- ✅ View leave history
- ✅ Cancel pending leaves
- ✅ Filter and search leaves

### Manager Features
- ✅ Dashboard with team overview
- ✅ View team leave requests
- ✅ Approve/Reject leaves with comments
- ✅ View team members

### HR Features
- ✅ Dashboard with analytics
- ✅ View all leave requests
- ✅ Override any leave decision
- ✅ Manage user leave balances
- ✅ Export reports (CSV/PDF)
- ✅ View summary statistics

## 🎨 Design Features

- ✅ Fully responsive (mobile, tablet, desktop)
- ✅ Modern UI with Tailwind CSS
- ✅ Loading states and error handling
- ✅ Toast notifications
- ✅ Accessible components
- ✅ Professional color scheme

## 🔧 Technologies

- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **React Query** - Data fetching
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Lucide React** - Icons
- **date-fns** - Date formatting

## 📱 Responsive Design

The application is fully responsive and works on:
- 📱 Mobile phones (320px+)
- 📱 Tablets (768px+)
- 💻 Laptops (1024px+)
- 🖥️ Desktops (1280px+)

## 🧪 Test Credentials

After seeding the backend database:

**Employee:**
- Email: `employee1@lms.com`
- Password: `emp123456`

**Manager:**
- Email: `manager@lms.com`
- Password: `manager123`

**HR:**
- Email: `hr@lms.com`
- Password: `hr123456`

## 🚀 Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

## 📝 Notes

- Make sure the backend is running on `http://localhost:5000`
- The frontend proxies API requests to the backend
- All API calls are authenticated with JWT tokens
- Tokens are stored in localStorage

## 🐛 Troubleshooting

**API Connection Error:**
- Ensure backend is running on port 5000
- Check `VITE_API_URL` in `.env` if using custom URL

**Build Errors:**
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version (should be v18+)

**Styling Issues:**
- Ensure Tailwind CSS is properly configured
- Check `tailwind.config.js` and `postcss.config.js`

