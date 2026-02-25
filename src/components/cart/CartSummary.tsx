import React from "react";
import { Truck, Shield, Lock, Gift } from "lucide-react";
import type { CartSummary as CartSummaryType } from "../../types";
// import { Link } from "react-router-dom";

interface CartSummaryProps {
  summary: CartSummaryType;
  onCheckout: () => void;
  onApplyPromo?: (code: string) => void;
  isCheckingOut?: boolean;
  itemCount: number;
}

const CartSummary: React.FC<CartSummaryProps> = ({
  summary,
  onCheckout,
  onApplyPromo,
  isCheckingOut = false,
  itemCount,
}) => {
  const [promoCode, setPromoCode] = React.useState("");
  const [isApplyingPromo, setIsApplyingPromo] = React.useState(false);
  const [promoError, setPromoError] = React.useState("");

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;

    setIsApplyingPromo(true);
    setPromoError("");

    try {
      await onApplyPromo?.(promoCode);
      setPromoCode("");
    } catch (error) {
      setPromoError("Invalid promo code");
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const shippingCost =
    summary.shipping === 0 ? "Free" : `$${summary.shipping.toFixed(2)}`;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

      {/* Item Count */}
      <div className="text-sm text-gray-600 mb-4">
        {itemCount} {itemCount === 1 ? "item" : "items"}
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>${summary.subtotal.toFixed(2)}</span>
        </div>

        {summary.discount && summary.discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>-${summary.discount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span>{shippingCost}</span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>Tax</span>
          <span>${summary.tax.toFixed(2)}</span>
        </div>

        <div className="border-t border-gray-200 my-3 pt-3">
          <div className="flex justify-between text-lg font-bold text-gray-900">
            <span>Total</span>
            <span>${summary.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Promo Code Input */}
      {onApplyPromo && (
        <div className="mb-6">
          <label
            htmlFor="promo"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Promo Code
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="promo"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="Enter code"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isApplyingPromo}
            />
            <button
              onClick={handleApplyPromo}
              disabled={!promoCode.trim() || isApplyingPromo}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Apply
            </button>
          </div>
          {promoError && (
            <p className="mt-1 text-sm text-red-600">{promoError}</p>
          )}
        </div>
      )}

      {/* Checkout Button */}
      <button
        onClick={onCheckout}
        disabled={isCheckingOut || itemCount === 0}
        className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mb-4 flex items-center justify-center"
      >
        {isCheckingOut ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
            Processing...
          </>
        ) : (
          "Proceed to Checkout"
        )}
      </button>

      {/* Payment Icons */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        <div className="text-gray-400 text-sm flex items-center">
          <Lock className="w-4 h-4 mr-1" />
          Secure
        </div>
        <div className="text-gray-400 text-sm flex items-center">
          <Shield className="w-4 h-4 mr-1" />
          Protected
        </div>
        <div className="text-gray-400 text-sm flex items-center">
          <Truck className="w-4 h-4 mr-1" />
          Free Ship
        </div>
      </div>

      {/* Payment Methods */}
      <div className="flex items-center justify-center space-x-2">
        <img
          src="/visa.svg"
          alt="Visa"
          className="h-6 opacity-50 hover:opacity-100 transition-opacity"
        />
        <img
          src="/mastercard.svg"
          alt="Mastercard"
          className="h-6 opacity-50 hover:opacity-100 transition-opacity"
        />
        <img
          src="/amex.svg"
          alt="American Express"
          className="h-6 opacity-50 hover:opacity-100 transition-opacity"
        />
        <img
          src="/paypal.svg"
          alt="PayPal"
          className="h-6 opacity-50 hover:opacity-100 transition-opacity"
        />
      </div>

      {/* Shipping Notice */}
      {summary.subtotal < 25 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700 flex items-start">
          <Gift className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
          <span>
            Add ${(25 - summary.subtotal).toFixed(2)} more to qualify for free
            shipping!
          </span>
        </div>
      )}
    </div>
  );
};

export default CartSummary;
