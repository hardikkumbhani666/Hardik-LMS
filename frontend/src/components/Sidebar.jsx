import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  Users, 
  BarChart3,
  History,
  X 
} from 'lucide-react'

const Sidebar = ({ isOpen, onClose, userRole }) => {
  const menuItems = {
    employee: [
      { path: '/employee', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/employee/apply', icon: Calendar, label: 'Apply Leave' },
      { path: '/employee/leaves', icon: FileText, label: 'My Leaves' },
      { path: '/employee/audit', icon: History, label: 'Audit Trail' },
    ],
    manager: [
      { path: '/manager', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/manager/leaves', icon: FileText, label: 'Team Leaves' },
      { path: '/manager/team', icon: Users, label: 'Team Members' },
      { path: '/manager/audit', icon: History, label: 'Audit Trail' },
    ],
    hr: [
      { path: '/hr', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/hr/leaves', icon: FileText, label: 'All Leaves' },
      { path: '/hr/users', icon: Users, label: 'Users' },
      { path: '/hr/reports', icon: BarChart3, label: 'Reports' },
      { path: '/hr/audit', icon: History, label: 'Audit Trail' },
    ],
  }

  const items = menuItems[userRole] || []

  const basePath = `/${userRole}`

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white shadow-xl border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:relative lg:z-auto lg:flex-shrink-0 lg:h-full
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full bg-gradient-to-b from-white to-gray-50/50">
          {/* Close button for mobile */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white lg:hidden flex-shrink-0">
            <h2 className="text-lg font-bold text-gray-900">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto overflow-x-hidden hide-scrollbar">
            {items.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  end={item.path === basePath}
                  className={({ isActive }) =>
                    `group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 transition-transform ${item.path === basePath ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
}

export default Sidebar

