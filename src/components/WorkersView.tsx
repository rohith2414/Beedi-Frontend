import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Linking,
} from 'react-native';
import { Worker, Branch } from '../types';

interface WorkersViewProps {
    workers: Worker[];
    branches: Branch[];
    selectedBranch: Branch | null;
    onBack: () => void;
    onSelectWorker: (worker: Worker) => void;
    onCreateWorker: () => void;
    onEditWorker: (worker: Worker) => void;
}

const WorkersView: React.FC<WorkersViewProps> = ({
    workers,
    branches,
    selectedBranch,
    onBack,
    onSelectWorker,
    onCreateWorker,
    onEditWorker,
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredWorkers = selectedBranch
        ? workers.filter(w =>
            w.branchId === selectedBranch.id &&
            (w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                w.serialNo.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        : workers.filter(w =>
            w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            w.serialNo.toLowerCase().includes(searchQuery.toLowerCase())
        );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={onBack}
                >
                    <Text style={styles.backButtonText}>← Back to Branches</Text>
                </TouchableOpacity>

                <View style={styles.headerRow}>
                    <Text style={styles.headerTitle}>{selectedBranch?.name || 'All Workers'}</Text>
                    {selectedBranch && (
                        <TouchableOpacity
                            style={styles.createButton}
                            onPress={onCreateWorker}
                        >
                            <Text style={styles.createButtonText}>+ Add</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {selectedBranch && (
                    <Text style={styles.subtitle}>P:₹{selectedBranch.permanentRate} C:₹{selectedBranch.contractRate}/1000</Text>
                )}

                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by name or serial number..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <ScrollView
                style={styles.scrollContent}
                contentContainerStyle={styles.scrollContentContainer}
            >
                {filteredWorkers.length === 0 ? (
                    <Text style={styles.emptyText}>No workers found</Text>
                ) : (
                    filteredWorkers.map(worker => (
                        <TouchableOpacity
                            key={worker.id}
                            style={styles.workerCard}
                            onPress={() => onSelectWorker(worker)}
                        >
                            <View style={styles.workerCardContent}>
                                <View style={styles.workerInfo}>
                                    <View style={styles.workerHeader}>
                                        <View style={styles.serialBadge}>
                                            <Text style={styles.serialText}>{worker.serialNo}</Text>
                                        </View>
                                        <Text style={styles.workerName}>{worker.name}</Text>
                                        <View style={[styles.typeBadge, worker.employeeType === 'PERMANENT' ? styles.typeBadgePermanent : styles.typeBadgeContract]}>
                                            <Text style={styles.typeBadgeText}>{worker.employeeType === 'PERMANENT' ? 'P' : 'C'}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.phoneText}>{worker.phone}</Text>
                                    {!selectedBranch && (
                                        <Text style={styles.workerBranchName}>
                                            📍 {branches.find(b => b.id === worker.branchId)?.name || 'Unknown Branch'}
                                        </Text>
                                    )}
                                </View>
                                <View style={styles.actionButtons}>
                                    <TouchableOpacity
                                        style={styles.callButton}
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            Linking.openURL(`tel:${worker.phone}`);
                                        }}
                                    >
                                        <Text style={styles.callButtonText}>📞</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.editButton}
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            onEditWorker(worker);
                                        }}
                                    >
                                        <Text style={styles.editButtonText}>✎</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    header: {
        backgroundColor: '#fff',
        paddingTop: 48,
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    backButton: {
        paddingVertical: 8,
        marginBottom: 12,
    },
    backButtonText: {
        color: '#3b82f6',
        fontSize: 16,
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        flex: 1,
        marginRight: 8,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    createButton: {
        backgroundColor: '#10b981',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    createButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    subtitle: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 12,
    },
    searchInput: {
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    scrollContent: {
        flex: 1,
    },
    scrollContentContainer: {
        padding: 16,
    },
    emptyText: {
        textAlign: 'center',
        padding: 32,
        color: '#6b7280',
    },
    workerCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    workerCardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    workerInfo: {
        flex: 1,
    },
    workerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    serialBadge: {
        backgroundColor: '#dbeafe',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    serialText: {
        fontSize: 12,
        color: '#1e40af',
        fontFamily: 'monospace',
    },
    typeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 8,
    },
    typeBadgePermanent: {
        backgroundColor: '#d1fae5',
    },
    typeBadgeContract: {
        backgroundColor: '#fef3c7',
    },
    typeBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#374151',
    },
    workerName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
    },
    phoneText: {
        fontSize: 12,
        color: '#9ca3af',
        marginTop: 4,
    },
    workerBranchName: {
        fontSize: 11,
        color: '#10b981',
        fontWeight: '600',
        marginTop: 2,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
        marginLeft: 12,
    },
    callButton: {
        backgroundColor: '#10b981',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    callButtonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '600',
    },
    editButton: {
        backgroundColor: '#f59e0b',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    editButtonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '600',
    },
});

export default WorkersView;
