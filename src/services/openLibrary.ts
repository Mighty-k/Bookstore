import axios from "axios";
import type { Book } from "../types";

const OPEN_LIBRARY_API = "https://openlibrary.org";
const COVERS_API = "https://covers.openlibrary.org/b";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Rate limiting: 100 requests per 5 minutes for non-OLID/ID keys
const RATE_LIMIT = 100;
const RATE_WINDOW = 5 * 60 * 1000; // 5 minutes
let requestCount = 0;
let windowStart = Date.now();

interface OpenLibraryBook {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  isbn?: string[];
  cover_i?: number;
  cover_edition_key?: string;
  subject?: string[];
  language?: string[];
  publisher?: string[];
  number_of_pages_median?: number;
  ratings_average?: number;
  ratings_count?: number;
  oclc?: string[];
  lccn?: string[];
  ia?: string[];
}

interface CacheEntry {
  data: any;
  timestamp: number;
}

export class OpenLibraryService {
  private static cache: Map<string, CacheEntry> = new Map();

  private static checkRateLimit(): void {
    const now = Date.now();
    if (now - windowStart > RATE_WINDOW) {
      // Reset window
      requestCount = 0;
      windowStart = now;
    }

    requestCount++;
    if (requestCount > RATE_LIMIT) {
      console.warn(
        "⚠️ Rate limit approaching, consider using CoverID or OLID keys",
      );
    }
  }

  private static getCacheKey(
    type: string,
    query: string,
    page: number = 0,
  ): string {
    return `${type}-${query}-${page}`;
  }

