import React, { useState } from "react";
import { Minus, Plus, Trash2, Heart } from "lucide-react";
import type { CartItem as CartItemType } from "../../types";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (bookId: string, quantity: number) => void;
  onRemove: (bookId: string) => void;
  onMoveToWishlist?: (bookId: string) => void;
  isUpdating?: boolean;
}

const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
  onMoveToWishlist,
  isUpdating = false,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleIncrement = () => {
    if (item.quantity < item.stock) {
      onUpdateQuantity(item.bookId, item.quantity + 1);
    } else {
      toast.error(`Only ${item.stock} items available`);
    }
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.bookId, item.quantity - 1);
    } else {
      // If quantity is 1, show remove confirmation
      if (window.confirm("Remove item from cart?")) {
        handleRemove();
      }
    }
  };

  const handleRemove = () => {
    setIsRemoving(true);
    // Add a small delay for animation
    setTimeout(() => {
      onRemove(item.bookId);
      toast.success(`Removed "${item.title}" from cart`);
    }, 300);
  };

  const handleMoveToWishlist = () => {
    if (onMoveToWishlist) {
      onMoveToWishlist(item.bookId);
      toast.success(`Moved "${item.title}" to wishlist`);
    }
  };

  const itemTotal = item.price * item.quantity;

  return (
    <div
      className={`flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ${
        isRemoving ? "opacity-0 transform -translate-x-full" : "opacity-100"
      } ${isUpdating ? "pointer-events-none opacity-60" : ""}`}
    >
      {/* Book Image */}
      <div className="sm:w-24 sm:h-24 flex-shrink-0">
        <Link
          to={`/book/${item.bookId}`}
          className="block relative w-20 h-24 sm:w-24 sm:h-24 mx-auto sm:mx-0"
        >
          <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
            <img
              src={item.coverImage || "/placeholder-book.jpg"}
              alt={item.title}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
            />
          </div>
        </Link>
      </div>

      {/* Book Details */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
          <div className="flex-1">
            <Link
              to={`/book/${item.bookId}`}
              className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
            >
              {item.title}
            </Link>

            {/* Stock Status */}
            <div className="mt-1">
              {item.stock > 5 ? (
                <span className="text-sm text-green-600">In Stock</span>
              ) : item.stock > 0 ? (
                <span className="text-sm text-orange-600">
                  Only {item.stock} left in stock
                </span>
              ) : (
                <span className="text-sm text-red-600">Out of Stock</span>
              )}
            </div>

            {/* Price Mobile View */}
            <div className="mt-2 sm:hidden">
              <span className="text-xl font-bold text-gray-900">
                ${itemTotal.toFixed(2)}
              </span>
              <span className="text-sm text-gray-500 ml-2">
                (${item.price.toFixed(2)} each)
              </span>
            </div>
          </div>

          {/* Desktop Price */}
          <div className="hidden sm:block text-right">
            <span className="text-xl font-bold text-gray-900">
              ${itemTotal.toFixed(2)}
            </span>
            <div className="text-sm text-gray-500">
              ${item.price.toFixed(2)} each
            </div>
          </div>
        </div>

        {/* Action Buttons and Quantity */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
          {/* Quantity Selector */}
          <div className="flex items-center">
            <label className="text-sm text-gray-600 mr-3 sm:hidden">
              Quantity:
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={handleDecrement}
                disabled={isUpdating}
                className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-medium">
                {item.quantity}
              </span>
              <button
                onClick={handleIncrement}
                disabled={isUpdating || item.quantity >= item.stock}
                className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <span className="ml-3 text-sm text-gray-500 hidden sm:inline">
              max {item.stock}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {onMoveToWishlist && (
              <button
                onClick={handleMoveToWishlist}
                disabled={isUpdating}
                className="flex items-center text-gray-600 hover:text-red-500 transition-colors disabled:opacity-50"
                aria-label="Move to wishlist"
              >
                <Heart className="w-5 h-5 mr-1" />
                <span className="text-sm sm:inline">Wishlist</span>
              </button>
            )}

            <button
              onClick={handleRemove}
              disabled={isUpdating}
              className="flex items-center text-gray-600 hover:text-red-600 transition-colors disabled:opacity-50"
              aria-label="Remove item"
            >
              <Trash2 className="w-5 h-5 mr-1" />
              <span className="text-sm sm:inline">Remove</span>
            </button>
          </div>
        </div>

        {/* Mobile Stock Warning */}
        {item.stock <= 5 && item.stock > 0 && (
          <div className="mt-2 sm:hidden text-sm text-orange-600">
            Only {item.stock} left in stock - order soon
          </div>
        )}
      </div>
    </div>
  );
};

export default CartItem;
