import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import type { User, LoginCredentials, RegisterCredentials } from "../types";
import toast from "react-hot-toast";

interface UseAuthReturn {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;

  // Auth actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;

  // Session management
  refreshToken: () => Promise<void>;
  checkSession: () => Promise<boolean>;

  // 2FA
  enable2FA: () => Promise<{ qrCode: string; secret: string }>;
  verify2FA: (token: string) => Promise<boolean>;
  disable2FA: () => Promise<void>;

  // Errors
  error: string | null;
  clearError: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const navigate = useNavigate();
  const {
    user,
    token,
    // refreshToken: storeRefreshToken,
  } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user && !!token;
  const isAdmin = user?.role === "admin";

  // Clear error helper
  const clearError = useCallback(() => setError(null), []);

  // Handle API errors
  const handleError = (error: any) => {
    const message =
      error.response?.data?.message || error.message || "An error occurred";
    setError(message);
    toast.error(message);
    throw error;
  };

  // Login
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock successful login
      const mockUser: User = {
        id: "1",
        email: credentials.email,
        name: "John Doe",
        role: credentials.email.includes("admin") ? "admin" : "customer",
        shippingAddress: {
          fullName: "John Doe",
          email: credentials.email,
          phone: "+1234567890",
          street: "123 Main St",
          city: "San Francisco",
          state: "CA",
          zipCode: "94105",
          country: "USA",
        },
        createdAt: new Date().toISOString(),
        wishlist: [],
      };

      // const mockToken = "mock-jwt-token-" + Date.now();
      // const mockRefreshToken = "mock-refresh-token-" + Date.now();

      // setUser(mockUser);
      // setToken(mockToken, mockRefreshToken);

      toast.success(`Welcome back, ${mockUser.name}!`);

      // Redirect based on role
      if (mockUser.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Register
  const register = async (/*credentials: RegisterCredentials*/) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock successful registration
      // const mockUser: User = {
      //   id: Date.now().toString(),
      //   email: credentials.email,
      //   name: credentials.name,
      //   role: "customer",
      //   createdAt: new Date().toISOString(),
      //   wishlist: [],
      // };

      // const mockToken = "mock-jwt-token-" + Date.now();
      // const mockRefreshToken = "mock-refresh-token-" + Date.now();

      // setUser(mockUser);
      // setToken(mockToken, mockRefreshToken);
      navigate("/");
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // clearUser();
      // clearTokens();

      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile
  const updateProfile = async (data: Partial<User>) => {
    console.log("Updating profile with:", data);
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update user in store
      if (user) {
        // const updatedUser = { ...user, ...data };
        // setUser(updatedUser);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Change password
  const changePassword = async (
    oldPassword: string /* newPassword: string*/,
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Validate old password (mock)
      if (oldPassword !== "password123") {
        throw new Error("Current password is incorrect");
      }

      toast.success("Password changed successfully");
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success(`Password reset link sent to ${email}`);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh token
  const refreshToken = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // const newToken = "mock-jwt-token-" + Date.now();
      // const newRefreshToken = "mock-refresh-token-" + Date.now();

      // setToken(newToken, newRefreshToken);
    } catch (error) {
      // If refresh fails, logout
      await logout();
    }
  };

  // Check session validity
  const checkSession = async (): Promise<boolean> => {
    if (!token || !user) return false;

    try {
      // Simulate token validation
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Check if token is expired (mock)
      const tokenAge = parseInt(token.split("-").pop() || "0");
      const now = Date.now();
      const isExpired = now - tokenAge > 3600000; // 1 hour

      if (isExpired) {
        await refreshToken();
      }

      return true;
    } catch (error) {
      return false;
    }
  };

  // 2FA Methods
  const enable2FA = async () => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return {
        qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...",
        secret: "JBSWY3DPEHPK3PXP",
      };
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verify2FA = async (token: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Simulate verification
      await new Promise((resolve) => setTimeout(resolve, 500));

      const isValid = token.length === 6 && /^\d+$/.test(token);

      if (isValid) {
        toast.success("2FA verified successfully");
      } else {
        toast.error("Invalid verification code");
      }

      return isValid;
    } catch (error) {
      handleError(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const disable2FA = async () => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("2FA disabled successfully");
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto refresh token
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isAuthenticated) {
      // Refresh token every 50 minutes
      interval = setInterval(refreshToken, 50 * 60 * 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAuthenticated]);

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    isAdmin,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    resetPassword,
    refreshToken,
    checkSession,
    enable2FA,
    verify2FA,
    disable2FA,
    error,
    clearError,
  };
};
