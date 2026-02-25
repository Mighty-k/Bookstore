import React from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  CheckCircle,
  MapPin,
  CreditCard,
  Package,
  Edit,
  Truck,
  Shield,
  Lock,
} from "lucide-react";
import type { CartItem, Address, PaymentMethod } from "../../types";

interface OrderReviewProps {
  items: CartItem[];
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: PaymentMethod;
  subtotal: number;
  tax: number;
  shipping: number;
  onBack: () => void;
  onPlaceOrder: () => void;
  isProcessing: boolean;
}

const OrderReview: React.FC<OrderReviewProps> = ({
  items,
  shippingAddress,
  billingAddress,
  paymentMethod,
  subtotal,
  tax,
  shipping,
  onBack,
  onPlaceOrder,
  isProcessing,
}) => {
  const total = subtotal + tax + shipping;

  const formatAddress = (address: Address) => {
    return `${address.street}${address.apartment ? `, ${address.apartment}` : ""}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`;
  };

  const getPaymentDisplay = () => {
    if (paymentMethod.type === "card" && paymentMethod.card) {
      return `${paymentMethod.card.brand.toUpperCase()} •••• ${paymentMethod.card.last4}`;
    } else if (paymentMethod.type === "bank_transfer") {
      return "Bank Transfer";
    } else if (paymentMethod.type === "paypal") {
      return "PayPal";
    }
    return "Payment Method";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Review Your Order</h2>
        <div className="flex items-center text-green-600">
          <CheckCircle className="w-5 h-5 mr-2" />
          <span className="text-sm">All steps completed</span>
        </div>
      </div>

      {/* Items Review */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Order Items ({items.length})
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {items.map((item) => (
            <div key={item.bookId} className="p-4 flex items-center gap-4">
              <img
                src={item.coverImage || "/placeholder-book.jpg"}
                alt={item.title}
                className="w-16 h-20 object-cover rounded"
              />
              <div className="flex-1">
                <Link
                  to={`/book/${item.bookId}`}
                  className="font-medium text-gray-900 hover:text-blue-600"
                >
                  {item.title}
                </Link>
                <p className="text-sm text-gray-500">
                  Quantity: {item.quantity}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">
                  ${item.price.toFixed(2)} each
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping & Payment Review */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping Address */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-gray-500" />
              Shipping Address
            </h3>
            <button
              onClick={onBack}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </button>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p className="font-medium text-gray-900">
              {shippingAddress.fullName}
            </p>
            <p>{formatAddress(shippingAddress)}</p>
            <p>{shippingAddress.email}</p>
            <p>{shippingAddress.phone}</p>
          </div>
        </div>

        {/* Payment Method */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-gray-500" />
              Payment Method
            </h3>
            <button
              onClick={onBack}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </button>
          </div>
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-900">{getPaymentDisplay()}</p>
            {paymentMethod.type === "card" && (
              <p>
                Expires {paymentMethod.card?.expMonth}/
                {paymentMethod.card?.expYear}
              </p>
            )}
            {paymentMethod.type === "bank_transfer" && (
              <p className="mt-2 text-xs text-gray-500">
                Please complete your bank transfer within 24 hours
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Billing Address (if different) */}
      {shippingAddress !== billingAddress && (
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 flex items-center mb-3">
            <MapPin className="w-5 h-5 mr-2 text-gray-500" />
            Billing Address
          </h3>
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-900">
              {billingAddress.fullName}
            </p>
            <p>{formatAddress(billingAddress)}</p>
          </div>
        </div>
      )}

      {/* Price Summary */}
      <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-4">Price Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-200 pt-3 mt-3">
            <div className="flex justify-between text-lg font-bold text-gray-900">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Estimate */}
      <div className="bg-blue-50 p-4 rounded-lg flex items-start">
        <Truck className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">Estimated Delivery</p>
          <p>
            {shipping === 0 ? "Free shipping" : "Standard shipping"} •{" "}
            {new Date(
              Date.now() + 5 * 24 * 60 * 60 * 1000,
            ).toLocaleDateString()}{" "}
            -
            {new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000,
            ).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Terms and Place Order */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-start mb-6">
          <input
            type="checkbox"
            id="terms"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
            required
          />
          <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
            I agree to the{" "}
            <Link to="/terms" className="text-blue-600 hover:text-blue-800">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-blue-600 hover:text-blue-800">
              Privacy Policy
            </Link>
            . I understand that my order will be processed immediately.
          </label>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back to Payment
          </button>
          <button
            onClick={onPlaceOrder}
            disabled={isProcessing}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors flex items-center text-lg font-semibold"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                Processing...
              </>
            ) : (
              <>
                Place Order
                <Shield className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Secure Checkout Notice */}
      <p className="text-xs text-gray-500 flex items-center justify-center">
        <Lock className="w-3 h-3 mr-1" />
        By placing your order, you agree to our terms and conditions
      </p>
    </div>
  );
};

export default OrderReview;
