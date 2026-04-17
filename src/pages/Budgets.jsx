import { useState } from 'react'
import {
  useBudgets, useCreateBudget, useUpdateBudget, useDeleteBudget,
} from '../hooks/useBudgets'
import { useTransactions } from '../hooks/useTransactions'
import { useCategories } from '../hooks/useCategories'
import { formatCurrency } from '../utils/format'
import { HiPlus, HiPencil, HiTrash, HiXMark } from 'react-icons/hi2'

function BudgetForm({ budget, categories, onClose }) {
  const [name, setName] = useState(budget?.name || '')
  const [categoryId, setCategoryId] = useState(budget?.category_id || '')
  const [amount, setAmount] = useState(budget?.amount || '')
  const [period, setPeriod] = useState(budget?.period || 'monthly')
  const [startDate, setStartDate] = useState(
    budget?.start_date || new Date().toISOString().split('T')[0]
  )
  const [endDate, setEndDate] = useState(budget?.end_date || '')
  const [isActive, setIsActive] = useState(budget?.is_active ?? true)

  const createBudget = useCreateBudget()
  const updateBudget = useUpdateBudget()

  const handleSubmit = (e) => {
    e.preventDefault()
    const data = {
      name,
      category_id: categoryId || null,
      amount: parseFloat(amount),
      period,
      start_date: startDate,
      end_date: endDate || null,
      ...(budget ? { is_active: isActive } : {}),
    }

    if (budget) {
      updateBudget.mutate({ id: budget.id, data }, { onSuccess: onClose })
    } else {
      createBudget.mutate(data, { onSuccess: onClose })
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{budget ? 'Edit Budget' : 'New Budget'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <HiXMark className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category (optional)</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              <option value="">All categories</option>
              {categories
                .filter((c) => c.type === 'expense')
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget Amount</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date (optional)</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>

          {budget && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-gray-300"
              />
              Active
            </label>
          )}

          <button
            type="submit"
            disabled={createBudget.isPending || updateBudget.isPending}
            className="w-full py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {budget ? 'Update' : 'Create'} Budget
          </button>
        </form>
      </div>
    </div>
  )
}

export default function Budgets() {
  const { data: budgets = [], isLoading } = useBudgets()
  const { data: transactions = [] } = useTransactions()
  const { data: categories = [] } = useCategories()
  const deleteBudget = useDeleteBudget()
  const [showForm, setShowForm] = useState(false)
  const [editBudget, setEditBudget] = useState(null)

  const categoryMap = categories.reduce((map, c) => ({ ...map, [c.id]: c }), {})

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-40 mb-3"></div>
            <div className="h-2 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Budgets</h2>
        <button
          onClick={() => { setEditBudget(null); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <HiPlus className="w-4 h-4" />
          New Budget
        </button>
      </div>

      {budgets.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500 mb-4">No budgets yet. Create one to track your spending!</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
          >
            Create Budget
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {budgets.map((budget) => {
            const spent = transactions
              .filter((t) => t.type === 'expense' && (!budget.category_id || t.category_id === budget.category_id))
              .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
            const budgetAmount = parseFloat(budget.amount)
            const percentage = Math.min((spent / budgetAmount) * 100, 100)
            const remaining = budgetAmount - spent
            const barColor =
              percentage >= 90 ? 'bg-red-500' : percentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
            const category = categoryMap[budget.category_id]

            return (
              <div key={budget.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800">{budget.name}</h3>
                      {!budget.is_active && (
                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {category ? `${category.icon} ${category.name} · ` : ''}{budget.period}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setEditBudget(budget); setShowForm(true) }}
                      className="p-1.5 text-gray-400 hover:text-primary-600"
                    >
                      <HiPencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this budget?')) deleteBudget.mutate(budget.id)
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600"
                    >
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-600">
                    {formatCurrency(spent)} / {formatCurrency(budgetAmount)}
                  </span>
                  <span className={remaining >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {remaining >= 0 ? `${formatCurrency(remaining)} left` : `${formatCurrency(Math.abs(remaining))} over`}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${barColor} transition-all`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <BudgetForm
          budget={editBudget}
          categories={categories}
          onClose={() => { setShowForm(false); setEditBudget(null) }}
        />
      )}
    </div>
  )
}
