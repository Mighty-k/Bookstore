import { create } from "zustand";
//
import { immer } from "zustand/middleware/immer";
import type { Book, FilterOptions, Review, ReviewStats } from "../types";
import { booksAPI, type BookFilters } from "../services/api/books";
import toast from "react-hot-toast";

// Types
interface BooksState {
  // State
  books: Book[];
  featuredBooks: Book[];
  newReleases: Book[];
  bestsellers: Book[];
  recommendedBooks: Book[];
  currentBook: Book | null;
  categories: Array<{ id: string; name: string; count: number }>;
  filters: FilterOptions;
  searchQuery: string;
  totalBooks: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  recentlyViewed: Book[];
  wishlist: string[];

  // Review state
  currentReviews: Review[];
  reviewStats: ReviewStats | null;
  isLoadingReviews: boolean;

  // Cache
  cache: Map<string, { data: any; timestamp: number }>;
  cacheDuration: number;

  // Actions
  // Fetch actions
  fetchBooks: (
    filters?: Partial<FilterOptions>,
    page?: number,
  ) => Promise<void>;
  fetchBookById: (id: string, forceRefresh?: boolean) => Promise<Book | null>;
  fetchFeaturedBooks: () => Promise<void>;
  fetchNewReleases: () => Promise<void>;
  fetchBestsellers: () => Promise<void>;
  fetchRecommendedBooks: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  searchBooks: (
    query: string,
    filters?: Partial<FilterOptions>,
  ) => Promise<void>;

  // Filter actions
  setFilters: (filters: Partial<FilterOptions>) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;

  // Recently viewed
  addToRecentlyViewed: (book: Book) => void;
  clearRecentlyViewed: () => void;

  // Wishlist actions
  addToWishlist: (bookId: string) => Promise<void>;
  removeFromWishlist: (bookId: string) => Promise<void>;
  toggleWishlist: (bookId: string) => Promise<void>;
  isInWishlist: (bookId: string) => boolean;

  // Admin actions
  createBook: (bookData: any) => Promise<void>;
  updateBook: (id: string, bookData: any) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  updateStock: (id: string, stock: number) => Promise<void>;

  // Review actions
  fetchReviews: (bookId: string, page?: number) => Promise<void>;
  createReview: (
    bookId: string,
    rating: number,
    comment: string,
    title?: string,
  ) => Promise<void>;
  updateReview: (reviewId: string, data: Partial<Review>) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  markReviewHelpful: (reviewId: string) => Promise<void>;

  // Cache management
  clearCache: () => void;
  invalidateCache: (pattern?: string) => void;

  // Utility
  clearError: () => void;
  reset: () => void;
}

// Initial filter state
const initialFilters: FilterOptions = {
  categories: [],
  priceRange: [0, 1000],
  minRating: 0,
  sortBy: "newest",
  availability: "all",
  format: [],
  language: [],
};

