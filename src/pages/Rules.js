import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function Rules() {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity 
                        style={styles.backButton} 
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <View style={styles.headerIcon}>
                            <Ionicons name="document-text-outline" size={28} color="#fff" />
                        </View>
                        <Text style={styles.headerTitle}>Qaydalar</Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* App Purpose Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionIcon}>
                            <Ionicons name="bulb-outline" size={24} color="#667eea" />
                        </View>
                        <Text style={styles.sectionTitle}>App-in Məqsədi</Text>
                    </View>
                    <View style={styles.infoCard}>
                        <Text style={styles.infoText}>
                            "Günlük Notlar" tətbiqi gündəlik tapşırıqlarınızı və fikirlərinizi sadə və effektiv şəkildə idarə etmək üçün yaradılmışdır. Bu tətbiq hər gün yeni başlamaq və keçmiş günlərin məlumatlarını saxlayaraq, məhsuldarlığınızı artırmağa kömək edir.
                        </Text>
                    </View>
                </View>

                {/* How It Works Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionIcon}>
                            <Ionicons name="settings-outline" size={24} color="#667eea" />
                        </View>
                        <Text style={styles.sectionTitle}>Necə İşləyir?</Text>
                    </View>
                    
                    <View style={styles.stepCard}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>1</Text>
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>Günlük Notlar Əlavə Edin</Text>
                            <Text style={styles.stepDescription}>
                                Hər gün üçün lazım olan tapşırıqları və fikirləri əlavə edin. Hər not avtomatik olaraq cari günə aid edilir.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.stepCard}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>2</Text>
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>Günlük Reset Sistemi</Text>
                            <Text style={styles.stepDescription}>
                                Hər günün sonunda (24 saat) bütün notlar avtomatik olaraq "Keçmiş Günlər" bölməsinə köçürülür və yeni gün üçün təmiz səhifə açılır.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.stepCard}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>3</Text>
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>Keçmişə Baxış</Text>
                            <Text style={styles.stepDescription}>
                                Keçmiş günlərdə yazdığınız notları həmişə görə bilərsiniz. Son 7 günün məlumatları saxlanılır.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Features Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionIcon}>
                            <Ionicons name="star-outline" size={24} color="#667eea" />
                        </View>
                        <Text style={styles.sectionTitle}>Əsas Xüsusiyyətlər</Text>
                    </View>
                    
                    <View style={styles.featureCard}>
                        <View style={styles.featureIcon}>
                            <Ionicons name="time-outline" size={20} color="#667eea" />
                        </View>
                        <Text style={styles.featureText}>Günlük timer sistemi</Text>
                    </View>

                    <View style={styles.featureCard}>
                        <View style={styles.featureIcon}>
                            <Ionicons name="cloud-upload-outline" size={20} color="#667eea" />
                        </View>
                        <Text style={styles.featureText}>Avtomatik məlumat yaddaşlaşdırma</Text>
                    </View>

                    <View style={styles.featureCard}>
                        <View style={styles.featureIcon}>
                            <Ionicons name="person-outline" size={20} color="#667eea" />
                        </View>
                        <Text style={styles.featureText}>Şəxsi hesab sistemi</Text>
                    </View>

                    <View style={styles.featureCard}>
                        <View style={styles.featureIcon}>
                            <Ionicons name="shield-checkmark-outline" size={20} color="#667eea" />
                        </View>
                        <Text style={styles.featureText}>Məlumatların təhlükəsizliyi</Text>
                    </View>
                </View>

                {/* Tips Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionIcon}>
                            <Ionicons name="lightbulb-outline" size={24} color="#667eea" />
                        </View>
                        <Text style={styles.sectionTitle}>İstifadə Tövsiyələri</Text>
                    </View>
                    
                    <View style={styles.tipCard}>
                        <Text style={styles.tipText}>
                            • Hər gün səhər yeni günə başlayarkən günlük hədəflərinizi yazın{'\n'}
                            • Mühüm tapşırıqları əvvəlcə yazın{'\n'}
                            • Günün sonunda nəticələri qiymətləndirin{'\n'}
                            • Keçmiş günlərdəki uğurları xatırlayın
                        </Text>
                    </View>
                </View>

                {/* Contact Section */}
                <View style={styles.section}>
                    <View style={styles.contactCard}>
                        <View style={styles.contactIcon}>
                            <Ionicons name="mail-outline" size={24} color="#667eea" />
                        </View>
                        <Text style={styles.contactTitle}>Dəstək Lazımdır?</Text>
                        <Text style={styles.contactText}>
                            Tətbiq haqqında suallarınız və ya təklifləriniz varsa, bizimlə əlaqə saxlayın.
                        </Text>
                    </View>
                </View>

                {/* Bottom Spacing for Navigation Buttons */}
                <View style={styles.bottomSpacing} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    
    // Header
    header: {
        paddingTop: 60,
        paddingBottom: 25,
        paddingHorizontal: 20,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    backButton: {
        padding: 10,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 12,
        marginRight: 15,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    headerIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },

    // Content
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 25,
    },

    // Sections
    section: {
        marginBottom: 30,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f4ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },

    // Info Card
    infoCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    infoText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#555',
        textAlign: 'justify',
    },

    // Step Cards
    stepCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    stepNumber: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#667eea',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    stepNumberText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    stepDescription: {
        fontSize: 14,
        lineHeight: 20,
        color: '#666',
    },

    // Feature Cards
    featureCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 18,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    featureIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f0f4ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    featureText: {
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
    },

    // Tip Card
    tipCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    tipText: {
        fontSize: 15,
        lineHeight: 22,
        color: '#555',
    },

    // Contact Card
    contactCard: {
        backgroundColor: '#fff',
        padding: 25,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    contactIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#f0f4ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    contactTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    contactText: {
        fontSize: 14,
        lineHeight: 20,
        color: '#666',
        textAlign: 'center',
    },

    // Bottom Spacing for Navigation Buttons
    bottomSpacing: {
        height: 100, // Adjust height as needed to prevent overlap
    },
});
