import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface DashboardViewProps {
    totalBranches: number;
    totalWorkers: number;
    onNavigate: (screen: 'branches' | 'workers' | 'reports' | 'subscription') => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({
    totalBranches,
    totalWorkers,
    onNavigate,
}) => {
    const { language, setLanguage, t } = useLanguage();
    const { subscription, logout } = useAuth();

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'te' : 'en');
    };

    const handleLogout = () => {
        Alert.alert(
            language === 'en' ? 'Logout' : 'లాగ్ అవుట్',
            language === 'en' ? 'Are you sure you want to logout?' : 'మీరు ఖచ్చితంగా లాగ్ అవుట్ చేయాలనుకుంటున్నారా?',
            [
                {
                    text: language === 'en' ? 'Cancel' : 'రద్దు చేయి',
                    style: 'cancel',
                },
                {
                    text: language === 'en' ? 'Logout' : 'లాగ్ అవుట్',
                    onPress: async () => {
                        try {
                            await logout();
                        } catch (error) {
                            console.error('Logout error:', error);
                            Alert.alert('Error', 'Failed to logout');
                        }
                    },
                    style: 'destructive',
                },
            ]
        );
    };

    const showTrialBanner = 
        subscription?.status === 'TRIAL' && 
        subscription?.daysRemaining !== undefined && 
        subscription?.daysRemaining <= 7;

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={styles.title}>{t.dashboard.title}</Text>
                            <Text style={styles.subtitle}>{t.dashboard.subtitle}</Text>
                        </View>
                        <View style={styles.headerButtons}>
                            <TouchableOpacity
                                style={styles.subscriptionNavButton}
                                onPress={() => onNavigate('subscription')}
                            >
                                <Text style={styles.subscriptionNavButtonText}>💳</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.languageButton}
                                onPress={toggleLanguage}
                            >
                                <Text style={styles.languageButtonText}>
                                    {language === 'en' ? 'తెలుగు' : 'English'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.logoutButton}
                                onPress={handleLogout}
                            >
                                <Text style={styles.logoutButtonText}>🚪</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {showTrialBanner && (
                    <TouchableOpacity 
                        style={styles.trialBanner}
                        onPress={() => onNavigate('subscription')}
                        activeOpacity={0.9}
                    >
                        <Text style={styles.trialBannerText}>
                            ⚠️ {language === 'en' 
                                ? `Your free trial ends in ${subscription.daysRemaining} days. Subscribe now to avoid lockout!` 
                                : `మీ ఉచిత ట్రయల్ ${subscription.daysRemaining} రోజుల్లో ముగుస్తుంది. లాకౌట్ నివారించడానికి ఇప్పుడే సబ్‌స్క్రైబ్ చేయండి!`}
                        </Text>
                        <Text style={styles.trialBannerLink}>
                            {language === 'en' ? 'Subscribe Now →' : 'ఇప్పుడే సబ్‌స్క్రైబ్ చేయండి →'}
                        </Text>
                    </TouchableOpacity>
                )}

                <View style={styles.cardsContainer}>
                    {/* Top Row - Branches and Workers */}
                    <View style={styles.topRow}>
                        {/* Branches Card */}
                        <TouchableOpacity
                            style={[styles.card, styles.smallCard, styles.branchesCard]}
                            onPress={() => onNavigate('branches')}
                            activeOpacity={0.8}
                        >
                            <View style={styles.cardIconContainer}>
                                <Text style={styles.cardIcon}>🏢</Text>
                            </View>
                            <Text style={styles.cardTitle}>{t.dashboard.branches}</Text>
                            <View style={styles.statsContainer}>
                                <Text style={styles.statsNumber}>{totalBranches}</Text>
                                <Text style={styles.statsLabel}>{t.dashboard.total}</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Workers Card */}
                        <TouchableOpacity
                            style={[styles.card, styles.smallCard, styles.workersCard]}
                            onPress={() => onNavigate('workers')}
                            activeOpacity={0.8}
                        >
                            <View style={styles.cardIconContainer}>
                                <Text style={styles.cardIcon}>👥</Text>
                            </View>
                            <Text style={styles.cardTitle}>{t.dashboard.workers}</Text>
                            <View style={styles.statsContainer}>
                                <Text style={styles.statsNumber}>{totalWorkers}</Text>
                                <Text style={styles.statsLabel}>{t.dashboard.total}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Bottom Row - Reports (Full Width) */}
                    <TouchableOpacity
                        style={[styles.card, styles.largeCard, styles.reportsCard]}
                        onPress={() => onNavigate('reports')}
                        activeOpacity={0.8}
                    >
                        <View style={styles.largeCardContent}>
                            <View style={styles.largeCardLeft}>
                                <Text style={styles.cardIcon}>📊</Text>
                            </View>
                            <View style={styles.largeCardRight}>
                                <Text style={styles.largeCardTitle}>{t.dashboard.reportsAnalytics}</Text>
                                <Text style={styles.largeCardSubtitle}>{t.dashboard.reportsDescription}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    scrollView: {
        flex: 1,
    },
    header: {
        paddingTop: 56,
        paddingHorizontal: 20,
        paddingBottom: 24,
        backgroundColor: '#fff',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    subscriptionNavButton: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        marginRight: 8,
        borderColor: '#cbd5e1',
        borderWidth: 1,
    },
    subscriptionNavButtonText: {
        fontSize: 16,
    },
    languageButton: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    languageButtonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    logoutButton: {
        backgroundColor: '#fef2f2',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        marginLeft: 8,
        borderColor: '#fee2e2',
        borderWidth: 1,
    },
    logoutButtonText: {
        fontSize: 16,
    },
    trialBanner: {
        backgroundColor: '#fffbeb',
        borderColor: '#fef3c7',
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 20,
        marginTop: 16,
        flexDirection: 'column',
        alignItems: 'flex-start',
        shadowColor: '#d97706',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    trialBannerText: {
        color: '#d97706',
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 20,
    },
    trialBannerLink: {
        color: '#b45309',
        fontSize: 13,
        fontWeight: 'bold',
        marginTop: 6,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1f2937',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        marginTop: 4,
        fontWeight: '500',
    },
    cardsContainer: {
        flex: 1,
        padding: 20,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    card: {
        borderRadius: 20,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    smallCard: {
        width: '48%',
        padding: 20,
        justifyContent: 'space-between',
        minHeight: 180,
    },
    largeCard: {
        width: '100%',
        padding: 24,
        minHeight: 140,
    },
    branchesCard: {
        backgroundColor: '#3b82f6',
    },
    workersCard: {
        backgroundColor: '#10b981',
    },
    reportsCard: {
        backgroundColor: '#f59e0b',
    },
    cardIconContainer: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
    },
    cardIcon: {
        fontSize: 40,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    statsContainer: {
        marginTop: 'auto',
    },
    statsNumber: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
        lineHeight: 40,
    },
    statsLabel: {
        fontSize: 13,
        color: '#fff',
        opacity: 0.9,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    largeCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    largeCardLeft: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        padding: 16,
        marginRight: 20,
    },
    largeCardRight: {
        flex: 1,
    },
    largeCardTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 6,
    },
    largeCardSubtitle: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
        lineHeight: 20,
    },
});

export default DashboardView;
