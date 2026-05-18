import { create } from "zustand";

interface NotificationState {
  unreadByChat: Record<string, number>;
  getUnreadCount: (chatId: string) => number;
  getTotalUnread: () => number;
  incrementUnread: (chatId: string) => void;
  markChatAsRead: (chatId: string) => void;
  clearAll: () => void;
}

export const useNotifications = create<NotificationState>()((set, get) => ({
  unreadByChat: {},

  getUnreadCount: (chatId: string) => get().unreadByChat[chatId] ?? 0,

  getTotalUnread: () =>
    Object.values(get().unreadByChat).reduce((sum, n) => sum + n, 0),

  incrementUnread: (chatId: string) => {
    set((state) => ({
      unreadByChat: {
        ...state.unreadByChat,
        [chatId]: (state.unreadByChat[chatId] ?? 0) + 1,
      },
    }));
  },

  markChatAsRead: (chatId: string) => {
    set((state) => {
      if (!state.unreadByChat[chatId]) return state;
      const { [chatId]: _, ...rest } = state.unreadByChat;
      return { unreadByChat: rest };
    });
  },

  clearAll: () => set({ unreadByChat: {} }),
}));
