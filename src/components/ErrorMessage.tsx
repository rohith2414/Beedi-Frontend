import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ErrorMessageProps {
    message: string;
    onRetry?: () => void;
    onDismiss?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry, onDismiss }) => {
    return (
        <View style={styles.container}>
            <View style={styles.errorBox}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{message}</Text>

                <View style={styles.buttonContainer}>
                    {onRetry && (
                        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
                            <Text style={styles.retryButtonText}>Retry</Text>
                        </TouchableOpacity>
                    )}
                    {onDismiss && (
                        <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
                            <Text style={styles.dismissButtonText}>Dismiss</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    errorBox: {
        backgroundColor: '#fef2f2',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#fecaca',
        padding: 16,
        alignItems: 'center',
    },
    errorIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    errorText: {
        fontSize: 14,
        color: '#991b1b',
        textAlign: 'center',
        marginBottom: 12,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    retryButton: {
        backgroundColor: '#ef4444',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    dismissButton: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    dismissButtonText: {
        color: '#6b7280',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default ErrorMessage;
