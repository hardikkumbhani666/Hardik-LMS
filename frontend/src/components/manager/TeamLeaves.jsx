import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, XCircle, MessageSquare, CheckSquare } from 'lucide-react'
import { leaveAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { getErrorMessage } from '../../utils/errorMessages'

const TeamLeaves = () => {
  const [filters, setFilters] = useState({ status: '', type: '', page: 1 })
  const [selectedLeave, setSelectedLeave] = useState(null)
  const [comment, setComment] = useState('')
  const [isRefetchingAfterBulkApprove, setIsRefetchingAfterBulkApprove] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['leaves', 'manager', filters],
    queryFn: () => leaveAPI.getAll(filters).then((res) => res.data.data),
    onError: (error) => {
      // Don't show error toast if we're refetching after a successful bulk approve
      // The bulk approve mutation will handle showing success/error messages
      if (!isRefetchingAfterBulkApprove) {
        const errorMsg = getErrorMessage(error, 'manager', 'viewTeamLeaves')
        toast.error(errorMsg)
      }
    },
  })

  const approveMutation = useMutation({
    mutationFn: ({ id, comment }) => leaveAPI.approve(id, { comment }),
    onSuccess: () => {
      toast.success('Leave request approved')
      queryClient.invalidateQueries(['leaves'])
      setSelectedLeave(null)
      setComment('')
    },
    onError: (error) => {
      const errorMsg = getErrorMessage(error, 'manager', 'approveLeave')
      toast.error(errorMsg)
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, comment }) => leaveAPI.reject(id, { comment }),
    onSuccess: () => {
      toast.success('Leave request rejected')
      queryClient.invalidateQueries(['leaves'])
      setSelectedLeave(null)
      setComment('')
    },
    onError: (error) => {
      const errorMsg = getErrorMessage(error, 'manager', 'rejectLeave')
      toast.error(errorMsg)
    },
  })

  const bulkApproveMutation = useMutation({
    mutationFn: ({ leaveIds, comment }) => leaveAPI.bulkApprove({ leaveIds, comment }),
    onSuccess: (response) => {
      const { approved, failed } = response.data.data
      
      // Set flag to prevent query error toast during refetch
      setIsRefetchingAfterBulkApprove(true)
      
      // Show success message based on results
      if (approved > 0 && failed === 0) {
        toast.success(`Approved ${approved} leave${approved !== 1 ? 's' : ''}`)
      } else if (approved > 0 && failed > 0) {
        toast.success(`Approved ${approved} leave${approved !== 1 ? 's' : ''}, ${failed} failed`)
      } else if (failed > 0) {
        toast.error(`Could not approve leave requests. ${failed} failed`)
      } else {
        toast.success('Leave requests processed')
      }
      
      // Invalidate and refetch queries
      queryClient.invalidateQueries(['leaves']).then(() => {
        // Reset flag after a short delay to allow refetch to complete
        setTimeout(() => {
          setIsRefetchingAfterBulkApprove(false)
        }, 1000)
      })
      
      setComment('')
    },
    onError: (error) => {
      const errorMsg = getErrorMessage(error, 'manager', 'bulkApprove')
      toast.error(errorMsg)
      // Reset flag on error
      setIsRefetchingAfterBulkApprove(false)
    },
  })

  const handleApprove = (leave) => {
    approveMutation.mutate({ id: leave._id, comment })
  }

  const handleReject = (leave) => {
    rejectMutation.mutate({ id: leave._id, comment })
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <MessageSquare className="h-6 w-6 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Team Leave Requests</h1>
        </div>
        <div className="flex items-center space-x-2">
          {(() => {
            const pendingLeaves = data?.leaves?.filter((leave) => leave.status === 'pending') || []
            return (
              <button
                onClick={() => {
                  if (pendingLeaves.length === 0) {
                    toast.error('No pending leave requests')
                    return
                  }
                  const allPendingIds = pendingLeaves.map((leave) => leave._id)
                  bulkApproveMutation.mutate({
                    leaveIds: allPendingIds,
                  })
                }}
                disabled={bulkApproveMutation.isPending || !pendingLeaves.length}
                className="btn btn-primary"
              >
                {bulkApproveMutation.isPending ? 'Approving...' : `Bulk Approve All (${pendingLeaves.length})`}
              </button>
            )
          })()}
        </div>
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
          <div className="space-y-4">
            {data.leaves.map((leave) => (
              <div
                key={leave._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {leave.userId?.name || 'N/A'}
                        </h3>
                        <p className="text-sm text-gray-500">{leave.userId?.employeeId || ''}</p>
                      </div>
                      <span className={`badge badge-${leave.status}`}>
                        {leave.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 text-sm">
                      <div>
                        <p className="text-gray-500">Dates</p>
                        <p className="font-medium text-gray-900">
                          {format(new Date(leave.startDate), 'MMM dd')} - {format(new Date(leave.endDate), 'MMM dd')}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Type</p>
                        <p className="font-medium text-gray-900 capitalize">{leave.type}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Days</p>
                        <p className="font-medium text-gray-900">{leave.totalDays} days</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Reason</p>
                        <p className="font-medium text-gray-900 truncate">{leave.reason}</p>
                      </div>
                    </div>
                    {leave.managerComment && (
                      <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-800">
                        <strong>Your Comment:</strong> {leave.managerComment}
                      </div>
                    )}
                    {leave.attachment && (
                      <div className="mt-3">
                        <a
                          href={`http://localhost:5000${leave.attachment}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary-600 hover:text-primary-800 underline"
                        >
                          View Attachment
                        </a>
                      </div>
                    )}
                  </div>

                  {leave.status === 'pending' && (
                    <div className="flex flex-col sm:flex-row gap-2 lg:ml-4">
                      <button
                        onClick={() => setSelectedLeave(leave)}
                        className="btn btn-primary flex items-center justify-center space-x-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedLeave(leave)
                          setComment('')
                        }}
                        className="btn btn-danger flex items-center justify-center space-x-2"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No leave requests found</p>
          </div>
        )}
      </div>

      {/* Approval/Rejection Modal */}
      {selectedLeave && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {selectedLeave.status === 'pending' ? 'Add Comment (Optional)' : 'Leave Details'}
            </h3>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              rows={3}
              className="input mb-4"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => handleApprove(selectedLeave)}
                disabled={approveMutation.isPending}
                className="flex-1 btn btn-success"
              >
                {approveMutation.isPending ? 'Approving...' : 'Approve'}
              </button>
              <button
                onClick={() => handleReject(selectedLeave)}
                disabled={rejectMutation.isPending}
                className="flex-1 btn btn-danger"
              >
                {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
              </button>
              <button
                onClick={() => {
                  setSelectedLeave(null)
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

export default TeamLeaves

