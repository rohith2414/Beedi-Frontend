import { API_CONFIG } from '../config/api';
import apiService from './api.service';
import { Worker, ApiResponse } from '../types';

// Worker service
class WorkerService {
    // Get all workers with optional filters
    async getWorkers(branchId?: string, search?: string): Promise<Worker[]> {
        try {
            let endpoint = '';
            if (branchId) {
                endpoint = API_CONFIG.ENDPOINTS.BRANCH_WORKERS(branchId);
            } else {
                endpoint = '/api/workers';
            }

            if (search) {
                endpoint += `${endpoint.includes('?') ? '&' : '?'}search=${encodeURIComponent(search)}`;
            }

            console.log('🔍 Worker Service - Calling API:', endpoint);

            // The API returns: { success: true, workers: [...] } (for branch-based) or { success: true, data: [...] } (for /api/workers)
            const response: any = await apiService.get(endpoint);

            console.log('🔍 Worker Service - Response:', JSON.stringify(response).substring(0, 300));

            if (response.success) {
                const workers = response.data || response.workers || [];
                console.log('✅ Worker Service - Received', workers.length, 'workers');

                // Map employeeType to workerType for compatibility
                return workers.map((worker: Worker) => ({
                    ...worker,
                    workerType: worker.employeeType === 'PERMANENT' ? 'permanent' : 'contract',
                }));
            }

            throw new Error('Failed to fetch workers - invalid response structure');
        } catch (error: any) {
            console.error('❌ Worker Service - Error:', error.message);
            throw new Error(error.message || 'Failed to fetch workers');
        }
    }

    // Get single worker
    async getWorker(id: string): Promise<Worker> {
        try {
            const response = await apiService.get<Worker>(API_CONFIG.ENDPOINTS.WORKER(id));

            if (response.success && response.data) {
                return {
                    ...response.data,
                    workerType: response.data.employeeType === 'PERMANENT' ? 'permanent' : 'contract',
                };
            }

            throw new Error(response.error || 'Failed to fetch worker');
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch worker');
        }
    }

    // Create worker
    async createWorker(data: {
        name: string;
        serialNo: string;
        phone?: string;
        branchId: string;
        employeeType?: 'PERMANENT' | 'CONTRACT';
    }): Promise<Worker> {
        try {
            const { branchId, ...workerData } = data;

            // The API returns: { success: true, data: {...worker}, branch: {...} }
            const response: any = await apiService.post(
                API_CONFIG.ENDPOINTS.BRANCH_WORKERS(branchId),
                {
                    ...workerData,
                    employeeType: data.employeeType || 'PERMANENT',
                }
            );

            if (response.success && response.data) {
                // Extract worker directly from response.data
                const worker = response.data;

                return {
                    ...worker,
                    workerType: worker.employeeType === 'PERMANENT' ? 'permanent' : 'contract',
                };
            }

            throw new Error('Failed to create worker - invalid response structure');
        } catch (error: any) {
            throw new Error(error.message || 'Failed to create worker');
        }
    }

    // Update worker
    async updateWorker(
        id: string,
        data: {
            name?: string;
            phone?: string;
            employeeType?: 'PERMANENT' | 'CONTRACT';
            isActive?: boolean;
        }
    ): Promise<Worker> {
        try {
            const response = await apiService.put<Worker>(API_CONFIG.ENDPOINTS.WORKER(id), data);

            if (response.success && response.data) {
                return {
                    ...response.data,
                    workerType: response.data.employeeType === 'PERMANENT' ? 'permanent' : 'contract',
                };
            }

            throw new Error(response.error || 'Failed to update worker');
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update worker');
        }
    }

    // Delete worker
    async deleteWorker(id: string): Promise<void> {
        try {
            const response = await apiService.delete(API_CONFIG.ENDPOINTS.WORKER(id));

            if (!response.success) {
                throw new Error(response.error || 'Failed to delete worker');
            }
        } catch (error: any) {
            throw new Error(error.message || 'Failed to delete worker');
        }
    }

    // Get workers metadata (count)
    async getWorkersMetadata(): Promise<{ count: number }> {
        try {
            const response = await apiService.get<{ count: number }>(API_CONFIG.ENDPOINTS.WORKERS_METADATA);

            if (response.success && response.data) {
                return response.data;
            }

            throw new Error(response.error || 'Failed to fetch workers metadata');
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch workers metadata');
        }
    }
}

// Export singleton instance
export default new WorkerService();
