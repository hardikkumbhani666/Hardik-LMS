import { useQuery } from '@tanstack/react-query'
import { Users, Clock, CheckCircle, XCircle, Calendar } from 'lucide-react'
import { leaveAPI, userAPI } from '../../services/api'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../../utils/errorMessages'

const ManagerHome = () => {
  const { data: leavesData } = useQuery({
    queryKey: ['leaves', 'manager'],
    queryFn: () => leaveAPI.getAll({ status: 'pending', limit: 10 }).then((res) => res.data.data),
    onError: (error) => {
      const errorMsg = getErrorMessage(error, 'manager', 'viewTeamLeaves')
      toast.error(errorMsg)
    },
  })

  const { data: teamData } = useQuery({
    queryKey: ['team'],
    queryFn: () => userAPI.getUsers().then((res) => res.data.data),
    onError: (error) => {
      const errorMsg = getErrorMessage(error, 'manager', 'viewTeam')
      toast.error(errorMsg)
    },
  })

  const stats = [
    {
      name: 'Pending Approvals',
      value: leavesData?.leaves?.filter((l) => l.status === 'pending').length || 0,
      icon: Clock,
      color: 'text-yellow-600 bg-yellow-100',
    },
    {
      name: 'Team Members',
      value: teamData?.users?.length || 0,
      icon: Users,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      name: 'Approved This Month',
      value: leavesData?.leaves?.filter((l) => l.status === 'approved').length || 0,
      icon: CheckCircle,
      color: 'text-green-600 bg-green-100',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 rounded-2xl shadow-xl p-6 sm:p-8 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Manager Dashboard</h1>
          <p className="text-purple-100 text-sm sm:text-base">Review and manage your team's leave requests</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Pending Leave Requests</h2>
          <p className="text-sm text-gray-500 mt-1">Require your review and approval</p>
        </div>
        {leavesData?.leaves?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Days</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leavesData.leaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-purple-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {leave.userId?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {leave.userId?.employeeId || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {format(new Date(leave.startDate), 'MMM dd')} - {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                      {leave.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {leave.totalDays} days
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a
                        href={`/manager/leaves`}
                        className="text-purple-600 hover:text-purple-800 text-sm font-semibold hover:underline"
                      >
                        Review →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No pending leave requests</p>
            <p className="text-sm text-gray-400 mt-1">All caught up!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ManagerHome

