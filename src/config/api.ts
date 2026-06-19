// API Configuration
export const API_CONFIG = {
    // Development URL - Change this to your backend URL
    // For USB Connection (ADB): Use localhost with 'adb reverse tcp:5000 tcp:5000'
    // For WiFi Connection: Use your laptop's IP address (e.g., 192.168.1.32)
    // Find your IP: 
    //   - Linux: ip addr show | grep "inet " | grep -v 127.0.0.1
    //   - Windows: ipconfig (look for IPv4 Address)
    //   - Mac: ifconfig | grep "inet " | grep -v 127.0.0.1
    BASE_URL: __DEV__ ? 'http://localhost:5000' : 'https://your-production-url.com',

    // API Endpoints
    ENDPOINTS: {
        // Auth
        REGISTER: '/api/auth/register',
        LOGIN: '/api/auth/login',
        ME: '/api/auth/me',

        // Subscription
        SUBSCRIPTION_STATUS: '/api/subscription/status',
        SUBSCRIPTION_CREATE_ORDER: '/api/subscription/create-order',
        SUBSCRIPTION_VERIFY_PAYMENT: '/api/subscription/verify-payment',
        SUBSCRIPTION_PAYMENTS: '/api/subscription/payments',

        // Branches
        BRANCHES: '/api/branches',
        BRANCH: (id: string) => `/api/branches/${id}`,
        BRANCHES_METADATA: '/api/branches/metadata',

        // Workers (branch-based)
        BRANCH_WORKERS: (branchId: string) => `/api/branches/${branchId}/workers`,
        WORKER: (id: string) => `/api/workers/${id}`,
        WORKERS_METADATA: '/api/workers/metadata',

        // Records
        RECORDS: '/api/records',
        MONTHLY_RECORDS: (workerId: string, year: number, month: number) =>
            `/api/records/${workerId}/${year}/${month}`,
        BULK_RECORDS: '/api/records/bulk',
        RECORD: (id: string) => `/api/records/${id}`,
        RECORDS_DELETE: (id: string) => `/api/records/${id}`,

        // Reports endpoints
        REPORTS_TODAY: '/api/reports/today',
        REPORTS_BRANCH_DAILY: (branchId: string, date: string) => `/api/reports/branch/${branchId}/daily/${date}`,
        REPORTS_BRANCH_MONTHLY: (branchId: string, year: number, month: number) => `/api/reports/branch/${branchId}/monthly/${year}/${month}`,
        REPORTS_BRANCH_YEARLY: (branchId: string, year: number) => `/api/reports/branch/${branchId}/yearly/${year}`,
        REPORTS_ALL_BRANCHES_DAILY: (date: string) => `/api/reports/all-branches/daily/${date}`,
        REPORTS_ALL_BRANCHES_MONTHLY: (year: number, month: number) => `/api/reports/all-branches/monthly/${year}/${month}`,
        REPORTS_ALL_BRANCHES_YEARLY: (year: number) => `/api/reports/all-branches/yearly/${year}`,

        // Reports
        DASHBOARD: '/api/reports/dashboard',
        WORKER_SALARY: (workerId: string, year: number, month: number, deductDues: boolean = true) =>
            `/api/reports/worker/${workerId}/${year}/${month}?deductDues=${deductDues}`,
        BRANCH_REPORT: (branchId: string, year: number, month: number) =>
            `/api/reports/branch/${branchId}/${year}/${month}`,
    },

    // Request timeout in milliseconds
    TIMEOUT: 30000,

    // Retry configuration
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
};

// Helper to get full URL
export const getFullUrl = (endpoint: string): string => {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
};
