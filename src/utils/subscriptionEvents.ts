import { SubscriptionStatus } from '../types';

interface SubscriptionExpiredPayload {
    subscriptionStatus: SubscriptionStatus;
    trialEndDate?: string | null;
    subscriptionEndDate?: string | null;
}

class SubscriptionEventEmitter {
    private listeners: Set<(data?: SubscriptionExpiredPayload) => void> = new Set();

    subscribe(callback: (data?: SubscriptionExpiredPayload) => void) {
        this.listeners.add(callback);
        return () => {
            this.listeners.delete(callback);
        };
    }

    emit(data?: SubscriptionExpiredPayload) {
        this.listeners.forEach(callback => callback(data));
    }
}

export const subscriptionEventEmitter = new SubscriptionEventEmitter();
