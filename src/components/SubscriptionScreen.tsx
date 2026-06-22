import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import subscriptionService from '../services/subscription.service';
import { Payment, Subscription } from '../types';

let RazorpayCheckout: any = null;
try {
    RazorpayCheckout = require('react-native-razorpay').default;
} catch (e) {
    console.warn('RazorpayCheckout native module not available. Simulator fallback will be used.');
}

interface SubscriptionScreenProps {
    onBack?: () => void;
    canGoBack?: boolean;
}

const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({
    onBack,
    canGoBack = false,
}) => {
    const { user, subscription, updateSubscription, logout } = useAuth();
    const { t, language } = useLanguage();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [simulatedMode, setSimulatedMode] = useState(false); // Default to false

    useEffect(() => {
        loadPaymentHistory();
    }, []);

    const loadPaymentHistory = async () => {
        try {
            setHistoryLoading(true);
            const response = await subscriptionService.getPaymentHistory();
            if (response.success && response.data) {
                setPayments(response.data);
            }
        } catch (error: any) {
            console.error('Error loading payments history:', error);
        } finally {
            setHistoryLoading(false);
        }
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

    const handleSubscribe = async () => {
        try {
            setLoading(true);

            // Step 1: Create order on backend
            const orderResponse = await subscriptionService.createPaymentOrder();
            if (!orderResponse.success || !orderResponse.data) {
                throw new Error(orderResponse.error || 'Failed to create order');
            }

            const { orderId, amount, currency, keyId, name, description } = orderResponse.data;

            // Step 2: Pay via Razorpay SDK or Simulator
            if (simulatedMode || !RazorpayCheckout) {
                // Simulated Checkout Flow
                Alert.alert(
                    t.subscription.simulatedPaymentMode,
                    `Order ID: ${orderId}\nAmount: ₹${amount / 100}\n\nChoose payment result:`,
                    [
                        {
                            text: 'Success',
                            onPress: async () => {
                                await verifySimulatedPayment(orderId);
                            },
                        },
                        {
                            text: 'Cancel',
                            onPress: () => {
                                Alert.alert('Cancelled', t.subscription.cancelMessage);
                                setLoading(false);
                            },
                            style: 'cancel',
                        },
                        {
                            text: 'Fail',
                            onPress: () => {
                                Alert.alert('Failed', t.subscription.failMessage);
                                setLoading(false);
                            },
                            style: 'destructive',
                        },
                    ],
                    { cancelable: false }
                );
            } else {
                // Real Razorpay SDK Flow
                const options = {
                    key: keyId,
                    amount: amount,
                    currency: currency,
                    name: name,
                    description: description,
                    order_id: orderId,
                    prefill: {
                        email: user?.email || '',
                        contact: user?.phone || '',
                    },
                    theme: {
                        color: '#10b981', // Brand green
                    },
                };

                try {
                    const paymentData = await RazorpayCheckout.open(options);
                    
                    // Step 3: Verify payment on backend
                    const verifyResponse = await subscriptionService.verifyPayment(
                        paymentData.razorpay_order_id || orderId,
                        paymentData.razorpay_payment_id,
                        paymentData.razorpay_signature
                    );

                    if (verifyResponse.success && verifyResponse.data) {
                        const newSub: Subscription = {
                            status: verifyResponse.data.subscriptionStatus,
                            subscriptionEndDate: verifyResponse.data.subscriptionEndDate,
                            trialEndDate: subscription?.trialEndDate || null,
                            daysRemaining: 30, // Default for new active sub
                        };
                        await updateSubscription(newSub);
                        Alert.alert(t.common.success, t.subscription.verifySuccess);
                        loadPaymentHistory();
                        if (onBack) {
                            onBack();
                        }
                    } else {
                        throw new Error(verifyResponse.error || 'Verification failed');
                    }
                } catch (sdkError: any) {
                    console.error('Razorpay SDK Error:', sdkError);
                    if (sdkError.code === 'PAYMENT_CANCELLED') {
                        Alert.alert('Cancelled', t.subscription.cancelMessage);
                    } else {
                        Alert.alert('Error', t.subscription.failMessage);
                    }
                } finally {
                    setLoading(false);
                }
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Payment initiation failed.');
            setLoading(false);
        }
    };

    const verifySimulatedPayment = async (orderId: string) => {
        try {
            setLoading(true);
            const mockPaymentId = `pay_sim_${Math.random().toString(36).substring(2, 11)}`;
            const mockSignature = 'simulated_signature';

            const verifyResponse = await subscriptionService.verifyPayment(
                orderId,
                mockPaymentId,
                mockSignature
            );

            if (verifyResponse.success && verifyResponse.data) {
                const newSub: Subscription = {
                    status: verifyResponse.data.subscriptionStatus,
                    subscriptionEndDate: verifyResponse.data.subscriptionEndDate,
                    trialEndDate: subscription?.trialEndDate || null,
                    daysRemaining: 30,
                };
                await updateSubscription(newSub);
                Alert.alert(t.common.success, t.subscription.verifySuccess);
                loadPaymentHistory();
                if (onBack) {
                    onBack();
                }
            } else {
                throw new Error(verifyResponse.error || 'Verification failed');
            }
        } catch (error: any) {
            Alert.alert('Verification Failed', error.message || 'Could not verify simulated payment');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'ACTIVE':
            case 'TRIAL':
                return '#10b981'; // Green
            case 'EXPIRED':
            case 'TRIAL_EXPIRED':
            default:
                return '#ef4444'; // Red
        }
    };

    const getStatusText = (status?: string) => {
        if (!status) return 'UNKNOWN';
        switch (status) {
            case 'TRIAL':
                return t.subscription.trialActive;
            case 'TRIAL_EXPIRED':
                return t.subscription.trialExpired;
            case 'ACTIVE':
                return t.subscription.subscribedActive;
            case 'EXPIRED':
                return t.subscription.subscribedExpired;
            default:
                return status;
        }
    };

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return dateString;
        }
    };

    const isLocked = subscription?.status === 'TRIAL_EXPIRED' || subscription?.status === 'EXPIRED';

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* Header */}
            <View style={styles.header}>
                {canGoBack && onBack && (
                    <TouchableOpacity style={styles.backButton} onPress={onBack}>
                        <Text style={styles.backButtonText}>←</Text>
                    </TouchableOpacity>
                )}
                <Text style={styles.headerTitle}>{t.subscription.title}</Text>
            </View>

            {/* Status Card */}
            <View style={[styles.card, styles.statusCard]}>
                <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>{t.subscription.status}:</Text>
                    <View style={[styles.badge, { backgroundColor: getStatusColor(subscription?.status) }]}>
                        <Text style={styles.badgeText}>{getStatusText(subscription?.status)}</Text>
                    </View>
                </View>

                {subscription?.daysRemaining !== undefined && (
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>{t.subscription.daysRemaining}:</Text>
                        <Text style={styles.infoValue}>
                            {subscription.daysRemaining} {t.subscription.daysLeftLabel}
                        </Text>
                    </View>
                )}

                {subscription?.status === 'TRIAL' && subscription.trialEndDate && (
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>{t.subscription.expiryDate}:</Text>
                        <Text style={styles.infoValue}>{formatDate(subscription.trialEndDate)}</Text>
                    </View>
                )}

                {subscription?.status === 'ACTIVE' && subscription.subscriptionEndDate && (
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>{t.subscription.expiryDate}:</Text>
                        <Text style={styles.infoValue}>{formatDate(subscription.subscriptionEndDate)}</Text>
                    </View>
                )}

                {isLocked && (
                    <View style={styles.warningContainer}>
                        <Text style={styles.warningText}>⚠️ {t.subscription.lockedMessage}</Text>
                    </View>
                )}
            </View>

            {/* Plan Info */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>{t.subscription.planDetails}</Text>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t.subscription.amountLabel}:</Text>
                    <Text style={styles.priceText}>{t.subscription.amountValue}</Text>
                </View>
                <Text style={styles.subText}>{t.subscription.freeTrialInfo}</Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#10b981" style={styles.subscribeLoader} />
                ) : (subscription?.status === 'ACTIVE' || subscription?.status === 'TRIAL') ? (
                    <TouchableOpacity 
                        style={[styles.subscribeButton, styles.disabledButton]} 
                        disabled={true}
                    >
                        <Text style={styles.disabledButtonText}>
                            {subscription?.status === 'ACTIVE'
                                ? (language === 'te' ? 'సక్రియంగా ఉంది' : 'Active')
                                : (language === 'te' ? 'ఉచిత ట్రయల్ సక్రియంగా ఉంది' : 'Free Trial Active')}
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe}>
                        <Text style={styles.subscribeButtonText}>{t.subscription.subscribeNow}</Text>
                    </TouchableOpacity>
                )}
            </View>



            {/* Payment History */}
            <View style={styles.historyContainer}>
                <Text style={styles.sectionTitle}>{t.subscription.paymentHistory}</Text>
                
                {historyLoading ? (
                    <ActivityIndicator size="small" color="#10b981" style={styles.loader} />
                ) : payments.length === 0 ? (
                    <Text style={styles.emptyText}>{t.subscription.historyEmpty}</Text>
                ) : (
                    payments.map((payment) => (
                        <View key={payment.id} style={styles.paymentItem}>
                            <View style={styles.paymentRow}>
                                <Text style={styles.paymentDate}>{formatDate(payment.createdAt)}</Text>
                                <Text style={[styles.paymentStatus, { color: payment.status === 'PAID' ? '#10b981' : '#ef4444' }]}>
                                    {payment.status}
                                </Text>
                            </View>
                            <View style={styles.paymentRow}>
                                <Text style={styles.paymentDetailText}>
                                    {t.subscription.amountLabel}: ₹{payment.amount / 100}
                                </Text>
                            </View>
                            <View style={styles.paymentRow}>
                                <Text style={styles.paymentIdText}>
                                    {t.subscription.orderId}: {payment.razorpayOrderId}
                                </Text>
                            </View>
                            {payment.razorpayPaymentId && (
                                <View style={styles.paymentRow}>
                                    <Text style={styles.paymentIdText}>
                                        {t.subscription.paymentId}: {payment.razorpayPaymentId}
                                    </Text>
                                </View>
                            )}
                        </View>
                    ))
                )}
            </View>

            {/* Logout Button */}
            {isLocked && (
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>{t.subscription.logout}</Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 20,
    },
    backButton: {
        padding: 10,
        marginRight: 10,
    },
    backButtonText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    statusCard: {
        borderColor: '#e2e8f0',
        borderWidth: 1,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    statusLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#475569',
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    badgeText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    infoLabel: {
        fontSize: 14,
        color: '#64748b',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
    },
    warningContainer: {
        marginTop: 10,
        backgroundColor: '#fef2f2',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#fee2e2',
    },
    warningText: {
        color: '#ef4444',
        fontSize: 13,
        fontWeight: '500',
        lineHeight: 18,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 16,
    },
    priceText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#10b981',
    },
    subText: {
        fontSize: 13,
        color: '#64748b',
        marginTop: 8,
        marginBottom: 20,
        lineHeight: 18,
    },
    subscribeButton: {
        backgroundColor: '#10b981',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    subscribeLoader: {
        marginVertical: 10,
    },
    subscribeButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    devCard: {
        backgroundColor: '#f1f5f9',
        borderColor: '#cbd5e1',
        borderWidth: 1,
    },
    devCardTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#475569',
        marginBottom: 8,
    },
    devCardText: {
        fontSize: 13,
        color: '#475569',
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    historyContainer: {
        marginTop: 10,
        marginBottom: 20,
    },
    loader: {
        marginVertical: 20,
    },
    emptyText: {
        textAlign: 'center',
        color: '#94a3b8',
        marginVertical: 20,
    },
    paymentItem: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderColor: '#e2e8f0',
        borderWidth: 1,
    },
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    paymentDate: {
        fontSize: 14,
        fontWeight: '500',
        color: '#475569',
    },
    paymentStatus: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    paymentDetailText: {
        fontSize: 13,
        color: '#64748b',
    },
    paymentIdText: {
        fontSize: 11,
        color: '#94a3b8',
        fontFamily: 'Courier',
    },
    logoutButton: {
        backgroundColor: '#ef4444',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 10,
    },
    logoutButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledButton: {
        backgroundColor: '#cbd5e1',
        shadowColor: 'transparent',
        elevation: 0,
    },
    disabledButtonText: {
        color: '#64748b',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default SubscriptionScreen;
