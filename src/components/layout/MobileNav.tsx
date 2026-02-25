import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, ShoppingCart, Heart, User } from "lucide-react";
import { useCartStore } from "../../store/cartStore";

const MobileNav: React.FC = () => {
  const location = useLocation();
  const { totalItems } = useCartStore();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/catalog", icon: Search, label: "Explore" },
    { path: "/cart", icon: ShoppingCart, label: "Cart", badge: totalItems },
    { path: "/wishlist", icon: Heart, label: "Wishlist" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full relative ${
                isActive ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="relative">
                <Icon size={20} />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1">{item.label}</span>
              {isActive && (
                <div className="absolute -top-1 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
