import { API_CONFIG } from '../config/api';
import apiService from './api.service';
import { Branch, ApiResponse } from '../types';

// Branch service
class BranchService {
    // Get all branches
    async getBranches(): Promise<Branch[]> {
        try {
            const response = await apiService.get<Branch[]>(API_CONFIG.ENDPOINTS.BRANCHES);

            if (response.success && response.data) {
                // Map workersCount to workers for display compatibility
                return response.data.map(branch => ({
                    ...branch,
                    workers: branch.workersCount || 0,
                }));
            }

            throw new Error(response.error || 'Failed to fetch branches');
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch branches');
        }
    }

    // Get single branch
    async getBranch(id: string): Promise<Branch> {
        try {
            const response = await apiService.get<Branch>(API_CONFIG.ENDPOINTS.BRANCH(id));

            if (response.success && response.data) {
                return {
                    ...response.data,
                    workers: response.data.workersCount || 0,
                };
            }

            throw new Error(response.error || 'Failed to fetch branch');
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch branch');
        }
    }

    // Create branch
    async createBranch(
        name: string,
        permanentRate: number = 350,
        contractRate: number = 300
    ): Promise<Branch> {
        try {
            const response = await apiService.post<Branch>(API_CONFIG.ENDPOINTS.BRANCHES, {
                name,
                permanentRate,
                contractRate,
            });

            if (response.success && response.data) {
                return {
                    ...response.data,
                    workers: 0,
                };
            }

            throw new Error(response.error || 'Failed to create branch');
        } catch (error: any) {
            throw new Error(error.message || 'Failed to create branch');
        }
    }

    // Update branch
    async updateBranch(
        id: string,
        data: {
            name?: string;
            permanentRate?: number;
            contractRate?: number;
        }
    ): Promise<Branch> {
        try {
            const response = await apiService.put<Branch>(API_CONFIG.ENDPOINTS.BRANCH(id), data);

            if (response.success && response.data) {
                return {
                    ...response.data,
                    workers: response.data.workersCount || 0,
                };
            }

            throw new Error(response.error || 'Failed to update branch');
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update branch');
        }
    }

    // Delete branch
    async deleteBranch(id: string): Promise<void> {
        try {
            const response = await apiService.delete(API_CONFIG.ENDPOINTS.BRANCH(id));

            if (!response.success) {
                throw new Error(response.error || 'Failed to delete branch');
            }
        } catch (error: any) {
            throw new Error(error.message || 'Failed to delete branch');
        }
    }

    // Get branches metadata (count)
    async getBranchesMetadata(): Promise<{ count: number }> {
        try {
            const response = await apiService.get<{ count: number }>(API_CONFIG.ENDPOINTS.BRANCHES_METADATA);

            if (response.success && response.data) {
                return response.data;
            }

            throw new Error(response.error || 'Failed to fetch branches metadata');
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch branches metadata');
        }
    }
}

// Export singleton instance
export default new BranchService();
