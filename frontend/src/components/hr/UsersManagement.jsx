import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, Edit, Calendar } from 'lucide-react'
import { userAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../../utils/errorMessages'

const UsersManagement = () => {
  const [selectedUser, setSelectedUser] = useState(null)
  const [balanceData, setBalanceData] = useState({})
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => userAPI.getUsers().then((res) => res.data.data),
    onError: (error) => {
      const errorMsg = getErrorMessage(error, 'hr', 'viewUsers')
      toast.error(errorMsg)
    },
  })

  const updateBalanceMutation = useMutation({
    mutationFn: async ({ userId, updates }) => {
      // Update all balances in sequence to avoid multiple toast messages
      const results = []
      for (const [leaveType, days] of Object.entries(updates)) {
        if (days !== undefined && days !== '') {
          const result = await userAPI.updateBalance(userId, { leaveType, days: Number(days) })
          results.push(result)
        }
      }
      return results
    },
    onSuccess: () => {
      toast.success('Leave balance updated!')
      queryClient.invalidateQueries(['users'])
      setSelectedUser(null)
      setBalanceData({})
    },
    onError: (error) => {
      const errorMsg = getErrorMessage(error, 'hr', 'updateBalance')
      toast.error(errorMsg)
    },
  })

  const handleUpdateBalance = () => {
    if (selectedUser) {
      const updates = {}
      Object.entries(balanceData).forEach(([type, days]) => {
        if (days !== undefined && days !== '') {
          updates[type] = days
        }
      })
      if (Object.keys(updates).length > 0) {
        updateBalanceMutation.mutate({
          userId: selectedUser._id,
          updates,
        })
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-green-100 rounded-lg">
          <Users className="h-6 w-6 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
      </div>

      <div className="card">
        {data?.users?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.employeeId}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`badge badge-${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.department || 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => {
                          setSelectedUser(user)
                          setBalanceData({
                            casual: user.leaveBalances?.casual || 0,
                            sick: user.leaveBalances?.sick || 0,
                            earned: user.leaveBalances?.earned || 0,
                            unpaid: user.leaveBalances?.unpaid || 0,
                          })
                        }}
                        className="text-primary-600 hover:text-primary-800"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No users found</p>
          </div>
        )}
      </div>

      {/* Balance Update Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Update Leave Balance - {selectedUser.name}
            </h3>
            <div className="space-y-4">
              {['casual', 'sick', 'earned', 'unpaid'].map((type) => (
                <div key={type}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                    {type} Leave
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={balanceData[type] || 0}
                    onChange={(e) =>
                      setBalanceData({ ...balanceData, [type]: e.target.value })
                    }
                    className="input"
                  />
                </div>
              ))}
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleUpdateBalance}
                disabled={updateBalanceMutation.isPending}
                className="flex-1 btn btn-primary"
              >
                {updateBalanceMutation.isPending ? 'Updating...' : 'Update Balance'}
              </button>
              <button
                onClick={() => {
                  setSelectedUser(null)
                  setBalanceData({})
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UsersManagement

