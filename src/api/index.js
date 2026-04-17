import client from './client'

export const authApi = {
  signup: (data) => client.post('/auth/signup', data),
  login: (data) => client.post('/auth/login', data),
  refresh: (data) => client.post('/auth/refresh', data),
  logout: (data) => client.post('/auth/logout', data),
}

export const usersApi = {
  getMe: () => client.get('/users/me'),
  updateMe: (data) => client.put('/users/me', data),
}

export const accountsApi = {
  list: () => client.get('/accounts'),
  get: (id) => client.get(`/accounts/${id}`),
  create: (data) => client.post('/accounts', data),
  update: (id, data) => client.put(`/accounts/${id}`, data),
  delete: (id) => client.delete(`/accounts/${id}`),
}

export const transactionsApi = {
  list: (params) => client.get('/transactions', { params }),
  get: (id) => client.get(`/transactions/${id}`),
  create: (data) => client.post('/transactions', data),
  update: (id, data) => client.put(`/transactions/${id}`, data),
  delete: (id) => client.delete(`/transactions/${id}`),
}

export const transfersApi = {
  list: () => client.get('/transfers'),
  get: (id) => client.get(`/transfers/${id}`),
  create: (data) => client.post('/transfers', data),
  update: (id, data) => client.put(`/transfers/${id}`, data),
  delete: (id) => client.delete(`/transfers/${id}`),
}

export const budgetsApi = {
  list: () => client.get('/budgets'),
  get: (id) => client.get(`/budgets/${id}`),
  create: (data) => client.post('/budgets', data),
  update: (id, data) => client.put(`/budgets/${id}`, data),
  delete: (id) => client.delete(`/budgets/${id}`),
}

export const categoriesApi = {
  list: () => client.get('/categories'),
}
