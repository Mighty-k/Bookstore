import React, { useState, useEffect } from "react";
import {
  Star,
  ShoppingCart,
  /* Eye,*/ Heart,
  Share2,
  ImageOff,
  Loader,
} from "lucide-react";
import type { Book } from "../../types";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import QuickViewModal from "./QuickViewModal";

interface BookCardProps {
  book: Book;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const { addItem } = useCartStore();
  const {
    checkBookStatus,
    addToWishlist,
    removeFromWishlist,
    refreshBookStatus,
  } = useWishlistStore();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

  useEffect(() => {
    // Check if book is in wishlist
    const status = checkBookStatus(book.id);
    setIsWishlisted(status);
  }, [book.id, checkBookStatus]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (book.stock === 0) {
      toast.error("This book is out of stock");
      return;
    }

    addItem({
      bookId: book.id,
      title: book.title,
      price: book.price,
      quantity: 1,
      coverImage: book.coverImage,
      stock: book.stock,
    });
    toast.success(`Added "${book.title}" to cart!`);
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setWishlistLoading(true);

    if (isWishlisted) {
      const success = await removeFromWishlist(book.id);
      if (success) {
        setIsWishlisted(false);
      }
    } else {
      const success = await addToWishlist(book.id, book.title);
      if (success) {
        setIsWishlisted(true);
      }
    }

    setWishlistLoading(false);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const url = `${window.location.origin}/book/${book.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: book.title,
          text: `Check out this book: ${book.title} by ${book.authors?.join(", ")}`,
          url,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickView(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const getImageSrc = () => {
    if (imageError) {
      const colors = [
        "2ecc71",
        "3498db",
        "9b59b6",
        "e74c3c",
        "f39c12",
        "1abc9c",
      ];
      const colorIndex =
        book.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
        colors.length;
      const color = colors[colorIndex];
      return `https://via.placeholder.com/300x450/${color}/ffffff?text=${encodeURIComponent(book.title.substring(0, 20))}`;
    }
    return (
      book.coverImage ||
      `https://via.placeholder.com/300x450/95a5a6/ffffff?text=No+Cover`
    );
  };

  return (
    <>
      <div className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        {/* Badges */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
          {book.stock <= 5 && book.stock > 0 && (
            <span className="bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded shadow-md">
              Only {book.stock} left
            </span>
          )}
          {book.stock === 0 && (
            <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded shadow-md">
              Out of Stock
            </span>
          )}
          {book.rating >= 4.5 && (
            <span className="bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded shadow-md">
              Bestseller
            </span>
          )}
        </div>

        {/* Quick Action Buttons */}
        <div className="absolute top-2 right-2 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleWishlist}
            disabled={wishlistLoading}
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors disabled:opacity-50"
            aria-label={
              isWishlisted ? "Remove from wishlist" : "Add to wishlist"
            }
          >
            {wishlistLoading ? (
              <Loader className="w-4 h-4 text-gray-600 animate-spin" />
            ) : (
              <Heart
                className={`w-4 h-4 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}`}
              />
            )}
          </button>
          <button
            onClick={handleShare}
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
            aria-label="Share book"
          >
            <Share2 className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Book Cover with Loading State */}
        <Link to={`/book/${book.id}`} className="block relative">
          <div className="relative pt-[140%] bg-gray-100 overflow-hidden">
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
            <img
              src={getImageSrc()}
              alt={book.title}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
                imageLoaded
                  ? "opacity-100 scale-100 group-hover:scale-110"
                  : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={handleImageError}
              loading="lazy"
            />

            {/* Show error icon if image fails */}
            {imageError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
                <ImageOff className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-xs text-gray-500">No cover</span>
              </div>
            )}

            {/* Hover Overlay with Quick View */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
              <button
                onClick={handleQuickView}
                className="bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-semibold shadow-lg hover:bg-gray-100 transition-colors transform hover:scale-105"
              >
                Quick View
              </button>
            </div>
          </div>
        </Link>

        {/* Book Info */}
        <div className="p-4">
          <Link to={`/book/${book.id}`}>
            <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors line-clamp-2 mb-1">
              {book.title}
            </h3>
          </Link>

          <p className="text-gray-600 text-sm mb-2">
            by {book.authors?.slice(0, 2).join(", ")}
            {book.authors && book.authors.length > 2 && " et al."}
          </p>

          {/* Rating */}
          <div className="flex items-center mb-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(book.rating)
                      ? "text-yellow-400 fill-current"
                      : i < book.rating
                        ? "text-yellow-400 fill-current opacity-50"
                        : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600">
              ({book.reviews?.length || 0})
            </span>
            {book.rating > 0 && (
              <span className="ml-auto text-sm font-medium text-gray-700">
                {book.rating.toFixed(1)}
              </span>
            )}
          </div>

          {/* Price and Actions */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-gray-900">
                ${book.price.toFixed(2)}
              </span>
              {book.originalPrice && (
                <span className="ml-2 text-sm text-gray-500 line-through">
                  ${book.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleAddToCart}
                disabled={book.stock === 0}
                className={`p-2 rounded-full transition-all ${
                  book.stock === 0
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"
                } text-white`}
                aria-label="Add to cart"
              >
                <ShoppingCart size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        book={book}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
        onAddToWishlist={() => {
          setIsWishlisted(!isWishlisted);
          refreshBookStatus(book.id);
        }}
      />
    </>
  );
};

export default BookCard;
