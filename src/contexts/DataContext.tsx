import React, { createContext, useState, useContext, ReactNode } from 'react';
import branchService from '../services/branch.service';
import workerService from '../services/worker.service';
import { Branch, Worker } from '../types';

// Data context interface
interface DataContextType {
    // Branches
    branches: Branch[];
    branchesLoading: boolean;
    branchesError: string | null;
    fetchBranches: () => Promise<void>;
    createBranch: (name: string, permanentRate: number, contractRate: number) => Promise<Branch>;
    updateBranch: (id: string, data: { name?: string; permanentRate?: number; contractRate?: number }) => Promise<Branch>;
    deleteBranch: (id: string) => Promise<void>;

    // Workers
    workers: Worker[];
    workersLoading: boolean;
    workersError: string | null;
    fetchWorkers: (branchId?: string, search?: string) => Promise<void>;
    createWorker: (data: { name: string; serialNo: string; phone?: string; branchId: string; employeeType?: 'PERMANENT' | 'CONTRACT' }) => Promise<Worker>;
    updateWorker: (id: string, data: { name?: string; phone?: string; employeeType?: 'PERMANENT' | 'CONTRACT' }) => Promise<Worker>;
    deleteWorker: (id: string) => Promise<void>;

    // Metadata Counts
    branchesCount: number;
    workersCount: number;
    fetchMetadataCounts: () => Promise<void>;
}

// Create context
const DataContext = createContext<DataContextType | undefined>(undefined);

// Provider props
interface DataProviderProps {
    children: ReactNode;
}

// Data provider component
export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [branchesLoading, setBranchesLoading] = useState(false);
    const [branchesError, setBranchesError] = useState<string | null>(null);

    const [workers, setWorkers] = useState<Worker[]>([]);
    const [workersLoading, setWorkersLoading] = useState(false);
    const [workersError, setWorkersError] = useState<string | null>(null);

    const [branchesCount, setBranchesCount] = useState(0);
    const [workersCount, setWorkersCount] = useState(0);

    // Fetch branches
    const fetchBranches = async () => {
        try {
            setBranchesLoading(true);
            setBranchesError(null);
            const data = await branchService.getBranches();
            setBranches(data);
        } catch (error: any) {
            setBranchesError(error.message || 'Failed to fetch branches');
            throw error;
        } finally {
            setBranchesLoading(false);
        }
    };

    // Fetch metadata counts
    const fetchMetadataCounts = async () => {
        try {
            const [branchRes, workerRes] = await Promise.all([
                branchService.getBranchesMetadata(),
                workerService.getWorkersMetadata(),
            ]);
            setBranchesCount(branchRes.count);
            setWorkersCount(workerRes.count);
        } catch (error: any) {
            console.error('Error fetching metadata counts:', error.message);
        }
    };

    // Create branch
    const createBranch = async (name: string, permanentRate: number, contractRate: number): Promise<Branch> => {
        try {
            const newBranch = await branchService.createBranch(name, permanentRate, contractRate);
            setBranches(prev => [...prev, newBranch]);
            fetchMetadataCounts();
            return newBranch;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to create branch');
        }
    };

    // Update branch
    const updateBranch = async (
        id: string,
        data: { name?: string; permanentRate?: number; contractRate?: number }
    ): Promise<Branch> => {
        try {
            const updatedBranch = await branchService.updateBranch(id, data);
            setBranches(prev => prev.map(b => (b.id === id ? updatedBranch : b)));
            return updatedBranch;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update branch');
        }
    };

    // Delete branch
    const deleteBranch = async (id: string): Promise<void> => {
        try {
            await branchService.deleteBranch(id);
            setBranches(prev => prev.filter(b => b.id !== id));
            fetchMetadataCounts();
        } catch (error: any) {
            throw new Error(error.message || 'Failed to delete branch');
        }
    };

    // Fetch workers
    const fetchWorkers = async (branchId?: string, search?: string) => {
        console.log('📦 DataContext - fetchWorkers called with branchId:', branchId, 'search:', search);
        try {
            setWorkersLoading(true);
            setWorkersError(null);
            console.log('📦 DataContext - Calling workerService.getWorkers...');
            const data = await workerService.getWorkers(branchId, search);
            console.log('📦 DataContext - Setting workers:', data.length);
            setWorkers(data);
        } catch (error: any) {
            console.error('📦 DataContext - Error fetching workers:', error.message);
            setWorkersError(error.message || 'Failed to fetch workers');
            throw error;
        } finally {
            setWorkersLoading(false);
        }
    };

    // Create worker
    const createWorker = async (data: {
        name: string;
        serialNo: string;
        phone?: string;
        branchId: string;
        employeeType?: 'PERMANENT' | 'CONTRACT';
    }): Promise<Worker> => {
        try {
            const newWorker = await workerService.createWorker(data);
            setWorkers(prev => [...prev, newWorker]);

            // Update branch worker count
            setBranches(prev =>
                prev.map(b =>
                    b.id === data.branchId ? { ...b, workers: (b.workers || 0) + 1 } : b
                )
            );

            fetchMetadataCounts();
            return newWorker;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to create worker');
        }
    };

    // Update worker
    const updateWorker = async (
        id: string,
        data: { name?: string; phone?: string; employeeType?: 'PERMANENT' | 'CONTRACT' }
    ): Promise<Worker> => {
        try {
            const updatedWorker = await workerService.updateWorker(id, data);
            setWorkers(prev => prev.map(w => (w.id === id ? updatedWorker : w)));
            return updatedWorker;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update worker');
        }
    };

    // Delete worker
    const deleteWorker = async (id: string): Promise<void> => {
        try {
            const worker = workers.find(w => w.id === id);
            await workerService.deleteWorker(id);
            setWorkers(prev => prev.filter(w => w.id !== id));

            // Update branch worker count
            if (worker) {
                setBranches(prev =>
                    prev.map(b =>
                        b.id === worker.branchId ? { ...b, workers: Math.max((b.workers || 0) - 1, 0) } : b
                    )
                );
            }

            fetchMetadataCounts();
        } catch (error: any) {
            throw new Error(error.message || 'Failed to delete worker');
        }
    };

    const value: DataContextType = {
        branches,
        branchesLoading,
        branchesError,
        fetchBranches,
        createBranch,
        updateBranch,
        deleteBranch,

        workers,
        workersLoading,
        workersError,
        fetchWorkers,
        createWorker,
        updateWorker,
        deleteWorker,

        branchesCount,
        workersCount,
        fetchMetadataCounts,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

// Custom hook to use data context
export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
