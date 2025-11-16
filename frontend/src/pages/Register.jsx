import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { UserPlus, Mail, Lock, User, Building, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const validateForm = () => {
    const newErrors = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Name cannot exceed 50 characters'
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    } else if (formData.password.length > 128) {
      newErrors.password = 'Password cannot exceed 128 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      })
    }
    // Clear general error when user starts typing
    if (errors.general) {
      setErrors({
        ...errors,
        general: '',
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Client-side validation
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const result = await register(formData)

      if (result.success) {
        toast.success('Account created successfully!')
        const roleRoutes = {
          employee: '/employee',
          manager: '/manager',
          hr: '/hr',
        }
        navigate(roleRoutes[result.user.role] || '/employee')
      } else {
        // Handle backend errors
        if (result.errors && Array.isArray(result.errors)) {
          const backendErrors = {}
          result.errors.forEach((err) => {
            backendErrors[err.field] = err.message
          })
          setErrors(backendErrors)
        } else {
          // Set field errors for specific cases
          const errorMessage = result.message || 'Could not create account'
          if (errorMessage.toLowerCase().includes('email') || errorMessage.toLowerCase().includes('already exists')) {
            setErrors({ email: errorMessage })
          } else {
            setErrors({ general: errorMessage })
          }
        }
      }
    } catch (err) {
      // Handle network errors
      setErrors({ general: 'Unable to connect to server. Please check your internet connection and try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-300/20 rounded-full blur-3xl -ml-48 -mb-48"></div>
      
      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 p-8 sm:p-10">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mb-4 shadow-lg">
              <UserPlus className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">Create Account</h2>
            <p className="mt-2 text-sm text-gray-600">Sign up to get started with Leave Management</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* General Error (for server errors) */}
            {errors.general && (
              <div className="mt-2 animate-in slide-in-from-top-2 duration-200">
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-md p-3">
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-red-700 leading-relaxed">
                    {errors.general}
                  </p>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none z-10 transition-colors ${
                  errors.name ? 'text-red-500' : 'text-gray-400'
                }`} />
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 pl-11 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.name
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50 text-red-900 placeholder-red-300'
                      : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500 hover:border-gray-400'
                  }`}
                  placeholder="Enter your name"
                  aria-invalid={errors.name ? 'true' : 'false'}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                />
              </div>
              {errors.name && (
                <div id="name-error" className="mt-2 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-md p-2.5">
                    <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-red-700 leading-relaxed">
                      {errors.name}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none z-10 transition-colors ${
                  errors.email ? 'text-red-500' : 'text-gray-400'
                }`} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 pl-11 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.email
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50 text-red-900 placeholder-red-300'
                      : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500 hover:border-gray-400'
                  }`}
                  placeholder="Enter your email"
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
              </div>
              {errors.email && (
                <div id="email-error" className="mt-2 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-md p-2.5">
                    <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-red-700 leading-relaxed">
                      {errors.email}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none z-10 transition-colors ${
                  errors.password ? 'text-red-500' : 'text-gray-400'
                }`} />
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 pl-11 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.password
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50 text-red-900 placeholder-red-300'
                      : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500 hover:border-gray-400'
                  }`}
                  placeholder="Enter your password (min 6 characters)"
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
              </div>
              {errors.password && (
                <div id="password-error" className="mt-2 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-md p-2.5">
                    <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-red-700 leading-relaxed">
                      {errors.password}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors bg-white"
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="hr">HR</option>
              </select>
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                Department (Optional)
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                <input
                  id="department"
                  name="department"
                  type="text"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 pl-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  placeholder="Enter department"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register

