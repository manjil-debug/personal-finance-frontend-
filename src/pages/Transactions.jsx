import { useState } from 'react'
import {
  useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction,
} from '../hooks/useTransactions'
import { useAccounts } from '../hooks/useAccounts'
import { useCategories } from '../hooks/useCategories'
import { formatCurrency, formatDate } from '../utils/format'
import { HiPlus, HiPencil, HiTrash, HiXMark } from 'react-icons/hi2'

function TransactionForm({ transaction, accounts, categories, onClose }) {
  const [accountId, setAccountId] = useState(transaction?.account_id || '')
  const [categoryId, setCategoryId] = useState(transaction?.category_id || '')
  const [type, setType] = useState(transaction?.type || 'expense')
  const [amount, setAmount] = useState(transaction?.amount || '')
  const [currency, setCurrency] = useState(transaction?.currency || 'USD')
  const [description, setDescription] = useState(transaction?.description || '')
  const [notes, setNotes] = useState(transaction?.notes || '')
  const [date, setDate] = useState(transaction?.date || new Date().toISOString().split('T')[0])

  const createTxn = useCreateTransaction()
  const updateTxn = useUpdateTransaction()

  const handleSubmit = (e) => {
    e.preventDefault()

    if (transaction) {
      updateTxn.mutate(
        { id: transaction.id, data: { category_id: categoryId || null, description, notes, date } },
        { onSuccess: onClose }
      )
    } else {
      createTxn.mutate(
        {
          account_id: accountId,
          category_id: categoryId || null,
          type,
          amount: parseFloat(amount),
          currency,
          description,
          notes: notes || null,
          date,
        },
        { onSuccess: onClose }
      )
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{transaction ? 'Edit Transaction' : 'New Transaction'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <HiXMark className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!transaction && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                >
                  <option value="">Select account</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.icon} {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <div className="flex gap-2">
                  {['expense', 'income'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        type === t
                          ? t === 'expense'
                            ? 'bg-red-50 border-red-300 text-red-700'
                            : 'bg-green-50 border-green-300 text-green-700'
                          : 'border-gray-200 text-gray-500'
                      }`}
                    >
                      {t === 'expense' ? 'Expense' : 'Income'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
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
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              <option value="">No category</option>
              {categories
                .filter((c) => c.type === type || transaction)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={createTxn.isPending || updateTxn.isPending}
            className="w-full py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {transaction ? 'Update' : 'Create'} Transaction
          </button>
        </form>
      </div>
    </div>
  )
}

export default function Transactions() {
  const [filterAccount, setFilterAccount] = useState('')
  const { data: transactions = [], isLoading } = useTransactions(
    filterAccount ? { account_id: filterAccount } : undefined
  )
  const { data: accounts = [] } = useAccounts()
  const { data: categories = [] } = useCategories()
  const deleteTxn = useDeleteTransaction()
  const [showForm, setShowForm] = useState(false)
  const [editTxn, setEditTxn] = useState(null)

  const sortedTxns = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date))

  // Group by date
  const grouped = sortedTxns.reduce((groups, txn) => {
    const date = txn.date
    if (!groups[date]) groups[date] = []
    groups[date].push(txn)
    return groups
  }, {})

  const accountMap = accounts.reduce((map, a) => ({ ...map, [a.id]: a }), {})
  const categoryMap = categories.reduce((map, c) => ({ ...map, [c.id]: c }), {})

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Transactions</h2>
        <button
          onClick={() => { setEditTxn(null); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <HiPlus className="w-4 h-4" />
          Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <select
          value={filterAccount}
          onChange={(e) => setFilterAccount(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
        >
          <option value="">All Accounts</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.icon} {a.name}
            </option>
          ))}
        </select>
      </div>

      {sortedTxns.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No transactions found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([date, txns]) => (
            <div key={date}>
              <h4 className="text-sm font-medium text-gray-500 mb-2">{formatDate(date)}</h4>
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                {txns.map((txn) => {
                  const category = categoryMap[txn.category_id]
                  const account = accountMap[txn.account_id]
                  return (
                    <div key={txn.id} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-sm">
                          {category?.icon || (txn.type === 'income' ? '💰' : '💸')}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{txn.description}</p>
                          <p className="text-xs text-gray-400">
                            {account?.name || 'Unknown'}{category ? ` · ${category.name}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-sm font-semibold ${
                            txn.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                        </span>
                        <button
                          onClick={() => { setEditTxn(txn); setShowForm(true) }}
                          className="p-1 text-gray-400 hover:text-primary-600"
                        >
                          <HiPencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this transaction?')) deleteTxn.mutate(txn.id)
                          }}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <HiTrash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <TransactionForm
          transaction={editTxn}
          accounts={accounts}
          categories={categories}
          onClose={() => { setShowForm(false); setEditTxn(null) }}
        />
      )}
    </div>
  )
}
