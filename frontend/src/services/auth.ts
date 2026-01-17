import { User, AuthResponse, LoginRequest, SignupRequest } from '../types';

// Mock users with passwords for authentication
const mockUsers: (User & { password: string })[] = [
  {
    id: '1',
    email: 'admin@aanya.com',
    password: 'admin123',
    full_name: 'Dr. Admin',
    role: 'admin',
    phone: '+1234567890',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    email: 'doctor@aanya.com',
    password: 'doctor123',
    full_name: 'Dr. Sarah Wilson',
    role: 'doctor',
    phone: '+1234567891',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    email: 'nurse@aanya.com',
    password: 'nurse123',
    full_name: 'Nurse Mary Johnson',
    role: 'nurse',
    phone: '+1234567892',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    email: 'receptionist@aanya.com',
    password: 'reception123',
    full_name: 'Tharushi Perera',
    role: 'receptionist',
    phone: '+94 77 234 5678',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    email: 'pharmacist@aanya.com',
    password: 'pharma123',
    full_name: 'Dinesh Fernando',
    role: 'pharmacist',
    phone: '+94 75 678 9012',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '6',
    email: 'labtech@aanya.com',
    password: 'lab123',
    full_name: 'Chamara Silva',
    role: 'lab',
    phone: '+94 76 890 1234',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '7',
    email: 'patient@aanya.com',
    password: 'patient123',
    full_name: 'Kasun Bandara',
    role: 'patient',
    phone: '+94771234570',
    created_at: '2024-01-01T00:00:00Z'
  }
];

// Simulate API delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Generate mock JWT-like token
const generateToken = (user: User): string => {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };
  
  // Simple base64 encoding for demo purposes (not secure)
  return btoa(JSON.stringify(payload));
};

// Decode token
const decodeToken = (token: string): any => {
  try {
    return JSON.parse(atob(token));
  } catch {
    return null;
  }
};

// Check if token is expired
const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  return Date.now() >= decoded.exp * 1000;
};

export const authService = {
  // Login user
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    await delay();
    
    const user = mockUsers.find(u => 
      u.email === credentials.email && u.password === credentials.password
    );
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Remove password from user object
    const { password, ...userWithoutPassword } = user;
    
    const token = generateToken(userWithoutPassword);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    
    return {
      token,
      user: userWithoutPassword,
      expires_at: expiresAt
    };
  },

  // Register new patient
  signup: async (userData: SignupRequest): Promise<AuthResponse> => {
    await delay();
    
    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Create new user
    const newUser: User & { password: string } = {
      id: (mockUsers.length + 1).toString(),
      email: userData.email,
      password: userData.password,
      full_name: userData.full_name,
      role: 'patient',
      phone: userData.phone,
      created_at: new Date().toISOString()
    };
    
    mockUsers.push(newUser);
    
    // Remove password from user object
    const { password, ...userWithoutPassword } = newUser;
    
    const token = generateToken(userWithoutPassword);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    
    return {
      token,
      user: userWithoutPassword,
      expires_at: expiresAt
    };
  },

  // Verify token and get user
  verifyToken: async (token: string): Promise<User> => {
    await delay();
    
    if (isTokenExpired(token)) {
      throw new Error('Token has expired');
    }
    
    const decoded = decodeToken(token);
    if (!decoded) {
      throw new Error('Invalid token');
    }
    
    const user = mockUsers.find(u => u.id === decoded.sub);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Remove password from user object
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  // Refresh token
  refreshToken: async (token: string): Promise<AuthResponse> => {
    await delay();
    
    const user = await authService.verifyToken(token);
    const newToken = generateToken(user);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    
    return {
      token: newToken,
      user,
      expires_at: expiresAt
    };
  },

  // Logout (in a real app, this would invalidate the token on the server)
  logout: async (): Promise<void> => {
    await delay();
    // In a real application, you would call the server to invalidate the token
    // For this mock implementation, we just return success
  },

  // Get user by ID
  getUserById: async (id: string): Promise<User> => {
    await delay();
    
    const user = mockUsers.find(u => u.id === id);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Remove password from user object
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  // Update user profile
  updateProfile: async (id: string, updates: Partial<User>): Promise<User> => {
    await delay();
    
    const index = mockUsers.findIndex(u => u.id === id);
    if (index === -1) {
      throw new Error('User not found');
    }
    
    mockUsers[index] = { ...mockUsers[index], ...updates };
    
    // Remove password from user object
    const { password, ...userWithoutPassword } = mockUsers[index];
    return userWithoutPassword;
  },

  // Change password
  changePassword: async (id: string, currentPassword: string, newPassword: string): Promise<void> => {
    await delay();
    
    const user = mockUsers.find(u => u.id === id);
    if (!user) {
      throw new Error('User not found');
    }
    
    if (user.password !== currentPassword) {
      throw new Error('Current password is incorrect');
    }
    
    user.password = newPassword;
  },

  // Forgot password (mock implementation)
  forgotPassword: async (email: string): Promise<void> => {
    await delay();
    
    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      // Don't reveal if user exists or not for security
      return;
    }
    
    // In a real application, you would send a password reset email
    console.log(`Password reset email would be sent to ${email}`);
  },

  // Reset password (mock implementation)
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await delay();
    
    // In a real application, you would verify the reset token
    // For this mock implementation, we just return success
    console.log(`Password would be reset with token: ${token}`);
  }
};

// Token storage helpers
export const tokenStorage = {
  set: (token: string): void => {
    localStorage.setItem('aanya_token', token);
  },

  get: (): string | null => {
    return localStorage.getItem('aanya_token');
  },

  remove: (): void => {
    localStorage.removeItem('aanya_token');
  },

  isValid: (): boolean => {
    const token = tokenStorage.get();
    if (!token) return false;
    return !isTokenExpired(token);
  }
};

// User storage helpers
export const userStorage = {
  set: (user: User): void => {
    localStorage.setItem('aanya_user', JSON.stringify(user));
  },

  get: (): User | null => {
    const userStr = localStorage.getItem('aanya_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  remove: (): void => {
    localStorage.removeItem('aanya_user');
  }
};

