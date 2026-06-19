// Event emitter for auth events
class AuthEventEmitter {
    private listeners: Set<() => void> = new Set();

    subscribe(callback: () => void) {
        this.listeners.add(callback);
        return () => {
            this.listeners.delete(callback);
        };
    }

    emit() {
        this.listeners.forEach(callback => callback());
    }
}

export const authEventEmitter = new AuthEventEmitter();
