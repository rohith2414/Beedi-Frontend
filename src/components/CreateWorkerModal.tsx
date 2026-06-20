import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import workerService from '../services/worker.service';
import { useData } from '../contexts/DataContext';
import ErrorMessage from './ErrorMessage';
import { useLanguage } from '../contexts/LanguageContext';

interface CreateWorkerModalProps {
    visible: boolean;
    branchId: string;
    onClose: () => void;
    onCreate: (name: string, serialNo: string, phone: string, branchId: string, workerType: 'permanent' | 'contract') => void;
}

const CreateWorkerModal: React.FC<CreateWorkerModalProps> = ({
    visible,
    branchId,
    onClose,
    onCreate,
}) => {
    const { t, language } = useLanguage();
    const [workerName, setWorkerName] = useState('');
    const [serialNo, setSerialNo] = useState('');
    const [phone, setPhone] = useState('');
    const [workerType, setWorkerType] = useState<'permanent' | 'contract'>('permanent');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { fetchWorkers } = useData();

    const handleCreate = async () => {
        if (workerName.trim() && serialNo.trim() && phone.trim()) {
            setLoading(true);
            setError(null);

            try {
                // Convert workerType to API format (PERMANENT/CONTRACT)
                const employeeType = workerType === 'permanent' ? 'PERMANENT' : 'CONTRACT';

                // Call the API to create the worker
                await workerService.createWorker({
                    name: workerName.trim(),
                    serialNo: serialNo.trim(),
                    phone: phone.trim(),
                    branchId: branchId,
                    employeeType: employeeType as 'PERMANENT' | 'CONTRACT',
                });

                // Refresh the workers list for this branch
                await fetchWorkers(branchId);

                // Call the onCreate callback
                onCreate(workerName.trim(), serialNo.trim(), phone.trim(), branchId, workerType);

                // Reset form and close
                setWorkerName('');
                setSerialNo('');
                setPhone('');
                setWorkerType('permanent');
                onClose();
            } catch (err: any) {
                setError(err.message || (language === 'en' ? 'Failed to create worker' : 'కార్మికుడిని చేర్చడం విఫలమైంది'));
            } finally {
                setLoading(false);
            }
        } else {
            setError(language === 'en' ? 'Please fill in all fields' : 'దయచేసి అన్ని వివరాలను పూరించండి');
        }
    };

    const handleClose = () => {
        setWorkerName('');
        setSerialNo('');
        setPhone('');
        setWorkerType('permanent');
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>
                        {language === 'en' ? 'Add New Worker' : 'కొత్త కార్మికుడిని చేర్చండి'}
                    </Text>

                    {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

                    <Text style={styles.label}>{language === 'en' ? 'Worker Name' : 'కార్మికుడి పేరు'}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder={language === 'en' ? 'Enter worker name' : 'కార్మికుడి పేరు నమోదు చేయండి'}
                        value={workerName}
                        onChangeText={setWorkerName}
                        editable={!loading}
                    />

                    <Text style={styles.label}>{language === 'en' ? 'Serial Number' : 'క్రమ సంఖ్య'}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., W001"
                        value={serialNo}
                        onChangeText={setSerialNo}
                        editable={!loading}
                    />

                    <Text style={styles.label}>{language === 'en' ? 'Phone Number' : 'ఫోన్ నంబర్'}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder={language === 'en' ? 'Enter phone number' : 'ఫోన్ నంబర్ నమోదు చేయండి'}
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                        editable={!loading}
                    />

                    <Text style={styles.label}>{language === 'en' ? 'Employee Type' : 'ఉద్యోగి రకం'}</Text>
                    <View style={styles.typeContainer}>
                        <TouchableOpacity
                            style={[styles.typeButton, workerType === 'permanent' && styles.typeButtonActive]}
                            onPress={() => setWorkerType('permanent')}
                            disabled={loading}
                        >
                            <Text style={[styles.typeButtonText, workerType === 'permanent' && styles.typeButtonTextActive]}>
                                {t.workers.permanent}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.typeButton, workerType === 'contract' && styles.typeButtonActive]}
                            onPress={() => setWorkerType('contract')}
                            disabled={loading}
                        >
                            <Text style={[styles.typeButtonText, workerType === 'contract' && styles.typeButtonTextActive]}>
                                {t.workers.contract}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={handleClose}
                            disabled={loading}
                        >
                            <Text style={styles.cancelButtonText}>{t.modals.cancel}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.createButton, loading && styles.disabledButton]}
                            onPress={handleCreate}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.createButtonText}>
                                    {language === 'en' ? 'Add Worker' : 'కార్మికుడిని చేర్చండి'}
                                </Text>
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f9fafb',
    },
    typeContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    typeButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#d1d5db',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    typeButtonActive: {
        borderColor: '#10b981',
        backgroundColor: '#d1fae5',
    },
    typeButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
    },
    typeButtonTextActive: {
        color: '#10b981',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    button: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f3f4f6',
    },
    cancelButtonText: {
        color: '#6b7280',
        fontSize: 16,
        fontWeight: '600',
    },
    createButton: {
        backgroundColor: '#10b981',
    },
    disabledButton: {
        backgroundColor: '#9ca3af',
        opacity: 0.6,
    },
    createButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default CreateWorkerModal;
