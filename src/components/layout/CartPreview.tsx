import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, X, Trash2, ArrowRight } from "lucide-react";
import { useCartStore } from "../../store/cartStore";
import toast from "react-hot-toast";

interface CartPreviewProps {
  onClose: () => void;
}

const CartPreview: React.FC<CartPreviewProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { items, totalItems, totalPrice, removeItem } = useCartStore();

  const handleRemoveItem = (bookId: string, title: string) => {
    removeItem(bookId);
    toast.success(`Removed "${title}" from cart`);
  };

  const handleViewCart = () => {
    navigate("/cart");
    onClose();
  };

  const handleCheckout = () => {
    navigate("/checkout");
    onClose();
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Your cart is empty
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Looks like you haven't added any books yet.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">
          Shopping Cart ({totalItems} {totalItems === 1 ? "item" : "items"})
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Items List */}
      <div className="max-h-96 overflow-y-auto">
        {items.slice(0, 3).map((item) => (
          <div
            key={item.bookId}
            className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <div className="flex gap-3">
              <img
                src={item.coverImage || "/placeholder-book.jpg"}
                alt={item.title}
                className="w-16 h-20 object-cover rounded"
              />
              <div className="flex-1">
                <Link
                  to={`/book/${item.bookId}`}
                  onClick={onClose}
                  className="font-medium text-gray-900 hover:text-blue-600 line-clamp-2"
                >
                  {item.title}
                </Link>
                <p className="text-sm text-gray-500 mt-1">
                  Quantity: {item.quantity}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-bold text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleRemoveItem(item.bookId, item.title)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {items.length > 3 && (
          <div className="p-3 text-center border-b border-gray-100">
            <Link
              to="/cart"
              onClick={onClose}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              +{items.length - 3} more items in cart
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">Subtotal:</span>
          <span className="text-xl font-bold text-gray-900">
            ${totalPrice.toFixed(2)}
          </span>
        </div>

        <div className="space-y-2">
          <button
            onClick={handleCheckout}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            Proceed to Checkout
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>

          <button
            onClick={handleViewCart}
            className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            View Cart
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          Free shipping on orders over $25
        </p>
      </div>
    </div>
  );
};

export default CartPreview;
