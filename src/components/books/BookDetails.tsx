import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  ChevronLeft,
  Minus,
  Plus,
  Truck,
  Shield,
  RotateCcw,
  BookOpen,
  Calendar,
  Hash,
  Layers,
} from "lucide-react";
import { GoogleBooksService } from "../../services/googleBooks";
import type { Book, Review } from "../../types";
import { useCartStore } from "../../store/cartStore";
import toast from "react-hot-toast";
import BookGrid from "./BookGrid";
import SkeletonLoader from "../ui/SkeletonLoader";

const BookDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<
    "description" | "details" | "reviews"
  >("description");
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);
  const [userReview, setUserReview] = useState({ rating: 5, comment: "" });
  const [isWishlisted, setIsWishlisted] = useState(false);

  const { addItem } = useCartStore();

  useEffect(() => {
    fetchBookDetails();
  }, [id]);

  const fetchBookDetails = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const bookData = await GoogleBooksService.getBookById(id);
      if (bookData) {
        setBook(bookData);

        // Fetch related books by category
        if (bookData.categories && bookData.categories.length > 0) {
          const related = await GoogleBooksService.getBooksByCategory(
            bookData.categories[0],
            4,
          );
          setRelatedBooks(related.filter((b) => b.id !== id).slice(0, 4));
        }
      }
    } catch (error) {
      console.error("Error fetching book details:", error);
      toast.error("Failed to load book details");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!book) return;

    if (book.stock < quantity) {
      toast.error(`Only ${book.stock} copies available`);
      return;
    }

    addItem({
      bookId: book.id,
      title: book.title,
      price: book.price,
      quantity,
      coverImage: book.coverImage,
      stock: book.stock,
    });

    toast.success(
      `Added ${quantity} ${quantity === 1 ? "copy" : "copies"} to cart!`,
    );
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => {
      const newValue = prev + delta;
      if (newValue < 1) return 1;
      if (book && newValue > book.stock) return book.stock;
      return newValue;
    });
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the review to your backend
    toast.success("Review submitted successfully!");
    setUserReview({ rating: 5, comment: "" });
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: book?.title,
          text: `Check out this book: ${book?.title} by ${book?.authors?.join(", ")}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SkeletonLoader className="h-96" />
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Book not found</h2>
          <Link
            to="/catalog"
            className="text-blue-600 hover:text-blue-800 mt-4 inline-block"
          >
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-blue-600">
            Home
          </Link>
          <ChevronLeft className="w-4 h-4 mx-2" />
          <Link to="/catalog" className="hover:text-blue-600">
            Catalog
          </Link>
          <ChevronLeft className="w-4 h-4 mx-2" />
          <span className="text-gray-900 font-medium truncate">
            {book.title}
          </span>
        </nav>

        {/* Main Book Details */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Book Cover */}
            <div className="relative">
              <div className="sticky top-24">
                <div className="relative rounded-lg overflow-hidden shadow-xl">
                  <img
                    src={book.coverImage || "/placeholder-book.jpg"}
                    alt={book.title}
                    className="w-full h-auto object-cover"
                  />

                  {/* Stock Badge */}
                  {book.stock <= 5 && book.stock > 0 && (
                    <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Only {book.stock} left in stock
                    </div>
                  )}

                  {book.stock === 0 && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Out of Stock
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={handleWishlist}
                    className={`flex-1 flex items-center justify-center px-4 py-3 border rounded-lg transition-colors ${
                      isWishlisted
                        ? "border-red-500 text-red-500 hover:bg-red-50"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 mr-2 ${isWishlisted ? "fill-red-500" : ""}`}
                    />
                    {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Share2 className="w-5 h-5 mr-2" />
                    Share
                  </button>
                </div>
              </div>
            </div>

            {/* Book Info */}
            <div>
              {/* Categories */}
              <div className="flex flex-wrap gap-2 mb-4">
                {book.categories?.map((category, index) => (
                  <Link
                    key={index}
                    to={`/catalog?category=${category.toLowerCase()}`}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full hover:bg-blue-200 transition-colors"
                  >
                    {category}
                  </Link>
                ))}
              </div>

              {/* Title and Author */}
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {book.title}
              </h1>
              <p className="text-xl text-gray-600 mb-4">
                by {book.authors?.join(", ")}
              </p>

              {/* Rating */}
              <div className="flex items-center mb-6">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(book.rating)
                          ? "text-yellow-400 fill-current"
                          : i < book.rating
                            ? "text-yellow-400 fill-current opacity-50"
                            : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-lg font-medium text-gray-900">
                  {book.rating.toFixed(1)}
                </span>
                <span className="ml-2 text-gray-500">
                  ({book.reviews?.length || 0} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">
                    ${book.price.toFixed(2)}
                  </span>
                  {book.originalPrice && (
                    <span className="ml-3 text-xl text-gray-500 line-through">
                      ${book.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Free shipping on orders over $25
                </p>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-2 border border-gray-300 rounded-l-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={book.stock}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(
                        Math.min(
                          book.stock,
                          Math.max(1, parseInt(e.target.value) || 1),
                        ),
                      )
                    }
                    className="w-20 text-center border-t border-b border-gray-300 py-2 focus:outline-none"
                  />
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= book.stock}
                    className="p-2 border border-gray-300 rounded-r-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <span className="ml-4 text-sm text-gray-500">
                    {book.stock} available
                  </span>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={book.stock === 0}
                className={`w-full py-4 px-6 rounded-lg text-lg font-semibold flex items-center justify-center ${
                  book.stock === 0
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                } transition-colors mb-6`}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {book.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </button>

              {/* Shipping Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-b border-gray-200 py-6">
                <div className="flex items-center text-gray-600">
                  <Truck className="w-5 h-5 mr-2" />
                  <span className="text-sm">Free Shipping</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Shield className="w-5 h-5 mr-2" />
                  <span className="text-sm">Secure Payment</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <RotateCcw className="w-5 h-5 mr-2" />
                  <span className="text-sm">30-Day Returns</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t border-gray-200">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("description")}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === "description"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab("details")}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === "details"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Book Details
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === "reviews"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Reviews ({book.reviews?.length || 0})
              </button>
            </div>

            <div className="p-8">
              {/* Description Tab */}
              {activeTab === "description" && (
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {book.description || "No description available."}
                  </p>
                </div>
              )}

              {/* Details Tab */}
              {activeTab === "details" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <BookOpen className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Format
                        </p>
                        <p className="text-gray-900">Hardcover</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Calendar className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Published Date
                        </p>
                        <p className="text-gray-900">
                          {book.publishedDate
                            ? new Date(book.publishedDate).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Hash className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          ISBN-13
                        </p>
                        <p className="text-gray-900">{book.isbn || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Layers className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Pages
                        </p>
                        <p className="text-gray-900">
                          {book.pageCount || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === "reviews" && (
                <div>
                  {/* Review Form */}
                  <div className="mb-8 bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Write a Review
                    </h3>
                    <form onSubmit={handleSubmitReview}>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rating
                        </label>
                        <div className="flex space-x-2">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              type="button"
                              onClick={() =>
                                setUserReview({ ...userReview, rating })
                              }
                              className="focus:outline-none"
                            >
                              <Star
                                className={`w-8 h-8 ${
                                  rating <= userReview.rating
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your Review
                        </label>
                        <textarea
                          value={userReview.comment}
                          onChange={(e) =>
                            setUserReview({
                              ...userReview,
                              comment: e.target.value,
                            })
                          }
                          rows={4}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Share your thoughts about this book..."
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Submit Review
                      </button>
                    </form>
                  </div>

                  {/* Existing Reviews */}
                  {book.reviews && book.reviews.length > 0 ? (
                    <div className="space-y-6">
                      {book.reviews.map((review: Review) => (
                        <div
                          key={review.id}
                          className="border-b border-gray-200 pb-6"
                        >
                          <div className="flex items-center mb-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="ml-2 text-sm font-medium text-gray-900">
                              {review.userName}
                            </span>
                            <span className="ml-auto text-sm text-gray-500">
                              {new Date(review.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No reviews yet. Be the first to review this book!
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Books */}
        {relatedBooks.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              You Might Also Like
            </h2>
            <BookGrid books={relatedBooks} />
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetailsPage;
