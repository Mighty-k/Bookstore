import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  ShoppingCart,
  Trash2,
  BookOpen,
  ArrowLeft,
  Loader,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import axios from "axios";
import toast from "react-hot-toast";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Rating from "../components/ui/Rating";

const API_URL = import.meta.env.VITE_API_URL;

interface WishlistItem {
  bookId: string;
  title: string;
  addedAt: string;
}

interface BookDetails extends WishlistItem {
  coverImage?: string;
  price?: number;
  rating?: number;
  authors?: string[];
  description?: string;
}

const Wishlist: React.FC = () => {
  const { user, token } = useAuthStore();
  const { addItem } = useCartStore();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [bookDetails, setBookDetails] = useState<Map<string, BookDetails>>(
    new Map(),
  );
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  // Define fetchBookDetailsData first
  const fetchBookDetailsData = useCallback(async (items: WishlistItem[]) => {
    const details = new Map();

    for (const item of items) {
      try {
        const response = await fetch(
          `https://openlibrary.org/search.json?q=${encodeURIComponent(item.title)}&limit=1`,
        );
        const data = await response.json();

        if (data.docs && data.docs.length > 0) {
          const book = data.docs[0];
          details.set(item.bookId, {
            ...item,
            coverImage: book.cover_i
              ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
              : "https://via.placeholder.com/150x200?text=No+Cover",
            price: 14.99 + Math.random() * 20,
            rating: book.ratings_average || 4.0,
            authors: book.author_name,
            description: book.description || "No description available",
          });
        } else {
          // Fallback if no book found
          details.set(item.bookId, {
            ...item,
            coverImage: "https://via.placeholder.com/150x200?text=No+Cover",
            price: 14.99,
            rating: 4.0,
            authors: ["Unknown Author"],
          });
        }
      } catch (error) {
        console.error(`Failed to fetch details for ${item.title}:`, error);
        details.set(item.bookId, {
          ...item,
          coverImage: "https://via.placeholder.com/150x200?text=No+Cover",
          price: 14.99,
          rating: 4.0,
          authors: ["Unknown Author"],
        });
      }
    }

    setBookDetails(details);
  }, []);

  // Define fetchWishlistData
  const fetchWishlistData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/user/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setWishlistItems(response.data.data);
        // Fetch book details for each item
        await fetchBookDetailsData(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to load wishlist"
        : "Failed to load wishlist";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [token, fetchBookDetailsData]);

  // Use useEffect with the defined function
  useEffect(() => {
    if (user) {
      fetchWishlistData();
    }
  }, [user, fetchWishlistData]);

  const handleRemoveFromWishlist = async (bookId: string) => {
    if (!token) return;

    setRemoving(bookId);
    try {
      const response = await axios.delete(
        `${API_URL}/user/wishlist/${bookId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.success) {
        setWishlistItems((prev) =>
          prev.filter((item) => item.bookId !== bookId),
        );
        const { updateWishlistCount } = useAuthStore.getState();

        // Update bookDetails map
        setBookDetails((prev) => {
          const newMap = new Map(prev);
          newMap.delete(bookId);
          return newMap;
        });
        const newCount = wishlistItems.length - 1;
        updateWishlistCount(newCount);
        toast.success("Removed from wishlist");
      }
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to remove item"
        : "Failed to remove item";
      toast.error(errorMessage);
    } finally {
      setRemoving(null);
    }
  };

  const handleAddToCart = (item: BookDetails) => {
    if (!item.price) return;

    addItem({
      bookId: item.bookId,
      title: item.title,
      price: item.price,
      quantity: 1,
      coverImage: item.coverImage || "",
      stock: 10,
    });

    toast.success(`Added "${item.title}" to cart`);
  };

  const handleAddAllToCart = () => {
    let added = 0;
    wishlistItems.forEach((item) => {
      const details = bookDetails.get(item.bookId);
      if (details?.price) {
        addItem({
          bookId: item.bookId,
          title: item.title,
          price: details.price,
          quantity: 1,
          coverImage: details.coverImage || "",
          stock: 10,
        });
        added++;
      }
    });

    toast.success(`Added ${added} items to cart`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Please Login
          </h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to view your wishlist
          </p>
          <Link to="/login" state={{ from: "/wishlist" }}>
            <Button variant="primary">Login to Continue</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-600 mt-2">
              {wishlistItems.length}{" "}
              {wishlistItems.length === 1 ? "item" : "items"} saved for later
            </p>
          </div>

          {wishlistItems.length > 0 && (
            <Button
              variant="primary"
              leftIcon={<ShoppingCart size={18} />}
              onClick={handleAddAllToCart}
            >
              Add All to Cart
            </Button>
          )}
        </div>

        {/* Wishlist Items */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : wishlistItems.length === 0 ? (
          <Card className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-gray-500 mb-6">
              Save your favorite books here and they'll appear in this list
            </p>
            <Link to="/catalog">
              <Button variant="primary" leftIcon={<BookOpen size={18} />}>
                Browse Books
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => {
              const details = bookDetails.get(item.bookId);

              return (
                <Card
                  key={item.bookId}
                  className="overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="flex gap-4">
                    {/* Book Cover */}
                    <Link to={`/book/${item.bookId}`} className="shrink-0">
                      <img
                        src={
                          details?.coverImage ||
                          "https://via.placeholder.com/100x150?text=No+Cover"
                        }
                        alt={item.title}
                        className="w-24 h-32 object-cover rounded"
                      />
                    </Link>

                    {/* Book Info */}
                    <div className="flex-1 min-w-0">
                      <Link to={`/book/${item.bookId}`}>
                        <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                      </Link>

                      {details?.authors && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                          by {details.authors.slice(0, 2).join(", ")}
                          {details.authors.length > 2 && " et al."}
                        </p>
                      )}

                      {details?.rating && (
                        <div className="flex items-center mt-2">
                          <Rating value={details.rating} size="sm" />
                          <span className="ml-1 text-xs text-gray-500">
                            ({details.rating.toFixed(1)})
                          </span>
                        </div>
                      )}

                      {details?.price && (
                        <p className="text-lg font-bold text-gray-900 mt-2">
                          ${details.price.toFixed(2)}
                        </p>
                      )}

                      <p className="text-xs text-gray-400 mt-1">
                        Added {new Date(item.addedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      leftIcon={<ShoppingCart size={14} />}
                      onClick={() => details && handleAddToCart(details)}
                      disabled={!details}
                    >
                      Add to Cart
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="px-3"
                      onClick={() => handleRemoveFromWishlist(item.bookId)}
                      disabled={removing === item.bookId}
                    >
                      {removing === item.bookId ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Back to Shopping Link */}
        {wishlistItems.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              to="/catalog"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
