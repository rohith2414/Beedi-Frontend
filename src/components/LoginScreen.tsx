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
import { useLanguage } from '../contexts/LanguageContext';
import authService from '../services/auth.service';

type ScreenMode = 'login' | 'register' | 'forgot_password' | 'enter_reset_code';

const LoginScreen: React.FC = () => {
    const { login, register } = useAuth();
    const { language, setLanguage } = useLanguage();
    const [mode, setMode] = useState<ScreenMode>('login');
    const [loading, setLoading] = useState(false);

    // Form fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [resetCode, setResetCode] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const getLocalizedValidationError = (error: string) => {
        if (language === 'en') return error;
        switch (error) {
            case 'Email is required':
                return 'ఈమెయిల్ అవసరం';
            case 'Please enter a valid email address':
                return 'దయచేసి సరైన ఈమెయిల్ చిరునామాను నమోదు చేయండి';
            case 'Password is required':
                return 'పాస్‌వర్డ్ అవసరం';
            case 'Password must be at least 6 characters':
                return 'పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి';
            case 'Name is required':
                return 'పేరు అవసరం';
            case 'Please enter a valid phone number':
                return 'దయచేసి సరైన ఫోన్ నంబర్‌ను నమోదు చేయండి';
            case 'Confirm password is required':
                return 'పాస్‌వర్డ్‌ను ధృవీకరించడం అవసరం';
            case 'Passwords do not match':
                return 'పాస్‌వర్డ్‌లు సరిపోలడం లేదు';
            case 'Verification code is required':
                return 'ధృవీకరణ కోడ్ అవసరం';
            case 'Verification code must be 6 digits':
                return 'ధృవీకరణ కోడ్ కనీసం 6 అంకెలు ఉండాలి';
            default:
                return error;
        }
    };

    const handleLogin = async () => {
        try {
            // Validate
            const error = validateLoginForm(email, password);
            if (error) {
                Alert.alert(
                    language === 'en' ? 'Validation Error' : 'ధృవీకరణ లోపం',
                    getLocalizedValidationError(error)
                );
                return;
            }

            setLoading(true);
            await login(email, password);
            // Navigation handled by AuthContext
        } catch (error: any) {
            Alert.alert(
                language === 'en' ? 'Login Failed' : 'లాగిన్ విఫలమైంది',
                error.message || (language === 'en' ? 'Please check your credentials' : 'దయచేసి మీ ఆధారాలను తనిఖీ చేయండి')
            );
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        try {
            // Validate basic inputs
            const error = validateRegisterForm(email, password, name, phone);
            if (error) {
                Alert.alert(
                    language === 'en' ? 'Validation Error' : 'ధృవీకరణ లోపం',
                    getLocalizedValidationError(error)
                );
                return;
            }

            // Validate confirm password
            if (!confirmPassword) {
                Alert.alert(
                    language === 'en' ? 'Validation Error' : 'ధృవీకరణ లోపం',
                    getLocalizedValidationError('Confirm password is required')
                );
                return;
            }

            if (password !== confirmPassword) {
                Alert.alert(
                    language === 'en' ? 'Validation Error' : 'ధృవీకరణ లోపం',
                    getLocalizedValidationError('Passwords do not match')
                );
                return;
            }

            setLoading(true);
            await register(email, password, name, phone);
            // Navigation handled by AuthContext
        } catch (error: any) {
            Alert.alert(
                language === 'en' ? 'Registration Failed' : 'నమోదు విఫలమైంది',
                error.message || (language === 'en' ? 'Please try again' : 'దయచేసి మళ్లీ ప్రయత్నించండి')
            );
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            Alert.alert(
                language === 'en' ? 'Validation Error' : 'ధృవీకరణ లోపం',
                getLocalizedValidationError('Email is required')
            );
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert(
                language === 'en' ? 'Validation Error' : 'ధృవీకరణ లోపం',
                getLocalizedValidationError('Please enter a valid email address')
            );
            return;
        }

        try {
            setLoading(true);
            await authService.forgotPassword(email);
            
            Alert.alert(
                language === 'en' ? 'Verification Code Sent' : 'ధృవీకరణ కోడ్ పంపబడింది',
                language === 'en' 
                    ? 'A 6-digit verification code has been sent to your email address.'
                    : 'మీ ఈమెయిల్ చిరునామాకు 6 అంకెల ధృవీకరణ కోడ్ పంపబడింది.',
                [
                    {
                        text: language === 'en' ? 'OK' : 'సరే',
                        onPress: () => {
                            setMode('enter_reset_code');
                            setPassword('');
                            setConfirmPassword('');
                        }
                    }
                ]
            );
        } catch (error: any) {
            Alert.alert(
                language === 'en' ? 'Error' : 'లోపం',
                error.message || (language === 'en' ? 'Something went wrong. Please try again.' : 'ఏదో తప్పు జరిగింది. దయచేసి మళ్లీ ప్రయత్నించండి.')
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!resetCode) {
            Alert.alert(
                language === 'en' ? 'Validation Error' : 'ధృవీకరణ లోపం',
                getLocalizedValidationError('Verification code is required')
            );
            return;
        }

        if (resetCode.length !== 6) {
            Alert.alert(
                language === 'en' ? 'Validation Error' : 'ధృవీకరణ లోపం',
                getLocalizedValidationError('Verification code must be 6 digits')
            );
            return;
        }

        if (!password) {
            Alert.alert(
                language === 'en' ? 'Validation Error' : 'ధృవీకరణ లోపం',
                getLocalizedValidationError('Password is required')
            );
            return;
        }

        if (password.length < 6) {
            Alert.alert(
                language === 'en' ? 'Validation Error' : 'ధృవీకరణ లోపం',
                getLocalizedValidationError('Password must be at least 6 characters')
            );
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert(
                language === 'en' ? 'Validation Error' : 'ధృవీకరణ లోపం',
                getLocalizedValidationError('Passwords do not match')
            );
            return;
        }

        try {
            setLoading(true);
            await authService.resetPassword(email, resetCode, password);
            Alert.alert(
                language === 'en' ? 'Success' : 'విజయం',
                language === 'en' ? 'Password reset successful. Please login with your new password.' : 'పాస్‌వర్డ్ రీసెట్ విజయవంతమైంది. దయచేసి మీ కొత్త పాస్‌వర్డ్‌తో లాగిన్ అవ్వండి.',
                [
                    {
                        text: language === 'en' ? 'OK' : 'సరే',
                        onPress: () => {
                            setMode('login');
                            setEmail('');
                            setPassword('');
                            setConfirmPassword('');
                            setResetCode('');
                        }
                    }
                ]
            );
        } catch (error: any) {
            Alert.alert(
                language === 'en' ? 'Reset Failed' : 'రీసెట్ విఫలమైంది',
                error.message || (language === 'en' ? 'Verification code is invalid or expired' : 'ధృవీకరణ కోడ్ చెల్లనిది లేదా గడువు ముగిసింది')
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = () => {
        if (mode === 'login') {
            handleLogin();
        } else if (mode === 'register') {
            handleRegister();
        } else if (mode === 'forgot_password') {
            handleForgotPassword();
        } else {
            handleResetPassword();
        }
    };

    const toggleMode = () => {
        if (mode === 'login') {
            setMode('register');
        } else {
            setMode('login');
        }
        // Clear form
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setName('');
        setPhone('');
        setResetCode('');
    };

    if (loading) {
        return (
            <LoadingSpinner
                fullScreen
                message={
                    mode === 'login'
                        ? (language === 'en' ? 'Logging in...' : 'లాగిన్ అవుతోంది...')
                        : mode === 'register'
                        ? (language === 'en' ? 'Creating account...' : 'ఖాతా సృష్టించబడుతోంది...')
                        : mode === 'forgot_password'
                        ? (language === 'en' ? 'Sending reset link...' : 'రీసెట్ కోడ్ పంపబడుతోంది...')
                        : (language === 'en' ? 'Resetting password...' : 'పాస్‌వర్డ్ రీసెట్ చేయబడుతోంది...')
                }
            />
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.topBar}>
                <View style={styles.languageToggleContainer}>
                    <TouchableOpacity
                        style={[styles.langButton, language === 'en' && styles.langButtonActive]}
                        onPress={() => setLanguage('en')}
                    >
                        <Text style={[styles.langButtonText, language === 'en' && styles.langButtonTextActive]}>EN</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.langButton, language === 'te' && styles.langButtonActive]}
                        onPress={() => setLanguage('te')}
                    >
                        <Text style={[styles.langButtonText, language === 'te' && styles.langButtonTextActive]}>తెలుగు</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <Text style={styles.appTitle}>
                        {language === 'en' ? '🌿 Beedi Management' : '🌿 బీడీ మేనేజ్‌మెంట్'}
                    </Text>
                    <Text style={styles.subtitle}>
                        {mode === 'login'
                            ? (language === 'en' ? 'Welcome back!' : 'మళ్లీ స్వాగతం!')
                            : mode === 'register'
                            ? (language === 'en' ? 'Create your account' : 'మీ ఖాతాను సృష్టించండి')
                            : mode === 'forgot_password'
                            ? (language === 'en' ? 'Reset your password' : 'మీ పాస్‌వర్డ్‌ను రీసెట్ చేయండి')
                            : (language === 'en' ? 'Enter Verification Code' : 'ధృవీకరణ కోడ్ నమోదు చేయండి')}
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    {mode === 'register' && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                {language === 'en' ? 'Full Name *' : 'పూర్తి పేరు *'}
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder={language === 'en' ? 'Enter your full name' : 'మీ పూర్తి పేరు నమోదు చేయండి'}
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                                editable={!loading}
                            />
                        </View>
                    )}

                    {mode !== 'enter_reset_code' && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                {language === 'en' ? 'Email *' : 'ఈమెయిల్ *'}
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder={language === 'en' ? 'Enter your email' : 'మీ ఈమెయిల్ నమోదు చేయండి'}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                editable={!loading}
                            />
                        </View>
                    )}

                    {mode === 'register' && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                {language === 'en' ? 'Phone (Optional)' : 'ఫోన్ నంబర్ (ఐచ్ఛికం)'}
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder={language === 'en' ? 'Enter your phone number' : 'మీ ఫోన్ నంబర్ నమోదు చేయండి'}
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                                editable={!loading}
                            />
                        </View>
                    )}

                    {mode === 'enter_reset_code' && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                {language === 'en' ? 'Verification Code *' : 'ధృవీకరణ కోడ్ *'}
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder={language === 'en' ? 'Enter 6-digit code' : '6 అంకెల కోడ్‌ని నమోదు చేయండి'}
                                value={resetCode}
                                onChangeText={setResetCode}
                                keyboardType="number-pad"
                                maxLength={6}
                                editable={!loading}
                            />
                        </View>
                    )}

                    {(mode === 'login' || mode === 'register' || mode === 'enter_reset_code') && (
                        <>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>
                                    {mode === 'enter_reset_code'
                                        ? (language === 'en' ? 'New Password *' : 'కొత్త పాస్‌వర్డ్ *')
                                        : (language === 'en' ? 'Password *' : 'పాస్‌వర్డ్ *')}
                                </Text>
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        placeholder={
                                            mode === 'enter_reset_code'
                                                ? (language === 'en' ? 'Enter new password' : 'కొత్త పాస్‌వర్డ్‌ని నమోదు చేయండి')
                                                : (language === 'en' ? 'Enter your password' : 'మీ పాస్‌వర్డ్ నమోదు చేయండి')
                                        }
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
                                        editable={!loading}
                                    />
                                    <TouchableOpacity 
                                        style={styles.eyeButton}
                                        onPress={() => setShowPassword(!showPassword)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.eyeText}>
                                            {showPassword ? '👁️' : '🙈'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                {(mode === 'register' || mode === 'enter_reset_code') && (
                                    <Text style={styles.hint}>
                                        {language === 'en' ? 'Minimum 6 characters' : 'కనీసం 6 అక్షరాలు ఉండాలి'}
                                    </Text>
                                )}
                            </View>

                            {(mode === 'register' || mode === 'enter_reset_code') && (
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>
                                        {mode === 'enter_reset_code'
                                            ? (language === 'en' ? 'Confirm New Password *' : 'కొత్త పాస్‌వర్డ్‌ను ధృవీకరించండి *')
                                            : (language === 'en' ? 'Confirm Password *' : 'పాస్‌వర్డ్‌ను ధృవీకరించండి *')}
                                    </Text>
                                    <View style={styles.passwordContainer}>
                                        <TextInput
                                            style={styles.passwordInput}
                                            placeholder={
                                                mode === 'enter_reset_code'
                                                    ? (language === 'en' ? 'Confirm new password' : 'కొత్త పాస్‌వర్డ్‌ను ధృవీకరించండి')
                                                    : (language === 'en' ? 'Confirm your password' : 'మీ పాస్‌వర్డ్‌ను ధృవీకరించండి')
                                            }
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            secureTextEntry={!showPassword}
                                            autoCapitalize="none"
                                            editable={!loading}
                                        />
                                        <TouchableOpacity 
                                            style={styles.eyeButton}
                                            onPress={() => setShowPassword(!showPassword)}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={styles.eyeText}>
                                                {showPassword ? '👁️' : '🙈'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}

                            {mode === 'login' && (
                                <TouchableOpacity
                                    style={styles.forgotPasswordButton}
                                    onPress={() => {
                                        setMode('forgot_password');
                                        setEmail('');
                                    }}
                                >
                                    <Text style={styles.forgotPasswordText}>
                                        {language === 'en' ? 'Forgot Password?' : 'పాస్‌వర్డ్ మర్చిపోయారా?'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </>
                    )}

                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        <Text style={styles.submitButtonText}>
                            {mode === 'login'
                                ? (language === 'en' ? 'Login' : 'లాగిన్')
                                : mode === 'register'
                                ? (language === 'en' ? 'Register' : 'నమోదు చేయండి')
                                : mode === 'forgot_password'
                                ? (language === 'en' ? 'Send Code' : 'కోడ్ పంపండి')
                                : (language === 'en' ? 'Reset Password' : 'పాస్‌వర్డ్‌ను రీసెట్ చేయండి')}
                        </Text>
                    </TouchableOpacity>

                    {(mode === 'forgot_password' || mode === 'enter_reset_code') ? (
                        <TouchableOpacity
                            style={styles.toggleButton}
                            onPress={() => {
                                setMode('login');
                                setEmail('');
                                setPassword('');
                                setConfirmPassword('');
                                setResetCode('');
                            }}
                            disabled={loading}
                        >
                            <Text style={styles.toggleButtonText}>
                                {language === 'en' ? 'Back to Login' : 'లాగిన్‌కి తిరిగి వెళ్లండి'}
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.toggleButton}
                            onPress={toggleMode}
                            disabled={loading}
                        >
                            <Text style={styles.toggleButtonText}>
                                {mode === 'login'
                                    ? (language === 'en' ? "Don't have an account? Register" : 'ఖాతా లేదా? నమోదు చేయండి')
                                    : (language === 'en' ? 'Already have an account? Login' : 'ఇప్పటికే ఖాతా ఉందా? లాగిన్ అవ్వండి')}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        {language === 'en'
                            ? 'Manage your beedi production efficiently'
                            : 'మీ బీడీల ఉత్పత్తిని సమర్థవంతంగా నిర్వహించండి'}
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
    topBar: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'ios' ? 48 : 24,
        paddingBottom: 8,
    },
    languageToggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#e2e8f0',
        borderRadius: 8,
        padding: 2,
    },
    langButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    langButtonActive: {
        backgroundColor: '#3b82f6',
    },
    langButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
    },
    langButtonTextActive: {
        color: '#fff',
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
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1f2937',
    },
    eyeButton: {
        paddingHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    eyeText: {
        fontSize: 20,
    },
    forgotPasswordButton: {
        alignSelf: 'flex-end',
        marginBottom: 20,
        marginTop: -10,
    },
    forgotPasswordText: {
        color: '#3b82f6',
        fontSize: 14,
        fontWeight: '500',
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
