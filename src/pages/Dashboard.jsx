import { useAccounts } from '../hooks/useAccounts'
import { useTransactions } from '../hooks/useTransactions'
import { useBudgets } from '../hooks/useBudgets'
import { formatCurrency, formatDate } from '../utils/format'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

function SummaryCard({ title, amount, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
      <p className="text-xs sm:text-sm text-gray-500 mb-1">{title}</p>
      <p className={`text-lg sm:text-2xl font-bold ${color}`}>{formatCurrency(amount)}</p>
    </div>
  )
}

export default function Dashboard() {
  const { data: accounts = [], isLoading: loadingAccounts } = useAccounts()
  const { data: transactions = [], isLoading: loadingTxns } = useTransactions()
  const { data: budgets = [] } = useBudgets()

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

  if (loadingAccounts || loadingTxns) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-32"></div>
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
        <SummaryCard title="Net Worth" amount={netWorth} color="text-gray-900" />
        <SummaryCard title="Total Income" amount={totalIncome} color="text-green-600" />
        <SummaryCard title="Total Expenses" amount={totalExpenses} color="text-red-600" />
      </div>

      {/* Budget Overview - moved to top */}
      {budgets.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Budget Overview</h3>
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
                    <span className="font-medium text-gray-700">{budget.name}</span>
                    <span className="text-gray-500">
                      {formatCurrency(spent)} / {formatCurrency(budget.amount)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
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
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Spending Trend (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={spendingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip />
              <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Recent Transactions</h3>
          {recentTransactions.length === 0 ? (
            <p className="text-gray-400 text-sm">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((txn) => (
                <div key={txn.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{txn.description}</p>
                    <p className="text-xs text-gray-400">{formatDate(txn.date)}</p>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      txn.type === 'income' ? 'text-green-600' : 'text-red-600'
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
    </div>
  )
}
