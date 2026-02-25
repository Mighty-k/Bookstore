import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Settings,
  LogOut,
  BookOpen,
  Heart,
  CreditCard,
  Shield,
  ChevronDown,
  UserCircle,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
// import toast from "react-hot-toast";

const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout(navigate); // Pass navigate to the logout function
  };

  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <Link
          to="/login"
          className="hidden sm:block px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
        >
          Sign In
        </Link>
        <Link
          to="/register"
          className="hidden sm:block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Sign Up
        </Link>
        <Link
          to="/login"
          className="sm:hidden p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          aria-label="Account"
        >
          <User size={20} />
        </Link>
      </div>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <UserCircle className="w-5 h-5 text-blue-600" />
        </div>
        <span className="hidden lg:block text-sm font-medium text-gray-700">
          {user.name.split(" ")[0]}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 animate-fadeIn z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500 mt-1">{user.email}</p>
            {user.role === "admin" && (
              <span className="inline-block mt-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                Admin
              </span>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <User className="w-4 h-4 mr-3" />
              Profile
            </Link>
            <Link
              to="/orders"
              onClick={() => setIsOpen(false)}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <BookOpen className="w-4 h-4 mr-3" />
              My Orders
            </Link>
            <Link
              to="/wishlist"
              onClick={() => setIsOpen(false)}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <Heart className="w-4 h-4 mr-3" />
              Wishlist
            </Link>
            <Link
              to="/payment-methods"
              onClick={() => setIsOpen(false)}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <CreditCard className="w-4 h-4 mr-3" />
              Payment Methods
            </Link>
            <Link
              to="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <Settings className="w-4 h-4 mr-3" />
              Settings
            </Link>

            {user.role === "admin" && (
              <>
                <div className="border-t border-gray-200 my-2"></div>
                <Link
                  to="/admin/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 transition-colors"
                >
                  <Shield className="w-4 h-4 mr-3" />
                  Admin Dashboard
                </Link>
              </>
            )}

            <div className="border-t border-gray-200 my-2"></div>

            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