// Create store with immer
export const useBookStore = create<BooksState>()(
  immer((set, get) => ({
    // Initial state
    books: [],
    featuredBooks: [],
    newReleases: [],
    bestsellers: [],
    recommendedBooks: [],
    currentBook: null,
    categories: [],
    filters: initialFilters,
    searchQuery: "",
    totalBooks: 0,
    currentPage: 1,
    totalPages: 1,
    isLoading: false,
    isSearching: false,
    error: null,
    recentlyViewed: [],
    wishlist: [],
    currentReviews: [],
    reviewStats: null,
    isLoadingReviews: false,
    cache: new Map(),
    cacheDuration: 5 * 60 * 1000, // 5 minutes

    // Fetch books with filters
    fetchBooks: async (filters = {}, page = 1) => {
      const state = get();
      const currentFilters = { ...state.filters, ...filters };

      set({ isLoading: true, error: null });

      try {
        const cacheKey = `books-${JSON.stringify({ ...currentFilters, page })}`;
        const cached = state.cache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < state.cacheDuration) {
          const { books, total, totalPages } = cached.data;
          set({
            books,
            totalBooks: total,
            totalPages,
            currentPage: page,
            isLoading: false,
          });
          return;
        }

        const apiFilters: BookFilters = {
          categories: currentFilters.categories,
          minPrice: currentFilters.priceRange[0],
          maxPrice: currentFilters.priceRange[1],
          minRating: currentFilters.minRating,
          sortBy: currentFilters.sortBy,
          page,
          limit: 20,
        };

        if (currentFilters.availability === "inStock") {
          apiFilters.inStock = true;
        }

        if (currentFilters.format && currentFilters.format.length > 0) {
          apiFilters.format = currentFilters.format;
        }

        if (currentFilters.language && currentFilters.language.length > 0) {
          apiFilters.language = currentFilters.language;
        }

        const response = await booksAPI.getBooks(apiFilters);

        // Update cache
        set((state) => {
          state.cache.set(cacheKey, {
            data: response,
            timestamp: Date.now(),
          });
        });

        set({
          books: response.books,
          totalBooks: response.total,
          totalPages: response.totalPages,
          currentPage: response.page,
          isLoading: false,
        });
      } catch (error: any) {
        set({
          error: error.message || "Failed to fetch books",
          isLoading: false,
        });
        toast.error("Failed to load books");
      }
    },

    // Fetch single book
    fetchBookById: async (id, forceRefresh = false) => {
      const state = get();

      // Check cache first
      if (!forceRefresh) {
        const cached = state.cache.get(`book-${id}`);
        if (cached && Date.now() - cached.timestamp < state.cacheDuration) {
          set({ currentBook: cached.data });
          return cached.data;
        }
      }

      set({ isLoading: true, error: null });

      try {
        const book = await booksAPI.getBookById(id);

        // Update cache
        set((state) => {
          state.cache.set(`book-${id}`, {
            data: book,
            timestamp: Date.now(),
          });
        });

        set({ currentBook: book, isLoading: false });

        // Add to recently viewed
        get().addToRecentlyViewed(book);

        return book;
      } catch (error: any) {
        set({
          error: error.message || "Failed to fetch book",
          isLoading: false,
        });
        toast.error("Failed to load book details");
        return null;
      }
    },

    // Fetch featured books
    fetchFeaturedBooks: async () => {
      const state = get();
      const cached = state.cache.get("featured-books");

      if (cached && Date.now() - cached.timestamp < state.cacheDuration) {
        set({ featuredBooks: cached.data });
        return;
      }

      try {
        const books = await booksAPI.getFeaturedBooks(8);

        set((state) => {
          state.cache.set("featured-books", {
            data: books,
            timestamp: Date.now(),
          });
        });

        set({ featuredBooks: books });
      } catch (error) {
        console.error("Failed to fetch featured books:", error);
      }
    },

    // Fetch new releases
    fetchNewReleases: async () => {
      const state = get();
      const cached = state.cache.get("new-releases");

      if (cached && Date.now() - cached.timestamp < state.cacheDuration) {
        set({ newReleases: cached.data });
        return;
      }

      try {
        const books = await booksAPI.getNewReleases(8);

        set((state) => {
          state.cache.set("new-releases", {
            data: books,
            timestamp: Date.now(),
          });
        });

        set({ newReleases: books });
      } catch (error) {
        console.error("Failed to fetch new releases:", error);
      }
    },

    // Fetch bestsellers
    fetchBestsellers: async () => {
      const state = get();
      const cached = state.cache.get("bestsellers");

      if (cached && Date.now() - cached.timestamp < state.cacheDuration) {
        set({ bestsellers: cached.data });
        return;
      }

      try {
        const books = await booksAPI.getBestsellers(8);

        set((state) => {
          state.cache.set("bestsellers", {
            data: books,
            timestamp: Date.now(),
          });
        });

        set({ bestsellers: books });
      } catch (error) {
        console.error("Failed to fetch bestsellers:", error);
      }
    },

    // Fetch recommended books
    fetchRecommendedBooks: async () => {
      try {
        const books = await booksAPI.getRecommendedBooks(8);
        set({ recommendedBooks: books });
      } catch (error) {
        console.error("Failed to fetch recommended books:", error);
      }
    },

    // Fetch categories
    fetchCategories: async () => {
      const state = get();
      const cached = state.cache.get("categories");

      if (cached && Date.now() - cached.timestamp < state.cacheDuration) {
        set({ categories: cached.data });
        return;
      }

      try {
        const categories = await booksAPI.getCategories();

        set((state) => {
          state.cache.set("categories", {
            data: categories,
            timestamp: Date.now(),
          });
        });

        set({ categories });
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    },

    // Search books
    searchBooks: async (query, filters = {}) => {
      set({ isSearching: true, error: null, searchQuery: query });

      try {
        const apiFilters: BookFilters = {
          query,
          page: 1,
          limit: 20,
        };

        if (filters.categories) apiFilters.categories = filters.categories;
        if (filters.minRating) apiFilters.minRating = filters.minRating;
        if (filters.sortBy) apiFilters.sortBy = filters.sortBy;

        const response = await booksAPI.searchBooks(query, apiFilters);

        set({
          books: response as any,
          totalBooks: (response as any).length,
          isSearching: false,
        });
      } catch (error: any) {
        set({
          error: error.message || "Search failed",
          isSearching: false,
        });
        toast.error("Search failed");
      }
    },

    // Set filters
    setFilters: (filters) => {
      set((state) => {
        state.filters = { ...state.filters, ...filters };
      });
      get().fetchBooks({}, 1);
    },

    // Set search query
    setSearchQuery: (query) => {
      set({ searchQuery: query });
    },

    // Clear filters
    clearFilters: () => {
      set({ filters: initialFilters, searchQuery: "" });
      get().fetchBooks({}, 1);
    },

    // Add to recently viewed
    addToRecentlyViewed: (book) => {
      set((state) => {
        // Remove if already exists
        const filtered = state.recentlyViewed.filter((b) => b.id !== book.id);
        // Add to beginning and limit to 10
        state.recentlyViewed = [book, ...filtered].slice(0, 10);
      });

      // Persist to localStorage
      localStorage.setItem(
        "recentlyViewed",
        JSON.stringify(get().recentlyViewed),
      );
    },

    // Clear recently viewed
    clearRecentlyViewed: () => {
      set({ recentlyViewed: [] });
      localStorage.removeItem("recentlyViewed");
    },

    // Add to wishlist
    addToWishlist: async (bookId) => {
      try {
        // API call would go here
        set((state) => {
          if (!state.wishlist.includes(bookId)) {
            state.wishlist.push(bookId);
          }
        });
        toast.success("Added to wishlist");
      } catch (error) {
        toast.error("Failed to add to wishlist");
      }
    },

    // Remove from wishlist
    removeFromWishlist: async (bookId) => {
      try {
        set((state) => {
          state.wishlist = state.wishlist.filter((id) => id !== bookId);
        });
        toast.success("Removed from wishlist");
      } catch (error) {
        toast.error("Failed to remove from wishlist");
      }
    },

    // Toggle wishlist
    toggleWishlist: async (bookId) => {
      const { isInWishlist } = get();
      if (isInWishlist(bookId)) {
        await get().removeFromWishlist(bookId);
      } else {
        await get().addToWishlist(bookId);
      }
    },

    // Check if in wishlist
    isInWishlist: (bookId) => {
      return get().wishlist.includes(bookId);
    },

    // Create book (admin)
    createBook: async (bookData) => {
      set({ isLoading: true, error: null });

      try {
        await booksAPI.createBook(bookData);
        get().invalidateCache();
        toast.success("Book created successfully");
      } catch (error: any) {
        set({ error: error.message });
        toast.error("Failed to create book");
      } finally {
        set({ isLoading: false });
      }
    },

    // Update book (admin)
    updateBook: async (id, bookData) => {
      set({ isLoading: true, error: null });

      try {
        await booksAPI.updateBook({ id, ...bookData });
        get().invalidateCache(`book-${id}`);
        toast.success("Book updated successfully");
      } catch (error: any) {
        set({ error: error.message });
        toast.error("Failed to update book");
      } finally {
        set({ isLoading: false });
      }
    },

    // Delete book (admin)
    deleteBook: async (id) => {
      set({ isLoading: true, error: null });

      try {
        await booksAPI.deleteBook(id);
        get().invalidateCache();
        toast.success("Book deleted successfully");
      } catch (error: any) {
        set({ error: error.message });
        toast.error("Failed to delete book");
      } finally {
        set({ isLoading: false });
      }
    },

    // Update stock (admin)
    updateStock: async (id, stock) => {
      try {
        await booksAPI.updateStock(id, stock);
        get().invalidateCache(`book-${id}`);
        toast.success("Stock updated");
      } catch (error) {
        toast.error("Failed to update stock");
      }
    },

    // Fetch reviews
    fetchReviews: async (bookId, page = 1) => {
      set({ isLoadingReviews: true });

      try {
        const { reviews, stats } = await booksAPI.getReviews(bookId, page);
        set({
          currentReviews: reviews,
          reviewStats: stats,
          isLoadingReviews: false,
        });
      } catch (error) {
        set({ isLoadingReviews: false });
        toast.error("Failed to load reviews");
      }
    },

    // Create review
    createReview: async (bookId, rating, comment, title) => {
      try {
        await booksAPI.createReview({
          bookId,
          rating,
          comment,
          title,
          anonymous: false,
        });

        // Refresh reviews
        await get().fetchReviews(bookId);
        toast.success("Review submitted successfully");
      } catch (error) {
        toast.error("Failed to submit review");
      }
    },

    // Update review
    updateReview: async (reviewId, data) => {
      try {
        await booksAPI.updateReview({ reviewId, ...data });

        // Refresh current book reviews
        const { currentBook } = get();
        if (currentBook) {
          await get().fetchReviews(currentBook.id);
        }

        toast.success("Review updated");
      } catch (error) {
        toast.error("Failed to update review");
      }
    },

    // Delete review
    deleteReview: async (reviewId) => {
      try {
        await booksAPI.deleteReview(reviewId);

        // Refresh current book reviews
        const { currentBook } = get();
        if (currentBook) {
          await get().fetchReviews(currentBook.id);
        }

        toast.success("Review deleted");
      } catch (error) {
        toast.error("Failed to delete review");
      }
    },

    // Mark review as helpful
    markReviewHelpful: async (reviewId) => {
      try {
        await booksAPI.markReviewHelpful(reviewId);

        // Update local state
        set((state) => {
          const review = state.currentReviews.find((r) => r.id === reviewId);
          if (review) {
            review.helpful = (review.helpful || 0) + 1;
          }
        });
      } catch (error) {
        toast.error("Failed to mark as helpful");
      }
    },

    // Clear cache
    clearCache: () => {
      set({ cache: new Map() });
    },

    // Invalidate cache (optionally by pattern)
    invalidateCache: (pattern) => {
      if (pattern) {
        set((state) => {
          const newCache = new Map();
          state.cache.forEach((value, key) => {
            if (!key.includes(pattern)) {
              newCache.set(key, value);
            }
          });
          state.cache = newCache;
        });
      } else {
        set({ cache: new Map() });
      }
    },

    // Clear error
    clearError: () => set({ error: null }),

    // Reset store
    reset: () => {
      set({
        books: [],
        featuredBooks: [],
        newReleases: [],
        bestsellers: [],
        recommendedBooks: [],
        currentBook: null,
        filters: initialFilters,
        searchQuery: "",
        totalBooks: 0,
        currentPage: 1,
        totalPages: 1,
        isLoading: false,
        isSearching: false,
        error: null,
        recentlyViewed: [],
        wishlist: [],
        currentReviews: [],
        reviewStats: null,
        isLoadingReviews: false,
        cache: new Map(),
      });
    },
  })),
);

