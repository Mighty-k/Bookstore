import React, { useState, useEffect } from "react";
import {
  X,
  // Star,
  ShoppingCart,
  Heart,
  Share2,
  Minus,
  Plus,
  BookOpen,
  Calendar,
  Hash,
  Layers,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader,
} from "lucide-react";
import type { Book } from "../../types";
import { useCartStore } from "../../store/cartStore";
import { useAuthStore } from "../../store/authStore";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Rating from "../ui/Rating";
import Button from "../ui/Button";
import Badge from "../ui/Badge";

interface QuickViewModalProps {
  book: Book;
  isOpen: boolean;
  onClose: () => void;
  onAddToWishlist?: () => void;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({
  book,
  isOpen,
  onClose,
  onAddToWishlist,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [imageError, setImageError] = useState(false);

  const { addItem } = useCartStore();
  const { user } = useAuthStore();

  // Mock additional images (in real app, these would come from the book object)
  const images = [
    book.coverImage,
    book.coverImage?.replace("L.jpg", "M.jpg"),
    book.coverImage?.replace("L.jpg", "S.jpg"),
  ].filter(Boolean);

  // Handle body scroll lock/unlock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Reset state when modal opens with new book
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setQuantity(1);
        setActiveImageIndex(0);
        setImageError(false);
        setImageLoaded(false);
        setShowFullDescription(false);
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [isOpen, book.id]);

  if (!isOpen) return null;

  const handleAddToCart = async () => {
    if (book.stock === 0) {
      toast.error("This book is out of stock");
      return;
    }

    if (quantity > book.stock) {
      toast.error(`Only ${book.stock} copies available`);
      return;
    }

    setIsAddingToCart(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    addItem({
      bookId: book.id,
      title: book.title,
      price: book.price,
      quantity,
      coverImage: book.coverImage,
      stock: book.stock,
    });

    setIsAddingToCart(false);
    toast.success(
      `Added ${quantity} ${quantity === 1 ? "copy" : "copies"} to cart!`,
    );
    onClose();
  };

  const handleWishlist = () => {
    if (!user) {
      toast.error("Please login to add items to wishlist");
      return;
    }
    setIsWishlisted(!isWishlisted);
    onAddToWishlist?.();
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  const handleShare = async () => {
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

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => {
      const newValue = prev + delta;
      if (newValue < 1) return 1;
      if (book && newValue > book.stock) return book.stock;
      return newValue;
    });
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const getImageSrc = (index: number) => {
    if (imageError) {
      return `https://via.placeholder.com/400x600/e2e8f0/1e293b?text=${encodeURIComponent(book.title.substring(0, 30))}`;
    }
    return images[index] || book.coverImage;
  };

  const truncatedDescription =
    book.description?.length > 200
      ? book.description.substring(0, 200) + "..."
      : book.description;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="quick-view-title"
      role="dialog"
      aria-modal="true"
      onClick={handleOverlayClick}
    >
      {/* Glassy Backdrop */}
      <div className="fixed inset-0 bg-white/10 backdrop-blur-xs transition-opacity" />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden animate-slideUp">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[90vh] overflow-y-auto">
            {/* Image Gallery */}
            <div className="relative bg-gray-100 p-6">
              <div className="sticky top-0">
                <div className="relative aspect-w-3 aspect-h-4 mb-4 bg-gray-200 rounded-lg overflow-hidden">
                  {!imageLoaded && !imageError && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                  )}
                  <img
                    src={getImageSrc(activeImageIndex)}
                    alt={book.title}
                    className={`w-full h-full object-contain transition-opacity duration-300 ${
                      imageLoaded ? "opacity-100" : "opacity-0"
                    }`}
                    onLoad={() => setImageLoaded(true)}
                    onError={handleImageError}
                  />

                  {/* Stock Badge */}
                  {book.stock <= 5 && book.stock > 0 && (
                    <Badge
                      variant="warning"
                      size="lg"
                      className="absolute top-4 left-4"
                    >
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Only {book.stock} left
                    </Badge>
                  )}

                  {book.stock === 0 && (
                    <Badge
                      variant="error"
                      size="lg"
                      className="absolute top-4 left-4"
                    >
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Out of Stock
                    </Badge>
                  )}
                </div>

                {/* Thumbnail Navigation */}
                {images.length > 1 && (
                  <div className="flex gap-2 justify-center mt-4">
                    {images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImageIndex(index)}
                        className={`relative w-16 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          activeImageIndex === index
                            ? "border-blue-600 shadow-lg scale-105"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${book.title} - view ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://via.placeholder.com/64x80?text=No+Cover";
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setActiveImageIndex((prev) => Math.max(0, prev - 1))
                      }
                      disabled={activeImageIndex === 0}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() =>
                        setActiveImageIndex((prev) =>
                          Math.min(images.length - 1, prev + 1),
                        )
                      }
                      disabled={activeImageIndex === images.length - 1}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Book Details */}
            <div className="p-6">
              {/* Categories */}
              <div className="flex flex-wrap gap-2 mb-4">
                {book.categories?.slice(0, 3).map((category, index) => (
                  <Link
                    key={index}
                    to={`/catalog?category=${category.toLowerCase()}`}
                    onClick={onClose}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full hover:bg-blue-200 transition-colors"
                  >
                    {category}
                  </Link>
                ))}
                {book.categories && book.categories.length > 3 && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{book.categories.length - 3}
                  </span>
                )}
              </div>

              {/* Title */}
              <h2
                id="quick-view-title"
                className="text-2xl font-bold text-gray-900 mb-2"
              >
                {book.title}
              </h2>

              {/* Author */}
              <p className="text-gray-600 mb-4">
                by {book.authors?.join(", ")}
              </p>

              {/* Rating */}
              <div className="flex items-center mb-4">
                <Rating value={book.rating} size="md" />
                <span className="ml-2 text-sm text-gray-600">
                  ({book.reviews?.length || 0} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900">
                    ${book.price.toFixed(2)}
                  </span>
                  {book.originalPrice && (
                    <>
                      <span className="ml-2 text-lg text-gray-500 line-through">
                        ${book.originalPrice.toFixed(2)}
                      </span>
                      <Badge variant="success" size="md" className="ml-3">
                        Save ${(book.originalPrice - book.price).toFixed(2)}
                      </Badge>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Description
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {showFullDescription
                    ? book.description
                    : truncatedDescription}
                </p>
                {book.description?.length > 200 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-blue-600 text-sm font-medium hover:text-blue-800 mt-2"
                  >
                    {showFullDescription ? "Show less" : "Read more"}
                  </button>
                )}
              </div>

              {/* Book Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                {book.publishedDate && (
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Published:</span>
                    <span className="ml-1 font-medium text-gray-900">
                      {new Date(book.publishedDate).getFullYear()}
                    </span>
                  </div>
                )}
                {book.pageCount && (
                  <div className="flex items-center text-sm">
                    <Layers className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Pages:</span>
                    <span className="ml-1 font-medium text-gray-900">
                      {book.pageCount}
                    </span>
                  </div>
                )}
                {book.isbn && (
                  <div className="flex items-center text-sm">
                    <Hash className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">ISBN:</span>
                    <span className="ml-1 font-medium text-gray-900">
                      {book.isbn.slice(-6)}
                    </span>
                  </div>
                )}
                {book.language && (
                  <div className="flex items-center text-sm">
                    <BookOpen className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Language:</span>
                    <span className="ml-1 font-medium text-gray-900">
                      {book.language}
                    </span>
                  </div>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1 || book.stock === 0}
                      className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-16 text-center font-medium">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= book.stock || book.stock === 0}
                      className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="ml-4 text-sm text-gray-500">
                    {book.stock > 0
                      ? `${book.stock} available`
                      : "Out of stock"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  leftIcon={<ShoppingCart size={18} />}
                  onClick={handleAddToCart}
                  disabled={book.stock === 0 || isAddingToCart}
                  isLoading={isAddingToCart}
                >
                  Add to Cart
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  leftIcon={
                    <Heart
                      className={isWishlisted ? "fill-red-500" : ""}
                      size={18}
                    />
                  }
                  onClick={handleWishlist}
                >
                  {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
                </Button>
              </div>

              {/* View Full Details Link */}
              <Link
                to={`/book/${book.id}`}
                onClick={onClose}
                className="block text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View full details →
              </Link>

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="mt-4 flex items-center justify-center w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Share2 size={16} className="mr-2" />
                Share this book
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
