import apiService from './api.service';
import { API_CONFIG } from '../config/api';
import { formatDateForAPI } from '../utils/date';

interface BranchSummary {
    branchId: string;
    branchName: string;
    totalKattalu: number;
}

interface TodaySummaryResponse {
    date: string;
    combined: {
        totalKattalu: number;
    };
    branches: BranchSummary[];
}

interface BranchReportSummary {
    totalKattalu: number;
    totalAaku: number;
    totalThambaku: number;
    totalDharam: number;
}

interface BranchReportResponse {
    branch: {
        id: string;
        name: string;
    };
    date?: string;
    period?: {
        year: number;
        month?: number;
    };
    summary: BranchReportSummary;
}

class ReportService {
    /**
     * Get today's summary for all branches
     */
    async getTodaySummary(): Promise<TodaySummaryResponse> {
        try {
            const response: any = await apiService.get(API_CONFIG.ENDPOINTS.REPORTS_TODAY);

            if (response.success && response.data) {
                return response.data;
            }

            throw new Error('Failed to fetch today\'s summary');
        } catch (error: any) {
            console.error('Error in getTodaySummary:', error.message);
            throw error;
        }
    }

    /**
     * Get daily report for a specific branch
     */
    async getBranchDailyReport(branchId: string, date: Date): Promise<BranchReportResponse> {
        try {
            const dateStr = formatDateForAPI(date);
            const endpoint = API_CONFIG.ENDPOINTS.REPORTS_BRANCH_DAILY(branchId, dateStr);
            const response: any = await apiService.get(endpoint);

            if (response.success && response.data) {
                return response.data;
            }

            throw new Error('Failed to fetch daily report');
        } catch (error: any) {
            console.error('Error in getBranchDailyReport:', error.message);
            throw error;
        }
    }

    /**
     * Get monthly report for a specific branch
     */
    async getBranchMonthlyReport(branchId: string, year: number, month: number): Promise<BranchReportResponse> {
        try {
            const endpoint = API_CONFIG.ENDPOINTS.REPORTS_BRANCH_MONTHLY(branchId, year, month);
            const response: any = await apiService.get(endpoint);

            if (response.success && response.data) {
                return response.data;
            }

            throw new Error('Failed to fetch monthly report');
        } catch (error: any) {
            console.error('Error in getBranchMonthlyReport:', error.message);
            throw error;
        }
    }

    /**
     * Get yearly report for a specific branch
     */
    async getBranchYearlyReport(branchId: string, year: number): Promise<BranchReportResponse> {
        try {
            const endpoint = API_CONFIG.ENDPOINTS.REPORTS_BRANCH_YEARLY(branchId, year);
            const response: any = await apiService.get(endpoint);

            if (response.success && response.data) {
                return response.data;
            }

            throw new Error('Failed to fetch yearly report');
        } catch (error: any) {
            console.error('Error in getBranchYearlyReport:', error.message);
            throw error;
        }
    }

    /**
     * Get daily report for ALL branches combined
     */
    async getAllBranchesDailyReport(date: Date): Promise<{ date: string; summary: BranchReportSummary }> {
        try {
            const dateStr = formatDateForAPI(date);
            const endpoint = API_CONFIG.ENDPOINTS.REPORTS_ALL_BRANCHES_DAILY(dateStr);
            const response: any = await apiService.get(endpoint);

            if (response.success && response.data) {
                return response.data;
            }

            throw new Error('Failed to fetch all branches daily report');
        } catch (error: any) {
            console.error('Error in getAllBranchesDailyReport:', error.message);
            throw error;
        }
    }

    /**
     * Get monthly report for ALL branches combined
     */
    async getAllBranchesMonthlyReport(year: number, month: number): Promise<{ period: { year: number; month: number }; summary: BranchReportSummary }> {
        try {
            const endpoint = API_CONFIG.ENDPOINTS.REPORTS_ALL_BRANCHES_MONTHLY(year, month);
            const response: any = await apiService.get(endpoint);

            if (response.success && response.data) {
                return response.data;
            }

            throw new Error('Failed to fetch all branches monthly report');
        } catch (error: any) {
            console.error('Error in getAllBranchesMonthlyReport:', error.message);
            throw error;
        }
    }

    /**
     * Get yearly report for ALL branches combined
     */
    async getAllBranchesYearlyReport(year: number): Promise<{ period: { year: number }; summary: BranchReportSummary }> {
        try {
            const endpoint = API_CONFIG.ENDPOINTS.REPORTS_ALL_BRANCHES_YEARLY(year);
            const response: any = await apiService.get(endpoint);

            if (response.success && response.data) {
                return response.data;
            }

            throw new Error('Failed to fetch all branches yearly report');
        } catch (error: any) {
            console.error('Error in getAllBranchesYearlyReport:', error.message);
            throw error;
        }
    }
}

export default new ReportService();
