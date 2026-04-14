import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  role: localStorage.getItem('role') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  login: (userData, token, role) => {
    localStorage.setItem('token', token)
    localStorage.setItem('role', role)
    localStorage.setItem('user', JSON.stringify(userData))
    set({ user: userData, token, role, isAuthenticated: true })
  },
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('user')
    set({ user: null, token: null, role: null, isAuthenticated: false })
  },
  updateUser: (partial) => set((state) => ({ user: { ...state.user, ...partial } })),
  hydrate: () => {
    const user = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')
    if (token && user) {
      set({ user: JSON.parse(user), token, role, isAuthenticated: true })
    }
  }
}))
