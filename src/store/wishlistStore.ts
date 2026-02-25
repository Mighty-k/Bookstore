import { create } from "zustand";
import { persist } from "zustand/middleware";
import { wishlistService } from "../services/api/wishlist";
import type { WishlistItem } from "../services/api/wishlist";
import { useAuthStore } from "./authStore";
import toast from "react-hot-toast";

interface WishlistState {
  items: WishlistItem[];
  count: number;
  isLoading: boolean;
  error: string | null;
  bookStatus: Map<string, boolean>; // Track which books are in wishlist

  // Actions
  fetchWishlist: () => Promise<void>;
  addToWishlist: (bookId: string, title: string) => Promise<boolean>;
  removeFromWishlist: (bookId: string) => Promise<boolean>;
  moveToCart: (
    bookId: string,
    title: string,
    price?: number,
    coverImage?: string,
  ) => Promise<boolean>;
  clearWishlist: () => Promise<void>;
  checkBookStatus: (bookId: string) => boolean;
  refreshBookStatus: (bookId: string) => Promise<void>;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      count: 0,
      isLoading: false,
      error: null,
      bookStatus: new Map(),

      fetchWishlist: async () => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) {
          set({ items: [], count: 0 });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const items = await wishlistService.getWishlist();

          // Update book status map
          const bookStatus = new Map();
          items.forEach((item) => bookStatus.set(item.bookId, true));

          set({
            items,
            count: items.length,
            bookStatus,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Failed to fetch wishlist",
            isLoading: false,
          });
        }
      },

      addToWishlist: async (bookId, title) => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) {
          toast.error("Please login to add to wishlist");
          return false;
        }

        set({ isLoading: true, error: null });
        try {
          const items = await wishlistService.addToWishlist(bookId, title);

          // Update book status
          const bookStatus = new Map(get().bookStatus);
          bookStatus.set(bookId, true);

          set({
            items,
            count: items.length,
            bookStatus,
            isLoading: false,
          });

          toast.success("Added to wishlist");
          return true;
        } catch (error: any) {
          const message =
            error.response?.data?.message || "Failed to add to wishlist";
          set({
            error: message,
            isLoading: false,
          });
          toast.error(message);
          return false;
        }
      },

      removeFromWishlist: async (bookId) => {
        set({ isLoading: true, error: null });
        try {
          const items = await wishlistService.removeFromWishlist(bookId);

          // Update book status
          const bookStatus = new Map(get().bookStatus);
          bookStatus.set(bookId, false);

          set({
            items,
            count: items.length,
            bookStatus,
            isLoading: false,
          });

          toast.success("Removed from wishlist");
          return true;
        } catch (error: any) {
          const message =
            error.response?.data?.message || "Failed to remove from wishlist";
          set({
            error: message,
            isLoading: false,
          });
          toast.error(message);
          return false;
        }
      },

      moveToCart: async (bookId, title, price, coverImage) => {
        set({ isLoading: true, error: null });
        try {
          const result = await wishlistService.moveToCart(
            bookId,
            price,
            coverImage,
          );

          // Update book status (removed from wishlist)
          const bookStatus = new Map(get().bookStatus);
          bookStatus.set(bookId, false);

          set({
            items: result.wishlist,
            count: result.wishlist.length,
            bookStatus,
            isLoading: false,
          });

          toast.success(`Moved "${title}" to cart`);
          return true;
        } catch (error: any) {
          const message =
            error.response?.data?.message || "Failed to move to cart";
          set({
            error: message,
            isLoading: false,
          });
          toast.error(message);
          return false;
        }
      },

      clearWishlist: async () => {
        if (!window.confirm("Are you sure you want to clear your wishlist?")) {
          return;
        }

        set({ isLoading: true, error: null });
        try {
          await wishlistService.clearWishlist();
          set({
            items: [],
            count: 0,
            bookStatus: new Map(),
            isLoading: false,
          });
          toast.success("Wishlist cleared");
        } catch (error: any) {
          const message =
            error.response?.data?.message || "Failed to clear wishlist";
          set({
            error: message,
            isLoading: false,
          });
          toast.error(message);
        }
      },

      checkBookStatus: (bookId) => {
        return get().bookStatus.get(bookId) || false;
      },

      refreshBookStatus: async (bookId) => {
        try {
          const inWishlist = await wishlistService.checkInWishlist(bookId);
          const bookStatus = new Map(get().bookStatus);
          bookStatus.set(bookId, inWishlist);
          set({ bookStatus });
        } catch (error) {
          console.error("Failed to refresh book status:", error);
        }
      },
    }),
    {
      name: "wishlist-storage",
      partialize: (state) => ({
        count: state.count,
        // Don't persist items or bookStatus, fetch fresh each session
      }),
    },
  ),
);

// Initialize wishlist on auth change
useAuthStore.subscribe((state) => {
  if (state.isAuthenticated) {
    useWishlistStore.getState().fetchWishlist();
  } else {
    useWishlistStore.getState().items = [];
    useWishlistStore.getState().count = 0;
    useWishlistStore.getState().bookStatus.clear();
  }
});
