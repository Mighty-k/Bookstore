import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
  User,
  MessageCircle,
  ThumbsUp,
  Flag,
  CheckCircle,
  AlertCircle,
  Facebook,
  Twitter,
  Mail,
  Link as LinkIcon,
} from "lucide-react";
import { OpenLibraryService } from "../services/openLibrary";
import type { Book, Review } from "../types";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
// import { useUIStore } from "../store/uiStore";
import toast from "react-hot-toast";
import BookGrid from "../components/books/BookGrid";
import SkeletonLoader from "../components/ui/SkeletonLoader";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Rating from "../components/ui/Rating";
import Tabs from "../components/ui/Tabs";
import Modal from "../components/ui/Modal";
import Tooltip from "../components/ui/Tooltip";

const BookDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);
  const [userReview, setUserReview] = useState({
    rating: 5,
    comment: "",
    title: "",
  });
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [helpfulReviews, setHelpfulReviews] = useState<Set<string>>(new Set());

  const { addItem } = useCartStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchBookDetails();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchBookDetails = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const bookData = await OpenLibraryService.getBookById(id);
      if (bookData) {
        setBook(bookData);

        // Mock reviews (Open Library doesn't provide reviews)
        const mockReviews: Review[] = [
          {
            id: "1",
            userId: "user1",
            userName: "John Doe",
            userAvatar: "https://i.pravatar.cc/150?u=1",
            rating: 5,
            title: "Absolutely amazing!",
            comment:
              "This book completely changed my perspective. The writing is beautiful and the characters are so well developed. Highly recommended!",
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            helpful: 24,
            verified: true,
          },
          // ... more mock reviews
        ];

        setReviews(mockReviews);

        // Fetch related books by category
        if (bookData.categories && bookData.categories.length > 0) {
          const related = await OpenLibraryService.getBooksBySubject(
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

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/checkout");
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => {
      const newValue = prev + delta;
      if (newValue < 1) return 1;
      if (book && newValue > book.stock) return book.stock;
      return newValue;
    });
  };

  const handleWishlist = () => {
    if (!user) {
      toast.error("Please login to add items to wishlist");
      navigate("/login");
      return;
    }
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  const handleShare = async (platform?: string) => {
    const url = window.location.href;
    const title = book?.title || "";
    const text = `Check out this book: ${title}`;

    if (platform === "facebook") {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        "_blank",
      );
    } else if (platform === "twitter") {
      window.open(
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
        "_blank",
      );
    } else if (platform === "email") {
      window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + "\n\n" + url)}`;
    } else if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
    setShowShareModal(false);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();

    const newReview: Review = {
      id: Date.now().toString(),
      userId: user?.id || "guest",
      userName: user?.name || "Anonymous",
      userAvatar: user?.avatar,
      rating: userReview.rating,
      title: userReview.title,
      comment: userReview.comment,
      date: new Date().toISOString(),
      helpful: 0,
      verified: true,
    };

    setReviews([newReview, ...reviews]);
    setUserReview({ rating: 5, comment: "", title: "" });
    setShowReviewModal(false);
    toast.success("Review submitted successfully!");
  };

  const handleHelpful = (reviewId: string) => {
    if (!user) {
      toast.error("Please login to mark reviews as helpful");
      return;
    }

    if (helpfulReviews.has(reviewId)) {
      setHelpfulReviews((prev) => {
        const newSet = new Set(prev);
        newSet.delete(reviewId);
        return newSet;
      });
      setReviews(
        reviews.map((r) =>
          r.id === reviewId ? { ...r, helpful: (r.helpful || 0) - 1 } : r,
        ),
      );
    } else {
      setHelpfulReviews((prev) => new Set(prev).add(reviewId));
      setReviews(
        reviews.map((r) =>
          r.id === reviewId ? { ...r, helpful: (r.helpful || 0) + 1 } : r,
        ),
      );
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / reviews.length;
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      distribution[r.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SkeletonLoader className="h-96" count={1} />
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-lg shadow-lg p-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Book not found
            </h2>
            <p className="text-gray-600 mb-6">
              The book you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/catalog">
              <Button variant="primary" leftIcon={<ChevronLeft size={16} />}>
                Back to Catalog
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const ratingDistribution = getRatingDistribution();
  const averageRating = calculateAverageRating();

  const tabs = [
    { id: "description", label: "Description" },
    { id: "details", label: "Book Details" },
    { id: "reviews", label: `Reviews (${reviews.length})` },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-gray-500 mb-6">
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
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Book Cover */}
            <div className="relative">
              <div className="sticky top-24">
                <div className="relative rounded-lg overflow-hidden shadow-xl bg-gray-100">
                  <img
                    src={book.coverImage || "/placeholder-book.jpg"}
                    alt={book.title}
                    className="w-full h-auto object-cover"
                  />

                  {/* Badges */}
                  <div className="absolute top-4 left-4 space-y-2">
                    {book.stock <= 5 && book.stock > 0 && (
                      <Badge variant="warning" size="lg">
                        <AlertCircle size={14} className="mr-1" />
                        Only {book.stock} left
                      </Badge>
                    )}

                    {book.stock === 0 && (
                      <Badge variant="error" size="lg">
                        <AlertCircle size={14} className="mr-1" />
                        Out of Stock
                      </Badge>
                    )}

                    {averageRating >= 4.5 && reviews.length > 10 && (
                      <Badge variant="success" size="lg">
                        <Star size={14} className="mr-1 fill-current" />
                        Bestseller
                      </Badge>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="absolute top-4 right-4 space-y-2">
                    <Tooltip
                      content={
                        isWishlisted
                          ? "Remove from wishlist"
                          : "Add to wishlist"
                      }
                    >
                      <button
                        onClick={handleWishlist}
                        className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                      >
                        <Heart
                          className={`w-5 h-5 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}`}
                        />
                      </button>
                    </Tooltip>

                    <Tooltip content="Share">
                      <button
                        onClick={() => setShowShareModal(true)}
                        className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                      >
                        <Share2 className="w-5 h-5 text-gray-600" />
                      </button>
                    </Tooltip>
                  </div>
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

              {/* Rating Summary */}
              <div className="flex items-center gap-6 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <span className="text-3xl font-bold text-gray-900">
                    {averageRating.toFixed(1)}
                  </span>
                  <div className="flex mt-1">
                    <Rating value={averageRating} size="sm" />
                  </div>
                  <span className="text-sm text-gray-500">
                    {reviews.length} reviews
                  </span>
                </div>

                <div className="flex-1 space-y-1">
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 w-8">
                        {stars} stars
                      </span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 rounded-full"
                          style={{
                            width: `${(ratingDistribution[stars as keyof typeof ratingDistribution] / reviews.length) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-8">
                        {
                          ratingDistribution[
                            stars as keyof typeof ratingDistribution
                          ]
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">
                    ${book.price.toFixed(2)}
                  </span>
                  {book.originalPrice && (
                    <>
                      <span className="ml-3 text-xl text-gray-500 line-through">
                        ${book.originalPrice.toFixed(2)}
                      </span>
                      <Badge variant="success" size="md" className="ml-3">
                        Save ${(book.originalPrice - book.price).toFixed(2)}
                      </Badge>
                    </>
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
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-16 text-center font-medium">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= book.stock}
                      className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="ml-4 text-sm text-gray-500">
                    {book.stock} available
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  leftIcon={<ShoppingCart size={18} />}
                  onClick={handleAddToCart}
                  disabled={book.stock === 0}
                >
                  Add to Cart
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  onClick={handleBuyNow}
                  disabled={book.stock === 0}
                >
                  Buy Now
                </Button>
              </div>

              {/* Shipping Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-b border-gray-200 py-6">
                <div className="flex items-center text-gray-600">
                  <Truck className="w-5 h-5 mr-2 text-blue-500" />
                  <span className="text-sm">Free Shipping</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Shield className="w-5 h-5 mr-2 text-green-500" />
                  <span className="text-sm">Secure Payment</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <RotateCcw className="w-5 h-5 mr-2 text-orange-500" />
                  <span className="text-sm">30-Day Returns</span>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <Hash className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-gray-500">ISBN-13:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {book.isbn || "N/A"}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Layers className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-gray-500">Pages:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {book.pageCount || "N/A"}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-gray-500">Published:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {book.publishedDate
                      ? new Date(book.publishedDate).getFullYear()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <BookOpen className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-gray-500">Format:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    Hardcover
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t border-gray-200">
            <div className="px-8">
              <Tabs
                tabs={tabs}
                activeTab={activeTab}
                onChange={setActiveTab}
                variant="underline"
              />
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                      <BookOpen className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Format
                        </p>
                        <p className="text-gray-900 font-medium">Hardcover</p>
                      </div>
                    </div>
                    <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Published Date
                        </p>
                        <p className="text-gray-900 font-medium">
                          {book.publishedDate
                            ? new Date(book.publishedDate).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                      <User className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Publisher
                        </p>
                        <p className="text-gray-900 font-medium">
                          {book.publisher || "Unknown"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                      <Hash className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          ISBN-13
                        </p>
                        <p className="text-gray-900 font-medium">
                          {book.isbn || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                      <Layers className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Pages
                        </p>
                        <p className="text-gray-900 font-medium">
                          {book.pageCount || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                      <MessageCircle className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Language
                        </p>
                        <p className="text-gray-900 font-medium">
                          {book.language || "English"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === "reviews" && (
                <div>
                  {/* Write Review Button */}
                  {user && (
                    <div className="mb-8 text-right">
                      <Button
                        variant="primary"
                        leftIcon={<MessageCircle size={16} />}
                        onClick={() => setShowReviewModal(true)}
                      >
                        Write a Review
                      </Button>
                    </div>
                  )}

                  {/* Reviews List */}
                  {reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div
                          key={review.id}
                          className="border-b border-gray-200 pb-6 last:border-0"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center">
                              <img
                                src={
                                  review.userAvatar ||
                                  `https://ui-avatars.com/api/?name=${review.userName}&background=random`
                                }
                                alt={review.userName}
                                className="w-10 h-10 rounded-full mr-3"
                              />
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  {review.userName}
                                </h4>
                                <div className="flex items-center mt-1">
                                  <Rating value={review.rating} size="sm" />
                                  <span className="mx-2 text-gray-300">•</span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(review.date).toLocaleDateString(
                                      "en-US",
                                      {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      },
                                    )}
                                  </span>
                                  {review.verified && (
                                    <>
                                      <span className="mx-2 text-gray-300">
                                        •
                                      </span>
                                      <CheckCircle
                                        size={14}
                                        className="text-green-500"
                                      />
                                      <span className="text-xs text-green-600 ml-1">
                                        Verified Purchase
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {review.title && (
                            <h5 className="font-semibold text-gray-900 mb-2">
                              {review.title}
                            </h5>
                          )}

                          <p className="text-gray-700 mb-3">{review.comment}</p>

                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => handleHelpful(review.id)}
                              className={`flex items-center text-sm ${
                                helpfulReviews.has(review.id)
                                  ? "text-blue-600"
                                  : "text-gray-500 hover:text-gray-700"
                              }`}
                            >
                              <ThumbsUp size={14} className="mr-1" />
                              Helpful ({review.helpful || 0})
                            </button>

                            <button className="flex items-center text-sm text-gray-500 hover:text-gray-700">
                              <Flag size={14} className="mr-1" />
                              Report
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No reviews yet
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Be the first to share your thoughts about this book!
                      </p>
                      {user ? (
                        <Button
                          variant="primary"
                          onClick={() => setShowReviewModal(true)}
                        >
                          Write a Review
                        </Button>
                      ) : (
                        <Link to="/login" state={{ from: `/book/${book.id}` }}>
                          <Button variant="primary">Login to Review</Button>
                        </Link>
                      )}
                    </div>
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

        {/* Recently Viewed (optional) */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Recently Viewed
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-sm p-3 text-center"
              >
                <div className="w-full aspect-w-2 aspect-h-3 bg-gray-200 rounded-lg mb-2"></div>
                <p className="text-sm font-medium text-gray-900 truncate">
                  Book Title {i}
                </p>
                <p className="text-xs text-gray-500">Author Name</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share this book"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Share "{book?.title}" with your friends and family
          </p>

          <div className="grid grid-cols-4 gap-3">
            <button
              onClick={() => handleShare("facebook")}
              className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Facebook className="w-5 h-5 mx-auto" />
            </button>
            <button
              onClick={() => handleShare("twitter")}
              className="p-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
            >
              <Twitter className="w-5 h-5 mx-auto" />
            </button>
            <button
              onClick={() => handleShare("email")}
              className="p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Mail className="w-5 h-5 mx-auto" />
            </button>
            <button
              onClick={() => handleShare()}
              className="p-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
            >
              <LinkIcon className="w-5 h-5 mx-auto" />
            </button>
          </div>

          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-2">Or copy link</p>
            <div className="flex">
              <input
                type="text"
                value={window.location.href}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg text-sm bg-gray-50"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Link copied!");
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Review Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="Write a Review"
        size="md"
      >
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Rating
            </label>
            <Rating
              value={userReview.rating}
              size="lg"
              interactive
              onChange={(value) =>
                setUserReview({ ...userReview, rating: value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review Title
            </label>
            <input
              type="text"
              value={userReview.title}
              onChange={(e) =>
                setUserReview({ ...userReview, title: e.target.value })
              }
              placeholder="Summarize your review"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review
            </label>
            <textarea
              value={userReview.comment}
              onChange={(e) =>
                setUserReview({ ...userReview, comment: e.target.value })
              }
              rows={4}
              placeholder="What did you think about this book?"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowReviewModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Submit Review
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BookDetailsPage;
