import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Loader } from "lucide-react";

interface ProtectedRouteProps {
  allowedRoles?: Array<"customer" | "admin">;
  redirectTo?: string;
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles = ["customer", "admin"],
  redirectTo = "/login",
  children,
}) => {
  const location = useLocation();
  const { user, token, isAuthenticated, isLoading } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Short timeout to ensure auth state is loaded
    const timer = setTimeout(() => {
      setChecking(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Show loading only while auth is loading OR while we're checking
  if (isLoading || checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Verifying Access
          </h2>
          <p className="text-gray-600">
            Please wait while we verify your credentials...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated || !user || !token) {
    return (
      <Navigate to={redirectTo} state={{ from: location.pathname }} replace />
    );
  }

  // Check role
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Render children or outlet
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
