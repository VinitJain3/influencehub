import { create } from 'zustand'

export const useNotificationStore = create((set) => ({
  unreadCount: 0,
  notifications: [],
  setCount: (n) => set({ unreadCount: n }),
  increment: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  markAllRead: () => set({ unreadCount: 0 }),
  setNotifications: (notifications) => set({ notifications }),
}))
