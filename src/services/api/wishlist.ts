import axios from "axios";
import { useAuthStore } from "../../store/authStore";

const API_URL = import.meta.env.VITE_API_URL;

export interface WishlistItem {
  bookId: string;
  title: string;
  addedAt: string;
}

class WishlistService {
  private getAuthHeader() {
    const token = useAuthStore.getState().token;
    return {
      headers: { Authorization: `Bearer ${token}` },
    };
  }

  // GET /api/user/wishlist - Get all wishlist items
  async getWishlist(): Promise<WishlistItem[]> {
    try {
      const response = await axios.get(
        `${API_URL}/user/wishlist`,
        this.getAuthHeader(),
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
      throw error;
    }
  }

  // GET /api/user/wishlist/count - Get wishlist count
  async getWishlistCount(): Promise<number> {
    try {
      const response = await axios.get(
        `${API_URL}/user/wishlist/count`,
        this.getAuthHeader(),
      );
      return response.data.data.count;
    } catch (error) {
      console.error("Failed to fetch wishlist count:", error);
      return 0;
    }
  }

  // POST /api/user/wishlist - Add item to wishlist
  async addToWishlist(bookId: string, title: string): Promise<WishlistItem[]> {
    try {
      const response = await axios.post(
        `${API_URL}/user/wishlist`,
        { bookId, title },
        this.getAuthHeader(),
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to add to wishlist:", error);
      throw error;
    }
  }

  // DELETE /api/user/wishlist/:bookId - Remove item from wishlist
  async removeFromWishlist(bookId: string): Promise<WishlistItem[]> {
    try {
      const response = await axios.delete(
        `${API_URL}/user/wishlist/${bookId}`,
        this.getAuthHeader(),
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
      throw error;
    }
  }

  // POST /api/user/wishlist/:bookId/move-to-cart - Move item to cart
  async moveToCart(
    bookId: string,
    price?: number,
    coverImage?: string,
  ): Promise<any> {
    try {
      const response = await axios.post(
        `${API_URL}/user/wishlist/${bookId}/move-to-cart`,
        { price, coverImage },
        this.getAuthHeader(),
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to move item to cart:", error);
      throw error;
    }
  }

  // DELETE /api/user/wishlist - Clear entire wishlist
  async clearWishlist(): Promise<void> {
    try {
      await axios.delete(`${API_URL}/user/wishlist`, this.getAuthHeader());
    } catch (error) {
      console.error("Failed to clear wishlist:", error);
      throw error;
    }
  }

  // Check if a book is in wishlist
  async checkInWishlist(bookId: string): Promise<boolean> {
    try {
      const wishlist = await this.getWishlist();
      return wishlist.some((item) => item.bookId === bookId);
    } catch (error) {
      return false;
    }
  }
}

export const wishlistService = new WishlistService();
