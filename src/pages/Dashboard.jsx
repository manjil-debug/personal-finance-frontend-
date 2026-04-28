import { useAccounts } from '../hooks/useAccounts'
import { useTransactions } from '../hooks/useTransactions'
import { useBudgets } from '../hooks/useBudgets'
import { useCategories } from '../hooks/useCategories'
import { useTheme } from '../context/ThemeContext'
import { formatCurrency, formatDate } from '../utils/format'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend, LineChart, Line,
} from 'recharts'

const DONUT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1', '#14b8a6', '#f97316']

function CustomTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow-lg">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
          {formatter ? formatter(entry.value) : entry.value}
        </p>
      ))}
    </div>
  )
}

function PieTooltip({ active, payload, formatter }) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow-lg">
      <p className="text-xs text-gray-500 dark:text-gray-400">{name}</p>
      <p className="text-sm font-semibold dark:text-gray-100">{formatter ? formatter(value) : value}</p>
    </div>
  )
}

function SummaryCard({ title, amount, color }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
      <p className={`text-lg sm:text-2xl font-bold ${color}`}>{formatCurrency(amount)}</p>
    </div>
  )
}

export default function Dashboard() {
  const { data: accounts = [], isLoading: loadingAccounts } = useAccounts()
  const { data: transactions = [], isLoading: loadingTxns } = useTransactions()
  const { data: budgets = [] } = useBudgets()
  const { data: categories = [] } = useCategories()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const netWorth = accounts.reduce((sum, a) => sum + parseFloat(a.balance || 0), 0)
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)

  // Build spending trend data (last 7 days)
  const spendingData = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const dayExpenses = transactions
      .filter((t) => t.type === 'expense' && t.date === dateStr)
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
    spendingData.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: dayExpenses,
    })
  }

  // Build monthly income vs expenses data (last 6 months)
  const categoryMap = categories.reduce((map, c) => ({ ...map, [c.id]: c }), {})
  const monthlyData = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - i)
    const year = d.getFullYear()
    const month = d.getMonth()
    const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    const monthIncome = transactions
      .filter((t) => {
        const td = new Date(t.date)
        return t.type === 'income' && td.getFullYear() === year && td.getMonth() === month
      })
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
    const monthExpense = transactions
      .filter((t) => {
        const td = new Date(t.date)
        return t.type === 'expense' && td.getFullYear() === year && td.getMonth() === month
      })
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
    monthlyData.push({ month: label, income: monthIncome, expenses: monthExpense, net: monthIncome - monthExpense })
  }

  // Build expense breakdown by category
  const expenseByCategory = {}
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const cat = categoryMap[t.category_id]
      const name = cat ? cat.name : 'Uncategorized'
      expenseByCategory[name] = (expenseByCategory[name] || 0) + parseFloat(t.amount || 0)
    })
  const expenseCategoryData = Object.entries(expenseByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  // Top 5 spending categories for horizontal bar
  const topCategories = expenseCategoryData.slice(0, 5)

  if (loadingAccounts || loadingTxns) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard title="Net Worth" amount={netWorth} color="text-gray-900 dark:text-gray-100" />
        <SummaryCard title="Total Income" amount={totalIncome} color="text-green-600 dark:text-green-400" />
        <SummaryCard title="Total Expenses" amount={totalExpenses} color="text-red-600 dark:text-red-400" />
      </div>

      {/* Budget Overview - moved to top */}
      {budgets.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Budget Overview</h3>
          <div className="space-y-4">
            {budgets.filter((b) => b.is_active).slice(0, 5).map((budget) => {
              const spent = transactions
                .filter((t) => t.type === 'expense' && t.category_id === budget.category_id)
                .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
              const percentage = Math.min((spent / parseFloat(budget.amount)) * 100, 100)
              const barColor =
                percentage >= 90 ? 'bg-red-500' : percentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'

              return (
                <div key={budget.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{budget.name}</span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {formatCurrency(spent)} / {formatCurrency(budget.amount)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${barColor} transition-all`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Charts & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Spending Trend (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={spendingData}>
              <defs>
                <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip content={<CustomTooltip formatter={(v) => formatCurrency(v)} />} />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#spendingGradient)"
                dot={false}
                activeDot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Recent Transactions</h3>
          {recentTransactions.length === 0 ? (
            <p className="text-gray-400 text-sm">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((txn) => (
                <div key={txn.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{txn.description}</p>
                    <p className="text-xs text-gray-400">{formatDate(txn.date)}</p>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      txn.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Donut Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Allocation Donut */}
        {budgets.filter((b) => b.is_active).length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Budget Allocation</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={(() => {
                    const activeBudgets = budgets.filter((b) => b.is_active)
                    return activeBudgets.map((b) => ({
                      name: b.name,
                      value: parseFloat(b.amount),
                    }))
                  })()}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {budgets.filter((b) => b.is_active).map((_, i) => (
                    <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip formatter={(v) => formatCurrency(v)} />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-2">
              {budgets.filter((b) => b.is_active).map((b, i) => (
                <div key={b.id} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                  {b.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Net Worth by Account Donut */}
        {accounts.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Net Worth by Account</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={accounts
                    .filter((a) => parseFloat(a.balance || 0) > 0)
                    .map((a) => ({
                      name: a.name,
                      value: parseFloat(a.balance),
                    }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {accounts
                    .filter((a) => parseFloat(a.balance || 0) > 0)
                    .map((a, i) => (
                      <Cell key={i} fill={a.color || DONUT_COLORS[i % DONUT_COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip content={<PieTooltip formatter={(v) => formatCurrency(v)} />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-2">
              {accounts.filter((a) => parseFloat(a.balance || 0) > 0).map((a, i) => (
                <div key={a.id} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: a.color || DONUT_COLORS[i % DONUT_COLORS.length] }} />
                  {a.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Income vs Expenses & Cash Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Income vs Expenses */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Income vs Expenses (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData} barGap={4}>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }}
                axisLine={false}
                tickLine={false}
                width={50}
              />
              <Tooltip content={<CustomTooltip formatter={(v) => formatCurrency(v)} />} />
              <Legend
                wrapperStyle={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b' }}
              />
              <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Cash Flow Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Net Cash Flow (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={monthlyData}>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }}
                axisLine={false}
                tickLine={false}
                width={50}
              />
              <Tooltip content={<CustomTooltip formatter={(v) => formatCurrency(v)} />} />
              <Line
                type="monotone"
                dataKey="net"
                name="Net"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expense by Category & Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Breakdown by Category Donut */}
        {expenseCategoryData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Expenses by Category</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={expenseCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {expenseCategoryData.map((_, i) => (
                    <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip formatter={(v) => formatCurrency(v)} />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-2">
              {expenseCategoryData.map((entry, i) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                  {entry.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top 5 Spending Categories Bar */}
        {topCategories.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Top Spending Categories</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topCategories} layout="vertical" barSize={18}>
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  width={100}
                />
                <Tooltip content={<CustomTooltip formatter={(v) => formatCurrency(v)} />} />
                <Bar dataKey="value" name="Spent" radius={[0, 4, 4, 0]}>
                  {topCategories.map((_, i) => (
                    <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
