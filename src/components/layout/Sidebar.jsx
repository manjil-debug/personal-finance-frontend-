import { NavLink } from 'react-router-dom'
import {
  HiOutlineHome,
  HiOutlineCreditCard,
  HiOutlineBanknotes,
  HiOutlineArrowsRightLeft,
  HiOutlineChartPie,
  HiOutlineCog6Tooth,
} from 'react-icons/hi2'

const navItems = [
  { to: '/', icon: HiOutlineHome, label: 'Dashboard', end: true },
  { to: '/accounts', icon: HiOutlineCreditCard, label: 'Accounts' },
  { to: '/transactions', icon: HiOutlineBanknotes, label: 'Transactions' },
  { to: '/transfers', icon: HiOutlineArrowsRightLeft, label: 'Transfers' },
  { to: '/budgets', icon: HiOutlineChartPie, label: 'Budgets' },
  { to: '/settings', icon: HiOutlineCog6Tooth, label: 'Settings' },
]

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col z-30">
      <div className="p-6">
        <h1 className="text-xl font-bold text-primary-600">FinanceApp</h1>
      </div>

      <nav className="flex-1 px-3">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
