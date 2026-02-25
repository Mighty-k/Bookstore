import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Book } from "../types";
import { OpenLibraryService } from "../services/openLibrary";

interface HomeState {
  // Data
  featuredBooks: Book[];
  newReleases: Book[];
  bestsellers: Book[];

  // Metadata
  lastFetched: number | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchHomeData: (forceRefresh?: boolean) => Promise<void>;
  clearCache: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useHomeStore = create<HomeState>()(
  persist(
    (set, get) => ({
      // Initial state
      featuredBooks: [],
      newReleases: [],
      bestsellers: [],
      lastFetched: null,
      isLoading: false,
      error: null,

      fetchHomeData: async (forceRefresh = false) => {
        const state = get();
        const now = Date.now();

        // Check if cache is still valid
        if (
          !forceRefresh &&
          state.lastFetched &&
          now - state.lastFetched < CACHE_DURATION
        ) {
          console.log("📚 Using cached home data");
          return;
        }

        set({ isLoading: true, error: null });

        try {
          console.log("📚 Fetching fresh home data");

          const [featured, newReleases, bestsellers] = await Promise.all([
            OpenLibraryService.getTrendingBooks(8),
            OpenLibraryService.getNewReleases(8),
            OpenLibraryService.searchBooks("popular", 1, 8).then(
              (r) => r.books,
            ),
          ]);

          set({
            featuredBooks: featured,
            newReleases,
            bestsellers,
            lastFetched: now,
            isLoading: false,
          });
        } catch (error) {
          console.error("Error fetching home data:", error);
          set({
            error: "Failed to load books. Please try again.",
            isLoading: false,
          });
        }
      },

      clearCache: () => {
        set({
          featuredBooks: [],
          newReleases: [],
          bestsellers: [],
          lastFetched: null,
          error: null,
        });
      },
    }),
    {
      name: "home-storage",
      storage: createJSONStorage(() => sessionStorage), // Use sessionStorage (clears when tab closes)
      partialize: (state) => ({
        featuredBooks: state.featuredBooks,
        newReleases: state.newReleases,
        bestsellers: state.bestsellers,
        lastFetched: state.lastFetched,
      }),
    },
  ),
);