  private static getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log("📚 Cache hit for:", key);
      return cached.data;
    }
    return null;
  }

  private static setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Get cover URL using the official Open Library Covers API
   * Supports: ISBN, OCLC, LCCN, OLID, ID (cover ID)
   * Sizes: S (small), M (medium), L (large)
   */
  static getCoverUrl(
    idType: "isbn" | "oclc" | "lccn" | "olid" | "id",
    idValue: string | number,
    size: "S" | "M" | "L" = "L",
    return404: boolean = false,
  ): string {
    this.checkRateLimit();

    // Ensure idType is lowercase as per API docs
    const type = idType.toLowerCase();
    const value = idValue.toString();
    const sizeParam = size.toUpperCase();

    // Build the URL
    let url = `${COVERS_API}/${type}/${value}-${sizeParam}.jpg`;

    // Optionally return 404 instead of blank image
    if (return404) {
      url += "?default=false";
    }

    return url;
  }

  /**
   * Get cover info as JSON
   */
  static async getCoverInfo(
    idType: "isbn" | "oclc" | "lccn" | "olid" | "id",
    idValue: string | number,
  ): Promise<any> {
    this.checkRateLimit();

    try {
      const response = await axios.get(
        `${COVERS_API}/${idType.toLowerCase()}/${idValue}.json`,
        { timeout: 5000 },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching cover info:", error);
      return null;
    }
  }

  /**
   * Preload image to get dimensions without making two requests
   */
  static async preloadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  private static extractDescription(desc?: string | { value: string }): string {
    if (!desc) return "No description available.";
    if (typeof desc === "string") return desc;
    return desc.value || "No description available.";
  }

  private static mapOpenLibraryBook(book: OpenLibraryBook): Book {
    const id = book.key.replace("/works/", "").replace("/books/", "");

    // Try multiple cover sources in order of preference
    let coverImage = "";

    if (book.cover_i) {
      // Use Cover ID (best, no rate limiting)
      coverImage = this.getCoverUrl("id", book.cover_i, "L");
    } else if (book.cover_edition_key) {
      // Use OLID (also no rate limiting)
      coverImage = this.getCoverUrl("olid", book.cover_edition_key, "L");
    } else if (book.isbn && book.isbn[0]) {
      // Use ISBN (rate limited)
      coverImage = this.getCoverUrl("isbn", book.isbn[0], "L");
    } else if (book.oclc && book.oclc[0]) {
      // Use OCLC (rate limited)
      coverImage = this.getCoverUrl("oclc", book.oclc[0], "L");
    } else if (book.lccn && book.lccn[0]) {
      // Use LCCN (rate limited)
      coverImage = this.getCoverUrl("lccn", book.lccn[0], "L");
    } else {
      // Fallback to placeholder
      const colors = ["2ecc71", "3498db", "9b59b6", "e74c3c", "f39c12"];
      const colorIndex =
        id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
        colors.length;
      coverImage = `https://via.placeholder.com/300x450/${colors[colorIndex]}/ffffff?text=${encodeURIComponent(book.title.substring(0, 20))}`;
    }

    return {
      id,
      title: book.title || "Unknown Title",
      authors: book.author_name || ["Unknown Author"],
      description: "Loading description...",
      isbn: book.isbn?.[0],
      oclc: book.oclc?.[0],
      lccn: book.lccn?.[0],
      categories: book.subject?.slice(0, 5) || ["General"],
      price: 14.99 + Math.random() * 20,
      coverImage,
      rating: book.ratings_average || 4.0,
      reviews: [],
      stock: Math.floor(Math.random() * 50) + 10,
      publishedDate: book.first_publish_year?.toString(),
      pageCount: book.number_of_pages_median,
      publisher: book.publisher?.[0],
      language: book.language?.[0],
    };
  }

  // Search books
  static async searchBooks(
    query: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ books: Book[]; total: number }> {
    const cacheKey = this.getCacheKey("search", query, page);
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      console.log("📚 Searching Open Library:", query);

      const response = await axios.get(`${OPEN_LIBRARY_API}/search.json`, {
        params: {
          q: query,
          page,
          limit,
          fields:
            "key,title,author_name,first_publish_year,isbn,cover_i,cover_edition_key,subject,language,publisher,number_of_pages_median,ratings_average,ratings_count,oclc,lccn,ia",
        },
        timeout: 5000,
      });

      const books = response.data.docs.map((book: OpenLibraryBook) =>
        this.mapOpenLibraryBook(book),
      );

      const result = {
        books,
        total: response.data.numFound || 0,
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error("📚 Error searching books:", error);

      // Return mock data on error
      const mockBooks = this.generateMockBooks(query, limit);
      const result = {
        books: mockBooks,
        total: mockBooks.length,
      };
      this.setCache(cacheKey, result);
      return result;
    }
  }

  // Get book details by ID
  static async getBookById(id: string): Promise<Book | null> {
    const cacheKey = this.getCacheKey("book", id);
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      return cached;
    }

    if (id.startsWith("mock-")) {
      const mockBook = this.generateMockBooks("single", 1)[0];
      mockBook.id = id;
      this.setCache(cacheKey, mockBook);
      return mockBook;
    }

    try {
      console.log("📚 Fetching book details:", id);

      let bookData: any = null;
      let description = "No description available.";
      let coverImage = "";

      // Try works endpoint first
      try {
        const worksResponse = await axios.get(
          `${OPEN_LIBRARY_API}/works/${id}.json`,
        );
        bookData = worksResponse.data;
        description = this.extractDescription(bookData.description);

        // Get cover from works data using Cover ID
        if (bookData.covers && bookData.covers.length > 0) {
          coverImage = this.getCoverUrl("id", bookData.covers[0], "L");
        }
      } catch {
        // If works fails, try editions
        const editionsResponse = await axios.get(
          `${OPEN_LIBRARY_API}/works/${id}/editions.json`,
          {
            params: { limit: 1 },
          },
        );

        if (editionsResponse.data.entries?.length > 0) {
          const edition = editionsResponse.data.entries[0];
          bookData = edition;

          if (edition.description) {
            description = this.extractDescription(edition.description);
          }

          // Try multiple cover sources in order
          if (edition.covers && edition.covers.length > 0) {
            coverImage = this.getCoverUrl("id", edition.covers[0], "L");
          } else if (edition.isbn_13?.[0]) {
            coverImage = this.getCoverUrl("isbn", edition.isbn_13[0], "L");
          } else if (edition.isbn_10?.[0]) {
            coverImage = this.getCoverUrl("isbn", edition.isbn_10[0], "L");
          } else if (edition.oclc?.[0]) {
            coverImage = this.getCoverUrl("oclc", edition.oclc[0], "L");
          } else if (edition.lccn?.[0]) {
            coverImage = this.getCoverUrl("lccn", edition.lccn[0], "L");
          }
        }
      }

      // If we still don't have book data, try search
      if (!bookData) {
        const searchResponse = await axios.get(
          `${OPEN_LIBRARY_API}/search.json`,
          {
            params: {
              q: `key:${id}`,
              limit: 1,
            },
          },
        );

        if (searchResponse.data.docs?.length > 0) {
          const basicBook = searchResponse.data.docs[0];
          const mapped = this.mapOpenLibraryBook(basicBook);
          return mapped;
        }
        return null;
      }

      // If no cover found, use placeholder
      if (!coverImage) {
        const colors = ["2ecc71", "3498db", "9b59b6", "e74c3c", "f39c12"];
        const colorIndex =
          id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
          colors.length;
        coverImage = `https://via.placeholder.com/300x450/${colors[colorIndex]}/ffffff?text=${encodeURIComponent(bookData.title?.substring(0, 20) || "Book")}`;
      }

      const book: Book = {
        id,
        title: bookData.title || "Unknown Title",
        authors: bookData.authors?.map((a: any) => a.name || a.author?.key) || [
          "Unknown Author",
        ],
        description,
        isbn: bookData.isbn_13?.[0] || bookData.isbn_10?.[0],
        oclc: bookData.oclc?.[0],
        lccn: bookData.lccn?.[0],
        categories: bookData.subjects?.slice(0, 5) || ["General"],
        price: 14.99 + Math.random() * 20,
        coverImage,
        rating: 4.0,
        reviews: [],
        stock: Math.floor(Math.random() * 50) + 10,
        publishedDate: bookData.publish_date || bookData.first_publish_date,
        pageCount: bookData.number_of_pages,
        publisher: bookData.publishers?.[0],
        language: bookData.languages?.[0]?.key?.split("/").pop(),
      };

      this.setCache(cacheKey, book);
      return book;
    } catch (error) {
      console.error("📚 Error fetching book:", error);

      const mockBook = this.generateMockBooks("single", 1)[0];
      mockBook.id = id;
      this.setCache(cacheKey, mockBook);
      return mockBook;
    }
  }

  // Get books by subject/category
  static async getBooksBySubject(
    subject: string,
    limit: number = 20,
    page: number = 1,
  ): Promise<Book[]> {
    const cacheKey = this.getCacheKey("subject", subject, page);
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      console.log("📚 Fetching subject:", subject);

      const response = await axios.get(
        `${OPEN_LIBRARY_API}/subjects/${subject}.json`,
        {
          params: {
            limit,
            offset: (page - 1) * limit,
          },
          timeout: 5000,
        },
      );

      const books = await Promise.all(
        response.data.works.map(async (work: any) => {
          let coverImage = "";

          if (work.cover_id) {
            coverImage = this.getCoverUrl("id", work.cover_id, "L");
          } else if (work.cover_edition_key) {
            coverImage = this.getCoverUrl("olid", work.cover_edition_key, "L");
          } else if (work.isbn && work.isbn.length > 0) {
            coverImage = this.getCoverUrl("isbn", work.isbn[0], "L");
          } else {
            // Generate placeholder
            const colors = ["2ecc71", "3498db", "9b59b6", "e74c3c", "f39c12"];
            const colorIndex =
              work.key
                .split("")
                .reduce(
                  (acc: number, char: string) => acc + char.charCodeAt(0),
                  0,
                ) % colors.length;
            coverImage = `https://via.placeholder.com/300x450/${colors[colorIndex]}/ffffff?text=${encodeURIComponent(work.title.substring(0, 20))}`;
          }

          return {
            id: work.key.replace("/works/", ""),
            title: work.title,
            authors: work.authors?.map((a: any) => a.name) || [
              "Unknown Author",
            ],
            description: "Loading description...",
            categories: [subject, ...(work.subject || [])].slice(0, 5),
            price: 14.99 + Math.random() * 20,
            coverImage,
            rating: 4.0,
            reviews: [],
            stock: Math.floor(Math.random() * 50) + 10,
            publishedDate: work.first_publish_year?.toString(),
            pageCount: work.number_of_pages_median,
          } as Book;
        }),
      );

      this.setCache(cacheKey, books);
      return books;
    } catch (error) {
      console.error("📚 Error fetching subject:", error);
      const mockBooks = this.generateMockBooks(subject, limit);
      this.setCache(cacheKey, mockBooks);
      return mockBooks;
    }
  }

  // Get trending books
  static async getTrendingBooks(limit: number = 10): Promise<Book[]> {
    return this.searchBooks("trending", 1, limit).then((r) => r.books);
  }

  // Get new releases
  static async getNewReleases(limit: number = 10): Promise<Book[]> {
    return this.searchBooks("new+releases", 1, limit).then((r) => r.books);
  }

  // Get books by ISBN
  static async getBookByISBN(isbn: string): Promise<Book | null> {
    try {
      const response = await axios.get(`${OPEN_LIBRARY_API}/isbn/${isbn}.json`);
      const book = response.data;

      // Get cover using ISBN (preferred method for ISBN lookups)
      const coverImage = this.getCoverUrl("isbn", isbn, "L");

      return {
        id: book.key?.replace("/books/", "") || isbn,
        title: book.title,
        authors: book.authors?.map((a: any) => a.name) || ["Unknown Author"],
        description: book.description || "No description available.",
        isbn: isbn,
        oclc: book.oclc?.[0],
        lccn: book.lccn?.[0],
        categories: book.subjects?.slice(0, 5) || ["General"],
        price: 14.99 + Math.random() * 20,
        coverImage,
        rating: 4.0,
        reviews: [],
        stock: Math.floor(Math.random() * 50) + 10,
        publishedDate: book.publish_date,
        pageCount: book.number_of_pages,
        publisher: book.publishers?.[0],
      };
    } catch (error) {
      console.error("Error fetching book by ISBN:", error);
      return null;
    }
  }

  // Get cover info as JSON
  static async getCoverInfoForBook(
    idType: "isbn" | "oclc" | "lccn" | "olid" | "id",
    idValue: string | number,
  ): Promise<any> {
    return this.getCoverInfo(idType, idValue);
  }

  // Preload and get image dimensions
  static async getImageDimensions(
    url: string,
  ): Promise<{ width: number; height: number }> {
    try {
      const img = await this.preloadImage(url);
      return { width: img.width, height: img.height };
    } catch (error) {
      console.error("Failed to load image:", error);
      return { width: 0, height: 0 };
    }
  }

  private static generateMockBooks(query: string, count: number = 8): Book[] {
    console.log("📚 Generating mock books for:", query);

    const mockBooks: Book[] = [];
    const categories = [
      "Fiction",
      "Non-Fiction",
      "Science",
      "History",
      "Technology",
      "Romance",
      "Mystery",
      "Fantasy",
    ];
    const authors = [
      "John Smith",
      "Jane Doe",
      "Robert Johnson",
      "Mary Williams",
      "David Brown",
      "Sarah Davis",
      "Michael Wilson",
      "Emily Taylor",
    ];
    const titles = [
      "The Great Adventure",
      "Mystery of the Ages",
      "Science and Future",
      "History Uncovered",
      "Technology Today",
      "The Art of Reading",
      "World of Books",
      "Digital Revolution",
      "The Last Kingdom",
      "Echoes of Tomorrow",
      "Whispers in the Wind",
      "Shadows of the Past",
    ];

    const colors = [
      "2ecc71",
      "3498db",
      "9b59b6",
      "e74c3c",
      "f39c12",
      "1abc9c",
      "e67e22",
      "95a5a6",
    ];

    for (let i = 0; i < count; i++) {
      const color = colors[i % colors.length];
      mockBooks.push({
        id: `mock-${query}-${i}-${Date.now()}`,
        title:
          titles[Math.floor(Math.random() * titles.length)] +
          (i > 3 ? ` Vol. ${i}` : ""),
        authors: [authors[Math.floor(Math.random() * authors.length)]],
        description:
          "This is a sample book description. The actual content is temporarily unavailable.",
        categories: [categories[Math.floor(Math.random() * categories.length)]],
        price: 14.99 + i * 2,
        originalPrice: i % 3 === 0 ? 24.99 : undefined,
        coverImage: `https://via.placeholder.com/300x450/${color}/ffffff?text=Book+${i + 1}`,
        rating: 3.5 + Math.random() * 1.5,
        reviews: [],
        stock: Math.floor(Math.random() * 50) + 10,
        publishedDate: (2024 - i).toString(),
        pageCount: 300 + i * 50,
        publisher: "Open Library Publishing",
        language: "English",
      });
    }

    return mockBooks;
  }

  // Clear cache
  static clearCache(): void {
    this.cache.clear();
    console.log("📚 Cache cleared");
  }
}
