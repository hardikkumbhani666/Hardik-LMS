import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Calendar, FileText, AlertCircle } from 'lucide-react'
import { leaveAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const ApplyLeave = () => {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    type: 'casual',
    reason: '',
  })
  const [file, setFile] = useState(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data) => {
      const formDataToSend = new FormData()
      Object.keys(data).forEach((key) => {
        if (key !== 'file') {
          formDataToSend.append(key, data[key])
        }
      })
      if (data.file) {
        formDataToSend.append('attachment', data.file)
      }
      return leaveAPI.create(formDataToSend)
    },
    onSuccess: () => {
      toast.success('Leave request submitted!')
      queryClient.invalidateQueries(['leaves'])
      setFile(null)
      navigate('/employee/leaves')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Could not submit leave request')
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

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      // Check file size (5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('File is too large. Maximum size is 5MB')
        return
      }
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Only JPEG, PNG, and PDF files are allowed')
        return
      }
      setFile(selectedFile)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.error('End date must be after start date')
      return
    }

    mutation.mutate({ ...formData, file })
  }

  const today = format(new Date(), 'yyyy-MM-dd')

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-5">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Apply for Leave</h1>
              <p className="text-sm text-primary-100 mt-0.5">Submit your leave request for approval</p>
            </div>
          </div>
        </div>
        <div className="p-6 sm:p-8">

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
                className="input"
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
                className="input"
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
              className="input"
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

          <div>
            <label htmlFor="attachment" className="block text-sm font-medium text-gray-700 mb-2">
              Attachment (Optional)
              <span className="text-xs text-gray-500 ml-2">(Max 5MB, JPEG/PNG/PDF)</span>
            </label>
            <input
              type="file"
              id="attachment"
              name="attachment"
              accept="image/jpeg,image/jpg,image/png,application/pdf"
              onChange={handleFileChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
            />
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Important Notes:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>Leave requests require manager approval</li>
                  <li>You cannot apply for overlapping dates</li>
                  <li>Leave will be deducted upon approval</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 btn btn-primary py-3 disabled:opacity-50"
            >
              {mutation.isPending ? 'Submitting...' : 'Submit Request'}
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
    </div>
  )
}

export default ApplyLeave

