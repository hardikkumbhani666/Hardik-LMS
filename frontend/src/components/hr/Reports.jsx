import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart3, Download, FileText } from 'lucide-react'
import { reportAPI } from '../../services/api'
import toast from 'react-hot-toast'

const Reports = () => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    department: '',
  })

  const { data: summaryData, isLoading } = useQuery({
    queryKey: ['summary', filters],
    queryFn: () => reportAPI.getSummary(filters).then((res) => res.data.data),
  })

  const handleExport = async (type) => {
    try {
      const response = await reportAPI[`export${type}`](filters)
      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `leaves_report_${Date.now()}.${type.toLowerCase()}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success(`Report downloaded as ${type.toUpperCase()}`)
    } catch (error) {
      toast.error('Could not export report')
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
          <BarChart3 className="h-6 w-6 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
      </div>

      {/* Filters */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              max={filters.endDate || undefined}
              onChange={(e) => {
                const newStartDate = e.target.value
                if (filters.endDate && newStartDate > filters.endDate) {
                  toast.error('Start date must be before end date')
                  return
                }
                setFilters({ ...filters, startDate: newStartDate })
              }}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              min={filters.startDate || undefined}
              onChange={(e) => {
                const newEndDate = e.target.value
                if (filters.startDate && newEndDate < filters.startDate) {
                  toast.error('End date must be after start date')
                  return
                }
                setFilters({ ...filters, endDate: newEndDate })
              }}
              className="input"
            />
          </div>
      
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm font-medium text-gray-600">Total Requests</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {summaryData?.summary?.total?.requests || 0}
          </p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-gray-600">Total Days</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {summaryData?.summary?.total?.days || 0}
          </p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-gray-600">Pending</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {summaryData?.summary?.byStatus?.pending?.count || 0}
          </p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-gray-600">Approved</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {summaryData?.summary?.byStatus?.approved?.count || 0}
          </p>
        </div>
      </div>

      {/* Export Options */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Reports</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => handleExport('CSV')}
            className="flex items-center justify-center space-x-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <FileText className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-gray-900">Export as CSV</span>
            <Download className="h-4 w-4 text-gray-500" />
          </button>
          <button
            onClick={() => handleExport('PDF')}
            className="flex items-center justify-center space-x-2 p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <FileText className="h-5 w-5 text-red-600" />
            <span className="font-medium text-gray-900">Export as PDF</span>
            <Download className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Reports

