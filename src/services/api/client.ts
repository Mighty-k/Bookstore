import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";
import { useAuthStore } from "../../store/authStore";

// Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
  errors?: Record<string, string[]>;
}

// API Client Class
class ApiClient {
  private client: AxiosInstance;
  private static instance: ApiClient;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: unknown) => void;
    reject: (reason?: any) => void;
  }> = [];

  private constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    this.setupInterceptors();
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        // Handle token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() => this.client(originalRequest))
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = useAuthStore.getState().refreshToken;
            const response = await this.refreshAccessToken(refreshToken);

            useAuthStore
              .getState()
              .setToken(response.accessToken, response.refreshToken);

            this.processQueue(null, response.accessToken);
            return this.client(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            useAuthStore.getState().logout();
            window.location.href = "/login";
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(this.normalizeError(error));
      },
    );
  }

  private async refreshAccessToken(
    refreshToken: string | null,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await this.client.post("/auth/refresh", { refreshToken });
    return response.data;
  }

  private processQueue(error: any, token: string | null) {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  private normalizeError(error: AxiosError): ApiError {
    if (error.response) {
      const data = error.response.data as any;
      return {
        message: data?.message || "An error occurred",
        code: data?.code || "UNKNOWN_ERROR",
        status: error.response.status,
        errors: data?.errors,
      };
    }
    if (error.request) {
      return {
        message: "Network error. Please check your connection.",
        code: "NETWORK_ERROR",
        status: 0,
      };
    }
    return {
      message: error.message || "An unexpected error occurred",
      code: "UNKNOWN_ERROR",
      status: 0,
    };
  }

  // HTTP methods with proper type handling
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    // Handle both wrapped and unwrapped responses
    if (
      response.data &&
      typeof response.data === "object" &&
      "data" in response.data
    ) {
      return response.data.data as T;
    }
    return response.data as T;
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    if (
      response.data &&
      typeof response.data === "object" &&
      "data" in response.data
    ) {
      return response.data.data as T;
    }
    return response.data as T;
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    if (
      response.data &&
      typeof response.data === "object" &&
      "data" in response.data
    ) {
      return response.data.data as T;
    }
    return response.data as T;
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    if (
      response.data &&
      typeof response.data === "object" &&
      "data" in response.data
    ) {
      return response.data.data as T;
    }
    return response.data as T;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    if (
      response.data &&
      typeof response.data === "object" &&
      "data" in response.data
    ) {
      return response.data.data as T;
    }
    return response.data as T;
  }

  // Upload file
  async upload<T = any>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<T> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await this.client.post<ApiResponse<T>>(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(progress);
        }
      },
    });

    if (
      response.data &&
      typeof response.data === "object" &&
      "data" in response.data
    ) {
      return response.data.data as T;
    }
    return response.data as T;
  }

  // Download file
  async download(url: string, filename?: string): Promise<void> {
    const response = await this.client.get(url, {
      responseType: "blob",
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename || "download";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  }
}

// Create and export a single instance
const apiClient = ApiClient.getInstance();

// Export both the instance and the class (if needed)
export { apiClient, ApiClient };
