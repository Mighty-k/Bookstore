import React, { useState } from "react";
import { Link, Outlet, useLocation /*, useNavigate*/ } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
  Search,
  BarChart3,
  // Package,
  TrendingUp,
  DollarSign,
  // Star,
  MessageSquare,
  Tag,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [notifications] = useState(3);
  const location = useLocation();
  // const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Orders", href: "/admin/orders", icon: ShoppingBag, badge: 12 },
    { name: "Books", href: "/admin/books", icon: BookOpen },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Categories", href: "/admin/categories", icon: Tag },
    { name: "Reviews", href: "/admin/reviews", icon: MessageSquare },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  // const stats = [
  //   {
  //     label: "Total Revenue",
  //     value: "$45,678",
  //     change: "+12.5%",
  //     icon: DollarSign,
  //   },
  //   {
  //     label: "Total Orders",
  //     value: "1,234",
  //     change: "+8.2%",
  //     icon: ShoppingBag,
  //   },
  //   { label: "Total Books", value: "3,456", change: "+5.3%", icon: BookOpen },
  //   { label: "Total Users", value: "5,678", change: "+15.3%", icon: Users },
  // ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto bg-gray-900 w-72">
          {/* Logo */}
          <div className="flex items-center justify-between mb-8 px-2">
            <Link to="/admin" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">BookHaven</span>
              <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded-full">
                Admin
              </span>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center justify-between px-4 py-3 rounded-lg transition-colors
                    ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <Icon size={20} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="absolute bottom-4 left-3 right-3">
            <div className="px-4 py-3 bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {user?.name?.charAt(0) || "A"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.name || "Admin User"}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>
                <button
                  onClick={() => logout()}
                  className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`${isSidebarOpen ? "lg:ml-72" : ""} transition-margin`}>
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Left side */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 text-gray-600 rounded-lg hover:bg-gray-100 lg:hidden"
              >
                <Menu size={20} />
              </button>

              {/* Search */}
              <div className="hidden md:block">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search orders, books, users..."
                    className="w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Stats Ticker */}
              <div className="hidden lg:flex items-center space-x-4">
                <div className="flex items-center text-sm">
                  <DollarSign size={16} className="text-green-500 mr-1" />
                  <span className="font-medium">$12.4k</span>
                  <span className="text-green-500 text-xs ml-1">+8%</span>
                </div>
                <div className="flex items-center text-sm">
                  <TrendingUp size={16} className="text-blue-500 mr-1" />
                  <span className="font-medium">156</span>
                  <span className="text-blue-500 text-xs ml-1">+12</span>
                </div>
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Bell size={20} />
                {notifications > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                    {notifications}
                  </span>
                )}
              </button>

              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user?.name?.charAt(0) || "A"}
                    </span>
                  </div>
                  <ChevronDown size={16} className="text-gray-600" />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                    <Link
                      to="/admin/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/admin/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Settings
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
