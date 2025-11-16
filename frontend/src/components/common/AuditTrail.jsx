import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  History, 
  Filter, 
  Calendar, 
  User, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Plus, 
  Ban,
  AlertCircle,
  TrendingUp,
  Clock
} from 'lucide-react'
import { reportAPI } from '../../services/api'
import { format, formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

const AuditTrail = ({ entityType, entityId, userId }) => {
  const [filters, setFilters] = useState({
    entityType: entityType || '',
    entityId: entityId || '',
    userId: userId || '',
    action: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 20,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['audit', filters],
    queryFn: () => {
      const params = {}
      if (filters.action) params.action = filters.action
      if (filters.startDate) params.startDate = filters.startDate
      if (filters.endDate) params.endDate = filters.endDate
      if (filters.entityType) params.entityType = filters.entityType
      if (filters.entityId) params.entityId = filters.entityId
      if (filters.userId) params.userId = filters.userId
      params.page = filters.page
      params.limit = filters.limit
      return reportAPI.getAuditLogs(params).then((res) => res.data.data)
    },
  })

  const getActionConfig = (action) => {
    const configs = {
      created: {
        color: 'bg-blue-500',
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        icon: Plus,
        label: 'Created',
      },
      updated: {
        color: 'bg-yellow-500',
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
        icon: Edit,
        label: 'Updated',
      },
      approved: {
        color: 'bg-green-500',
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        icon: CheckCircle,
        label: 'Approved',
      },
      rejected: {
        color: 'bg-red-500',
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: XCircle,
        label: 'Rejected',
      },
      cancelled: {
        color: 'bg-gray-500',
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200',
        icon: Ban,
        label: 'Cancelled',
      },
      overridden: {
        color: 'bg-purple-500',
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        icon: AlertCircle,
        label: 'Overridden',
      },
      balance_updated: {
        color: 'bg-indigo-500',
        bg: 'bg-indigo-50',
        text: 'text-indigo-700',
        border: 'border-indigo-200',
        icon: TrendingUp,
        label: 'Balance Updated',
      },
    }
    return configs[action] || {
      color: 'bg-gray-500',
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      border: 'border-gray-200',
      icon: FileText,
      label: action,
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
            <History className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Audit Trail</h2>
            <p className="text-sm text-gray-500 mt-1">Track all past activities and changes</p>
          </div>
        </div>
        {data?.pagination && (
          <div className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
            <span className="font-medium">{data.pagination.total}</span> total entries
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="card bg-gradient-to-br from-gray-50 to-white border border-gray-200">
        <div className="flex items-center space-x-2 mb-6">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Filter className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Filter Options</h3>
            <p className="text-xs text-gray-500 mt-0.5">Refine your audit trail search</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value, page: 1 })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Actions</option>
              <option value="created">Created</option>
              <option value="updated">Updated</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
              <option value="overridden">Overridden</option>
              <option value="balance_updated">Balance Updated</option>
            </select>
          </div>
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
                setFilters({ ...filters, startDate: newStartDate, page: 1 })
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                setFilters({ ...filters, endDate: newEndDate, page: 1 })
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                const baseFilters = {
                  entityType: entityType || '',
                  entityId: entityId || '',
                  userId: userId || '',
                  page: 1,
                  limit: 20,
                }
                setFilters({ ...baseFilters, action: '', startDate: '', endDate: '' })
              }}
              className="btn btn-secondary w-full"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="card p-0 overflow-hidden">
        {data?.logs?.length > 0 ? (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-200 via-primary-300 to-primary-200 hidden md:block"></div>
            
            <div className="space-y-0 divide-y divide-gray-100">
              {data.logs.map((log, index) => {
                const config = getActionConfig(log.action)
                const Icon = config.icon
                const isLast = index === data.logs.length - 1
                
                return (
                  <div
                    key={log._id}
                    className={`relative p-6 hover:bg-gray-50 transition-colors duration-200 ${
                      !isLast ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-6 top-8 hidden md:block">
                      <div className={`relative ${config.color} w-4 h-4 rounded-full shadow-lg ring-4 ring-white z-10`}>
                        <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${config.color}`}></div>
                      </div>
                    </div>

                    <div className="ml-0 md:ml-12">
                      {/* Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className={`p-2 ${config.bg} ${config.border} border rounded-lg shadow-sm`}>
                            <Icon className={`h-5 w-5 ${config.text}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text} ${config.border} border`}>
                                {config.label}
                              </span>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {log.entityType} #{log.entityId?.toString().slice(-6)}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1.5">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="font-medium text-gray-900">{log.userId?.name || 'System'}</span>
                              </div>
                              <div className="flex items-center space-x-1.5">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span>{formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}</span>
                              </div>
                              <div className="flex items-center space-x-1.5">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span>{format(new Date(log.createdAt), 'MMM dd, yyyy • HH:mm')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Changes Section */}
                      {log.changes && Object.keys(log.changes).length > 0 && (
                        <div className={`mt-4 p-4 ${config.bg} ${config.border} border rounded-lg shadow-sm`}>
                          <div className="flex items-center space-x-2 mb-3">
                            <FileText className={`h-4 w-4 ${config.text}`} />
                            <span className={`text-sm font-semibold ${config.text}`}>Changes Made</span>
                          </div>
                          <div className="bg-white rounded-md p-4 border border-gray-200 overflow-x-auto">
                            <div className="space-y-3">
                              {Object.entries(log.changes).map(([key, value]) => {
                                const displayKey = key.replace(/([A-Z])/g, ' $1').trim().replace(/^\w/, c => c.toUpperCase())
                                const displayValue = typeof value === 'object' && value !== null 
                                  ? JSON.stringify(value, null, 2) 
                                  : String(value)
                                
                                return (
                                  <div key={key} className="flex flex-col gap-1.5 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                      {displayKey}
                                    </span>
                                    <span className="text-sm text-gray-700 break-words font-mono bg-gray-50 px-2 py-1.5 rounded border border-gray-200">
                                      {displayValue}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <History className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No audit logs found</h3>
            <p className="text-gray-500">Try adjusting your filters to see more results</p>
          </div>
        )}

        {/* Pagination */}
        {data?.pagination && data.pagination.pages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                Showing page <span className="font-semibold text-gray-900">{data.pagination.page}</span> of{' '}
                <span className="font-semibold text-gray-900">{data.pagination.pages}</span>
                {' '}({data.pagination.total} total entries)
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  disabled={filters.page === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  disabled={filters.page === data.pagination.pages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AuditTrail

