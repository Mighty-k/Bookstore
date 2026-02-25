import axios from "axios";
import type { Book } from "../types";

const GOOGLE_BOOKS_API = "https://www.googleapis.com/books/v1";

interface GoogleBookItem {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    categories?: string[];
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
    averageRating?: number;
    ratingsCount?: number;
    publishedDate?: string;
    pageCount?: number;
  };
  saleInfo: {
    retailPrice?: {
      amount: number;
      currencyCode: string;
    };
    listPrice?: {
      amount: number;
      currencyCode: string;
    };
  };
}

export class GoogleBooksService {
  private static generatePrice(isbn?: string): number {
    // Fallback pricing logic
    return isbn
      ? 9.99 + (parseInt(isbn.slice(-2)) % 50) // Generate price based on ISBN
      : 12.99; // Default price
  }

  static async searchBooks(
    query: string,
    startIndex: number = 0,
    maxResults: number = 20,
  ): Promise<Book[]> {
    try {
      const response = await axios.get(`${GOOGLE_BOOKS_API}/volumes`, {
        params: {
          q: query,
          startIndex,
          maxResults,
          projection: "lite",
        },
      });

      return (
        response.data.items?.map((item: GoogleBookItem) => {
          const isbn = item.volumeInfo.industryIdentifiers?.find(
            (id) => id.type === "ISBN_13",
          )?.identifier;

          return {
            id: item.id,
            title: item.volumeInfo.title,
            authors: item.volumeInfo.authors || ["Unknown Author"],
            description:
              item.volumeInfo.description || "No description available.",
            isbn,
            categories: item.volumeInfo.categories || ["General"],
            price:
              item.saleInfo?.retailPrice?.amount ||
              item.saleInfo?.listPrice?.amount ||
              this.generatePrice(isbn),
            coverImage:
              item.volumeInfo.imageLinks?.thumbnail?.replace(
                "http://",
                "https://",
              ) ||
              item.volumeInfo.imageLinks?.smallThumbnail?.replace(
                "http://",
                "https://",
              ) ||
              "/placeholder-book.jpg",
            rating: item.volumeInfo.averageRating || 4.0,
            reviews: [],
            stock: Math.floor(Math.random() * 50) + 10, // Simulated stock
            publishedDate: item.volumeInfo.publishedDate,
            pageCount: item.volumeInfo.pageCount,
          };
        }) || []
      );
    } catch (error) {
      console.error("Error fetching books:", error);
      return [];
    }
  }

  static async getBookById(id: string): Promise<Book | null> {
    try {
      const response = await axios.get(`${GOOGLE_BOOKS_API}/volumes/${id}`);
      const item: GoogleBookItem = response.data;

      const isbn = item.volumeInfo.industryIdentifiers?.find(
        (id) => id.type === "ISBN_13",
      )?.identifier;

      return {
        id: item.id,
        title: item.volumeInfo.title,
        authors: item.volumeInfo.authors || ["Unknown Author"],
        description: item.volumeInfo.description || "No description available.",
        isbn,
        categories: item.volumeInfo.categories || ["General"],
        price:
          item.saleInfo?.retailPrice?.amount ||
          item.saleInfo?.listPrice?.amount ||
          this.generatePrice(isbn),
        coverImage:
          item.volumeInfo.imageLinks?.thumbnail?.replace(
            "http://",
            "https://",
          ) ||
          item.volumeInfo.imageLinks?.smallThumbnail?.replace(
            "http://",
            "https://",
          ) ||
          "/placeholder-book.jpg",
        rating: item.volumeInfo.averageRating || 4.0,
        reviews: [],
        stock: Math.floor(Math.random() * 50) + 10,
        publishedDate: item.volumeInfo.publishedDate,
        pageCount: item.volumeInfo.pageCount,
      };
    } catch (error) {
      console.error("Error fetching book:", error);
      return null;
    }
  }

  static async getBooksByCategory(
    category: string,
    maxResults: number = 20,
  ): Promise<Book[]> {
    return this.searchBooks(`subject:${category}`, 0, maxResults);
  }

  static async getFeaturedBooks(): Promise<Book[]> {
    return this.searchBooks("bestseller", 0, 10);
  }
}
