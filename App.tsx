import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  BackHandler,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Branch, Worker } from './src/types';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { DataProvider, useData } from './src/contexts/DataContext';
import DashboardView from './src/components/DashboardView';
import BranchesView from './src/components/BranchesView';
import WorkersView from './src/components/WorkersView';
import WorkerCardView from './src/components/WorkerCardView';
import ReportsView from './src/components/ReportsView';
import RateModal from './src/components/RateModal';
import CreateBranchModal from './src/components/CreateBranchModal';
import CreateWorkerModal from './src/components/CreateWorkerModal';
import EditWorkerModal from './src/components/EditWorkerModal';
import LoginScreen from './src/components/LoginScreen';
import LoadingSpinner from './src/components/LoadingSpinner';
import SubscriptionScreen from './src/components/SubscriptionScreen';
import { subscriptionEventEmitter } from './src/utils/subscriptionEvents';

// Main app component (wrapped with auth)
const AppContent = () => {
  const { isAuthenticated, isLoading: authLoading, subscription } = useAuth();
  const { 
    branches, 
    workers, 
    fetchBranches, 
    fetchWorkers, 
    branchesCount, 
    workersCount, 
    fetchMetadataCounts 
  } = useData();

  const [currentView, setCurrentView] = useState<'dashboard' | 'branches' | 'workers' | 'worker-card' | 'reports' | 'subscription'>('dashboard');
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [showRateModal, setShowRateModal] = useState(false);
  const [showCreateBranchModal, setShowCreateBranchModal] = useState(false);
  const [showCreateWorkerModal, setShowCreateWorkerModal] = useState(false);
  const [showEditWorkerModal, setShowEditWorkerModal] = useState(false);
  const [workerToEdit, setWorkerToEdit] = useState<Worker | null>(null);

  const isLocked = subscription?.status === 'TRIAL_EXPIRED' || subscription?.status === 'EXPIRED';

  // Listen for subscription events (e.g. 403 API responses)
  useEffect(() => {
    const unsubscribe = subscriptionEventEmitter.subscribe(() => {
      console.log('💳 Subscription expired event received - redirecting to subscription screen');
      setCurrentView('subscription');
    });
    return unsubscribe;
  }, []);

  // Redirect to subscription screen if subscription status is expired
  useEffect(() => {
    if (isAuthenticated && isLocked && currentView !== 'subscription') {
      setCurrentView('subscription');
    }
  }, [isAuthenticated, isLocked, currentView]);

  // Fetch initial data when authenticated
  useEffect(() => {
    if (isAuthenticated && !isLocked) {
      loadInitialData();
    }
  }, [isAuthenticated, isLocked]);

  const loadInitialData = async () => {
    try {
      await fetchBranches();
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  // Fetch fresh metadata counts whenever navigating back to the dashboard
  useEffect(() => {
    if (isAuthenticated && !isLocked && currentView === 'dashboard') {
      fetchMetadataCounts();
    }
  }, [currentView, isAuthenticated, isLocked]);

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      if (isLocked) {
        // Prevent back navigation if user is locked out
        return true;
      }
      if (currentView === 'subscription') {
        setCurrentView('dashboard');
        return true;
      }
      if (currentView === 'worker-card') {
        setCurrentView('workers');
        return true;
      } else if (currentView === 'reports') {
        setCurrentView('dashboard');
        return true;
      } else if (currentView === 'workers') {
        if (selectedBranch) {
          setSelectedBranch(null);
          setCurrentView('branches');
        } else {
          setCurrentView('dashboard');
        }
        return true;
      } else if (currentView === 'branches') {
        setCurrentView('dashboard');
        return true;
      }
      return false; // Let default behavior happen (exit app) when on dashboard
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [currentView, selectedBranch, isLocked]);

  // Show loading screen while checking auth
  if (authLoading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

      {currentView === 'dashboard' && (
        <DashboardView
          totalBranches={branchesCount}
          totalWorkers={workersCount}
          onNavigate={async (screen) => {
            try {
              if (screen === 'branches') {
                // Fetch fresh branch data when navigating to branches
                await fetchBranches();
              } else if (screen === 'workers') {
                // Fetch all workers when navigating to workers directly
                await fetchWorkers();
              }
            } catch (error) {
              console.error(`Error navigating to ${screen}:`, error);
            }
            setCurrentView(screen);
          }}
        />
      )}

      {currentView === 'branches' && (
        <BranchesView
          branches={branches}
          onSelectBranch={async (branch) => {
            try {
              console.log('Branch selected:', branch.name, 'ID:', branch.id);
              setSelectedBranch(branch);
              // Fetch workers for the selected branch
              console.log('Fetching workers for branch:', branch.id);
              await fetchWorkers(branch.id);
              console.log('Workers fetched successfully');
              setCurrentView('workers');
            } catch (error: any) {
              console.error('Error in onSelectBranch:', error.message);
              Alert.alert('Error', `Failed to load workers: ${error.message}`);
            }
          }}
          onUpdateRateRequest={(branch) => {
            setSelectedBranch(branch);
            setShowRateModal(true);
          }}
          onBack={() => setCurrentView('dashboard')}
          onCreateBranch={() => setShowCreateBranchModal(true)}
        />
      )}

      {currentView === 'workers' && (
        <WorkersView
          workers={selectedBranch ? workers.filter(w => w.branchId === selectedBranch.id) : workers}
          branches={branches}
          selectedBranch={selectedBranch}
          onBack={() => {
            if (selectedBranch) {
              setSelectedBranch(null);
              setCurrentView('branches');
            } else {
              setCurrentView('dashboard');
            }
          }}
          onSelectWorker={(worker) => {
            setSelectedWorker(worker);
            // Find and set the branch based on worker's branchId
            const workerBranch = branches.find(b => b.id === worker.branchId);
            if (workerBranch) {
              setSelectedBranch(workerBranch);
            }
            setCurrentView('worker-card');
          }}
          onCreateWorker={() => setShowCreateWorkerModal(true)}
          onEditWorker={(worker) => {
            setWorkerToEdit(worker);
            setShowEditWorkerModal(true);
          }}
        />
      )}

      {currentView === 'worker-card' && selectedWorker && selectedBranch && (
        <WorkerCardView
          key={selectedWorker.id}
          worker={selectedWorker}
          branch={selectedBranch}
          onBack={() => setCurrentView('workers')}
        />
      )}

      {currentView === 'reports' && (
        <ReportsView
          branches={branches}
          onBack={() => setCurrentView('dashboard')}
        />
      )}

      {currentView === 'subscription' && (
        <SubscriptionScreen
          onBack={() => setCurrentView('dashboard')}
          canGoBack={!isLocked}
        />
      )}

      <RateModal
        visible={showRateModal}
        branch={selectedBranch}
        onClose={() => setShowRateModal(false)}
        onUpdate={async (branchId, permanentRate, contractRate) => {
          // This will be handled by the modal itself now
          setShowRateModal(false);
        }}
      />

      <CreateBranchModal
        visible={showCreateBranchModal}
        onClose={() => setShowCreateBranchModal(false)}
        onCreate={async (name, permanentRate, contractRate) => {
          // This will be handled by the modal itself now
          setShowCreateBranchModal(false);
        }}
      />

      <CreateWorkerModal
        visible={showCreateWorkerModal}
        branchId={selectedBranch?.id || ''}
        onClose={() => setShowCreateWorkerModal(false)}
        onCreate={async (name, serialNo, phone, branchId, workerType) => {
          // This will be handled by the modal itself now
          setShowCreateWorkerModal(false);
        }}
      />

      <EditWorkerModal
        visible={showEditWorkerModal}
        worker={workerToEdit}
        onClose={() => {
          setShowEditWorkerModal(false);
          setWorkerToEdit(null);
        }}
        onUpdate={async (id, name, serialNo, phone, employeeType) => {
          // Update selectedWorker if it's the one being edited
          if (selectedWorker && selectedWorker.id === id) {
            setSelectedWorker({
              ...selectedWorker,
              name,
              serialNo,
              phone,
              employeeType,
            });
          }
          setShowEditWorkerModal(false);
          setWorkerToEdit(null);
        }}
      />
    </SafeAreaView>
  );
};

// Root app component with providers
const BeediManagementApp = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 16,
    padding: 8,
  },
  backButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 16,
    color: '#6b7280',
  },
});

export default BeediManagementApp;