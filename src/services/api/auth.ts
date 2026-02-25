import { apiClient } from "./client";
import type {
  User,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
} from "../../types";

export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface TwoFactorRequest {
  token: string;
  method: "app" | "sms" | "email";
}

export interface TwoFactorSetupResponse {
  qrCode: string;
  secret: string;
  backupCodes: string[];
}

export interface Session {
  id: string;
  device: string;
  browser: string;
  os: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

class AuthAPI {
  private static instance: AuthAPI;

  private constructor() {}

  public static getInstance(): AuthAPI {
    if (!AuthAPI.instance) {
      AuthAPI.instance = new AuthAPI();
    }
    return AuthAPI.instance;
  }

  // ========== AUTHENTICATION ==========

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        "/auth/login",
        credentials,
      );

      // Store tokens
      localStorage.setItem("accessToken", response.token);
      if (response.refreshToken) {
        localStorage.setItem("refreshToken", response.refreshToken);
      }

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Register new user
   */
  async register(data: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        "/auth/register",
        data,
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local storage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await apiClient.post<{
      accessToken: string;
      refreshToken: string;
    }>("/auth/refresh", { refreshToken });
    return response;
  }

  /**
   * Verify email
   */
  async verifyEmail(data: VerifyEmailRequest): Promise<{ message: string }> {
    return apiClient.post("/auth/verify-email", data);
  }

  /**
   * Resend verification email
   */
  async resendVerification(email: string): Promise<{ message: string }> {
    return apiClient.post("/auth/resend-verification", { email });
  }

  // ========== PASSWORD MANAGEMENT ==========

  /**
   * Forgot password - send reset email
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    return apiClient.post("/auth/forgot-password", { email });
  }

  /**
   * Reset password with token
   */
  async resetPassword(
    token: string,
    password: string,
    confirmPassword: string,
  ): Promise<{ message: string }> {
    return apiClient.post("/auth/reset-password", {
      token,
      password,
      confirmPassword,
    });
  }

  /**
   * Change password (authenticated)
   */
  async changePassword(
    data: ChangePasswordRequest,
  ): Promise<{ message: string }> {
    return apiClient.post("/auth/change-password", data);
  }

  // ========== TWO FACTOR AUTHENTICATION ==========

  /**
   * Setup 2FA
   */
  async setup2FA(): Promise<TwoFactorSetupResponse> {
    return apiClient.post("/auth/2fa/setup");
  }

  /**
   * Enable 2FA
   */
  async enable2FA(
    token: string,
  ): Promise<{ message: string; backupCodes: string[] }> {
    return apiClient.post("/auth/2fa/enable", { token });
  }

  /**
   * Disable 2FA
   */
  async disable2FA(password: string): Promise<{ message: string }> {
    return apiClient.post("/auth/2fa/disable", { password });
  }

  /**
   * Verify 2FA token
   */
  async verify2FA(data: TwoFactorRequest): Promise<{ valid: boolean }> {
    return apiClient.post("/auth/2fa/verify", data);
  }

  // ========== PROFILE MANAGEMENT ==========

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    return apiClient.get("/auth/profile");
  }

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    return apiClient.put("/auth/profile", data);
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<{ avatarUrl: string }> {
    return apiClient.upload("/auth/avatar", file, onProgress);
  }

  /**
   * Delete avatar
   */
  async deleteAvatar(): Promise<{ message: string }> {
    return apiClient.delete("/auth/avatar");
  }

  // ========== SESSION MANAGEMENT ==========

  /**
   * Get all active sessions
   */
  async getSessions(): Promise<Session[]> {
    return apiClient.get("/auth/sessions");
  }

  /**
   * Revoke a session
   */
  async revokeSession(sessionId: string): Promise<{ message: string }> {
    return apiClient.delete(`/auth/sessions/${sessionId}`);
  }

  /**
   * Revoke all other sessions
   */
  async revokeAllOtherSessions(): Promise<{ message: string }> {
    return apiClient.post("/auth/sessions/revoke-all");
  }

  // ========== ACCOUNT MANAGEMENT ==========

  /**
   * Delete account
   */
  async deleteAccount(password: string): Promise<{ message: string }> {
    return apiClient.post("/auth/delete-account", { password });
  }

  /**
   * Export user data (GDPR)
   */
  async exportData(): Promise<Blob> {
    const response = await apiClient.get("/auth/export-data", {
      responseType: "blob",
    });
    return response as unknown as Blob;
  }

  // ========== SOCIAL LOGIN ==========

  /**
   * Get OAuth URLs
   */
  async getOAuthUrls(): Promise<{
    google: string;
    facebook: string;
    github: string;
  }> {
    return apiClient.get("/auth/oauth/urls");
  }

  /**
   * Handle OAuth callback
   */
  async handleOAuthCallback(
    provider: string,
    code: string,
  ): Promise<AuthResponse> {
    return apiClient.post(`/auth/oauth/${provider}/callback`, { code });
  }

  // ========== HELPER METHODS ==========

  private handleError(error: any): never {
    // Log error for monitoring
    console.error("Auth API Error:", error);

    // Transform error for UI
    if (error.response) {
      switch (error.response.status) {
        case 401:
          throw new Error("Invalid email or password");
        case 403:
          throw new Error("Account is locked. Please contact support.");
        case 429:
          throw new Error("Too many attempts. Please try again later.");
        default:
          throw new Error(
            error.response.data?.message || "Authentication failed",
          );
      }
    }

    throw error;
  }
}

// Export a singleton instance
export const authAPI = AuthAPI.getInstance();
