import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import axios from "axios";
import toast from "react-hot-toast";
import {
  // ChevronLeft,
  // ChevronRight,
  Truck,
  CreditCard,
  MapPin,
  Package,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCartStore();
  const { user, token } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || "",
    street: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    phone: "",
  });

  const [paymentMethod, setPaymentMethod] = useState({
    type: "card" as "card" | "bank_transfer" | "paypal",
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  });

  const calculateTotals = () => {
    const subtotal = totalPrice;
    const shipping = subtotal >= 25 ? 0 : 4.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    return { subtotal, shipping, tax, total };
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }

    setLoading(true);
    try {
      const { subtotal, shipping, tax, total } = calculateTotals();

      const orderData = {
        items: items.map((item) => ({
          bookId: item.bookId,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          coverImage: item.coverImage,
        })),
        subtotal,
        shipping,
        tax,
        total,
        shippingAddress,
        billingAddress: shippingAddress, // Same for now
        paymentMethod: {
          type: paymentMethod.type,
          last4: paymentMethod.cardNumber.slice(-4),
          brand: "visa", // Mock for now
        },
      };

      const response = await axios.post(`${API_URL}/orders`, orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        clearCart();
        toast.success("Order placed successfully!");
        navigate(`/orders/${response.data.data.orderNumber}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, shipping, tax, total } = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Checkout Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    s === step
                      ? "bg-blue-600 text-white"
                      : s < step
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {s < step ? "✓" : s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      s < step ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={shippingAddress.fullName}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        fullName: e.target.value,
                      })
                    }
                    className="w-full p-3 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={shippingAddress.street}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        street: e.target.value,
                      })
                    }
                    className="w-full p-3 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Apartment (optional)"
                    value={shippingAddress.apartment}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        apartment: e.target.value,
                      })
                    }
                    className="w-full p-3 border rounded-lg"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="City"
                      value={shippingAddress.city}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          city: e.target.value,
                        })
                      }
                      className="p-3 border rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={shippingAddress.state}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          state: e.target.value,
                        })
                      }
                      className="p-3 border rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="ZIP Code"
                      value={shippingAddress.zipCode}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          zipCode: e.target.value,
                        })
                      }
                      className="p-3 border rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Phone"
                      value={shippingAddress.phone}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          phone: e.target.value,
                        })
                      }
                      className="p-3 border rounded-lg"
                    />
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                  Payment Method
                </h2>
                <div className="space-y-4">
                  <div className="flex gap-4 mb-4">
                    {["card", "paypal", "bank_transfer"].map((method) => (
                      <button
                        key={method}
                        onClick={() =>
                          setPaymentMethod({
                            ...paymentMethod,
                            type: method as any,
                          })
                        }
                        className={`flex-1 p-3 border rounded-lg capitalize ${
                          paymentMethod.type === method
                            ? "border-blue-600 bg-blue-50 text-blue-600"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        {method.replace("_", " ")}
                      </button>
                    ))}
                  </div>

                  {paymentMethod.type === "card" && (
                    <>
                      <input
                        type="text"
                        placeholder="Card Number"
                        value={paymentMethod.cardNumber}
                        onChange={(e) =>
                          setPaymentMethod({
                            ...paymentMethod,
                            cardNumber: e.target.value,
                          })
                        }
                        className="w-full p-3 border rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Name on Card"
                        value={paymentMethod.cardName}
                        onChange={(e) =>
                          setPaymentMethod({
                            ...paymentMethod,
                            cardName: e.target.value,
                          })
                        }
                        className="w-full p-3 border rounded-lg"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={paymentMethod.expiry}
                          onChange={(e) =>
                            setPaymentMethod({
                              ...paymentMethod,
                              expiry: e.target.value,
                            })
                          }
                          className="p-3 border rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="CVV"
                          value={paymentMethod.cvv}
                          onChange={(e) =>
                            setPaymentMethod({
                              ...paymentMethod,
                              cvv: e.target.value,
                            })
                          }
                          className="p-3 border rounded-lg"
                        />
                      </div>
                    </>
                  )}

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
                    >
                      Review Order
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-blue-600" />
                  Review Order
                </h2>

                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Items</h3>
                  {items.map((item) => (
                    <div
                      key={item.bookId}
                      className="flex justify-between py-2 border-b"
                    >
                      <div>
                        <span className="font-medium">{item.title}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          x{item.quantity}
                        </span>
                      </div>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Shipping Address Summary */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Shipping To</h3>
                  <p className="text-gray-600">
                    {shippingAddress.fullName}
                    <br />
                    {shippingAddress.street}
                    <br />
                    {shippingAddress.city}, {shippingAddress.state}{" "}
                    {shippingAddress.zipCode}
                  </p>
                </div>

                {/* Payment Summary */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Payment</h3>
                  <p className="text-gray-600 capitalize">
                    {paymentMethod.type.replace("_", " ")}
                    {paymentMethod.cardNumber &&
                      ` ending in ${paymentMethod.cardNumber.slice(-4)}`}
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                  >
                    {loading ? "Placing Order..." : "Place Order"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-24">
              <h3 className="font-bold text-lg mb-4">Order Summary</h3>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>
                    {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-blue-600">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-500">
                <Truck className="w-4 h-4 inline mr-1" />
                {shipping === 0 ? "Free shipping" : "Standard shipping"}{" "}
                estimated delivery
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
