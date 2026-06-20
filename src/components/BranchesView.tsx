import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Branch } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface BranchesViewProps {
    branches: Branch[];
    onSelectBranch: (branch: Branch) => void;
    onUpdateRateRequest: (branch: Branch) => void;
    onBack: () => void;
    onCreateBranch: () => void;
}

const BranchesView: React.FC<BranchesViewProps> = ({
    branches,
    onSelectBranch,
    onUpdateRateRequest,
    onBack,
    onCreateBranch,
}) => {
    const { t, language } = useLanguage();

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={onBack}
            >
                <Text style={styles.backButtonText}>{t.nav.backToDashboard}</Text>
            </TouchableOpacity>

            <View style={styles.headerRow}>
                <Text style={styles.headerTitle}>{t.branches.selectBranch}</Text>
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={onCreateBranch}
                >
                    <Text style={styles.createButtonText}>{t.branches.create}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollContent}>
                {branches.map(branch => (
                    <TouchableOpacity
                        key={branch.id}
                        style={styles.branchCard}
                        onPress={() => onSelectBranch(branch)}
                    >
                        <View style={styles.cardContent}>
                            <View style={styles.cardLeft}>
                                <Text style={styles.branchName}>{branch.name}</Text>
                                <Text style={styles.branchInfo}>
                                    {branch.workers} {t.branches.workersCount} • {language === 'en' ? 'P' : 'శా'}:₹{branch.permanentRate} {language === 'en' ? 'C' : 'కా'}:₹{branch.contractRate}/1000
                                </Text>
                            </View>
                            <Text style={styles.chevron}>›</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.updateButton}
                            onPress={() => onUpdateRateRequest(branch)}
                        >
                            <Text style={styles.updateButtonText}>{t.branches.updateRate}</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
        padding: 16,
        paddingTop: 48,
    },
    backButton: {
        marginBottom: 12,
        paddingVertical: 8,
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
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    createButton: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    createButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    scrollContent: {
        flex: 1,
    },
    branchCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardLeft: {
        flex: 1,
    },
    branchName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    branchInfo: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 4,
    },
    workerCount: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 4,
    },
    rateContainer: {
        marginTop: 8,
    },
    rateText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#10b981',
    },
    chevron: {
        fontSize: 24,
        color: '#9ca3af',
    },
    updateButton: {
        marginTop: 12,
    },
    updateButtonText: {
        color: '#3b82f6',
        fontSize: 14,
    },
});

export default BranchesView;
