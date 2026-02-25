import React, { useState /*, useEffect*/ } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  BookOpen,
  Package,
  Eye,
  // MoreVertical,
  Download,
  // Calendar,
  ChevronRight,
  // Star,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  // BarChart,
  // Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  // Legend,
  ResponsiveContainer,
  // LineChart,
  // Line,
} from "recharts";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import ProgressBar from "../../components/ui/ProgressBar";
// import { useAuth } from "../../hooks/useAuth";

interface DashboardStats {
  revenue: {
    total: number;
    change: number;
    trend: "up" | "down";
  };
  orders: {
    total: number;
    change: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
  };
  books: {
    total: number;
    change: number;
    lowStock: number;
    outOfStock: number;
  };
  users: {
    total: number;
    change: number;
    new: number;
    active: number;
  };
}

interface RecentOrder {
  id: string;
  customer: string;
  amount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  date: string;
  items: number;
}

interface TopBook {
  id: string;
  title: string;
  author: string;
  sales: number;
  revenue: number;
  stock: number;
  image: string;
}

const Dashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState("week");
  const [stats] = useState<DashboardStats>({
    revenue: { total: 45678, change: 12.5, trend: "up" },
    orders: {
      total: 1234,
      change: 8.2,
      pending: 45,
      processing: 67,
      shipped: 89,
      delivered: 1033,
    },
    books: { total: 3456, change: 5.3, lowStock: 23, outOfStock: 12 },
    users: { total: 5678, change: 15.3, new: 89, active: 4321 },
  });
  const [recentOrders] = useState<RecentOrder[]>([
    {
      id: "ORD-001",
      customer: "John Doe",
      amount: 89.99,
      status: "delivered",
      date: "2024-01-15",
      items: 3,
    },
    {
      id: "ORD-002",
      customer: "Jane Smith",
      amount: 129.99,
      status: "shipped",
      date: "2024-01-15",
      items: 2,
    },
    {
      id: "ORD-003",
      customer: "Bob Johnson",
      amount: 45.5,
      status: "processing",
      date: "2024-01-14",
      items: 1,
    },
    {
      id: "ORD-004",
      customer: "Alice Brown",
      amount: 199.99,
      status: "pending",
      date: "2024-01-14",
      items: 4,
    },
    {
      id: "ORD-005",
      customer: "Charlie Wilson",
      amount: 67.5,
      status: "delivered",
      date: "2024-01-13",
      items: 2,
    },
  ]);

  const [topBooks] = useState<TopBook[]>([
    {
      id: "1",
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      sales: 234,
      revenue: 3450,
      stock: 45,
      image: "/book1.jpg",
    },
    {
      id: "2",
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      sales: 198,
      revenue: 2970,
      stock: 32,
      image: "/book2.jpg",
    },
    {
      id: "3",
      title: "1984",
      author: "George Orwell",
      sales: 167,
      revenue: 2505,
      stock: 28,
      image: "/book3.jpg",
    },
    {
      id: "4",
      title: "Pride and Prejudice",
      author: "Jane Austen",
      sales: 145,
      revenue: 2175,
      stock: 56,
      image: "/book4.jpg",
    },
    {
      id: "5",
      title: "The Catcher in the Rye",
      author: "J.D. Salinger",
      sales: 123,
      revenue: 1845,
      stock: 15,
      image: "/book5.jpg",
    },
  ]);

  const [salesData] = useState([
    { name: "Mon", sales: 4000, orders: 24 },
    { name: "Tue", sales: 3000, orders: 18 },
    { name: "Wed", sales: 5000, orders: 30 },
    { name: "Thu", sales: 4500, orders: 27 },
    { name: "Fri", sales: 6000, orders: 36 },
    { name: "Sat", sales: 5500, orders: 33 },
    { name: "Sun", sales: 3500, orders: 21 },
  ]);

  const [categoryData] = useState([
    { name: "Fiction", value: 35 },
    { name: "Non-Fiction", value: 25 },
    { name: "Technology", value: 20 },
    { name: "Children", value: 12 },
    { name: "Academic", value: 8 },
  ]);

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle size={16} />;
      case "shipped":
        return <Package size={16} />;
      case "processing":
        return <Clock size={16} />;
      case "pending":
        return <AlertCircle size={16} />;
      case "cancelled":
        return <XCircle size={16} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, Admin! Here's what's happening today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>

          <Button variant="outline" leftIcon={<Download size={16} />}>
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <h3 className="text-2xl font-bold text-gray-900">
                ${stats.revenue.total.toLocaleString()}
              </h3>
              <div className="flex items-center mt-2">
                {stats.revenue.trend === "up" ? (
                  <TrendingUp size={16} className="text-green-500 mr-1" />
                ) : (
                  <TrendingDown size={16} className="text-red-500 mr-1" />
                )}
                <span
                  className={`text-sm font-medium ${
                    stats.revenue.trend === "up"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {stats.revenue.change}%
                </span>
                <span className="text-sm text-gray-500 ml-2">
                  vs last period
                </span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign size={24} className="text-blue-600" />
            </div>
          </div>
        </Card>

        {/* Orders Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Orders</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {stats.orders.total.toLocaleString()}
              </h3>
              <div className="flex items-center mt-2">
                <div className="flex -space-x-1">
                  <Badge variant="warning" size="sm">
                    {stats.orders.pending} Pending
                  </Badge>
                  <Badge variant="info" size="sm">
                    {stats.orders.shipped} Shipped
                  </Badge>
                </div>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <ShoppingBag size={24} className="text-green-600" />
            </div>
          </div>
        </Card>

        {/* Books Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Books</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {stats.books.total.toLocaleString()}
              </h3>
              <div className="flex items-center mt-2 space-x-2">
                <span className="text-sm text-orange-600">
                  {stats.books.lowStock} Low Stock
                </span>
                <span className="text-sm text-red-600">
                  {stats.books.outOfStock} Out of Stock
                </span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <BookOpen size={24} className="text-purple-600" />
            </div>
          </div>
        </Card>

        {/* Users Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Users</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {stats.users.total.toLocaleString()}
              </h3>
              <div className="flex items-center mt-2">
                <Badge variant="success" size="sm" className="mr-2">
                  {stats.users.new} New
                </Badge>
                <span className="text-sm text-gray-500">
                  {stats.users.active} Active
                </span>
              </div>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Users size={24} className="text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Sales Overview
            </h3>
            <select className="text-sm border border-gray-300 rounded-lg px-3 py-1.5">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Distribution */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Sales by Category
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 space-y-2">
            {categoryData.map((category, index) => (
              <div
                key={category.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <div
                    className={`w-3 h-3 rounded-full mr-2`}
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <span className="text-sm text-gray-600">{category.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {category.value}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Orders & Top Books */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Orders
            </h3>
            <Link
              to="/admin/orders"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              View All
              <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Order ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {order.customer}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      ${order.amount}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatusColor(order.status)} size="sm">
                        <span className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {order.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Top Selling Books */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Top Selling Books
            </h3>
            <Link
              to="/admin/books"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              Manage Books
              <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>

          <div className="space-y-4">
            {topBooks.map((book) => (
              <div
                key={book.id}
                className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <img
                  src={book.image || "/placeholder-book.jpg"}
                  alt={book.title}
                  className="w-12 h-16 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">
                    {book.title}
                  </h4>
                  <p className="text-xs text-gray-600">{book.author}</p>
                  <div className="flex items-center mt-2">
                    <ProgressBar
                      value={book.sales}
                      max={250}
                      size="sm"
                      color="blue"
                    />
                    <span className="text-xs text-gray-500 ml-2">
                      {book.sales} sales
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    ${book.revenue}
                  </p>
                  <p className="text-xs text-gray-500">{book.stock} in stock</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/admin/books/add"
            className="p-4 border border-gray-200 rounded-lg text-center hover:bg-gray-50 transition-colors"
          >
            <BookOpen size={24} className="mx-auto mb-2 text-blue-600" />
            <span className="text-sm font-medium text-gray-900">
              Add New Book
            </span>
          </Link>
          <Link
            to="/admin/orders"
            className="p-4 border border-gray-200 rounded-lg text-center hover:bg-gray-50 transition-colors"
          >
            <Package size={24} className="mx-auto mb-2 text-green-600" />
            <span className="text-sm font-medium text-gray-900">
              Process Orders
            </span>
          </Link>
          <Link
            to="/admin/users"
            className="p-4 border border-gray-200 rounded-lg text-center hover:bg-gray-50 transition-colors"
          >
            <Users size={24} className="mx-auto mb-2 text-purple-600" />
            <span className="text-sm font-medium text-gray-900">
              Manage Users
            </span>
          </Link>
          <Link
            to="/admin/reports"
            className="p-4 border border-gray-200 rounded-lg text-center hover:bg-gray-50 transition-colors"
          >
            <Eye size={24} className="mx-auto mb-2 text-yellow-600" />
            <span className="text-sm font-medium text-gray-900">
              View Reports
            </span>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
