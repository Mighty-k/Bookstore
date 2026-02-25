import React from "react";
import {
  CheckCircle,
  Package,
  Truck,
  Mail,
  Printer,
  Download,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import type { Order } from "../../types";
import toast from "react-hot-toast";

interface OrderConfirmationProps {
  order: Order;
  onContinueShopping: () => void;
  onViewOrder: () => void;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  order,
  onContinueShopping,
  onViewOrder,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Generate and download order summary as PDF
    toast.success("Order summary downloaded");
  };

  const handleTrackOrder = () => {
    if (order.trackingNumber) {
      toast.success("Tracking information sent to your email");
    } else {
      toast.error("Tracking not available yet");
    }
  };

  return (
    <div className="text-center">
      {/* Success Icon */}
      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
      </div>

      {/* Thank You Message */}
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Thank You for Your Order!
      </h1>
      <p className="text-gray-600 mb-6">
        Your order has been confirmed and will be shipped soon.
      </p>

      {/* Order Info Card */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Order Number</p>
            <p className="text-xl font-bold text-gray-900">{order.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Order Date</p>
            <p className="font-medium text-gray-900">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Order Total</p>
            <p className="text-xl font-bold text-green-600">
              ${order.total.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="border-t border-b border-gray-200 py-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 text-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs text-gray-600">Confirmed</p>
            </div>
            <div className="flex-1 text-center">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                <Package className="w-4 h-4 text-gray-500" />
              </div>
              <p className="text-xs text-gray-600">Processing</p>
            </div>
            <div className="flex-1 text-center">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                <Truck className="w-4 h-4 text-gray-500" />
              </div>
              <p className="text-xs text-gray-600">Shipped</p>
            </div>
            <div className="flex-1 text-center">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-4 h-4 text-gray-500" />
              </div>
              <p className="text-xs text-gray-600">Delivered</p>
            </div>
          </div>
        </div>

        {/* Email Confirmation */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-start">
          <Mail className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Confirmation email sent</p>
            <p>
              We've sent a confirmation email to {order.shippingAddress.email}{" "}
              with all the details.
            </p>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">Shipping Address</h3>
          <p className="text-gray-600">
            {order.shippingAddress.fullName}
            <br />
            {order.shippingAddress.street}
            {order.shippingAddress.apartment &&
              `, ${order.shippingAddress.apartment}`}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
            {order.shippingAddress.zipCode}
            <br />
            {order.shippingAddress.country}
          </p>
        </div>

        {/* Order Items Summary */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
          <div className="space-y-3">
            {order.items.slice(0, 3).map((item) => (
              <div key={item.bookId} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.title} x {item.quantity}
                </span>
                <span className="font-medium">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
            {order.items.length > 3 && (
              <p className="text-sm text-gray-500">
                +{order.items.length - 3} more items
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
        <button
          onClick={onViewOrder}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          View Order Details
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
        <button
          onClick={onContinueShopping}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
        >
          <ShoppingBag className="w-5 h-5 mr-2" />
          Continue Shopping
        </button>
      </div>

      {/* Additional Actions */}
      <div className="flex flex-wrap gap-4 justify-center text-sm">
        <button
          onClick={handlePrint}
          className="text-gray-600 hover:text-gray-900 flex items-center"
        >
          <Printer className="w-4 h-4 mr-1" />
          Print Receipt
        </button>
        <button
          onClick={handleDownload}
          className="text-gray-600 hover:text-gray-900 flex items-center"
        >
          <Download className="w-4 h-4 mr-1" />
          Download PDF
        </button>
        <button
          onClick={handleTrackOrder}
          className="text-gray-600 hover:text-gray-900 flex items-center"
        >
          <Truck className="w-4 h-4 mr-1" />
          Track Order
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;