// Selectors for derived state
export const useBooks = () => {
  const {
    books,
    featuredBooks,
    newReleases,
    bestsellers,
    recommendedBooks,
    currentBook,
    categories,
    filters,
    searchQuery,
    totalBooks,
    currentPage,
    totalPages,
    isLoading,
    isSearching,
    error,
    recentlyViewed,
  } = useBookStore();

  return {
    books,
    featuredBooks,
    newReleases,
    bestsellers,
    recommendedBooks,
    currentBook,
    categories,
    filters,
    searchQuery,
    totalBooks,
    currentPage,
    totalPages,
    isLoading,
    isSearching,
    error,
    recentlyViewed,
    hasMore: currentPage < totalPages,
  };
};

// Initialize store with persisted data
export const initializeBookStore = () => {
  const store = useBookStore.getState();

  // Load recently viewed from localStorage
  const savedRecentlyViewed = localStorage.getItem("recentlyViewed");
  if (savedRecentlyViewed) {
    try {
      store.recentlyViewed = JSON.parse(savedRecentlyViewed);
    } catch (error) {
      console.error("Failed to load recently viewed:", error);
    }
  }

  // Load wishlist from localStorage
  const savedWishlist = localStorage.getItem("wishlist");
  if (savedWishlist) {
    try {
      store.wishlist = JSON.parse(savedWishlist);
    } catch (error) {
      console.error("Failed to load wishlist:", error);
    }
  }

  // Fetch initial data
  store.fetchFeaturedBooks();
  store.fetchNewReleases();
  store.fetchBestsellers();
  store.fetchCategories();
};
