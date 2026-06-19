import { API_CONFIG } from '../config/api';
import apiService from './api.service';
import { TokenStorage, UserStorage, SubscriptionStorage } from '../utils/storage';
import { Boss, AuthResponse, ApiResponse, Subscription } from '../types';

interface GetCurrentUserResult {
    user: Boss;
    subscription: Subscription | null;
}

// Authentication service
class AuthService {
    // Register new boss
    async register(
        email: string,
        password: string,
        name: string,
        phone?: string
    ): Promise<AuthResponse> {
        try {
            const response = await apiService.post<Boss>(
                API_CONFIG.ENDPOINTS.REGISTER,
                { email, password, name, phone },
                false // No auth required for register
            );

            if (response.success && response.data && response.token) {
                // Save token and user data
                await TokenStorage.saveToken(response.token);
                await UserStorage.saveUser(response.data);
                
                if (response.subscription) {
                    await SubscriptionStorage.saveSubscription(response.subscription);
                }
                
                return response as any as AuthResponse;
            }

            throw new Error(response.error || 'Registration failed');
        } catch (error: any) {
            throw new Error(error.message || 'Registration failed');
        }
    }

    // Login boss
    async login(email: string, password: string): Promise<AuthResponse> {
        try {
            const response = await apiService.post<Boss>(
                API_CONFIG.ENDPOINTS.LOGIN,
                { email, password },
                false // No auth required for login
            );

            if (response.success && response.data && response.token) {
                // Save token and user data
                await TokenStorage.saveToken(response.token);
                await UserStorage.saveUser(response.data);
                
                if (response.subscription) {
                    await SubscriptionStorage.saveSubscription(response.subscription);
                }
                
                return response as any as AuthResponse;
            }

            throw new Error(response.error || 'Login failed');
        } catch (error: any) {
            throw new Error(error.message || 'Login failed');
        }
    }

    // Get current user
    async getCurrentUser(): Promise<GetCurrentUserResult> {
        try {
            const response = await apiService.get<Boss>(API_CONFIG.ENDPOINTS.ME);

            if (response.success && response.data) {
                // Update stored user data
                await UserStorage.saveUser(response.data);
                
                if (response.subscription) {
                    await SubscriptionStorage.saveSubscription(response.subscription);
                }
                
                return {
                    user: response.data,
                    subscription: response.subscription || null,
                };
            }

            throw new Error(response.error || 'Failed to get user');
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get user');
        }
    }

    // Logout
    async logout(): Promise<void> {
        try {
            await TokenStorage.removeToken();
            await UserStorage.removeUser();
            await SubscriptionStorage.removeSubscription();
        } catch (error: any) {
            console.error('Logout error:', error);
            throw error;
        }
    }

    // Check if user is authenticated
    async isAuthenticated(): Promise<boolean> {
        const token = await TokenStorage.getToken();
        return !!token;
    }

    // Get stored user data (without API call)
    async getStoredUser(): Promise<Boss | null> {
        return await UserStorage.getUser();
    }

    // Get stored subscription data (without API call)
    async getStoredSubscription(): Promise<Subscription | null> {
        return await SubscriptionStorage.getSubscription();
    }
}

// Export singleton instance
export default new AuthService();
