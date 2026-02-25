import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Truck,
  Printer,
  Mail,
  RefreshCw,
  DollarSign,
  User,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Tabs from "../../components/ui/Tabs";
import Pagination from "../../components/ui/Pagination";
import { useDebounce } from "../../hooks/useDebounce";
import toast from "react-hot-toast";

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  trackingNumber?: string;
  estimatedDelivery?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderFilters {
  search: string;
  status: string[];
  paymentStatus: string[];
  dateRange: {
    start: string;
    end: string;
  };
  minAmount: number;
  maxAmount: number;
  sortBy: "date" | "amount" | "status";
  sortOrder: "asc" | "desc";
}

const OrdersManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [filters, setFilters] = useState<OrderFilters>({
    search: "",
    status: [],
    paymentStatus: [],
    dateRange: {
      start: "",
      end: "",
    },
    minAmount: 0,
    maxAmount: 1000,
    sortBy: "date",
    sortOrder: "desc",
  });

  const debouncedSearch = useDebounce(filters.search, 500);

  // Mock data
  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, filters, debouncedSearch, currentPage]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock orders data
      const mockOrders: Order[] = Array.from({ length: 50 }, (_, i) => ({
        id: `order-${i + 1}`,
        orderNumber: `ORD-${String(i + 1).padStart(6, "0")}`,
        customer: {
          id: `cust-${i + 1}`,
          name: `Customer ${i + 1}`,
          email: `customer${i + 1}@example.com`,
        },
        items: [
          {
            id: `item-${i + 1}-1`,
            title: `Book Title ${i + 1}`,
            quantity: Math.floor(Math.random() * 3) + 1,
            price: Math.floor(Math.random() * 50) + 10,
            image: "/placeholder-book.jpg",
          },
        ],
        subtotal: 0,
        tax: 0,
        shipping: 4.99,
        total: 0,
        status: ["pending", "processing", "shipped", "delivered", "cancelled"][
          Math.floor(Math.random() * 5)
        ] as Order["status"],
        paymentStatus: ["pending", "paid", "failed", "refunded"][
          Math.floor(Math.random() * 4)
        ] as Order["paymentStatus"],
        paymentMethod: ["Credit Card", "PayPal", "Bank Transfer"][
          Math.floor(Math.random() * 3)
        ],
        shippingAddress: {
          street: "123 Main St",
          city: "San Francisco",
          state: "CA",
          zipCode: "94105",
          country: "USA",
          phone: "+1234567890",
        },
        createdAt: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      // Calculate totals
      mockOrders.forEach((order) => {
        order.subtotal = order.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );
        order.tax = order.subtotal * 0.08;
        order.total = order.subtotal + order.tax + order.shipping;
      });

      setOrders(mockOrders);
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    // Search filter
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(searchLower) ||
          order.customer.name.toLowerCase().includes(searchLower) ||
          order.customer.email.toLowerCase().includes(searchLower),
      );
    }

    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter((order) =>
        filters.status.includes(order.status),
      );
    }

    // Payment status filter
    if (filters.paymentStatus.length > 0) {
      filtered = filtered.filter((order) =>
        filters.paymentStatus.includes(order.paymentStatus),
      );
    }

    // Date range filter
    if (filters.dateRange.start) {
      filtered = filtered.filter(
        (order) =>
          new Date(order.createdAt) >= new Date(filters.dateRange.start),
      );
    }
    if (filters.dateRange.end) {
      filtered = filtered.filter(
        (order) => new Date(order.createdAt) <= new Date(filters.dateRange.end),
      );
    }

    // Amount filter
    filtered = filtered.filter(
      (order) =>
        order.total >= filters.minAmount && order.total <= filters.maxAmount,
    );

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case "date":
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "amount":
          comparison = a.total - b.total;
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return filters.sortOrder === "asc" ? comparison : -comparison;
    });

    setFilteredOrders(filtered);
  };

  const handleBulkAction = (action: string) => {
    if (selectedOrders.length === 0) {
      toast.error("Please select orders first");
      return;
    }

    switch (action) {
      case "process":
        toast.success(`Processing ${selectedOrders.length} orders`);
        break;
      case "ship":
        toast.success(`Marking ${selectedOrders.length} orders as shipped`);
        break;
      case "delete":
        if (
          window.confirm(
            `Are you sure you want to delete ${selectedOrders.length} orders?`,
          )
        ) {
          setOrders(
            orders.filter((order) => !selectedOrders.includes(order.id)),
          );
          setSelectedOrders([]);
          toast.success("Orders deleted");
        }
        break;
      default:
        break;
    }
    setShowBulkActions(false);
  };

  const handleStatusChange = (orderId: string, newStatus: Order["status"]) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order,
      ),
    );
    toast.success(`Order status updated to ${newStatus}`);
  };

  const handleDeleteOrder = (orderId: string) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      setOrders(orders.filter((order) => order.id !== orderId));
      toast.success("Order deleted");
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
      case "refunded":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle size={16} />;
      case "shipped":
        return <Truck size={16} />;
      case "processing":
        return <Package size={16} />;
      case "pending":
        return <Clock size={16} />;
      case "cancelled":
        return <XCircle size={16} />;
      case "refunded":
        return <RefreshCw size={16} />;
      default:
        return null;
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

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const tabs = [
    { id: "all", label: "All Orders" },
    { id: "pending", label: "Pending" },
    { id: "processing", label: "Processing" },
    { id: "shipped", label: "Shipped" },
    { id: "delivered", label: "Delivered" },
    { id: "cancelled", label: "Cancelled" },
  ];

  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (activeTab === "all") {
      setFilters((prev) => ({ ...prev, status: [] }));
    } else {
      setFilters((prev) => ({ ...prev, status: [activeTab] }));
    }
  }, [activeTab]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Orders Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and track all customer orders
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            leftIcon={<Filter size={16} />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
          <Button
            variant="outline"
            leftIcon={<Download size={16} />}
            onClick={() => setShowExportModal(true)}
          >
            Export
          </Button>
          {selectedOrders.length > 0 && (
            <Button
              variant="primary"
              leftIcon={<Edit size={16} />}
              onClick={() => setShowBulkActions(true)}
            >
              Bulk Actions ({selectedOrders.length})
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="pills"
      />

      {/* Filters */}
      {showFilters && (
        <Card className="animate-slideDown">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Input
              label="Search"
              placeholder="Order #, customer..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              leftIcon={<Search size={16} />}
            />

            <Select
              label="Status"
              placeholder="All Statuses"
              value={filters.status}
              onChange={(value) =>
                setFilters({ ...filters, status: value as string[] })
              }
              options={[
                { value: "pending", label: "Pending" },
                { value: "processing", label: "Processing" },
                { value: "shipped", label: "Shipped" },
                { value: "delivered", label: "Delivered" },
                { value: "cancelled", label: "Cancelled" },
              ]}
              multiple
            />

            <Select
              label="Payment Status"
              placeholder="All Payment Statuses"
              value={filters.paymentStatus}
              onChange={(value) =>
                setFilters({ ...filters, paymentStatus: value as string[] })
              }
              options={[
                { value: "pending", label: "Pending" },
                { value: "paid", label: "Paid" },
                { value: "failed", label: "Failed" },
                { value: "refunded", label: "Refunded" },
              ]}
              multiple
            />

            <Input
              label="Min Amount"
              type="number"
              value={filters.minAmount}
              onChange={(e) =>
                setFilters({ ...filters, minAmount: Number(e.target.value) })
              }
              leftIcon={<DollarSign size={16} />}
            />

            <Input
              label="Max Amount"
              type="number"
              value={filters.maxAmount}
              onChange={(e) =>
                setFilters({ ...filters, maxAmount: Number(e.target.value) })
              }
              leftIcon={<DollarSign size={16} />}
            />
          </div>

          <div className="flex justify-end mt-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilters({
                  search: "",
                  status: [],
                  paymentStatus: [],
                  dateRange: { start: "", end: "" },
                  minAmount: 0,
                  maxAmount: 1000,
                  sortBy: "date",
                  sortOrder: "desc",
                });
              }}
            >
              Clear Filters
            </Button>
            <Button size="sm">Apply Filters</Button>
          </div>
        </Card>
      )}

      {/* Orders Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedOrders.length === currentOrders.length &&
                      currentOrders.length > 0
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedOrders(currentOrders.map((o) => o.id));
                      } else {
                        setSelectedOrders([]);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Order
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Items
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Payment
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : currentOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No orders found
                  </td>
                </tr>
              ) : (
                currentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedOrders([...selectedOrders, order.id]);
                          } else {
                            setSelectedOrders(
                              selectedOrders.filter((id) => id !== order.id),
                            );
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                          <User size={14} className="text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {order.customer.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.customer.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {order.items.length} item
                        {order.items.length > 1 ? "s" : ""}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-gray-900">
                        ${order.total.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatusColor(order.status)} size="sm">
                        <span className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={getPaymentStatusColor(order.paymentStatus)}
                        size="sm"
                      >
                        {order.paymentStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderDetails(true);
                          }}
                          className="p-1 text-gray-500 hover:text-blue-600"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-1 text-gray-500 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(
                              order.id,
                              e.target.value as Order["status"],
                            )
                          }
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filteredOrders.length > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, filteredOrders.length)} of{" "}
              {filteredOrders.length} results
            </p>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </Card>

      {/* Order Details Modal */}
      <Modal
        isOpen={showOrderDetails}
        onClose={() => setShowOrderDetails(false)}
        title={`Order Details - ${selectedOrder?.orderNumber}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Customer Information
                </h4>
                <p className="font-medium text-gray-900">
                  {selectedOrder.customer.name}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedOrder.customer.email}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedOrder.shippingAddress.phone}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Shipping Address
                </h4>
                <p className="text-sm text-gray-600">
                  {selectedOrder.shippingAddress.street}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedOrder.shippingAddress.city},{" "}
                  {selectedOrder.shippingAddress.state}{" "}
                  {selectedOrder.shippingAddress.zipCode}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedOrder.shippingAddress.country}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Order Items
              </h4>
              <div className="space-y-3">
                {selectedOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-12 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <p className="font-bold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
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
            <div className="flex justify-end gap-3">
              <Button variant="outline" leftIcon={<Printer size={16} />}>
                Print Invoice
              </Button>
              <Button variant="outline" leftIcon={<Mail size={16} />}>
                Email Customer
              </Button>
              <Button
                leftIcon={<Package size={16} />}
                onClick={() => {
                  handleStatusChange(selectedOrder.id, "processing");
                  setShowOrderDetails(false);
                }}
              >
                Process Order
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Bulk Actions Modal */}
      <Modal
        isOpen={showBulkActions}
        onClose={() => setShowBulkActions(false)}
        title="Bulk Actions"
        size="sm"
      >
        <div className="space-y-3">
          <button
            onClick={() => handleBulkAction("process")}
            className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Package className="w-5 h-5 text-blue-600 inline mr-3" />
            <span className="font-medium">Mark as Processing</span>
            <p className="text-sm text-gray-500 ml-8">
              Update status for selected orders
            </p>
          </button>

          <button
            onClick={() => handleBulkAction("ship")}
            className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Truck className="w-5 h-5 text-green-600 inline mr-3" />
            <span className="font-medium">Mark as Shipped</span>
            <p className="text-sm text-gray-500 ml-8">
              Update status for selected orders
            </p>
          </button>

          <button
            onClick={() => handleBulkAction("delete")}
            className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5 text-red-600 inline mr-3" />
            <span className="font-medium">Delete Orders</span>
            <p className="text-sm text-gray-500 ml-8">
              Permanently remove selected orders
            </p>
          </button>
        </div>
      </Modal>

      {/* Export Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Orders"
        size="sm"
      >
        <div className="space-y-4">
          <Select
            label="Export Format"
            placeholder="Select format"
            options={[
              { value: "csv", label: "CSV" },
              { value: "excel", label: "Excel" },
              { value: "pdf", label: "PDF" },
            ]}
            onChange={(value) => console.log(value)}
          />

          <Select
            label="Date Range"
            placeholder="Select range"
            options={[
              { value: "today", label: "Today" },
              { value: "yesterday", label: "Yesterday" },
              { value: "last7", label: "Last 7 Days" },
              { value: "last30", label: "Last 30 Days" },
              { value: "thisMonth", label: "This Month" },
              { value: "lastMonth", label: "Last Month" },
              { value: "custom", label: "Custom Range" },
            ]}
            onChange={(value) => console.log(value)}
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="includeItems"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="includeItems" className="text-sm text-gray-700">
              Include order items
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="includeCustomers"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="includeCustomers" className="text-sm text-gray-700">
              Include customer details
            </label>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowExportModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                toast.success("Export started");
                setShowExportModal(false);
              }}
            >
              Export
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrdersManagement;
