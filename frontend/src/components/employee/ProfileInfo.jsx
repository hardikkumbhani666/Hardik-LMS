import { useQuery } from '@tanstack/react-query'
import { User, Mail, Briefcase, Calendar, Building } from 'lucide-react'
import { userAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../../utils/errorMessages'

const ProfileInfo = () => {
  const { user } = useAuth()

  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userAPI.getProfile().then((res) => res.data.data),
    onError: (error) => {
      const errorMsg = getErrorMessage(error, 'employee', 'viewProfile')
      toast.error(errorMsg)
    },
  })

  const { data: balanceData } = useQuery({
    queryKey: ['balance'],
    queryFn: () => userAPI.getBalance().then((res) => res.data.data),
    onError: (error) => {
      const errorMsg = getErrorMessage(error, 'employee', 'viewBalance')
      toast.error(errorMsg)
    },
  })

  const profile = profileData?.user || user

  return (
    <div className="card">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-primary-100 rounded-lg">
          <User className="h-6 w-6 text-primary-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
      </div>

      <div className="space-y-6">
        {/* Personal Info */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <User className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 mb-1">Full Name</p>
                <p className="font-medium text-gray-900">{profile?.name || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 mb-1">Email Address</p>
                <p className="font-medium text-gray-900">{profile?.email || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <Briefcase className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 mb-1">Employee ID</p>
                <p className="font-medium text-gray-900">{profile?.employeeId || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <Building className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 mb-1">Department</p>
                <p className="font-medium text-gray-900">{profile?.department || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <User className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 mb-1">Role</p>
                <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                  {profile?.role || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Leave Balance */}
       
      </div>
    </div>
  )
}

export default ProfileInfo

