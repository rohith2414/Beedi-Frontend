import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import authService from '../services/auth.service';
import { Boss, Subscription } from '../types';
import { authEventEmitter } from '../utils/authEvents';
import { SubscriptionStorage } from '../utils/storage';

// Auth context interface
interface AuthContextType {
    user: Boss | null;
    subscription: Subscription | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string, phone?: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    updateSubscription: (newSubscription: Subscription) => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider props
interface AuthProviderProps {
    children: ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<Boss | null>(null);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Check if user is already logged in on app start
    useEffect(() => {
        checkAuthStatus();
    }, []);

    // Listen for unauthorized events (401 errors)
    useEffect(() => {
        const unsubscribe = authEventEmitter.subscribe(() => {
            console.log('🔐 Auth event: Unauthorized - logging out');
            setUser(null);
            setSubscription(null);
            setIsAuthenticated(false);
        });

        return unsubscribe;
    }, []);

    const checkAuthStatus = async () => {
        try {
            setIsLoading(true);
            const isAuth = await authService.isAuthenticated();

            if (isAuth) {
                // Try to get stored user data first (faster)
                const storedUser = await authService.getStoredUser();
                const storedSub = await authService.getStoredSubscription();
                if (storedUser) {
                    setUser(storedUser);
                    setSubscription(storedSub);
                    setIsAuthenticated(true);
                }

                // Then refresh from API in background
                try {
                    const result = await authService.getCurrentUser();
                    setUser(result.user);
                    setSubscription(result.subscription);
                    setIsAuthenticated(true);
                } catch (error) {
                    // If API call fails but we have stored user, keep them logged in
                    if (!storedUser) {
                        setUser(null);
                        setSubscription(null);
                        setIsAuthenticated(false);
                    }
                }
            } else {
                setUser(null);
                setSubscription(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('Auth check error:', error);
            setUser(null);
            setSubscription(null);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await authService.login(email, password);
            setUser(response.data);
            setSubscription(response.subscription || null);
            setIsAuthenticated(true);
        } catch (error: any) {
            throw new Error(error.message || 'Login failed');
        }
    };

    const register = async (email: string, password: string, name: string, phone?: string) => {
        try {
            const response = await authService.register(email, password, name, phone);
            setUser(response.data);
            setSubscription(response.subscription || null);
            setIsAuthenticated(true);
        } catch (error: any) {
            throw new Error(error.message || 'Registration failed');
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
            setUser(null);
            setSubscription(null);
            setIsAuthenticated(false);
        } catch (error: any) {
            console.error('Logout error:', error);
            throw error;
        }
    };

    const refreshUser = async () => {
        try {
            const result = await authService.getCurrentUser();
            setUser(result.user);
            setSubscription(result.subscription);
        } catch (error: any) {
            console.error('Refresh user error:', error);
            throw error;
        }
    };

    const updateSubscription = async (newSubscription: Subscription) => {
        try {
            setSubscription(newSubscription);
            await SubscriptionStorage.saveSubscription(newSubscription);
        } catch (error) {
            console.error('Update subscription storage error:', error);
        }
    };

    const value: AuthContextType = {
        user,
        subscription,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        updateSubscription,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
