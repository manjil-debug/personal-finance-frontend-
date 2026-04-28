import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionsApi } from '../api'
import toast from 'react-hot-toast'

export function useTransactions(params) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => transactionsApi.list(params).then((res) => res.data),
  })
}

export function useTransaction(id) {
  return useQuery({
    queryKey: ['transactions', id],
    queryFn: () => transactionsApi.get(id).then((res) => res.data),
    enabled: !!id,
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => transactionsApi.create(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      toast.success('Transaction created')
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Failed to create transaction'),
  })
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => transactionsApi.update(id, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      toast.success('Transaction updated')
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Failed to update transaction'),
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => transactionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      toast.success('Transaction deleted')
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Failed to delete transaction'),
  })
}
