import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Filter, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { leaveAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { getErrorMessage } from '../../utils/errorMessages'

const AllLeaves = () => {
  const [filters, setFilters] = useState({ status: '', type: '', page: 1 })
  const [selectedLeave, setSelectedLeave] = useState(null)
  const [action, setAction] = useState('') // 'approve' or 'reject'
  const [comment, setComment] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['leaves', 'hr', filters],
    queryFn: () => leaveAPI.getAll(filters).then((res) => res.data.data),
    onError: (error) => {
      const errorMsg = getErrorMessage(error, 'hr', 'viewAllLeaves')
      toast.error(errorMsg)
    },
  })

  const overrideMutation = useMutation({
    mutationFn: ({ id, status, comment }) => leaveAPI.override(id, { status, comment }),
    onSuccess: () => {
      toast.success(`Leave request ${action === 'approve' ? 'approved' : 'rejected'}`)
      queryClient.invalidateQueries(['leaves'])
      setSelectedLeave(null)
      setComment('')
      setAction('')
    },
    onError: (error) => {
      const errorMsg = getErrorMessage(error, 'hr', 'approveLeave')
      toast.error(errorMsg)
    },
  })

  const handleOverride = () => {
    if (selectedLeave && action) {
      overrideMutation.mutate({
        id: selectedLeave._id,
        status: action === 'approve' ? 'approved' : 'rejected',
        comment,
      })
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
          <AlertCircle className="h-6 w-6 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">All Leave Requests</h1>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="input"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
              className="input"
            >
              <option value="">All Types</option>
              <option value="casual">Casual</option>
              <option value="sick">Sick</option>
              <option value="earned">Earned</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: '', type: '', page: 1 })}
              className="btn btn-secondary w-full"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Leaves List */}
      <div className="card">
        {data?.leaves?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.leaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {leave.userId?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {leave.userId?.employeeId || ''}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {format(new Date(leave.startDate), 'MMM dd')} - {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                      {leave.type}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {leave.totalDays} days
                      {leave.attachment && (
                        <div className="mt-1">
                          <a
                            href={`http://localhost:5000${leave.attachment}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary-600 hover:text-primary-800 underline"
                          >
                            Attachment
                          </a>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`badge badge-${leave.status}`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => {
                          setSelectedLeave(leave)
                          setAction('approve')
                        }}
                        className="text-green-600 hover:text-green-800"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedLeave(leave)
                          setAction('reject')
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No leave requests found</p>
          </div>
        )}
      </div>

      {/* Override Modal */}
      {selectedLeave && action && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {action === 'approve' ? 'Approve' : 'Reject'} Leave Request
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Employee: <strong>{selectedLeave.userId?.name}</strong>
            </p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment (optional)..."
              rows={3}
              className="input mb-4"
            />
            <div className="flex space-x-3">
              <button
                onClick={handleOverride}
                disabled={overrideMutation.isPending}
                className={`flex-1 btn ${action === 'approve' ? 'btn-success' : 'btn-danger'}`}
              >
                {overrideMutation.isPending ? 'Processing...' : action === 'approve' ? 'Approve' : 'Reject'}
              </button>
              <button
                onClick={() => {
                  setSelectedLeave(null)
                  setAction('')
                  setComment('')
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

export default AllLeaves

