import { apiClient } from "./client";
import type { Book, Review, ReviewStats } from "../../types";

export interface BookFilters {
  query?: string;
  categories?: string[];
  authors?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  language?: string[];
  format?: string[];
  inStock?: boolean;
  sortBy?: "price_asc" | "price_desc" | "rating" | "newest" | "popularity";
  page?: number;
  limit?: number;
}

export interface CreateBookRequest {
  title: string;
  authors: string[];
  description: string;
  isbn?: string;
  categories?: string[];
  price: number;
  stock: number;
  publisher?: string;
  publishedDate?: string;
  pageCount?: number;
  language?: string;
  format?: string;
}

export interface UpdateBookRequest extends Partial<CreateBookRequest> {
  id: string;
}

export interface CreateReviewRequest {
  bookId: string;
  rating: number;
  title?: string;
  comment: string;
  anonymous?: boolean;
}

export interface UpdateReviewRequest {
  reviewId: string;
  rating?: number;
  title?: string;
  comment?: string;
}

class BooksAPI {
  private static instance: BooksAPI;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): BooksAPI {
    if (!BooksAPI.instance) {
      BooksAPI.instance = new BooksAPI();
    }
    return BooksAPI.instance;
  }

  // ========== BOOKS ==========

  /**
   * Get books with filters and pagination
   */
  async getBooks(filters: BookFilters = {}): Promise<{
    books: Book[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const cacheKey = this.generateCacheKey(filters);
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      return cached;
    }

    const params = this.buildQueryParams(filters);
    const response = await apiClient.get("/books", { params });

    this.setCache(cacheKey, response);
    return response;
  }

  /**
   * Get book by ID
   */
  async getBookById(id: string): Promise<Book> {
    const cacheKey = `book-${id}`;
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      return cached;
    }

    const book = await apiClient.get(`/books/${id}`);
    this.setCache(cacheKey, book);
    return book;
  }

  /**
   * Get books by ISBN
   */
  async getBookByISBN(isbn: string): Promise<Book> {
    return apiClient.get(`/books/isbn/${isbn}`);
  }

  /**
   * Create new book (admin)
   */
  async createBook(data: CreateBookRequest): Promise<Book> {
    const book = await apiClient.post("/books", data);
    this.clearCache();
    return book;
  }

  /**
   * Update book (admin)
   */
  async updateBook(data: UpdateBookRequest): Promise<Book> {
    const { id, ...updates } = data;
    const book = await apiClient.put(`/books/${id}`, updates);
    this.clearCache();
    return book;
  }

  /**
   * Delete book (admin)
   */
  async deleteBook(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/books/${id}`);
    this.clearCache();
    return response;
  }

  /**
   * Update book stock (admin)
   */
  async updateStock(id: string, stock: number): Promise<Book> {
    const book = await apiClient.patch(`/books/${id}/stock`, { stock });
    this.clearCache();
    return book;
  }

  // ========== SEARCH ==========

  /**
   * Search books
   */
  async searchBooks(
    query: string,
    filters?: Partial<BookFilters>,
  ): Promise<Book[]> {
    const params = { query, ...filters };
    return apiClient.get("/books/search", { params });
  }

  /**
   * Advanced search with multiple fields
   */
  async advancedSearch(criteria: {
    title?: string;
    author?: string;
    isbn?: string;
    publisher?: string;
    year?: number;
  }): Promise<Book[]> {
    return apiClient.post("/books/advanced-search", criteria);
  }

  // ========== CATEGORIES ==========

  /**
   * Get all categories
   */
  async getCategories(): Promise<
    Array<{ id: string; name: string; count: number }>
  > {
    const cached = this.getFromCache("categories");
    if (cached) return cached;

    const categories = await apiClient.get("/books/categories");
    this.setCache("categories", categories);
    return categories;
  }

  /**
   * Get books by category
   */
  async getBooksByCategory(
    category: string,
    filters?: Partial<BookFilters>,
  ): Promise<{
    books: Book[];
    total: number;
  }> {
    const params = { ...filters };
    return apiClient.get(`/books/categories/${category}`, { params });
  }

  // ========== FEATURED & RECOMMENDATIONS ==========

  /**
   * Get featured books
   */
  async getFeaturedBooks(limit: number = 10): Promise<Book[]> {
    const cacheKey = `featured-${limit}`;
    const cached = this.getFromCache(cacheKey);

    if (cached) return cached;

    const books = await apiClient.get("/books/featured", { params: { limit } });
    this.setCache(cacheKey, books);
    return books;
  }

  /**
   * Get new releases
   */
  async getNewReleases(limit: number = 10): Promise<Book[]> {
    const cacheKey = `new-releases-${limit}`;
    const cached = this.getFromCache(cacheKey);

    if (cached) return cached;

    const books = await apiClient.get("/books/new-releases", {
      params: { limit },
    });
    this.setCache(cacheKey, books);
    return books;
  }

  /**
   * Get bestsellers
   */
  async getBestsellers(limit: number = 10): Promise<Book[]> {
    const cacheKey = `bestsellers-${limit}`;
    const cached = this.getFromCache(cacheKey);

    if (cached) return cached;

    const books = await apiClient.get("/books/bestsellers", {
      params: { limit },
    });
    this.setCache(cacheKey, books);
    return books;
  }

  /**
   * Get recommended books for user
   */
  async getRecommendedBooks(limit: number = 10): Promise<Book[]> {
    return apiClient.get("/books/recommended", { params: { limit } });
  }

  /**
   * Get similar books
   */
  async getSimilarBooks(bookId: string, limit: number = 5): Promise<Book[]> {
    const cacheKey = `similar-${bookId}-${limit}`;
    const cached = this.getFromCache(cacheKey);

    if (cached) return cached;

    const books = await apiClient.get(`/books/${bookId}/similar`, {
      params: { limit },
    });
    this.setCache(cacheKey, books);
    return books;
  }

  // ========== REVIEWS ==========

  /**
   * Get reviews for a book
   */
  async getReviews(
    bookId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    reviews: Review[];
    stats: ReviewStats;
    total: number;
  }> {
    return apiClient.get(`/books/${bookId}/reviews`, {
      params: { page, limit },
    });
  }

  /**
   * Create review
   */
  async createReview(data: CreateReviewRequest): Promise<Review> {
    const review = await apiClient.post(`/books/${data.bookId}/reviews`, data);
    this.clearCache();
    return review;
  }

  /**
   * Update review
   */
  async updateReview(data: UpdateReviewRequest): Promise<Review> {
    const review = await apiClient.put(`/reviews/${data.reviewId}`, data);
    this.clearCache();
    return review;
  }

  /**
   * Delete review
   */
  async deleteReview(reviewId: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/reviews/${reviewId}`);
    this.clearCache();
    return response;
  }

  /**
   * Mark review as helpful
   */
  async markReviewHelpful(reviewId: string): Promise<{ helpful: number }> {
    return apiClient.post(`/reviews/${reviewId}/helpful`);
  }

  /**
   * Report review
   */
  async reportReview(
    reviewId: string,
    reason: string,
  ): Promise<{ message: string }> {
    return apiClient.post(`/reviews/${reviewId}/report`, { reason });
  }

  // ========== HELPER METHODS ==========

  private buildQueryParams(filters: BookFilters): Record<string, any> {
    const params: Record<string, any> = {};

    if (filters.query) params.query = filters.query;
    if (filters.categories?.length)
      params.categories = filters.categories.join(",");
    if (filters.authors?.length) params.authors = filters.authors.join(",");
    if (filters.minPrice !== undefined) params.minPrice = filters.minPrice;
    if (filters.maxPrice !== undefined) params.maxPrice = filters.maxPrice;
    if (filters.minRating !== undefined) params.minRating = filters.minRating;
    if (filters.language?.length) params.language = filters.language.join(",");
    if (filters.format?.length) params.format = filters.format.join(",");
    if (filters.inStock !== undefined) params.inStock = filters.inStock;
    if (filters.sortBy) params.sortBy = filters.sortBy;
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;

    return params;
  }

  private generateCacheKey(filters: BookFilters): string {
    return `books-${JSON.stringify(filters)}`;
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  private clearCache(): void {
    this.cache.clear();
  }
}

export const booksAPI = BooksAPI.getInstance();
