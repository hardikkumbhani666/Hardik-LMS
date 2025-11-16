import { useQuery } from '@tanstack/react-query'
import { Users, Mail, Building, Calendar } from 'lucide-react'
import { userAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../../utils/errorMessages'

const TeamMembers = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['team'],
    queryFn: () => userAPI.getUsers().then((res) => res.data.data),
    onError: (error) => {
      const errorMsg = getErrorMessage(error, 'manager', 'viewTeam')
      toast.error(errorMsg)
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const teamMembers = data?.users || []
  const totalCount = data?.count || teamMembers.length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Users className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
            {totalCount > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {totalCount} {totalCount === 1 ? 'member' : 'members'} in your team
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        {teamMembers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamMembers.map((member) => {
              const hasManager = member.managerId && (member.managerId._id || member.managerId)
              return (
                <div
                  key={member._id}
                  className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                    !hasManager ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-600 font-semibold">
                        {member.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{member.name}</h3>
                      <p className="text-sm text-gray-500">{member.employeeId}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    {member.department && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Building className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{member.department}</span>
                      </div>
                    )}
                    {!hasManager && (
                      <div className="mt-2 pt-2 border-t border-yellow-200">
                        <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full font-medium">
                          No Manager Assigned
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No team members found</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TeamMembers

