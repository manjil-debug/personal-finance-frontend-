import { useAuth } from '../../context/AuthContext'
import { HiOutlineArrowRightOnRectangle } from 'react-icons/hi2'

export default function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">
          Welcome back, {user?.full_name?.split(' ')[0] || 'User'}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-medium text-primary-700">
            {user?.full_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <span className="text-sm text-gray-600">{user?.full_name}</span>
        </div>
        <button
          onClick={logout}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          title="Logout"
        >
          <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}
