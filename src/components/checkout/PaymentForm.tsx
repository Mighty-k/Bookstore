import React, { useState } from "react";
import {
  CreditCard,
  Landmark,
  Wallet,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Lock,
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import type { PaymentMethod } from "../../types";
import toast from "react-hot-toast";

// Initialize Stripe
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_sample",
);

type PaymentType = "card" | "bank" | "paypal";

interface PaymentFormProps {
  onSubmit: (method: PaymentMethod) => void;
  onBack: () => void;
  amount: number;
}

const PaymentFormContent: React.FC<PaymentFormProps> = ({
  onSubmit,
  onBack,
  amount,
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const [paymentType, setPaymentType] = useState<PaymentType>("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [saveCard, setSaveCard] = useState(false);

  const handleCardChange = (event: any) => {
    setCardError(event.error ? event.error.message : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setCardError(null);

    try {
      if (paymentType === "card") {
        const cardElement = elements.getElement(CardElement);

        if (!cardElement) {
          throw new Error("Card element not found");
        }

        // Simulate payment processing
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // In production, you would:
        // 1. Create a payment intent on your server
        // 2. Confirm the card payment
        // 3. Handle the response

        const paymentMethod: PaymentMethod = {
          id: `pm_${Date.now()}`,
          type: "card",
          card: {
            brand: "visa",
            last4: "4242",
            expMonth: 12,
            expYear: 2025,
          },
          isDefault: saveCard,
        };

        onSubmit(paymentMethod);
        toast.success("Payment method added successfully");
      } else if (paymentType === "bank") {
        // Handle bank transfer
        toast.success("Bank transfer selected");
        onSubmit({
          id: `bank_${Date.now()}`,
          type: "bank_transfer",
          isDefault: saveCard,
        });
      } else if (paymentType === "paypal") {
        // Handle PayPal
        toast.success("PayPal selected");
        onSubmit({
          id: `paypal_${Date.now()}`,
          type: "paypal",
          isDefault: saveCard,
        });
      }
    } catch (error) {
      setCardError("Payment failed. Please try again.");
      toast.error("Payment processing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        "::placeholder": {
          color: "#aab7c4",
        },
        padding: "10px 12px",
      },
      invalid: {
        color: "#9e2146",
        iconColor: "#fa755a",
      },
    },
    hidePostalCode: true,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Method</h2>

      {/* Payment Type Selection */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <button
          type="button"
          onClick={() => setPaymentType("card")}
          className={`p-4 border rounded-lg flex flex-col items-center transition-all ${
            paymentType === "card"
              ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200"
              : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
          }`}
        >
          <CreditCard
            className={`w-6 h-6 mb-2 ${
              paymentType === "card" ? "text-blue-600" : "text-gray-500"
            }`}
          />
          <span
            className={`text-sm font-medium ${
              paymentType === "card" ? "text-blue-600" : "text-gray-700"
            }`}
          >
            Card
          </span>
        </button>

        <button
          type="button"
          onClick={() => setPaymentType("bank")}
          className={`p-4 border rounded-lg flex flex-col items-center transition-all ${
            paymentType === "bank"
              ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200"
              : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
          }`}
        >
          <Landmark
            className={`w-6 h-6 mb-2 ${
              paymentType === "bank" ? "text-blue-600" : "text-gray-500"
            }`}
          />
          <span
            className={`text-sm font-medium ${
              paymentType === "bank" ? "text-blue-600" : "text-gray-700"
            }`}
          >
            Bank
          </span>
        </button>

        <button
          type="button"
          onClick={() => setPaymentType("paypal")}
          className={`p-4 border rounded-lg flex flex-col items-center transition-all ${
            paymentType === "paypal"
              ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200"
              : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
          }`}
        >
          <Wallet
            className={`w-6 h-6 mb-2 ${
              paymentType === "paypal" ? "text-blue-600" : "text-gray-500"
            }`}
          />
          <span
            className={`text-sm font-medium ${
              paymentType === "paypal" ? "text-blue-600" : "text-gray-700"
            }`}
          >
            PayPal
          </span>
        </button>
      </div>

      {/* Payment Form Fields */}
      {paymentType === "card" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Details
            </label>
            <div
              className={`p-4 border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 ${
                cardError ? "border-red-500" : "border-gray-300"
              }`}
            >
              <CardElement
                options={cardElementOptions}
                onChange={handleCardChange}
              />
            </div>
            {cardError && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {cardError}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name on Card
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ZIP Code
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="94105"
                required
              />
            </div>
          </div>
        </div>
      )}

      {paymentType === "bank" && (
        <div className="p-6 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-4">
            Bank Transfer Details
          </h3>
          <div className="space-y-3 text-sm">
            <p className="flex justify-between">
              <span className="text-gray-600">Bank:</span>
              <span className="font-medium">Chase Bank</span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-600">Account Name:</span>
              <span className="font-medium">Bookstore Inc.</span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-600">Routing Number:</span>
              <span className="font-medium">021000021</span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-600">Account Number:</span>
              <span className="font-medium">****1234</span>
            </p>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            Your order will be processed after we receive the bank transfer.
            This typically takes 1-2 business days.
          </p>
        </div>
      )}

      {paymentType === "paypal" && (
        <div className="p-6 bg-gray-50 rounded-lg text-center">
          <Wallet className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-700 mb-4">
            You'll be redirected to PayPal to complete your payment.
          </p>
          <button
            type="button"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue with PayPal
          </button>
        </div>
      )}

      {/* Save Payment Method */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="saveCard"
          checked={saveCard}
          onChange={(e) => setSaveCard(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="saveCard" className="ml-2 text-sm text-gray-700">
          Save this payment method for future purchases
        </label>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">Order Summary</h3>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Amount:</span>
          <span className="font-bold text-gray-900">${amount.toFixed(2)}</span>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Back to Shipping
        </button>
        <button
          type="submit"
          disabled={
            isProcessing || !stripe || (paymentType === "card" && !elements)
          }
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors flex items-center"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
              Processing...
            </>
          ) : (
            <>
              Review Order
              <ChevronRight className="w-5 h-5 ml-2" />
            </>
          )}
        </button>
      </div>

      {/* Security Note */}
      <p className="text-xs text-gray-500 flex items-center justify-center">
        <Lock className="w-3 h-3 mr-1" />
        Your payment information is encrypted and secure
      </p>
    </form>
  );
};

// Wrapper component with Stripe provider
const PaymentForm: React.FC<PaymentFormProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormContent {...props} />
    </Elements>
  );
};

export default PaymentForm;
