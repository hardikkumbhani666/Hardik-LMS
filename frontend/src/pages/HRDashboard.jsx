import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import HRHome from '../components/hr/HRHome'
import AllLeaves from '../components/hr/AllLeaves'
import UsersManagement from '../components/hr/UsersManagement'
import Reports from '../components/hr/Reports'
import AuditTrailView from '../components/hr/AuditTrailView'

const HRDashboard = () => {
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
              <Route index element={<HRHome />} />
              <Route path="leaves" element={<AllLeaves />} />
              <Route path="users" element={<UsersManagement />} />
              <Route path="reports" element={<Reports />} />
              <Route path="audit" element={<AuditTrailView />} />
              <Route path="*" element={<Navigate to="/hr" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  )
}

export default HRDashboard

