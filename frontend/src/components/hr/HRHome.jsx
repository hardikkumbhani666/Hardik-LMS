import { useQuery } from '@tanstack/react-query'
import { FileText, Users, CheckCircle, Clock, BarChart3 } from 'lucide-react'
import { leaveAPI, userAPI, reportAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../../utils/errorMessages'

const HRHome = () => {
  const { data: leavesData } = useQuery({
    queryKey: ['leaves', 'hr'],
    queryFn: () => leaveAPI.getAll({ limit: 10 }).then((res) => res.data.data),
    onError: (error) => {
      const errorMsg = getErrorMessage(error, 'hr', 'viewAllLeaves')
      toast.error(errorMsg)
    },
  })

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => userAPI.getUsers().then((res) => res.data.data),
    onError: (error) => {
      const errorMsg = getErrorMessage(error, 'hr', 'viewUsers')
      toast.error(errorMsg)
    },
  })

  const { data: summaryData } = useQuery({
    queryKey: ['summary'],
    queryFn: () => reportAPI.getSummary().then((res) => res.data.data),
    onError: (error) => {
      const errorMsg = getErrorMessage(error, 'hr', 'viewReports')
      toast.error(errorMsg)
    },
  })

  const stats = [
    {
      name: 'Total Leaves',
      value: summaryData?.summary?.total?.requests || 0,
      icon: FileText,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      name: 'Pending',
      value: summaryData?.summary?.byStatus?.pending?.count || 0,
      icon: Clock,
      color: 'text-yellow-600 bg-yellow-100',
    },
    {
      name: 'Approved',
      value: summaryData?.summary?.byStatus?.approved?.count || 0,
      icon: CheckCircle,
      color: 'text-green-600 bg-green-100',
    },
    {
      name: 'Total Users',
      value: usersData?.users?.length || 0,
      icon: Users,
      color: 'text-purple-600 bg-purple-100',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="relative bg-gradient-to-br from-green-600 via-green-700 to-green-800 rounded-2xl shadow-xl p-6 sm:p-8 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">HR Dashboard</h1>
          <p className="text-green-100 text-sm sm:text-base">Manage all leave requests and employees efficiently</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-4 rounded-xl shadow-md ${stat.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Recent Leave Requests</h2>
            <p className="text-sm text-gray-500 mt-1">Latest leave applications</p>
          </div>
          {leavesData?.leaves?.length > 0 ? (
            <div className="p-6 space-y-3">
              {leavesData.leaves.slice(0, 5).map((leave) => (
                <div key={leave._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                  <div>
                    <p className="font-semibold text-gray-900">{leave.userId?.name || 'N/A'}</p>
                    <p className="text-sm text-gray-500 capitalize">{leave.type} leave</p>
                  </div>
                  <span className={`badge badge-${leave.status}`}>
                    {leave.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No leave requests</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
            <p className="text-sm text-gray-500 mt-1">Navigate to key sections</p>
          </div>
          <div className="p-6 space-y-3">
            <a
              href="/hr/leaves"
              className="block p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl hover:from-primary-100 hover:to-primary-200 transition-all border border-primary-200 hover:shadow-md"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-500 rounded-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <span className="font-semibold text-gray-900">View All Leaves</span>
              </div>
            </a>
            <a
              href="/hr/users"
              className="block p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all border border-purple-200 hover:shadow-md"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <span className="font-semibold text-gray-900">Manage Users</span>
              </div>
            </a>
            <a
              href="/hr/reports"
              className="block p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all border border-green-200 hover:shadow-md"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <span className="font-semibold text-gray-900">View Reports</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HRHome

