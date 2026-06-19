import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { validateLoginForm, validateRegisterForm } from '../utils/validators';
import LoadingSpinner from './LoadingSpinner';

const LoginScreen: React.FC = () => {
    const { login, register } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);

    // Form fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    const handleLogin = async () => {
        try {
            // Validate
            const error = validateLoginForm(email, password);
            if (error) {
                Alert.alert('Validation Error', error);
                return;
            }

            setLoading(true);
            await login(email, password);
            // Navigation handled by AuthContext
        } catch (error: any) {
            Alert.alert('Login Failed', error.message || 'Please check your credentials');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        try {
            // Validate
            const error = validateRegisterForm(email, password, name, phone);
            if (error) {
                Alert.alert('Validation Error', error);
                return;
            }

            setLoading(true);
            await register(email, password, name, phone);
            // Navigation handled by AuthContext
        } catch (error: any) {
            Alert.alert('Registration Failed', error.message || 'Please try again');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = () => {
        if (isLogin) {
            handleLogin();
        } else {
            handleRegister();
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        // Clear form
        setEmail('');
        setPassword('');
        setName('');
        setPhone('');
    };

    if (loading) {
        return <LoadingSpinner fullScreen message={isLogin ? 'Logging in...' : 'Creating account...'} />;
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <Text style={styles.appTitle}>🌿 Beedi Management</Text>
                    <Text style={styles.subtitle}>
                        {isLogin ? 'Welcome back!' : 'Create your account'}
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    {!isLogin && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your full name"
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                                editable={!loading}
                            />
                        </View>
                    )}

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!loading}
                        />
                    </View>

                    {!isLogin && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Phone (Optional)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your phone number"
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                                editable={!loading}
                            />
                        </View>
                    )}

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                            editable={!loading}
                        />
                        {!isLogin && (
                            <Text style={styles.hint}>Minimum 6 characters</Text>
                        )}
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        <Text style={styles.submitButtonText}>
                            {isLogin ? 'Login' : 'Register'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.toggleButton}
                        onPress={toggleMode}
                        disabled={loading}
                    >
                        <Text style={styles.toggleButtonText}>
                            {isLogin
                                ? "Don't have an account? Register"
                                : 'Already have an account? Login'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Manage your beedi production efficiently
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    appTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
    },
    formContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1f2937',
    },
    hint: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 4,
    },
    submitButton: {
        backgroundColor: '#3b82f6',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    submitButtonDisabled: {
        backgroundColor: '#9ca3af',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    toggleButton: {
        marginTop: 16,
        alignItems: 'center',
    },
    toggleButtonText: {
        color: '#3b82f6',
        fontSize: 14,
        fontWeight: '500',
    },
    footer: {
        marginTop: 32,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 13,
        color: '#9ca3af',
        textAlign: 'center',
    },
});

export default LoginScreen;
