import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Calendar, AlertCircle, X } from 'lucide-react'
import { leaveAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { getErrorMessage } from '../../utils/errorMessages'

const EditLeave = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: leaveData, isLoading } = useQuery({
    queryKey: ['leave', id],
    queryFn: () => leaveAPI.getOne(id).then((res) => res.data.data),
    enabled: !!id,
    onError: (error) => {
      const errorMsg = getErrorMessage(error, 'employee', 'editLeave')
      toast.error(errorMsg)
    },
  })

  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    type: 'casual',
    reason: '',
  })

  useEffect(() => {
    if (leaveData?.leaveRequest) {
      const leave = leaveData.leaveRequest
      setFormData({
        startDate: format(new Date(leave.startDate), 'yyyy-MM-dd'),
        endDate: format(new Date(leave.endDate), 'yyyy-MM-dd'),
        type: leave.type,
        reason: leave.reason,
      })
    }
  }, [leaveData])

  const mutation = useMutation({
    mutationFn: (data) => leaveAPI.update(id, data),
    onSuccess: () => {
      toast.success('Leave request updated!')
      queryClient.invalidateQueries(['leaves'])
      navigate('/employee/leaves')
    },
    onError: (error) => {
      const errorMsg = getErrorMessage(error, 'employee', 'editLeave')
      toast.error(errorMsg)
    },
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    
    // Validate date ranges
    if (name === 'startDate') {
      if (formData.endDate && value > formData.endDate) {
        toast.error('Start date must be before end date')
        return
      }
    } else if (name === 'endDate') {
      if (formData.startDate && value < formData.startDate) {
        toast.error('End date must be after start date')
        return
      }
    }
    
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.error('End date must be after start date')
      return
    }

    mutation.mutate(formData)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!leaveData?.leaveRequest || leaveData.leaveRequest.status !== 'pending') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Cannot Edit Leave</h2>
          <p className="text-gray-600 mb-4">
            Only pending leave requests can be edited.
          </p>
          <button
            onClick={() => navigate('/employee/leaves')}
            className="btn btn-primary"
          >
            Back to Leaves
          </button>
        </div>
      </div>
    )
  }

  const today = format(new Date(), 'yyyy-MM-dd')

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Calendar className="h-6 w-6 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Leave Request</h1>
          </div>
          <button
            onClick={() => navigate('/employee/leaves')}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                required
                min={today}
                max={formData.endDate || undefined}
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                required
                min={formData.startDate || today}
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              Leave Type *
            </label>
            <select
              id="type"
              name="type"
              required
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors bg-white"
            >
              <option value="casual">Casual Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="earned">Earned Leave</option>
              <option value="unpaid">Unpaid Leave</option>
            </select>
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              Reason *
            </label>
            <textarea
              id="reason"
              name="reason"
              required
              rows={4}
              maxLength={500}
              value={formData.reason}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
              placeholder="Please provide a reason for your leave request..."
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.reason.length}/500 characters
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Note:</p>
                <p className="text-blue-700">
                  Updating this leave request will re-validate for overlaps and balance. 
                  If approved, the balance will be recalculated.
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 btn btn-primary py-3 disabled:opacity-50"
            >
              {mutation.isPending ? 'Updating...' : 'Update Request'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/employee/leaves')}
              className="px-6 btn btn-secondary py-3"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditLeave

