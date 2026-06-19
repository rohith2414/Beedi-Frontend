import { API_CONFIG } from '../config/api';
import apiService from './api.service';
import { ApiResponse, Subscription, Payment, SubscriptionStatus } from '../types';

export interface SubscriptionStatusResponse {
    subscriptionStatus: SubscriptionStatus;
    isActive: boolean;
    daysRemaining: number;
    trialStartDate: string;
    trialEndDate: string | null;
    subscriptionEndDate: string | null;
    plan: {
        amount: number;
        currency: string;
        duration: string;
    };
}

export interface PaymentOrderResponse {
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
    name: string;
    description: string;
}

export interface PaymentVerificationResponse {
    subscriptionStatus: SubscriptionStatus;
    subscriptionEndDate: string;
    paymentId: string;
}

class SubscriptionService {
    // Get subscription status
    async getSubscriptionStatus(): Promise<ApiResponse<SubscriptionStatusResponse>> {
        try {
            return await apiService.get<SubscriptionStatusResponse>(
                API_CONFIG.ENDPOINTS.SUBSCRIPTION_STATUS
            );
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch subscription status');
        }
    }

    // Create a payment order
    async createPaymentOrder(): Promise<ApiResponse<PaymentOrderResponse>> {
        try {
            return await apiService.post<PaymentOrderResponse>(
                API_CONFIG.ENDPOINTS.SUBSCRIPTION_CREATE_ORDER,
                {}
            );
        } catch (error: any) {
            throw new Error(error.message || 'Failed to create payment order');
        }
    }

    // Verify payment
    async verifyPayment(
        razorpay_order_id: string,
        razorpay_payment_id: string,
        razorpay_signature: string
    ): Promise<ApiResponse<PaymentVerificationResponse>> {
        try {
            return await apiService.post<PaymentVerificationResponse>(
                API_CONFIG.ENDPOINTS.SUBSCRIPTION_VERIFY_PAYMENT,
                {
                    razorpay_order_id,
                    razorpay_payment_id,
                    razorpay_signature,
                }
            );
        } catch (error: any) {
            throw new Error(error.message || 'Payment verification failed');
        }
    }

    // Get payment history
    async getPaymentHistory(): Promise<ApiResponse<Payment[]>> {
        try {
            return await apiService.get<Payment[]>(
                API_CONFIG.ENDPOINTS.SUBSCRIPTION_PAYMENTS
            );
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch payment history');
        }
    }
}

export default new SubscriptionService();
