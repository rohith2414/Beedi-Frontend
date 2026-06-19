import { API_CONFIG } from '../config/api';
import apiService from './api.service';
import { DailyRecord, ApiResponse } from '../types';
import { formatDateForAPI } from '../utils/date';

// Record service
class RecordService {
    // Get monthly records for a worker
    async getMonthlyRecords(workerId: string, year: number, month: number): Promise<DailyRecord[]> {
        try {
            const endpoint = API_CONFIG.ENDPOINTS.MONTHLY_RECORDS(workerId, year, month);

            // The API returns: { success: true, count: N, data: [...records] }
            const response: any = await apiService.get(endpoint);

            if (response.success && response.data) {
                // Map baakiKattalu to due for compatibility and add day number
                return response.data.map((record: any) => {
                    const date = new Date(record.date);
                    return {
                        ...record,
                        day: date.getDate(),
                        due: record.baakiKattalu,
                    };
                });
            }

            throw new Error('Failed to fetch records');
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch records');
        }
    }

    // Create or update a single daily record (supports partial updates)
    async saveRecord(data: {
        workerId: string;
        date: string | Date;
        aaku?: number;
        thambaku?: number;
        dharam?: number;
        kattalu?: number;
        baakiKattalu?: number;
    }): Promise<DailyRecord> {
        try {
            const dateStr = typeof data.date === 'string' ? data.date : formatDateForAPI(data.date);

            // Build request body with only provided fields (partial update support)
            const requestBody: any = {
                workerId: data.workerId,
                date: dateStr,
            };

            // Only include fields that are explicitly provided
            if (data.aaku !== undefined) requestBody.aaku = data.aaku;
            if (data.thambaku !== undefined) requestBody.thambaku = data.thambaku;
            if (data.dharam !== undefined) requestBody.dharam = data.dharam;
            if (data.kattalu !== undefined) requestBody.kattalu = data.kattalu;
            if (data.baakiKattalu !== undefined) requestBody.baakiKattalu = data.baakiKattalu;
            console.log('💾 Saving record:', requestBody);
            // The API returns: { success: true, data: {...record} }
            const response: any = await apiService.post(API_CONFIG.ENDPOINTS.RECORDS, requestBody);

            if (response.success && response.data) {
                const date = new Date(response.data.date);
                return {
                    ...response.data,
                    day: date.getDate(),
                    due: response.data.baakiKattalu,
                };
            }

            throw new Error('Failed to save record');
        } catch (error: any) {
            throw new Error(error.message || 'Failed to save record');
        }
    }

    // Bulk save records (supports partial updates for each record)
    async bulkSaveRecords(
        workerId: string,
        records: Array<{
            date: string | Date;
            aaku?: number;
            thambaku?: number;
            dharam?: number;
            kattalu?: number;
            baakiKattalu?: number;
        }>
    ): Promise<DailyRecord[]> {
        try {
            // Format records, only including provided fields (partial update support)
            const formattedRecords = records.map(record => {
                const recordData: any = {
                    date: typeof record.date === 'string' ? record.date : formatDateForAPI(record.date),
                };

                // Only include fields that are explicitly provided
                if (record.aaku !== undefined) recordData.aaku = record.aaku;
                if (record.thambaku !== undefined) recordData.thambaku = record.thambaku;
                if (record.dharam !== undefined) recordData.dharam = record.dharam;
                if (record.kattalu !== undefined) recordData.kattalu = record.kattalu;
                if (record.baakiKattalu !== undefined) recordData.baakiKattalu = record.baakiKattalu;

                return recordData;
            });

            // The API returns: { success: true, count: N, data: [...records] }
            const response: any = await apiService.post(API_CONFIG.ENDPOINTS.BULK_RECORDS, {
                workerId,
                records: formattedRecords,
            });

            if (response.success && response.data) {
                return response.data.map((record: any) => {
                    const date = new Date(record.date);
                    return {
                        ...record,
                        day: date.getDate(),
                        due: record.baakiKattalu,
                    };
                });
            }

            throw new Error('Failed to bulk save records');
        } catch (error: any) {
            throw new Error(error.message || 'Failed to bulk save records');
        }
    }

    // Delete a record
    async deleteRecord(id: string): Promise<void> {
        try {
            const response = await apiService.delete(API_CONFIG.ENDPOINTS.RECORD(id));

            if (!response.success) {
                throw new Error(response.error || 'Failed to delete record');
            }
        } catch (error: any) {
            throw new Error(error.message || 'Failed to delete record');
        }
    }
}

// Export singleton instance
export default new RecordService();
