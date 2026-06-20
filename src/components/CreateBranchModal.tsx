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
import branchService from '../services/branch.service';
import { useData } from '../contexts/DataContext';
import ErrorMessage from './ErrorMessage';
import { useLanguage } from '../contexts/LanguageContext';

interface CreateBranchModalProps {
    visible: boolean;
    onClose: () => void;
    onCreate: (name: string, permanentRate: number, contractRate: number) => void;
}

const CreateBranchModal: React.FC<CreateBranchModalProps> = ({
    visible,
    onClose,
    onCreate,
}) => {
    const { t, language } = useLanguage();
    const [branchName, setBranchName] = useState('');
    const [permanentRate, setPermanentRate] = useState('');
    const [contractRate, setContractRate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { fetchBranches } = useData();

    const handleCreate = async () => {
        if (branchName.trim() && permanentRate.trim() && contractRate.trim()) {
            const permRate = parseFloat(permanentRate);
            const contRate = parseFloat(contractRate);

            if (!isNaN(permRate) && permRate > 0 && !isNaN(contRate) && contRate > 0) {
                setLoading(true);
                setError(null);

                try {
                    // Call the API to create the branch
                    await branchService.createBranch(branchName.trim(), permRate, contRate);

                    // Refresh the branches list
                    await fetchBranches();

                    // Call the onCreate callback
                    onCreate(branchName.trim(), permRate, contRate);

                    // Reset form and close
                    setBranchName('');
                    setPermanentRate('');
                    setContractRate('');
                    onClose();
                } catch (err: any) {
                    setError(err.message || (language === 'en' ? 'Failed to create branch' : 'శాఖను సృష్టించడం విఫలమైంది'));
                } finally {
                    setLoading(false);
                }
            } else {
                setError(language === 'en' ? 'Please enter valid rates greater than 0' : 'దయచేసి 0 కంటే ఎక్కువ విలువైన రేట్లను నమోదు చేయండి');
            }
        } else {
            setError(language === 'en' ? 'Please fill in all fields' : 'దయచేసి అన్ని వివరాలను పూరించండి');
        }
    };

    const handleClose = () => {
        setBranchName('');
        setPermanentRate('');
        setContractRate('');
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>{t.modals.createBranch}</Text>

                    {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

                    <Text style={styles.label}>{t.modals.branchName}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder={language === 'en' ? 'Enter branch name' : 'శాఖ పేరు నమోదు చేయండి'}
                        value={branchName}
                        onChangeText={setBranchName}
                        editable={!loading}
                    />

                    <Text style={styles.label}>
                        {language === 'en' ? 'Permanent Worker Rate per 1000 Beedis' : '1000 బీడీలకు శాశ్వత కార్మికుడి రేటు'}
                    </Text>
                    <TextInput
                        style={styles.input}
                        placeholder={language === 'en' ? 'Enter permanent rate (₹)' : 'శాశ్వత రేటు నమోదు చేయండి (₹)'}
                        value={permanentRate}
                        onChangeText={setPermanentRate}
                        keyboardType="numeric"
                        editable={!loading}
                    />

                    <Text style={styles.label}>
                        {language === 'en' ? 'Contract Worker Rate per 1000 Beedis' : '1000 బీడీలకు కాంట్రాక్ట్ కార్మికుడి రేటు'}
                    </Text>
                    <TextInput
                        style={styles.input}
                        placeholder={language === 'en' ? 'Enter contract rate (₹)' : 'కాంట్రాక్ట్ రేటు నమోదు చేయండి (₹)'}
                        value={contractRate}
                        onChangeText={setContractRate}
                        keyboardType="numeric"
                        editable={!loading}
                    />

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
                                <Text style={styles.createButtonText}>{t.modals.create}</Text>
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
        backgroundColor: '#3b82f6',
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

export default CreateBranchModal;
