import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, Search, ShoppingCart, Heart, X, BookOpen } from "lucide-react";
import { useCartStore } from "../../store/cartStore";
import { useAuthStore } from "../../store/authStore";
import { useWishlistStore } from "../../store/wishlistStore"; // Import wishlist store
// import { useUIStore } from "../../store/uiStore";
// import SearchBar from "./SearchBar";
import CategoryMenu from "./CategoryMenu";
import UserMenu from "./UserMenu";
import CartPreview from "./CartPreview";

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems } = useCartStore();
  const { user } = useAuthStore();
  const { count: wishlistCount, fetchWishlist } = useWishlistStore(); // Get wishlist count and fetch function
  // const { toggleSidebar } = useUIStore();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch wishlist count when user logs in
  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user, fetchWishlist]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsCartOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleSearchBlur = () => {
    if (!searchQuery.trim()) {
      setIsSearchOpen(false);
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 bg-white transition-all duration-300 ${
          isScrolled ? "shadow-lg" : "shadow-md"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 lg:h-16">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Logo */}
            <Link
              to="/"
              className={`flex items-center space-x-2 group transition-all duration-300 ${
                isSearchOpen ? "hidden lg:flex" : "flex"
              }`}
            >
              <div className="relative">
                <BookOpen className="w-7 h-7 lg:w-8 lg:h-8 text-blue-600 group-hover:text-blue-700 transition-colors" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 lg:w-3 lg:h-3 bg-yellow-400 rounded-full animate-pulse" />
              </div>
              <span className="text-lg lg:text-2xl font-bold text-gray-900">
                Book<span className="text-blue-600">Haven</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav
              className={`hidden lg:flex items-center space-x-8 transition-all duration-300 ${
                isSearchOpen ? "opacity-0 invisible w-0" : "opacity-100 visible"
              }`}
            >
              <Link
                to="/"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm lg:text-base"
              >
                Home
              </Link>
              <CategoryMenu />
              <Link
                to="/catalog"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm lg:text-base"
              >
                All Books
              </Link>
            </nav>

            {/* Search Bar - Inline (Desktop only) */}
            <div
              className={`hidden lg:block transition-all duration-300 ${
                isSearchOpen
                  ? "flex-1 max-w-sm mx-4 opacity-100 visible scale-100"
                  : "w-0 opacity-0 invisible scale-95"
              }`}
            >
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={handleSearchBlur}
                  placeholder="Search books..."
                  className="w-full pl-4 pr-10 py-2 text-sm bg-gray-100 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600"
                >
                  <Search size={16} />
                </button>
              </form>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Search Toggle Button */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`p-2 rounded-full transition-all duration-300 ${
                  isSearchOpen
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
                aria-label="Toggle search"
              >
                <Search size={18} />
              </button>

              {/* Wishlist - Now updates in real-time */}
              <Link
                to="/wishlist"
                className="hidden sm:flex p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all relative"
                aria-label="Wishlist"
              >
                <Heart size={18} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              <UserMenu />

              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all relative"
                aria-label="Cart"
              >
                <ShoppingCart size={18} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {isSearchOpen && (
            <div className="lg:hidden py-3 border-t border-gray-200">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search books..."
                  className="w-full pl-4 pr-10 py-2 text-sm bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600"
                >
                  <Search size={16} />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 animate-slideDown">
            <nav className="px-4 py-4 space-y-2">
              <Link
                to="/"
                className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/catalog"
                className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                All Books
              </Link>
              <Link
                to="/deals"
                className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Deals
              </Link>
              <Link
                to="/new-releases"
                className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                New Releases
              </Link>
              <Link
                to="/wishlist"
                className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
              </Link>
            </nav>
          </div>
        )}

        {/* Cart Preview Dropdown */}
        {isCartOpen && (
          <div className="absolute right-4 top-14 lg:top-16 w-80 sm:w-96 z-50 animate-slideDown">
            <CartPreview onClose={() => setIsCartOpen(false)} />
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
