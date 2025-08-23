import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, KeyboardAvoidingView, Platform, SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfile, clearError } from '../Redux/UserSlice';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../../firebaseConfig';
import CustomAlert from '../components/CustomAlert';

export default function Profile() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    
    // Custom Alert state
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('info');

    const dispatch = useDispatch();
    const { user, isLoading, error } = useSelector(state => state.user);
    const navigation = useNavigation();

    // Custom Alert göstərmək üçün helper funksiya
    const showAlert = (message, type = 'info') => {
        setAlertMessage(message);
        setAlertType(type);
        setAlertVisible(true);
    };

    // User məlumatlarını state-ə yüklə
    useEffect(() => {
        if (user) {
            // Name artıq user obyektindən gəlir, state-ə yükləməyə ehtiyac yoxdur
        }
    }, [user]);

    // Error mesajını göstər
    useEffect(() => {
        if (error) {
            showAlert(error, 'error');
            dispatch(clearError());
        }
    }, [error]);

    const handleSavePassword = async () => {
        if (!currentPassword.trim()) {
            showAlert('Cari şifrəni daxil edin', 'warning');
            return;
        }
        if (!newPassword.trim()) {
            showAlert('Yeni şifrəni daxil edin', 'warning');
            return;
        }
        if (newPassword.length < 6) {
            showAlert('Yeni şifrə ən azı 6 simvol olmalıdır', 'warning');
            return;
        }
        if (newPassword !== confirmPassword) {
            showAlert('Yeni şifrələr uyğun gəlmir', 'warning');
            return;
        }

        try {
            setIsChangingPassword(true);
            
            // Cari şifrəni yoxla
            const { signInWithEmailAndPassword } = await import('firebase/auth');
            await signInWithEmailAndPassword(auth, user.email, currentPassword);
            
            // Şifrəni dəyişdir
            await dispatch(updateUserProfile({ 
                name: user?.name || '', // Mövcud name-i saxla
                password: newPassword 
            })).unwrap();
            
            showAlert('Şifrə uğurla dəyişdirildi!', 'success');
            setIsChangingPassword(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error('Password change error:', error);
            
            if (error.message.includes('Cari şifrə yanlışdır')) {
                showAlert('Cari şifrə yanlışdır', 'error');
            } else if (error.message.includes('Təhlükəsizlik üçün yenidən giriş etməlisiniz')) {
                showAlert(error.message, 'warning');
            } else {
                showAlert(error.message || 'Şifrə dəyişdirilə bilmədi', 'error');
            }
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleCancelPassword = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setIsChangingPassword(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.keyboardContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backButton}
                        >
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.headerContent}>
                        <View style={styles.headerIcon}>
                            <Ionicons name="person-circle-outline" size={40} color="#fff" />
                        </View>
                        <Text style={styles.headerTitle}>Profil</Text>
                        <Text style={styles.headerSubtitle}>Şəxsi məlumatlarınız</Text>
                    </View>
                </LinearGradient>

                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.profileContainer}>
                        {/* Profil Məlumatları */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Profil Məlumatları</Text>
                            
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Ad Soyad</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="person-outline" size={20} color="#667eea" style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, styles.inputDisabled]}
                                        value={user?.name || ''}
                                        editable={false}
                                        placeholder="Ad və soyadınız"
                                        placeholderTextColor="#999"
                                    />
                                </View>
                                <Text style={styles.helperText}>Ad və soyad dəyişdirilə bilməz</Text>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Email</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="mail-outline" size={20} color="#667eea" style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, styles.inputDisabled]}
                                        value={user?.email || ''}
                                        editable={false}
                                        placeholder="Email ünvanınız"
                                        placeholderTextColor="#999"
                                    />
                                </View>
                                <Text style={styles.helperText}>Email ünvanı dəyişdirilə bilməz</Text>
                            </View>
                        </View>

                        {/* Şifrə Dəyişdirmə */}
                        {isChangingPassword && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Şifrə Dəyişdirmə</Text>
                                
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Cari Şifrə</Text>
                                    <View style={styles.inputContainer}>
                                        <Ionicons name="lock-closed-outline" size={20} color="#667eea" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            value={currentPassword}
                                            onChangeText={setCurrentPassword}
                                            placeholder="Cari şifrənizi daxil edin"
                                            placeholderTextColor="#999"
                                            secureTextEntry={!showCurrentPassword}
                                        />
                                        <TouchableOpacity
                                            style={styles.passwordToggle}
                                            onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                                        >
                                            <Ionicons 
                                                name={showCurrentPassword ? "eye-off-outline" : "eye-outline"} 
                                                size={20} 
                                                color="#667eea" 
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Yeni Şifrə</Text>
                                    <View style={styles.inputContainer}>
                                        <Ionicons name="lock-closed-outline" size={20} color="#667eea" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            value={newPassword}
                                            onChangeText={setNewPassword}
                                            placeholder="Yeni şifrə yaradın (ən azı 6 simvol)"
                                            placeholderTextColor="#999"
                                            secureTextEntry={!showNewPassword}
                                        />
                                        <TouchableOpacity
                                            style={styles.passwordToggle}
                                            onPress={() => setShowNewPassword(!showNewPassword)}
                                        >
                                            <Ionicons 
                                                name={showNewPassword ? "eye-off-outline" : "eye-outline"} 
                                                size={20} 
                                                color="#667eea" 
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Yeni Şifrəni Təsdiqlə</Text>
                                    <View style={styles.inputContainer}>
                                        <Ionicons name="lock-closed-outline" size={20} color="#667eea" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            placeholder="Yeni şifrənizi təkrar daxil edin"
                                            placeholderTextColor="#999"
                                            secureTextEntry={!showConfirmPassword}
                                        />
                                        <TouchableOpacity
                                            style={styles.passwordToggle}
                                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            <Ionicons 
                                                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                                                size={20} 
                                                color="#667eea" 
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Düymələr */}
                        <View style={styles.buttonContainer}>
                            {!isChangingPassword ? (
                                <TouchableOpacity
                                    style={styles.editButton}
                                    onPress={() => setIsChangingPassword(true)}
                                >
                                    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.editButtonGradient}>
                                        <Ionicons name="lock-closed-outline" size={20} color="#fff" style={styles.buttonIcon} />
                                        <Text style={styles.editButtonText}>Şifrəni Dəyiş</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.editButtonsRow}>
                                    <TouchableOpacity
                                        style={styles.cancelButton}
                                        onPress={handleCancelPassword}
                                        disabled={isLoading}
                                    >
                                        <Text style={styles.cancelButtonText}>Ləğv Et</Text>
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity
                                        style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
                                        onPress={handleSavePassword}
                                        disabled={isLoading}
                                    >
                                        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.saveButtonGradient}>
                                            {isLoading ? (
                                                <View style={styles.loadingContainer}>
                                                    <Ionicons name="reload" size={20} color="#fff" style={styles.loadingIcon} />
                                                    <Text style={styles.saveButtonText}>Yenilənir...</Text>
                                                </View>
                                            ) : (
                                                <>
                                                    <Ionicons name="checkmark-outline" size={20} color="#fff" style={styles.buttonIcon} />
                                                    <Text style={styles.saveButtonText}>Şifrəni Dəyiş</Text>
                                                </>
                                            )}
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
            
            {/* Custom Alert */}
            <CustomAlert
                visible={alertVisible}
                message={alertMessage}
                type={alertType}
                onHide={() => setAlertVisible(false)}
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
    headerTop: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 20 : 40,
        left: 20,
        zIndex: 1,
    },
    backButton: {
        padding: 10,
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
        paddingBottom: 40,
    },

    // Profile Container
    profileContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        marginBottom: 20,
    },

    // Sections
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        paddingBottom: 10,
        borderBottomWidth: 2,
        borderBottomColor: '#667eea',
    },

    // Input Groups
    inputGroup: {
        marginBottom: 20,
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
    inputDisabled: {
        backgroundColor: '#f1f3f4',
        color: '#666',
    },
    passwordToggle: {
        padding: 8,
    },
    helperText: {
        fontSize: 12,
        color: '#999',
        marginTop: 5,
        fontStyle: 'italic',
    },

    // Buttons
    buttonContainer: {
        marginTop: 20,
    },
    editButton: {
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    editButtonGradient: {
        paddingVertical: 18,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    editButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    buttonIcon: {
        marginRight: 8,
    },

    editButtonsRow: {
        flexDirection: 'row',
        gap: 15,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 18,
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonGradient: {
        paddingVertical: 18,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    loadingIcon: {
        marginRight: 8,
    },
});
