import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Branch } from '../types';
import branchService from '../services/branch.service';

interface RateModalProps {
    visible: boolean;
    branch: Branch | null;
    onClose: () => void;
    onUpdate: (branchId: string, permanentRate: string, contractRate: string) => void;
}

const RateModal: React.FC<RateModalProps> = ({ visible, branch, onClose, onUpdate }) => {
    const [permanentRate, setPermanentRate] = useState('0');
    const [contractRate, setContractRate] = useState('0');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (branch) {
            setPermanentRate(branch.permanentRate.toString());
            setContractRate(branch.contractRate.toString());
        }
    }, [branch]);

    const handleUpdate = async () => {
        if (!branch) return;

        const permRate = parseFloat(permanentRate);
        const contrRate = parseFloat(contractRate);

        if (isNaN(permRate) || isNaN(contrRate)) {
            Alert.alert('Invalid Input', 'Please enter valid numbers for rates');
            return;
        }

        try {
            setLoading(true);

            // Call API to update branch rates
            await branchService.updateBranch(branch.id, {
                permanentRate: permRate,
                contractRate: contrRate,
            });

            // Call parent callback
            onUpdate(branch.id, permanentRate, contractRate);

            Alert.alert('Success', 'Rates updated successfully');
            onClose();
        } catch (error: any) {
            console.error('Error updating rates:', error.message);
            Alert.alert('Error', error.message || 'Failed to update rates');
        } finally {
            setLoading(false);
        }
    };

    if (!branch) return null;

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Update Rates for {branch.name}</Text>

                    <Text style={styles.modalLabel}>Permanent Worker Rate per 1000 Beedis (₹)</Text>
                    <TextInput
                        style={styles.modalInput}
                        value={permanentRate}
                        onChangeText={setPermanentRate}
                        keyboardType="numeric"
                        placeholder="Enter permanent rate"
                        editable={!loading}
                    />

                    <Text style={styles.modalLabel}>Contract Worker Rate per 1000 Beedis (₹)</Text>
                    <TextInput
                        style={styles.modalInput}
                        value={contractRate}
                        onChangeText={setContractRate}
                        keyboardType="numeric"
                        placeholder="Enter contract rate"
                        editable={!loading}
                    />

                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={onClose}
                            disabled={loading}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.confirmButton, loading && styles.disabledButton]}
                            onPress={handleUpdate}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.confirmButtonText}>Update</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 24,
        width: '100%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#1f2937',
    },
    modalLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        color: '#1f2937',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    cancelButtonText: {
        color: '#374151',
    },
    confirmButton: {
        backgroundColor: '#3b82f6',
    },
    disabledButton: {
        backgroundColor: '#9ca3af',
    },
    confirmButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
});

export default RateModal;
