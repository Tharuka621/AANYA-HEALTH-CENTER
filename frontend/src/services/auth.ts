import { User, AuthResponse, LoginRequest, SignupRequest } from '../types';
import { axiosInstance } from './api';

export const authService = {
  // Login user
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await axiosInstance.post<AuthResponse>('/auth/login', credentials);
      const data = response.data;
      
      // Normalize role to lowercase for consistent routing
      if (data.user && data.user.role) {
        data.user.role = data.user.role.toLowerCase() as any;
      }
      
      return data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Invalid email or password';
      throw new Error(message);
    }
  },

  // Register new patient
  signup: async (userData: SignupRequest): Promise<AuthResponse> => {
    try {
      const response = await axiosInstance.post<AuthResponse>('/auth/signup', userData);
      const data = response.data;
      
      // Normalize role to lowercase for consistent routing
      if (data.user && data.user.role) {
        data.user.role = data.user.role.toLowerCase() as any;
      }
      
      return data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Signup failed';
      throw new Error(message);
    }
  },

  // Verify token and get user
  verifyToken: async (token: string): Promise<User> => {
    try {
      const response = await axiosInstance.get<{ user: User }>('/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.user;
    } catch (error: any) {
      throw new Error('Token verification failed');
    }
  },

  // Refresh token
  refreshToken: async (token: string): Promise<AuthResponse> => {
    try {
      const response = await axiosInstance.post<AuthResponse>('/auth/refresh', { token });
      return response.data;
    } catch (error: any) {
      throw new Error('Token refresh failed');
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      // Silent fail - clear local data anyway
      console.error('Logout request failed:', error);
    }
  },

  // Get user by ID
  getUserById: async (id: string): Promise<User> => {
    try {
      const response = await axiosInstance.get<{ user: User }>(`/users/${id}`);
      return response.data.user;
    } catch (error: any) {
      throw new Error('User not found');
    }
  },

  // Update user profile
  updateProfile: async (id: string, updates: Partial<User>): Promise<User> => {
    try {
      const response = await axiosInstance.put<{ user: User }>(`/users/${id}`, updates);
      return response.data.user;
    } catch (error: any) {
      throw new Error('Profile update failed');
    }
  },

  // Change password
  changePassword: async (id: string, currentPassword: string, newPassword: string): Promise<void> => {
    try {
      await axiosInstance.post(`/users/${id}/change-password`, {
        currentPassword,
        newPassword
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Password change failed';
      throw new Error(message);
    }
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<void> => {
    try {
      await axiosInstance.post('/auth/forgot-password', { email });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send reset email';
      throw new Error(message);
    }
  },

  // Reset password
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    try {
      await axiosInstance.post('/auth/reset-password', { token, newPassword });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Password reset failed';
      throw new Error(message);
    }
  }
};

// Token storage helpers
export const tokenStorage = {
  set: (token: string): void => {
    localStorage.setItem('token', token);
  },

  get: (): string | null => {
    return localStorage.getItem('token');
  },

  remove: (): void => {
    localStorage.removeItem('token');
  },

  isValid: (): boolean => {
    const token = tokenStorage.get();
    if (!token) return false;
    
    // Basic check - token exists
    // More sophisticated validation could decode JWT and check expiry
    return true;
  }
};

// User storage helpers
export const userStorage = {
  set: (user: User): void => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  get: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  remove: (): void => {
    localStorage.removeItem('user');
  }
};

