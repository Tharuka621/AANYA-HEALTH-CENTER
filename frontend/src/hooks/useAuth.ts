import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService, tokenStorage, userStorage } from '../services/auth';
import { AuthResponse, LoginRequest, SignupRequest, User } from '../types';
import { useAuth } from '../contexts/AuthContext';

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  token: () => [...authKeys.all, 'token'] as const,
};

// Get current user from storage
export const useCurrentUser = () => {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: () => {
      const user = userStorage.get();
      const token = tokenStorage.get();
      
      if (!user || !token || !tokenStorage.isValid()) {
        // Clear invalid data
        userStorage.remove();
        tokenStorage.remove();
        return null;
      }
      
      return user;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
};

// Login mutation
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: (data: AuthResponse) => {
      // Store token and user
      tokenStorage.set(data.token);
      userStorage.set(data.user);
      
      // Update query cache
      queryClient.setQueryData(authKeys.user(), data.user);
      queryClient.setQueryData(authKeys.token(), data.token);
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });
};

// Signup mutation
export const useSignup = () => {
  const queryClient = useQueryClient();
  const { setUser } = useAuth();

  return useMutation({
    mutationFn: (userData: SignupRequest) => authService.signup(userData),
    onSuccess: (data: AuthResponse) => {
      // Store token and user
      tokenStorage.set(data.token);
      userStorage.set(data.user);
      
      // Update AuthContext immediately
      setUser(data.user);
      
      // Update query cache
      queryClient.setQueryData(authKeys.user(), data.user);
      queryClient.setQueryData(authKeys.token(), data.token);
    },
    onError: (error) => {
      console.error('Signup failed:', error);
    },
  });
};

// Logout mutation
export const useLogout = () => {
  const queryClient = useQueryClient();
  const { setUser } = useAuth();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Clear storage
      tokenStorage.remove();
      userStorage.remove();
      
      // Update AuthContext immediately
      setUser(null);
      
      // Clear query cache
      queryClient.removeQueries({ queryKey: authKeys.all });
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      // Still clear local data even if server logout fails
      tokenStorage.remove();
      userStorage.remove();
      setUser(null);
      queryClient.removeQueries({ queryKey: authKeys.all });
      queryClient.clear();
    },
  });
};

// Refresh token mutation
export const useRefreshToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      const token = tokenStorage.get();
      if (!token) throw new Error('No token found');
      return authService.refreshToken(token);
    },
    onSuccess: (data: AuthResponse) => {
      // Update stored token and user
      tokenStorage.set(data.token);
      userStorage.set(data.user);
      
      // Update query cache
      queryClient.setQueryData(authKeys.user(), data.user);
      queryClient.setQueryData(authKeys.token(), data.token);
    },
    onError: (error) => {
      console.error('Token refresh failed:', error);
      // Clear invalid data
      tokenStorage.remove();
      userStorage.remove();
      queryClient.removeQueries({ queryKey: authKeys.all });
    },
  });
};

// Update profile mutation
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<User> }) =>
      authService.updateProfile(id, updates),
    onSuccess: (updatedUser: User) => {
      // Update stored user
      userStorage.set(updatedUser);
      
      // Update query cache
      queryClient.setQueryData(authKeys.user(), updatedUser);
    },
    onError: (error) => {
      console.error('Profile update failed:', error);
    },
  });
};

// Change password mutation
export const useChangePassword = () => {
  return useMutation({
    mutationFn: ({ id, currentPassword, newPassword }: { 
      id: string; 
      currentPassword: string; 
      newPassword: string; 
    }) => authService.changePassword(id, currentPassword, newPassword),
    onError: (error) => {
      console.error('Password change failed:', error);
    },
  });
};

// Forgot password mutation
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
    onError: (error) => {
      console.error('Forgot password failed:', error);
    },
  });
};

// Reset password mutation
export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      authService.resetPassword(token, newPassword),
    onError: (error) => {
      console.error('Password reset failed:', error);
    },
  });
};

// Check if user is authenticated
export const useIsAuthenticated = () => {
  const { data: user, isLoading } = useCurrentUser();
  return {
    isAuthenticated: !!user,
    isLoading,
    user,
  };
};

// Get user role
export const useUserRole = () => {
  const { data: user } = useCurrentUser();
  return user?.role || null;
};

// Check if user has specific role
export const useHasRole = (role: string) => {
  const userRole = useUserRole();
  return userRole === role;
};

// Check if user has any of the specified roles
export const useHasAnyRole = (roles: string[]) => {
  const userRole = useUserRole();
  return userRole ? roles.includes(userRole) : false;
};
