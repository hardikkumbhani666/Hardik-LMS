import { useState, useRef, useEffect } from 'react'
import { LogOut, User, Menu, Mail, Briefcase, Building, Calendar, X, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { userAPI } from '../services/api'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../utils/errorMessages'

const Header = ({ onMenuClick, showMenuButton = false }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)
  const role = user?.role || 'employee'
  
  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userAPI.getProfile().then((res) => res.data.data),
    enabled: profileOpen,
    onError: (error) => {
      const errorMsg = getErrorMessage(error, role, 'viewProfile')
      toast.error(errorMsg)
    },
  })

  const { data: balanceData } = useQuery({
    queryKey: ['balance'],
    queryFn: () => userAPI.getBalance().then((res) => res.data.data),
    enabled: profileOpen && role === 'employee',
    onError: (error) => {
      const errorMsg = getErrorMessage(error, role, 'viewBalance')
      toast.error(errorMsg)
    },
  })

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false)
      }
    }

    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [profileOpen])

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const getRoleBadgeColor = (role) => {
    const colors = {
      employee: 'bg-blue-100 text-blue-800 border-blue-200',
      manager: 'bg-purple-100 text-purple-800 border-purple-200',
      hr: 'bg-green-100 text-green-800 border-green-200',
    }
    return colors[role] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const profile = profileData?.user || user

  return (
    <header className="bg-white shadow-md border-b border-gray-200 flex-shrink-0 z-50 sticky top-0">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {showMenuButton && (
              <button
                onClick={onMenuClick}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <Menu className="h-6 w-6" />
              </button>
            )}
            <button
              onClick={() => {
                const dashboardPath = user?.role === 'employee' ? '/employee' : user?.role === 'manager' ? '/manager' : '/hr'
                navigate(dashboardPath)
              }}
              className="flex items-center space-x-2 text-lg sm:text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent hover:from-primary-700 hover:to-primary-800 transition-all cursor-pointer group"
            >
              <div className="hidden sm:block w-10 h-10 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden group-hover:shadow-xl transition-shadow">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white rounded-sm flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-sm"></div>
                  </div>
                </div>
              </div>
              <span className="truncate">Leave Management System</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center space-x-2 sm:space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="hidden sm:flex flex-col items-end">
                  <p className="text-sm font-semibold text-gray-900 truncate max-w-[140px]">{user?.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${getRoleBadgeColor(user?.role)}`}>
                    {user?.role?.toUpperCase()}
                  </span>
                </div>
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-500 absolute -bottom-1 -right-1 bg-white rounded-full transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {/* Profile Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-6 text-white">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                        <User className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold truncate">{profile?.name || 'N/A'}</h3>
                        <p className="text-sm text-primary-100 truncate">{profile?.email || 'N/A'}</p>
                        <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30`}>
                          {profile?.role?.toUpperCase() || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 max-h-[60vh] overflow-y-auto hide-scrollbar">
                    {/* Personal Information */}
                    <div className="mb-6">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Personal Information</h4>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <Briefcase className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 mb-1">Employee ID</p>
                            <p className="text-sm font-medium text-gray-900 truncate">{profile?.employeeId || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <Building className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 mb-1">Department</p>
                            <p className="text-sm font-medium text-gray-900 truncate">{profile?.department || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Leave Balances - Only show for employees */}
                    {user?.role === 'employee' && balanceData?.balances && (
                      <div className="mb-6">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Leave Balances</h4>
                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(balanceData.balances).map(([type, days]) => (
                            <div key={type} className="p-3 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg border border-primary-200">
                              <p className="text-xs text-gray-600 capitalize mb-1">{type}</p>
                              <p className="text-xl font-bold text-primary-700">{days}</p>
                              <p className="text-xs text-gray-500">days</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-4 border-t border-gray-200">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors font-medium"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

