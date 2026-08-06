import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Base API URL configuration with fallback
const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api/v1';

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filter?: Record<string, string | number | boolean>;
}

// Reusable Axios Instance with interceptors
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor: Attach Auth Token if present in localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dsrs-jwt-token') || localStorage.getItem('dsrs_auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Retry Helper for Transient Server or Network Errors
async function retryRequest<T>(
  fn: () => Promise<AxiosResponse<T>>,
  retries = 2,
  delayMs = 800
): Promise<AxiosResponse<T>> {
  try {
    return await fn();
  } catch (err: any) {
    if (retries <= 1 || (err.response && err.response.status < 500 && err.response.status !== 429)) {
      throw err;
    }
    await new Promise((res) => setTimeout(res, delayMs));
    return retryRequest(fn, retries - 1, delayMs * 1.5);
  }
}

// Generic API Service wrapper methods
export const apiService = {
  async get<T>(url: string, params?: Record<string, any>, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await retryRequest(() => apiClient.get<ApiResponse<T> | T>(url, { params, ...config }));
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return response.data as ApiResponse<T>;
      }
      return {
        data: response.data as T,
        success: true,
      };
    } catch (error: any) {
      return handleApiError<T>(error);
    }
  },

  async post<T>(url: string, body?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await retryRequest(() => apiClient.post<ApiResponse<T> | T>(url, body, config));
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return response.data as ApiResponse<T>;
      }
      return {
        data: response.data as T,
        success: true,
      };
    } catch (error: any) {
      return handleApiError<T>(error);
    }
  },

  async put<T>(url: string, body?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await retryRequest(() => apiClient.put<ApiResponse<T> | T>(url, body, config));
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return response.data as ApiResponse<T>;
      }
      return {
        data: response.data as T,
        success: true,
      };
    } catch (error: any) {
      return handleApiError<T>(error);
    }
  },

  async patch<T>(url: string, body?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await retryRequest(() => apiClient.patch<ApiResponse<T> | T>(url, body, config));
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return response.data as ApiResponse<T>;
      }
      return {
        data: response.data as T,
        success: true,
      };
    } catch (error: any) {
      return handleApiError<T>(error);
    }
  },

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await retryRequest(() => apiClient.delete<ApiResponse<T> | T>(url, config));
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return response.data as ApiResponse<T>;
      }
      return {
        data: response.data as T,
        success: true,
      };
    } catch (error: any) {
      return handleApiError<T>(error);
    }
  },
};

// Normalized Error Handler
function handleApiError<T>(error: AxiosError | any): ApiResponse<T> {
  const message =
    error.response?.data?.message ||
    error.response?.data?.detail ||
    error.message ||
    'An unexpected API error occurred';
  console.warn('[API Service Warning]:', message);

  return {
    data: null as unknown as T,
    success: false,
    message,
  };
}
