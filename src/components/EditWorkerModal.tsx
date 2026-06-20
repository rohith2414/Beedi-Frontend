import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Worker } from '../types';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';

interface EditWorkerModalProps {
    visible: boolean;
    worker: Worker | null;
    onClose: () => void;
    onUpdate: (id: string, name: string, serialNo: string, phone: string, employeeType: 'PERMANENT' | 'CONTRACT') => void;
}

const EditWorkerModal: React.FC<EditWorkerModalProps> = ({
    visible,
    worker,
    onClose,
    onUpdate,
}) => {
    const { t, language } = useLanguage();
    const { updateWorker } = useData();
    const [workerName, setWorkerName] = useState(worker?.name || '');
    const [serialNo, setSerialNo] = useState(worker?.serialNo || '');
    const [phone, setPhone] = useState(worker?.phone || '');
    const [employeeType, setEmployeeType] = useState<'PERMANENT' | 'CONTRACT'>(worker?.employeeType || 'PERMANENT');
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        if (worker) {
            setWorkerName(worker.name);
            setSerialNo(worker.serialNo || '');
            setPhone(worker.phone || '');
            setEmployeeType(worker.employeeType || 'PERMANENT');
        }
    }, [worker]);

    const handleUpdate = async () => {
        if (!worker || !workerName.trim() || !phone.trim()) {
            Alert.alert(
                language === 'en' ? 'Invalid Input' : 'చెల్లని ఇన్‌పుట్',
                language === 'en' ? 'Please fill in all required fields' : 'దయచేసి అవసరమైన అన్ని వివరాలను పూరించండి'
            );
            return;
        }

        try {
            setLoading(true);

            // Call DataContext to update worker (this updates global state)
            const updatedWorker = await updateWorker(worker.id, {
                name: workerName.trim(),
                phone: phone.trim(),
                employeeType: employeeType,
            });

            // Call parent callback with updated worker data
            onUpdate(updatedWorker.id, updatedWorker.name, updatedWorker.serialNo, updatedWorker.phone || '', updatedWorker.employeeType);

            Alert.alert(
                language === 'en' ? 'Success' : 'విజయం',
                language === 'en' ? 'Worker updated successfully' : 'కార్మికుడి వివరాలు విజయవంతంగా నవీకరించబడ్డాయి'
            );
            onClose();
        } catch (error: any) {
            console.error('Error updating worker:', error.message);
            Alert.alert(
                language === 'en' ? 'Error' : 'లోపం',
                error.message || (language === 'en' ? 'Failed to update worker' : 'కార్మికుడి వివరాల నవీకరణ విఫలమైంది')
            );
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (worker) {
            setWorkerName(worker.name);
            setSerialNo(worker.serialNo || '');
            setPhone(worker.phone || '');
            setEmployeeType(worker.employeeType || 'PERMANENT');
        }
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>
                        {language === 'en' ? 'Edit Worker' : 'కార్మికుడి వివరాల సవరణ'}
                    </Text>

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
                        editable={false}
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
                            style={[styles.typeButton, employeeType === 'PERMANENT' && styles.typeButtonActive]}
                            onPress={() => setEmployeeType('PERMANENT')}
                            disabled={loading}
                        >
                            <Text style={[styles.typeButtonText, employeeType === 'PERMANENT' && styles.typeButtonTextActive]}>
                                {t.workers.permanent}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.typeButton, employeeType === 'CONTRACT' && styles.typeButtonActive]}
                            onPress={() => setEmployeeType('CONTRACT')}
                            disabled={loading}
                        >
                            <Text style={[styles.typeButtonText, employeeType === 'CONTRACT' && styles.typeButtonTextActive]}>
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
                            style={[styles.button, styles.updateButton, loading && styles.disabledButton]}
                            onPress={handleUpdate}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.updateButtonText}>{t.modals.update}</Text>
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
        borderColor: '#f59e0b',
        backgroundColor: '#fef3c7',
    },
    typeButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
    },
    typeButtonTextActive: {
        color: '#f59e0b',
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
    updateButton: {
        backgroundColor: '#f59e0b',
    },
    disabledButton: {
        backgroundColor: '#9ca3af',
    },
    updateButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default EditWorkerModal;
