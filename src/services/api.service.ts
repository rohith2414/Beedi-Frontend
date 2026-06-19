import { API_CONFIG, getFullUrl } from '../config/api';
import { TokenStorage } from '../utils/storage';
import { ApiResponse, ApiError } from '../types';
import { authEventEmitter } from '../utils/authEvents';
import { subscriptionEventEmitter } from '../utils/subscriptionEvents';

// Request options interface
interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    headers?: Record<string, string>;
    requiresAuth?: boolean;
}

// Base API service class
class ApiService {
    private async getAuthHeaders(): Promise<Record<string, string>> {
        const token = await TokenStorage.getToken();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    private async makeRequest<T>(
        endpoint: string,
        options: RequestOptions = {}
    ): Promise<ApiResponse<T>> {
        const {
            method = 'GET',
            body,
            headers: customHeaders = {},
            requiresAuth = true,
        } = options;

        try {
            const url = getFullUrl(endpoint);
            const headers = requiresAuth
                ? await this.getAuthHeaders()
                : { 'Content-Type': 'application/json', ...customHeaders };

            const config: RequestInit = {
                method,
                headers: { ...headers, ...customHeaders },
            };

            if (body && method !== 'GET') {
                config.body = JSON.stringify(body);
            }

            console.log(`API Request: ${method} ${url}`);

            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                // Handle specific error codes
                if (response.status === 401) {
                    // Unauthorized - clear token and notify auth context
                    await TokenStorage.removeToken();
                    authEventEmitter.emit(); // Notify AuthContext to logout
                    throw new Error(data.error || 'Unauthorized. Please login again.');
                }

                if (response.status === 403 && data.error === 'SUBSCRIPTION_EXPIRED') {
                    // Subscription or trial expired
                    subscriptionEventEmitter.emit({
                        subscriptionStatus: data.data?.subscriptionStatus,
                        trialEndDate: data.data?.trialEndDate,
                        subscriptionEndDate: data.data?.subscriptionEndDate,
                    });
                    throw new Error(data.message || 'Subscription expired.');
                }

                throw new Error(data.error || `Request failed with status ${response.status}`);
            }

            return data;
        } catch (error: any) {
            console.error(`API Error: ${endpoint}`, error);
            throw error;
        }
    }

    // GET request
    async get<T>(endpoint: string, requiresAuth: boolean = true): Promise<ApiResponse<T>> {
        return this.makeRequest<T>(endpoint, { method: 'GET', requiresAuth });
    }

    // POST request
    async post<T>(
        endpoint: string,
        body: any,
        requiresAuth: boolean = true
    ): Promise<ApiResponse<T>> {
        return this.makeRequest<T>(endpoint, { method: 'POST', body, requiresAuth });
    }

    // PUT request
    async put<T>(
        endpoint: string,
        body: any,
        requiresAuth: boolean = true
    ): Promise<ApiResponse<T>> {
        return this.makeRequest<T>(endpoint, { method: 'PUT', body, requiresAuth });
    }

    // DELETE request
    async delete<T>(endpoint: string, requiresAuth: boolean = true): Promise<ApiResponse<T>> {
        return this.makeRequest<T>(endpoint, { method: 'DELETE', requiresAuth });
    }

    // Check if user is authenticated
    async isAuthenticated(): Promise<boolean> {
        const token = await TokenStorage.getToken();
        return !!token;
    }
}

// Export singleton instance
export default new ApiService();
