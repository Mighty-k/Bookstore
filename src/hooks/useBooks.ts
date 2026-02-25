import { useState, useEffect, useCallback } from "react";
import { GoogleBooksService } from "../services/googleBooks";
import * as types from "../types";

interface UseBooksOptions {
  initialQuery?: string;
  autoFetch?: boolean;
}

export const useBooks = (options: UseBooksOptions = {}) => {
  const { initialQuery = "", autoFetch = true } = options;

  const [books, setBooks] = useState<types.Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<types.FilterOptions>({
    categories: [],
    priceRange: [0, 100],
    minRating: 0,
    sortBy: "newest",
  });

  const fetchBooks = useCallback(
    async (reset = false) => {
      setLoading(true);
      setError(null);

      try {
        const currentPage = reset ? 0 : page;
        const fetchedBooks = query
          ? await GoogleBooksService.searchBooks(query, currentPage * 20)
          : await GoogleBooksService.searchBooks(
              "popular books",
              currentPage * 20,
            );

        // Apply filters
        let filteredBooks = fetchedBooks;

        if (filters.categories.length > 0) {
          filteredBooks = filteredBooks.filter((book) =>
            book.categories?.some((cat) =>
              filters.categories.includes(cat.toLowerCase()),
            ),
          );
        }

        filteredBooks = filteredBooks.filter(
          (book) =>
            book.price >= filters.priceRange[0] &&
            book.price <= filters.priceRange[1],
        );

        if (filters.minRating > 0) {
          filteredBooks = filteredBooks.filter(
            (book) => book.rating >= filters.minRating,
          );
        }

        // Sort
        filteredBooks.sort((a, b) => {
          switch (filters.sortBy) {
            case "price_asc":
              return a.price - b.price;
            case "price_desc":
              return b.price - a.price;
            case "rating":
              return b.rating - a.rating;
            default:
              return 0;
          }
        });

        setHasMore(filteredBooks.length === 20);

        if (reset) {
          setBooks(filteredBooks);
          setPage(1);
        } else {
          setBooks((prev) => [...prev, ...filteredBooks]);
          setPage((prev) => prev + 1);
        }
      } catch (err) {
        setError("Failed to fetch books. Please try again.");
        console.error("Error fetching books:", err);
      } finally {
        setLoading(false);
      }
    },
    [query, filters, page],
  );

  useEffect(() => {
    if (autoFetch) {
      fetchBooks(true);
    }
  }, [query, filters, autoFetch]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchBooks(false);
    }
  }, [loading, hasMore, fetchBooks]);

  const search = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  const updateFilters = useCallback(
    (newFilters: Partial<types.FilterOptions>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
    },
    [],
  );

  const clearFilters = useCallback(() => {
    setFilters({
      categories: [],
      priceRange: [0, 100],
      minRating: 0,
      sortBy: "newest",
    });
    setQuery("");
  }, []);

  return {
    books,
    loading,
    error,
    hasMore,
    query,
    filters,
    search,
    updateFilters,
    clearFilters,
    loadMore,
    refetch: () => fetchBooks(true),
  };
};
