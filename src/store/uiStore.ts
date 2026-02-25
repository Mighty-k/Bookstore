import { create } from "zustand";
import type { Book } from "../types";

interface UIStore {
  // Sidebar state
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;

  // Quick view modal
  isQuickViewOpen: boolean;
  quickViewBook: Book | null;
  openQuickView: (book: Book) => void;
  closeQuickView: () => void;

  // Search
  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;

  // Notifications
  notifications: Array<{
    id: string;
    type: "success" | "error" | "info" | "warning";
    message: string;
  }>;
  addNotification: (
    type: "success" | "error" | "info" | "warning",
    message: string,
  ) => void;
  removeNotification: (id: string) => void;

  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  // Sidebar
  isSidebarOpen: false,
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),

  // Quick view modal
  isQuickViewOpen: false,
  quickViewBook: null,
  openQuickView: (book) => set({ isQuickViewOpen: true, quickViewBook: book }),
  closeQuickView: () => set({ isQuickViewOpen: false, quickViewBook: null }),

  // Search
  isSearchOpen: false,
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),

  // Notifications
  notifications: [],
  addNotification: (type, message) => {
    const id = Date.now().toString();
    set((state) => ({
      notifications: [...state.notifications, { id, type, message }],
    }));

    // Auto remove after 5 seconds
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    }, 5000);
  },
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  // Theme
  isDarkMode: false,
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
}));
