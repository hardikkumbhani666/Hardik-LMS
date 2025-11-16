import { useQuery } from '@tanstack/react-query'
import { Calendar, Clock, CheckCircle, XCircle, TrendingUp } from 'lucide-react'
import { userAPI, leaveAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { format } from 'date-fns'

const DashboardHome = () => {
  const { user } = useAuth()

  const { data: balanceData } = useQuery({
    queryKey: ['balance'],
    queryFn: () => userAPI.getBalance().then((res) => res.data.data),
  })

  const { data: leavesData } = useQuery({
    queryKey: ['leaves', 'employee'],
    queryFn: () => leaveAPI.getAll({ limit: 5 }).then((res) => res.data.data),
  })

  const stats = [
    {
      name: 'Pending',
      value: leavesData?.leaves?.filter((l) => l.status === 'pending').length || 0,
      icon: Clock,
      color: 'text-yellow-600 bg-yellow-100',
    },
    {
      name: 'Approved',
      value: leavesData?.leaves?.filter((l) => l.status === 'approved').length || 0,
      icon: CheckCircle,
      color: 'text-green-600 bg-green-100',
    },
    {
      name: 'Rejected',
      value: leavesData?.leaves?.filter((l) => l.status === 'rejected').length || 0,
      icon: XCircle,
      color: 'text-red-600 bg-red-100',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-2xl shadow-xl p-6 sm:p-8 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-primary-100 text-sm sm:text-base">Manage your leave requests and track your leaves efficiently</p>
        </div>
      </div>

      {/* Leave Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {balanceData?.balances && Object.entries(balanceData.balances).map(([type, days]) => {
          const colorMap = {
            casual: 'from-blue-500 to-blue-600',
            sick: 'from-red-500 to-red-600',
            earned: 'from-green-500 to-green-600',
            unpaid: 'from-gray-500 to-gray-600',
          }
          const bgColor = colorMap[type] || 'from-primary-500 to-primary-600'
          
          return (
            <div key={type} className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
              <div className={`absolute inset-0 bg-gradient-to-br ${bgColor} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 bg-gradient-to-br ${bgColor} rounded-xl shadow-lg`}>
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <TrendingUp className="h-5 w-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 capitalize mb-1">{type} Leave</p>
                  <p className="text-3xl font-bold text-gray-900">{days}</p>
                  <p className="text-xs text-gray-500 mt-1">days available</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">{stat.name} Leaves</p>
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

      {/* Recent Leaves */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Recent Leave Requests</h2>
          <p className="text-sm text-gray-500 mt-1">Your latest leave applications</p>
        </div>
        {leavesData?.leaves?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leavesData.leaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-primary-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {format(new Date(leave.startDate), 'MMM dd')} - {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                      {leave.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {leave.totalDays} days
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge badge-${leave.status}`}>
                        {leave.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No leave requests yet</p>
            <p className="text-sm text-gray-400 mt-1">Start by applying for a leave</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardHome

