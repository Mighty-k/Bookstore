import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import type { User, LoginCredentials, RegisterCredentials } from "../types";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  wishlistCount: number; // Add this

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: (navigate?: any) => Promise<void>;
  refreshTokenAction: () => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  clearError: () => void;
  updateWishlistCount: (count: number) => void; // Add this
  fetchWishlistCount: () => Promise<void>; // Add this
  setToken: (token: string | null, refreshToken?: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,
      wishlistCount: 0, // Initialize

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(
            `${API_URL}/auth/login`,
            credentials,
          );

          const { user, tokens } = response.data.data;

          set({
            user,
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });

          axios.defaults.headers.common["Authorization"] =
            `Bearer ${tokens.accessToken}`;

          // Fetch wishlist count after login
          await get().fetchWishlistCount();

          toast.success(`Welcome back, ${user.name}!`);
        } catch (error: any) {
          const message = error.response?.data?.message || "Login failed";
          set({ error: message, isLoading: false });
          toast.error(message);
        }
      },

      register: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(
            `${API_URL}/auth/register`,
            credentials,
          );

          const { user, tokens } = response.data.data;

          set({
            user,
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });

          axios.defaults.headers.common["Authorization"] =
            `Bearer ${tokens.accessToken}`;

          // Fetch wishlist count after registration
          await get().fetchWishlistCount();

          toast.success(
            "Registration successful! Please check your email to verify your account.",
          );
        } catch (error: any) {
          const message =
            error.response?.data?.message || "Registration failed";
          set({ error: message, isLoading: false });
          toast.error(message);
        }
      },

      googleLogin: async (credential) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`${API_URL}/auth/google`, {
            credential,
          });

          const { user, tokens } = response.data.data;

          set({
            user,
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });

          axios.defaults.headers.common["Authorization"] =
            `Bearer ${tokens.accessToken}`;

          // Fetch wishlist count after Google login
          await get().fetchWishlistCount();

          toast.success(`Welcome, ${user.name}!`);
        } catch (error: any) {
          const message =
            error.response?.data?.message || "Google login failed";
          set({ error: message, isLoading: false });
          toast.error(message);
        }
      },

      logout: async (navigate) => {
        const { token, refreshToken } = get();
        try {
          if (token) {
            await axios.post(
              `${API_URL}/auth/logout`,
              { refreshToken },
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            );
          }
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            wishlistCount: 0, // Reset on logout
          });

          delete axios.defaults.headers.common["Authorization"];

          toast.success("Logged out successfully");

          if (navigate) {
            navigate("/");
          }
        }
      },

      refreshTokenAction: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return;

        try {
          const response = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } =
            response.data.data;

          set({
            token: accessToken,
            refreshToken: newRefreshToken,
          });

          axios.defaults.headers.common["Authorization"] =
            `Bearer ${accessToken}`;
        } catch (error) {
          get().logout();
        }
      },

      clearError: () => set({ error: null }),

      updateWishlistCount: (count) => set({ wishlistCount: count }),

      fetchWishlistCount: async () => {
        const { token } = get();
        if (!token) return;

        try {
          const response = await axios.get(`${API_URL}/user/wishlist`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.data.success) {
            set({ wishlistCount: response.data.data.length });
          }
        } catch (error) {
          console.error("Failed to fetch wishlist count:", error);
        }
      },
      setToken: (token, refreshToken) => {
        set({
          token,
          refreshToken: refreshToken || get().refreshToken,
          isAuthenticated: !!token,
        });

        // Update axios default header
        if (token) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
          delete axios.defaults.headers.common["Authorization"];
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        wishlistCount: state.wishlistCount, // Persist count
      }),
    },
  ),
);
