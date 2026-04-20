import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { HiOutlineArrowRightOnRectangle, HiBars3, HiOutlineSun, HiOutlineMoon } from 'react-icons/hi2'

export default function Header({ onMenuToggle }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <HiBars3 className="w-6 h-6" />
        </button>
        <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100">
          Welcome back, {user?.full_name?.split(' ')[0] || 'User'}
        </h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <HiOutlineSun className="w-5 h-5" /> : <HiOutlineMoon className="w-5 h-5" />}
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-sm font-medium text-primary-700 dark:text-primary-300">
            {user?.full_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:inline">{user?.full_name}</span>
        </div>
        <button
          onClick={logout}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          title="Logout"
        >
          <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}
