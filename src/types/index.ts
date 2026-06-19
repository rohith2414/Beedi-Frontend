export type SubscriptionStatus = 'TRIAL' | 'TRIAL_EXPIRED' | 'ACTIVE' | 'EXPIRED';
export type PaymentStatus = 'CREATED' | 'PAID' | 'FAILED';

export interface Subscription {
    status: SubscriptionStatus;
    trialEndDate: string | null;
    subscriptionEndDate: string | null;
    daysRemaining: number;
}

export interface Payment {
    id: string;
    razorpayOrderId: string;
    razorpayPaymentId: string | null;
    amount: number;
    currency: string;
    status: PaymentStatus;
    planDuration: string;
    createdAt: string;
}

// Boss/User types
export interface Boss {
    id: string;
    email: string;
    name: string;
    phone?: string;
    createdAt: string;
    updatedAt?: string;
    subscriptionStatus?: SubscriptionStatus;
    trialStartDate?: string;
    trialEndDate?: string | null;
    subscriptionEndDate?: string | null;
}


// Branch types
export interface Branch {
    id: string;
    bossId?: string;
    name: string;
    workers?: number; // For display purposes
    workersCount?: number; // From API
    permanentRate: number;
    contractRate: number;
    createdAt?: string;
    updatedAt?: string;
}

// Worker types
export interface Worker {
    id: string;
    serialNo: string;
    name: string;
    branchId: string;
    phone?: string;
    employeeType: 'PERMANENT' | 'CONTRACT';
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
    branch?: Branch;
    branchName?: string;
    // Legacy support
    workerType?: 'permanent' | 'contract';
}

// Daily Record types
export interface DailyRecord {
    id?: string;
    workerId?: string;
    date: string | Date;
    day?: number; // For display purposes
    aaku: string | number;
    thambaku: string | number;
    dharam: string | number;
    kattalu: string | number;
    baakiKattalu: string | number; // API field name
    due?: string | number; // Legacy support
    createdAt?: string;
    updatedAt?: string;
}

// Legacy type alias
export interface DailyData extends DailyRecord { }

// API Response types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    count?: number;
    error?: string;
    message?: string;
    token?: string;
    subscription?: Subscription;
}

export interface AuthResponse {
    success: boolean;
    data: Boss;
    token: string;
    subscription: Subscription;
}

export interface DashboardSummary {
    totalBranches: number;
    totalWorkers: number;
    activeWorkers: number;
    currentMonthRecords: number;
    currentMonth: {
        year: number;
        month: number;
    };
}

export interface WorkerSalaryReport {
    worker: {
        id: string;
        name: string;
        serialNo: string;
        employeeType: 'PERMANENT' | 'CONTRACT';
    };
    branch: {
        id: string;
        name: string;
    };
    period: {
        year: number;
        month: number;
    };
    salary: {
        totalKattalu: number;
        totalDue: number;
        effectiveKattalu: number;
        rate: number;
        totalSalary: number;
        deductDues: boolean;
    };
    recordsCount: number;
}

export interface BranchMonthlyReport {
    branch: {
        id: string;
        name: string;
        permanentRate: number;
        contractRate: number;
    };
    period: {
        year: number;
        month: number;
    };
    summary: {
        totalWorkers: number;
        totalSalary: number;
        totalKattalu: number;
    };
    workers: Array<{
        workerId: string;
        workerName: string;
        serialNo: string;
        employeeType: 'PERMANENT' | 'CONTRACT';
        totalKattalu: number;
        totalDue: number;
        effectiveKattalu: number;
        rate: number;
        totalSalary: number;
        deductDues: boolean;
    }>;
}

// Error types
export interface ApiError {
    success: false;
    error: string;
    statusCode?: number;
}

