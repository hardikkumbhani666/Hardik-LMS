import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import DashboardHome from '../components/employee/DashboardHome'
import ApplyLeave from '../components/employee/ApplyLeave'
import MyLeaves from '../components/employee/MyLeaves'
import EditLeave from '../components/employee/EditLeave'
import AuditTrailView from '../components/employee/AuditTrailView'

const EmployeeDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Fixed Header */}
      <Header onMenuClick={() => setSidebarOpen(true)} showMenuButton={true} />
      
      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Fixed Sidebar (Desktop) / Overlay (Mobile) */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          userRole={user?.role}
        />
        
        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 hide-scrollbar">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            <Routes>
              <Route index element={<DashboardHome />} />
              <Route path="apply" element={<ApplyLeave />} />
              <Route path="leaves" element={<MyLeaves />} />
              <Route path="leaves/edit/:id" element={<EditLeave />} />
              <Route path="audit" element={<AuditTrailView />} />
              <Route path="*" element={<Navigate to="/employee" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  )
}

export default EmployeeDashboard

