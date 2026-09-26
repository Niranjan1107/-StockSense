import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types/inventory';
import { authService, AuthSession } from '../services/authService';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  token: string | null;
  isLoading: boolean;
  login: (email: string, passwordPlain: string, rememberMe?: boolean) => Promise<{ success: boolean; message?: string }>;
  signup: (name: string, email: string, role: Role, passwordPlain: string, warehouseId?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  switchDemoRole: (role: Role) => Promise<void>;
  requestPasswordResetOtp: (email: string) => Promise<{ success: boolean; otp?: string; message: string }>;
  verifyOtp: (email: string, otp: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (email: string, otp: string, newPasswordPlain: string) => Promise<{ success: boolean; message: string }>;
  changePassword: (currentPasswordPlain: string, newPasswordPlain: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (updatedData: Partial<User>) => void;
  activeOtpNotice: string | null;
  clearOtpNotice: () => void;
  // Role helpers
  isManager: boolean;
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'stocksense_auth_token_v2';
const REMEMBER_USER_KEY = 'stocksense_remember_email_v2';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeOtpNotice, setActiveOtpNotice] = useState<string | null>(null);

  // Initialize session verification on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem(TOKEN_KEY);
        if (savedToken) {
          const result = authService.verifyToken(savedToken);
          if (result.valid && result.user) {
            setCurrentUser(result.user);
            setToken(savedToken);
          } else {
            // Token expired or invalid
            localStorage.removeItem(TOKEN_KEY);
            setCurrentUser(null);
            setToken(null);
          }
        }
      } catch (e) {
        console.error('Session verification error', e);
        localStorage.removeItem(TOKEN_KEY);
        setCurrentUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (
    email: string,
    passwordPlain: string,
    rememberMe: boolean = true
  ): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      const res = await authService.login(email, passwordPlain, rememberMe);
      if (res.success && res.session) {
        setToken(res.session.token);
        setCurrentUser(res.session.user);
        localStorage.setItem(TOKEN_KEY, res.session.token);
        if (rememberMe) {
          localStorage.setItem(REMEMBER_USER_KEY, email.trim());
        } else {
          localStorage.removeItem(REMEMBER_USER_KEY);
        }
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    name: string,
    email: string,
    role: Role,
    passwordPlain: string,
    warehouseId: string = 'wh-1'
  ): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      const res = await authService.register(name, email, role, passwordPlain, warehouseId);
      if (res.success && res.session) {
        setToken(res.session.token);
        setCurrentUser(res.session.user);
        localStorage.setItem(TOKEN_KEY, res.session.token);
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message || 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem(TOKEN_KEY);
  };

  const switchDemoRole = async (role: Role) => {
    if (role === 'inventory_manager') {
      await login('elena.vance@stocksense.io', 'Manager@123', true);
    } else {
      await login('marcus.chen@stocksense.io', 'Staff@123', true);
    }
  };

  const requestPasswordResetOtp = async (email: string) => {
    const res = await authService.requestPasswordResetOtp(email);
    if (res.success && res.otp) {
      setActiveOtpNotice(
        `[StockSense Secure Dispatch] Verification OTP for ${email.trim()}: ${res.otp} (Valid for 10 minutes)`
      );
    }
    return res;
  };

  const verifyOtp = async (email: string, otp: string) => {
    return await authService.verifyOtp(email, otp);
  };

  const resetPassword = async (email: string, otp: string, newPasswordPlain: string) => {
    setIsLoading(true);
    try {
      const res = await authService.resetPassword(email, otp, newPasswordPlain);
      if (res.success && res.session) {
        setToken(res.session.token);
        setCurrentUser(res.session.user);
        localStorage.setItem(TOKEN_KEY, res.session.token);
        setActiveOtpNotice(null);
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message };
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (currentPasswordPlain: string, newPasswordPlain: string) => {
    if (!currentUser) {
      return { success: false, message: 'No active session' };
    }
    return await authService.changePassword(currentUser.id, currentPasswordPlain, newPasswordPlain);
  };

  const updateProfile = (updatedData: Partial<User>) => {
    if (!currentUser) return;
    const updated = authService.updateProfile(currentUser.id, updatedData);
    if (updated) {
      setCurrentUser(updated);
    }
  };

  const clearOtpNotice = () => {
    setActiveOtpNotice(null);
  };

  const isManager = currentUser?.role === 'inventory_manager';
  const isStaff = currentUser?.role === 'warehouse_staff';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        token,
        isLoading,
        login,
        signup,
        logout,
        switchDemoRole,
        requestPasswordResetOtp,
        verifyOtp,
        resetPassword,
        changePassword,
        updateProfile,
        activeOtpNotice,
        clearOtpNotice,
        isManager,
        isStaff,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
