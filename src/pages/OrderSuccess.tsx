import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { CheckCircle, Package, Truck, Calendar, Home } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const OrderSuccess: React.FC = () => {
  const { orderNumber } = useParams();
  const { token } = useAuthStore();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/orders/number/${orderNumber}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setOrder(response.data.data);
      } catch (error) {
        console.error("Failed to fetch order:", error);
      } finally {
        setLoading(false);
      }
    };

    if (orderNumber && token) {
      fetchOrder();
    }
  }, [orderNumber, token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h1>

          <p className="text-gray-600 mb-6">
            Thank you for your purchase. Your order has been received.
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Order Number</span>
              <span className="font-mono font-bold">{order?.orderNumber}</span>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center gap-4 mb-4">
                <Package className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium">Order Status</p>
                  <p className="text-sm text-gray-500 capitalize">
                    {order?.orderStatus}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <Truck className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium">Estimated Delivery</p>
                  <p className="text-sm text-gray-500">
                    {order?.estimatedDelivery
                      ? new Date(order.estimatedDelivery).toLocaleDateString()
                      : "Processing"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium">Order Date</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order?.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              to="/orders"
              className="block w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
            >
              View All Orders
            </Link>
            <Link
              to="/"
              className="block w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50"
            >
              <Home className="w-4 h-4 inline mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
