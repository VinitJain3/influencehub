import { create } from 'zustand'

let toastId = 0

export const useToastStore = create((set) => ({
  toasts: [],
  addToast: ({ type, title, description, duration = 4000 }) => {
    const id = ++toastId
    set((state) => ({
      toasts: [...state.toasts, { id, type, title, description, duration }]
    }))
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }))
    }, duration)
    return id
  },
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id)
  })),
}))

export const useToast = () => {
  const addToast = useToastStore((s) => s.addToast)
  return {
    toast: {
      success: (title, description) => addToast({ type: 'success', title, description }),
      error: (title, description) => addToast({ type: 'error', title, description }),
      warning: (title, description) => addToast({ type: 'warning', title, description }),
      info: (title, description) => addToast({ type: 'info', title, description }),
    }
  }
}
