import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { budgetsApi } from '../api'
import toast from 'react-hot-toast'

export function useBudgets() {
  return useQuery({
    queryKey: ['budgets'],
    queryFn: () => budgetsApi.list().then((res) => res.data),
  })
}

export function useBudget(id) {
  return useQuery({
    queryKey: ['budgets', id],
    queryFn: () => budgetsApi.get(id).then((res) => res.data),
    enabled: !!id,
  })
}

export function useCreateBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => budgetsApi.create(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      toast.success('Budget created')
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Failed to create budget'),
  })
}

export function useUpdateBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => budgetsApi.update(id, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      toast.success('Budget updated')
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Failed to update budget'),
  })
}

export function useDeleteBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => budgetsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      toast.success('Budget deleted')
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Failed to delete budget'),
  })
}
