import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, ChevronRight } from "lucide-react";

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  // Don't show breadcrumbs on homepage
  if (pathnames.length === 0) {
    return null;
  }

  const breadcrumbMap: Record<string, string> = {
    catalog: "Catalog",
    book: "Book",
    cart: "Shopping Cart",
    checkout: "Checkout",
    profile: "My Profile",
    orders: "My Orders",
    wishlist: "Wishlist",
    login: "Sign In",
    register: "Sign Up",
    admin: "Admin",
    dashboard: "Dashboard",
  };

  return (
    <nav
      className="flex items-center text-sm text-gray-500"
      aria-label="Breadcrumb"
    >
      <Link
        to="/"
        className="flex items-center hover:text-blue-600 transition-colors"
      >
        <Home className="w-4 h-4" />
        <span className="sr-only">Home</span>
      </Link>

      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;
        const displayName =
          breadcrumbMap[name] || name.charAt(0).toUpperCase() + name.slice(1);

        return (
          <React.Fragment key={name}>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            {isLast ? (
              <span className="font-medium text-gray-900">{displayName}</span>
            ) : (
              <Link
                to={routeTo}
                className="hover:text-blue-600 transition-colors"
              >
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
