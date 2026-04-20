import { useState } from 'react'
import { useTransfers, useCreateTransfer, useDeleteTransfer } from '../hooks/useTransfers'
import { useAccounts } from '../hooks/useAccounts'
import { formatCurrency, formatDate } from '../utils/format'
import { HiPlus, HiTrash, HiXMark, HiArrowRight } from 'react-icons/hi2'

function TransferForm({ accounts, onClose }) {
  const [fromAccountId, setFromAccountId] = useState('')
  const [toAccountId, setToAccountId] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const createTransfer = useCreateTransfer()

  const handleSubmit = (e) => {
    e.preventDefault()
    createTransfer.mutate(
      {
        from_account_id: fromAccountId,
        to_account_id: toAccountId,
        amount: parseFloat(amount),
        currency,
        description: description || null,
        notes: notes || null,
        date,
      },
      { onSuccess: onClose }
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold dark:text-gray-100">New Transfer</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <HiXMark className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From</label>
              <select
                value={fromAccountId}
                onChange={(e) => setFromAccountId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm bg-white dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="">Select</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id} disabled={a.id === toAccountId}>
                    {a.icon} {a.name}
                  </option>
                ))}
              </select>
            </div>
            <HiArrowRight className="w-5 h-5 text-gray-400 mb-2.5" />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To</label>
              <select
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm bg-white dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="">Select</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id} disabled={a.id === fromAccountId}>
                    {a.icon} {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 dark:text-gray-100"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          <button
            type="submit"
            disabled={createTransfer.isPending}
            className="w-full py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            Create Transfer
          </button>
        </form>
      </div>
    </div>
  )
}

export default function Transfers() {
  const { data: transfers = [], isLoading } = useTransfers()
  const { data: accounts = [] } = useAccounts()
  const deleteTransfer = useDeleteTransfer()
  const [showForm, setShowForm] = useState(false)

  const accountMap = accounts.reduce((map, a) => ({ ...map, [a.id]: a }), {})

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Transfers</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <HiPlus className="w-4 h-4" />
          New Transfer
        </button>
      </div>

      {transfers.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">No transfers yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transfers.map((transfer) => {
            const fromAccount = accountMap[transfer.from_account_id]
            const toAccount = accountMap[transfer.to_account_id]
            return (
              <div
                key={transfer.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-800 dark:text-gray-100">
                      {fromAccount?.icon} {fromAccount?.name || 'Unknown'}
                    </span>
                    <HiArrowRight className="w-4 h-4 text-primary-500" />
                    <span className="font-medium text-gray-800 dark:text-gray-100">
                      {toAccount?.icon} {toAccount?.name || 'Unknown'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(transfer.date)}</span>
                  {transfer.description && (
                    <span className="text-xs text-gray-400">· {transfer.description}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-primary-600">
                    {formatCurrency(transfer.amount)}
                  </span>
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this transfer?')) deleteTransfer.mutate(transfer.id)
                    }}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showForm && <TransferForm accounts={accounts} onClose={() => setShowForm(false)} />}
    </div>
  )
}
