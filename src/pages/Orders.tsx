import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  // ChevronRight,
  Eye,
  Download,
  Printer,
  Search,
  // Filter,
  // Calendar,
  DollarSign,
  MapPin,
  ShoppingBag,
  RotateCcw,
  Loader,
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Tabs from "../components/ui/Tabs";
import Modal from "../components/ui/Modal";
import type { Order } from "../types";
import { useAuthStore } from "../store/authStore";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const { user, token } = useAuthStore();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, activeTab, pagination.page]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/orders?page=${pagination.page}&limit=${pagination.limit}`;

      // Add status filter based on active tab
      if (activeTab !== "all") {
        url += `&status=${activeTab}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setOrders(response.data.data);
        setFilteredOrders(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error: any) {
      console.error("Failed to fetch orders:", error);
      toast.error(error.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    if (!searchQuery) {
      setFilteredOrders(orders);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = orders.filter(
      (order) =>
        order.orderNumber.toLowerCase().includes(query) ||
        order.items.some((item) => item.title.toLowerCase().includes(query)),
    );
    setFilteredOrders(filtered);
  };

  useEffect(() => {
    filterOrders();
  }, [searchQuery, orders]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "shipped":
        return <Truck className="w-5 h-5 text-blue-500" />;
      case "processing":
        return <Package className="w-5 h-5 text-yellow-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-orange-500" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "success";
      case "shipped":
        return "info";
      case "processing":
        return "warning";
      case "pending":
        return "primary";
      case "cancelled":
        return "error";
      default:
        return "secondary";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "error";
      case "refunded":
        return "info";
      default:
        return "secondary";
    }
  };

  const handleTrackOrder = (order: Order) => {
    if (order.trackingNumber) {
      // In a real app, this would open a tracking modal or redirect to carrier website
      toast.success(`Tracking: ${order.trackingNumber}`);
    } else {
      toast.error("Tracking information not available yet");
    }
  };

  const handleDownloadInvoice = async (_order: Order) => {
    try {
      // In a real app, this would download a PDF invoice
      toast.success("Invoice downloaded");
    } catch (error) {
      toast.error("Failed to download invoice");
    }
  };

  const handleReturnRequest = async (_order: Order) => {
    try {
      // In a real app, this would initiate a return
      toast.success("Return request submitted");
    } catch (error) {
      toast.error("Failed to submit return request");
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const tabs = [
    { id: "all", label: "All Orders" },
    { id: "pending", label: "Pending" },
    { id: "processing", label: "Processing" },
    { id: "shipped", label: "Shipped" },
    { id: "delivered", label: "Delivered" },
    { id: "cancelled", label: "Cancelled" },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Please Login
          </h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to view your orders
          </p>
          <Link to="/login" state={{ from: "/orders" }}>
            <Button variant="primary">Login to Continue</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-2">
            Track, return, or buy items again
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order number or book title..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 overflow-x-auto">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={setActiveTab}
            variant="pills"
          />
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No orders found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? "Try adjusting your search"
                : "You haven't placed any orders yet"}
            </p>
            {!searchQuery && (
              <Link to="/catalog">
                <Button variant="primary">Start Shopping</Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card
                key={order.id}
                className="hover:shadow-lg transition-shadow"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(order.orderStatus)}
                    <div>
                      <p className="text-sm text-gray-500">Order Number</p>
                      <p className="font-semibold text-gray-900">
                        {order.orderNumber}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-sm text-gray-500">Order Date</p>
                      <p className="font-medium text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="font-bold text-gray-900">
                        ${order.total.toFixed(2)}
                      </p>
                    </div>

                    <Badge variant={getStatusColor(order.orderStatus)}>
                      {order.orderStatus}
                    </Badge>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3 mb-4">
                  {order.items.slice(0, 2).map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <img
                        src={item.coverImage || "/placeholder-book.jpg"}
                        alt={item.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <Link
                          to={`/book/${item.bookId}`}
                          className="font-medium text-gray-900 hover:text-blue-600"
                        >
                          {item.title}
                        </Link>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity} • ${item.price.toFixed(2)}{" "}
                          each
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <p className="text-sm text-gray-500 text-center">
                      +{order.items.length - 2} more items
                    </p>
                  )}
                </div>

                {/* Order Actions */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Eye size={16} />}
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowOrderDetails(true);
                    }}
                  >
                    View Details
                  </Button>

                  {order.trackingNumber && (
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Truck size={16} />}
                      onClick={() => handleTrackOrder(order)}
                    >
                      Track Order
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Download size={16} />}
                    onClick={() => handleDownloadInvoice(order)}
                  >
                    Invoice
                  </Button>

                  {order.orderStatus === "delivered" && (
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<RotateCcw size={16} />}
                      onClick={() => handleReturnRequest(order)}
                    >
                      Return
                    </Button>
                  )}
                </div>
              </Card>
            ))}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <Modal
        isOpen={showOrderDetails}
        onClose={() => setShowOrderDetails(false)}
        title={`Order Details - ${selectedOrder?.orderNumber}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Status Timeline */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-4">Order Status</h4>
              <div className="flex items-center justify-between">
                {["pending", "processing", "shipped", "delivered"].map(
                  (status, index) => {
                    const statuses = [
                      "pending",
                      "processing",
                      "shipped",
                      "delivered",
                    ];
                    const currentIndex = statuses.indexOf(
                      selectedOrder.orderStatus,
                    );
                    const isComplete = index <= currentIndex;
                    const isCurrent = index === currentIndex;

                    return (
                      <div key={status} className="flex-1 text-center">
                        <div className="relative">
                          <div
                            className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                              isComplete
                                ? "bg-green-500 text-white"
                                : "bg-gray-200 text-gray-400"
                            }`}
                          >
                            {index + 1}
                          </div>
                          {index < 3 && (
                            <div
                              className={`absolute top-4 left-1/2 w-full h-0.5 ${
                                index < currentIndex
                                  ? "bg-green-500"
                                  : "bg-gray-200"
                              }`}
                            />
                          )}
                        </div>
                        <p
                          className={`text-sm mt-2 capitalize ${
                            isCurrent
                              ? "font-semibold text-gray-900"
                              : "text-gray-500"
                          }`}
                        >
                          {status}
                        </p>
                      </div>
                    );
                  },
                )}
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
              <div className="space-y-3">
                {selectedOrder.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <img
                      src={item.coverImage || "/placeholder-book.jpg"}
                      alt={item.title}
                      className="w-16 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <Link
                        to={`/book/${item.bookId}`}
                        className="font-medium text-gray-900 hover:text-blue-600"
                        onClick={() => setShowOrderDetails(false)}
                      >
                        {item.title}
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">
                        Quantity: {item.quantity} • ${item.price.toFixed(2)}{" "}
                        each
                      </p>
                    </div>
                    <p className="font-bold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <MapPin size={16} className="mr-2 text-gray-500" />
                  Shipping Address
                </h4>
                <p className="text-sm text-gray-600">
                  {selectedOrder.shippingAddress.fullName}
                  <br />
                  {selectedOrder.shippingAddress.street}
                  <br />
                  {selectedOrder.shippingAddress.city},{" "}
                  {selectedOrder.shippingAddress.state}{" "}
                  {selectedOrder.shippingAddress.zipCode}
                  <br />
                  {selectedOrder.shippingAddress.country}
                  <br />
                  {selectedOrder.shippingAddress.phone}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <DollarSign size={16} className="mr-2 text-gray-500" />
                  Payment Information
                </h4>
                <p className="text-sm text-gray-600">
                  Method: {selectedOrder.paymentMethod}
                  <br />
                  Status:{" "}
                  <Badge
                    variant={getPaymentStatusColor(selectedOrder.paymentStatus)}
                    size="sm"
                  >
                    {selectedOrder.paymentStatus}
                  </Badge>
                  <br />
                  {selectedOrder.trackingNumber && (
                    <>Tracking: {selectedOrder.trackingNumber}</>
                  )}
                </p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-900">
                    ${selectedOrder.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="text-gray-900">
                    ${selectedOrder.shipping.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax:</span>
                  <span className="text-gray-900">
                    ${selectedOrder.tax.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                  <span>Total:</span>
                  <span className="text-blue-600">
                    ${selectedOrder.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                leftIcon={<Printer size={16} />}
                onClick={() => window.print()}
              >
                Print
              </Button>
              <Button
                variant="outline"
                leftIcon={<Download size={16} />}
                onClick={() => handleDownloadInvoice(selectedOrder)}
              >
                Download Invoice
              </Button>
              {selectedOrder.trackingNumber && (
                <Button
                  variant="primary"
                  leftIcon={<Truck size={16} />}
                  onClick={() => handleTrackOrder(selectedOrder)}
                >
                  Track Package
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;
