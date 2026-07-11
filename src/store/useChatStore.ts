import { create } from 'zustand';

interface ChatStore {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  clearUnread: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
  clearUnread: () => set({ unreadCount: 0 }),
}));
