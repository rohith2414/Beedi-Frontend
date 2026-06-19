import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

interface LoadingSpinnerProps {
    message?: string;
    fullScreen?: boolean;
    size?: 'small' | 'large';
    color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    message,
    fullScreen = false,
    size = 'large',
    color = '#3b82f6',
}) => {
    if (fullScreen) {
        return (
            <View style={styles.fullScreenContainer}>
                <ActivityIndicator size={size} color={color} />
                {message && <Text style={styles.message}>{message}</Text>}
            </View>
        );
    }

    return (
        <View style={styles.inlineContainer}>
            <ActivityIndicator size={size} color={color} />
            {message && <Text style={styles.message}>{message}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    fullScreenContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
    },
    inlineContainer: {
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    message: {
        marginTop: 12,
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
    },
});

export default LoadingSpinner;
