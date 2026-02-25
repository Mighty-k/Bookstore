import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  ArrowLeft,
  Trash2,
  AlertCircle,
  Truck,
} from "lucide-react";
import CartItem from "../components/cart/CartItem";
import CartSummary from "../components/cart/CartSummary";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import type { CartSummary as CartSummaryType } from "../types";
import toast from "react-hot-toast";

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    totalItems,
    totalPrice,
  } = useCartStore();
  const { user } = useAuthStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  // Calculate cart summary
  const calculateSummary = (): CartSummaryType => {
    const subtotal = totalPrice;
    const shipping = subtotal >= 25 ? 0 : 4.99;
    const tax = subtotal * 0.08; // 8% tax rate
    const total = subtotal + shipping + tax;

    return {
      subtotal,
      shipping,
      tax,
      total,
    };
  };

  const [summary, setSummary] = useState(calculateSummary());

  // Update summary when items change
  useEffect(() => {
    setSummary(calculateSummary());
  }, [items, totalPrice]);

  const handleUpdateQuantity = async (bookId: string, newQuantity: number) => {
    setUpdatingItems((prev) => new Set(prev).add(bookId));

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    updateQuantity(bookId, newQuantity);
    setUpdatingItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(bookId);
      return newSet;
    });
  };

  const handleRemoveItem = (bookId: string) => {
    removeItem(bookId);
  };

  const handleApplyPromo = async (code: string) => {
    // Simulate promo code validation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (code === "SAVE20") {
      // Apply 20% discount
      setSummary((prev) => ({
        ...prev,
        discount: prev.subtotal * 0.2,
        total: prev.total - prev.subtotal * 0.2,
      }));
      toast.success("Promo code applied! 20% discount");
    } else if (code === "FREESHIP") {
      // Apply free shipping
      setSummary((prev) => ({
        ...prev,
        shipping: 0,
        total: prev.total - prev.shipping,
      }));
      toast.success("Free shipping applied!");
    } else {
      throw new Error("Invalid code");
    }
  };

  const handleCheckout = () => {
    if (!user) {
      // Save current cart to redirect back after login
      sessionStorage.setItem("redirectAfterLogin", "/checkout");
      navigate("/login", { state: { from: "/cart" } });
      toast.error("Please login to checkout");
      return;
    }

    setIsCheckingOut(true);
    // Simulate checkout preparation
    setTimeout(() => {
      setIsCheckingOut(false);
      navigate("/checkout");
    }, 1500);
  };

  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      clearCart();
      toast.success("Cart cleared");
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <div className="text-gray-400 mb-4">
              <ShoppingBag className="w-20 h-20 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any books to your cart yet.
            </p>
            <Link
              to="/catalog"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Continue Shopping
            </Link>
          </div>
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
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-600 mt-2">
              {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
            </p>
          </div>

          <button
            onClick={handleClearCart}
            className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Clear Cart
          </button>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1">
            <div className="space-y-4">
              {items.map((item) => (
                <CartItem
                  key={item.bookId}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemoveItem}
                  onMoveToWishlist={() => {
                    // Handle move to wishlist
                    toast.success("Feature coming soon!");
                  }}
                  isUpdating={updatingItems.has(item.bookId)}
                />
              ))}
            </div>

            {/* Continue Shopping Link */}
            <div className="mt-6">
              <Link
                to="/catalog"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Link>
            </div>

            {/* Free Shipping Progress */}
            {summary.subtotal < 25 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center text-blue-700 mb-2">
                  <Truck className="w-5 h-5 mr-2" />
                  <span className="font-medium">Free Shipping Progress</span>
                </div>
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block text-blue-600">
                        ${summary.subtotal.toFixed(2)} spent
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-blue-600">
                        ${25 - summary.subtotal} to go
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                    <div
                      style={{ width: `${(summary.subtotal / 25) * 100}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Recently Viewed or Recommendations */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                You might also like
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Add recommended books here */}
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="aspect-w-1 aspect-h-1 mb-2">
                    <div className="bg-gray-200 rounded animate-pulse h-24" />
                  </div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                </div>
                {/* Repeat for more recommendations */}
              </div>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:w-96">
            <CartSummary
              summary={summary}
              onCheckout={handleCheckout}
              onApplyPromo={handleApplyPromo}
              isCheckingOut={isCheckingOut}
              itemCount={totalItems}
            />

            {/* Trust Badges */}
            <div className="mt-4 bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="text-xs text-gray-500">
                  <p className="mb-1">Secure checkout powered by Stripe</p>
                  <p>Your payment information is encrypted and secure.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
