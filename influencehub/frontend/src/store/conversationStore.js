import { create } from 'zustand'

export const useConversationStore = create((set) => ({
  conversations: [],
  activeId: null,
  messages: {},
  unreadCounts: {},
  setConversations: (list) => set({ conversations: list }),
  setActive: (id) => set({ activeId: id }),
  appendMessage: (convId, message) => set((state) => ({
    messages: {
      ...state.messages,
      [convId]: [...(state.messages[convId] || []), message]
    }
  })),
  setMessages: (convId, msgs) => set((state) => ({
    messages: { ...state.messages, [convId]: msgs }
  })),
  markConversationRead: (convId) => set((state) => ({
    unreadCounts: { ...state.unreadCounts, [convId]: 0 }
  })),
}))
