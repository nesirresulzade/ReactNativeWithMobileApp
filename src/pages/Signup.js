import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, KeyboardAvoidingView, Platform, SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { signupUser, clearError } from '../Redux/UserSlice';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import CustomAlert from '../components/CustomAlert';

export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    // Custom Alert state
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('info');

    const dispatch = useDispatch();
    const navigation = useNavigation();
    const { isLoading, error, user } = useSelector(state => state.user);

    // Custom Alert göstərmək üçün helper funksiya
    const showAlert = (message, type = 'info') => {
        setAlertMessage(message);
        setAlertType(type);
        setAlertVisible(true);
    };

    // User varsa Home-a yönləndir
    useEffect(() => {
        if (user) {
            navigation.replace('Home');
        }
    }, [user]);

    // Error mesajını göstər
    useEffect(() => {
        if (error) {
            showAlert(error, 'error');
            dispatch(clearError());
        }
    }, [error]);

    const handleSignup = async () => {
        if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
            showAlert('Bütün sahələri doldurun', 'warning');
            return;
        }

        if (password !== confirmPassword) {
            showAlert('Şifrələr uyğun gəlmir', 'warning');
            return;
        }

        if (password.length < 6) {
            showAlert('Şifrə ən azı 6 simvol olmalıdır', 'warning');
            return;
        }

        try {
            await dispatch(signupUser({ name, email, password })).unwrap();
            // Uğurlu qeydiyyatdan sonra user state dəyişəcək və useEffect ilə Home-a yönləndiriləcək
            // Alert və manual navigation lazım deyil
        } catch (error) {
            // Error artıq Redux state-də saxlanılıb və useEffect ilə göstəriləcək
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                style={styles.keyboardContainer} 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
                    <View style={styles.headerContent}>
                        <View style={styles.headerIcon}>
                            <Ionicons name="person-add-outline" size={40} color="#fff" />
                        </View>
                        <Text style={styles.headerTitle}>Yeni Hesab</Text>
                        <Text style={styles.headerSubtitle}>Qeydiyyatdan keçin</Text>
                    </View>
                </LinearGradient>

                <ScrollView 
                    style={styles.content} 
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.formContainer}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Ad Soyad</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="person-outline" size={20} color="#667eea" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ad və soyadınızı daxil edin"
                                    placeholderTextColor="#999"
                                    value={name}
                                    onChangeText={setName}
                                    autoCapitalize="words"
                                    autoCorrect={false}
                                    editable={!isLoading}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Email</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="mail-outline" size={20} color="#667eea" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email ünvanınızı daxil edin"
                                    placeholderTextColor="#999"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    editable={!isLoading}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Şifrə</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="lock-closed-outline" size={20} color="#667eea" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Şifrə yaradın (ən azı 6 simvol)"
                                    placeholderTextColor="#999"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    editable={!isLoading}
                                />
                                <TouchableOpacity
                                    style={styles.passwordToggle}
                                    onPress={() => setShowPassword(!showPassword)}
                                    disabled={isLoading}
                                >
                                    <Ionicons 
                                        name={showPassword ? "eye-off-outline" : "eye-outline"} 
                                        size={20} 
                                        color="#667eea" 
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Şifrəni Təsdiqlə</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="lock-closed-outline" size={20} color="#667eea" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Şifrənizi təkrar daxil edin"
                                    placeholderTextColor="#999"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                    autoCapitalize="none"
                                    editable={!isLoading}
                                />
                                <TouchableOpacity
                                    style={styles.passwordToggle}
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    disabled={isLoading}
                                >
                                    <Ionicons 
                                        name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                                        size={20} 
                                        color="#667eea" 
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity 
                            style={[styles.signupButton, isLoading && styles.signupButtonDisabled]} 
                            onPress={handleSignup}
                            disabled={isLoading}
                        >
                            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.signupButtonGradient}>
                                {isLoading ? (
                                    <View style={styles.loadingContainer}>
                                        <Ionicons name="reload" size={20} color="#fff" style={styles.loadingIcon} />
                                        <Text style={styles.signupButtonText}>Hesab yaradılır...</Text>
                                    </View>
                                ) : (
                                    <Text style={styles.signupButtonText}>Hesab Yarat</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>və ya</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <TouchableOpacity 
                            style={styles.loginButton}
                            onPress={() => navigation.navigate('Login')}
                            disabled={isLoading}
                        >
                            <Text style={styles.loginButtonText}>Hesabım var</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
            <CustomAlert
                visible={alertVisible}
                message={alertMessage}
                type={alertType}
                onClose={() => setAlertVisible(false)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    keyboardContainer: {
        flex: 1,
    },
    
    // Header
    header: {
        paddingTop: Platform.OS === 'ios' ? 20 : 40,
        paddingBottom: 30,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    headerContent: {
        alignItems: 'center',
    },
    headerIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
    },

    // Content
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40, // Telefon düymələri üçün əlavə yer
    },

    // Form Container
    formContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        marginBottom: 20, // Əlavə aşağı məsafə
    },

    // Input Groups
    inputGroup: {
        marginBottom: 25,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e9ecef',
        paddingHorizontal: 16,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 16,
        color: '#333',
    },
    passwordToggle: {
        padding: 8,
    },

    // Signup Button
    signupButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 10,
        marginBottom: 25,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    signupButtonDisabled: {
        opacity: 0.7,
    },
    signupButtonGradient: {
        paddingVertical: 18,
        alignItems: 'center',
    },
    signupButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    loadingIcon: {
        marginRight: 8,
    },

    // Divider
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 25,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#e9ecef',
    },
    dividerText: {
        marginHorizontal: 20,
        color: '#999',
        fontSize: 14,
    },

    // Login Button
    loginButton: {
        paddingVertical: 16,
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    loginButtonText: {
        color: '#667eea',
        fontSize: 16,
        fontWeight: '600',
    },
});
