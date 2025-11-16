import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import ManagerHome from '../components/manager/ManagerHome'
import TeamLeaves from '../components/manager/TeamLeaves'
import TeamMembers from '../components/manager/TeamMembers'
import AuditTrailView from '../components/manager/AuditTrailView'

const ManagerDashboard = () => {
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
              <Route index element={<ManagerHome />} />
              <Route path="leaves" element={<TeamLeaves />} />
              <Route path="team" element={<TeamMembers />} />
              <Route path="audit" element={<AuditTrailView />} />
              <Route path="*" element={<Navigate to="/manager" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  )
}

export default ManagerDashboard

