import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function Loading({ onSkip, type = 'default' }) {
    const [showMessage, setShowMessage] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        console.log('Loading: Component mounted');
        
        // 2 saniyə sonra mesaj göstər
        const messageTimer = setTimeout(() => {
            console.log('Loading: Timeout reached, showing message');
            setShowMessage(true);
        }, 2000);

        // Animasiya başlat
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();

        return () => {
            console.log('Loading: Component unmounted');
            clearTimeout(messageTimer);
        };
    }, []);

    const handleSkip = () => {
        console.log('Loading: Skip button pressed');
        if (onSkip) onSkip();
    };

    // Loading tipinə görə fərqli mesajlar
    const getLoadingMessage = () => {
        switch (type) {
            case 'logout':
                return 'Çıxış edilir...';
            case 'login':
                return 'Giriş edilir...';
            case 'signup':
                return 'Hesab yaradılır...';
            default:
                return 'Yüklənir...';
        }
    };

    return (
        <LinearGradient 
            colors={['#667eea', '#764ba2']} 
            style={styles.container}
        >
            <Animated.View 
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }]
                    }
                ]}
            >
                {/* App Icon */}
                <View style={styles.iconContainer}>
                    <Ionicons name="journal-outline" size={80} color="#fff" />
                </View>

                {/* App Title */}
                <Text style={styles.title}>Günlük Notlar</Text>
                <Text style={styles.subtitle}>Planım App</Text>

                {/* Loading Message */}
                <Text style={styles.loadingMessage}>{getLoadingMessage()}</Text>

                {/* Loading Indicator */}
                <View style={styles.loadingContainer}>
                    <View style={styles.loadingDots}>
                        <View style={[styles.dot, styles.dot1]} />
                        <View style={[styles.dot, styles.dot2]} />
                        <View style={[styles.dot, styles.dot3]} />
                    </View>
                </View>

                {/* Skip Button (2 saniyə sonra görünür) */}
                {showMessage && (
                    <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                        <Text style={styles.skipButtonText}>Loading-i Atla</Text>
                    </TouchableOpacity>
                )}
            </Animated.View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 50,
        textAlign: 'center',
    },
    loadingContainer: {
        marginBottom: 40,
    },
    loadingDots: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#fff',
        marginHorizontal: 6,
    },
    dot1: {
        animationName: 'bounce',
        animationDuration: '1.4s',
        animationIterationCount: 'infinite',
        animationDelay: '0s',
    },
    dot2: {
        animationName: 'bounce',
        animationDuration: '1.4s',
        animationIterationCount: 'infinite',
        animationDelay: '0.2s',
    },
    dot3: {
        animationName: 'bounce',
        animationDuration: '1.4s',
        animationIterationCount: 'infinite',
        animationDelay: '0.4s',
    },
    skipButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    skipButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    loadingMessage: {
        fontSize: 20,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 20,
        textAlign: 'center',
    },
});
