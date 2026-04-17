import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transfersApi } from '../api'
import toast from 'react-hot-toast'

export function useTransfers() {
  return useQuery({
    queryKey: ['transfers'],
    queryFn: () => transfersApi.list().then((res) => res.data),
  })
}

export function useCreateTransfer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => transfersApi.create(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast.success('Transfer created')
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Failed to create transfer'),
  })
}

export function useUpdateTransfer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => transfersApi.update(id, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] })
      toast.success('Transfer updated')
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Failed to update transfer'),
  })
}

export function useDeleteTransfer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => transfersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast.success('Transfer deleted')
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Failed to delete transfer'),
  })
}
