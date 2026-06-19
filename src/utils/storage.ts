import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
    AUTH_TOKEN: '@beedi_auth_token',
    USER_DATA: '@beedi_user_data',
    SUBSCRIPTION_DATA: '@beedi_subscription_data',
    BRANCHES_CACHE: '@beedi_branches_cache',
    WORKERS_CACHE: '@beedi_workers_cache',
};

// Token management
export const TokenStorage = {
    async saveToken(token: string): Promise<void> {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        } catch (error) {
            console.error('Error saving token:', error);
            throw error;
        }
    },

    async getToken(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        } catch (error) {
            console.error('Error getting token:', error);
            return null;
        }
    },

    async removeToken(): Promise<void> {
        try {
            await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        } catch (error) {
            console.error('Error removing token:', error);
            throw error;
        }
    },
};

// User data management
export const UserStorage = {
    async saveUser(user: any): Promise<void> {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
        } catch (error) {
            console.error('Error saving user:', error);
            throw error;
        }
    },

    async getUser(): Promise<any | null> {
        try {
            const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error getting user:', error);
            return null;
        }
    },

    async removeUser(): Promise<void> {
        try {
            await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
        } catch (error) {
            console.error('Error removing user:', error);
            throw error;
        }
    },
};

// Subscription data management
export const SubscriptionStorage = {
    async saveSubscription(subscription: any): Promise<void> {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTION_DATA, JSON.stringify(subscription));
        } catch (error) {
            console.error('Error saving subscription:', error);
            throw error;
        }
    },

    async getSubscription(): Promise<any | null> {
        try {
            const subData = await AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTION_DATA);
            return subData ? JSON.parse(subData) : null;
        } catch (error) {
            console.error('Error getting subscription:', error);
            return null;
        }
    },

    async removeSubscription(): Promise<void> {
        try {
            await AsyncStorage.removeItem(STORAGE_KEYS.SUBSCRIPTION_DATA);
        } catch (error) {
            console.error('Error removing subscription:', error);
            throw error;
        }
    },
};

// Cache management
export const CacheStorage = {
    async saveCache(key: string, data: any, expiryMinutes: number = 5): Promise<void> {
        try {
            const cacheData = {
                data,
                expiry: Date.now() + expiryMinutes * 60 * 1000,
            };
            await AsyncStorage.setItem(key, JSON.stringify(cacheData));
        } catch (error) {
            console.error('Error saving cache:', error);
        }
    },

    async getCache(key: string): Promise<any | null> {
        try {
            const cacheString = await AsyncStorage.getItem(key);
            if (!cacheString) return null;

            const cacheData = JSON.parse(cacheString);
            if (Date.now() > cacheData.expiry) {
                await AsyncStorage.removeItem(key);
                return null;
            }

            return cacheData.data;
        } catch (error) {
            console.error('Error getting cache:', error);
            return null;
        }
    },

    async clearCache(): Promise<void> {
        try {
            await AsyncStorage.removeItem(STORAGE_KEYS.BRANCHES_CACHE);
            await AsyncStorage.removeItem(STORAGE_KEYS.WORKERS_CACHE);
        } catch (error) {
            console.error('Error clearing cache:', error);
        }
    },
};

// Clear all app data
export const clearAllStorage = async (): Promise<void> => {
    try {
        await AsyncStorage.clear();
    } catch (error) {
        console.error('Error clearing storage:', error);
        throw error;
    }
};
