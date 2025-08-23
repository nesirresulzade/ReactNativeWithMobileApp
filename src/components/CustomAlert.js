import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function CustomAlert({ 
    visible, 
    message, 
    type = 'info', // 'success', 'error', 'warning', 'info'
    onHide 
}) {
    const slideAnim = useRef(new Animated.Value(-100)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Giriş animasiyası
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();

            // 3 saniyə sonra avtomatik silin
            const timer = setTimeout(() => {
                hideAlert();
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [visible]);

    const hideAlert = () => {
        // Çıxış animasiyası
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: -100,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            if (onHide) {
                onHide();
            }
        });
    };

    if (!visible) return null;

    const getAlertConfig = () => {
        switch (type) {
            case 'success':
                return {
                    colors: ['#4CAF50', '#45a049'],
                    icon: 'checkmark-circle',
                    backgroundColor: '#e8f5e8',
                    borderColor: '#4CAF50',
                };
            case 'error':
                return {
                    colors: ['#f44336', '#d32f2f'],
                    icon: 'close-circle',
                    backgroundColor: '#ffebee',
                    borderColor: '#f44336',
                };
            case 'warning':
                return {
                    colors: ['#ff9800', '#f57c00'],
                    icon: 'warning',
                    backgroundColor: '#fff3e0',
                    borderColor: '#ff9800',
                };
            case 'info':
            default:
                return {
                    colors: ['#2196F3', '#1976d2'],
                    icon: 'information-circle',
                    backgroundColor: '#e3f2fd',
                    borderColor: '#2196F3',
                };
        }
    };

    const config = getAlertConfig();

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY: slideAnim }],
                    opacity: opacityAnim,
                },
            ]}
        >
            <LinearGradient colors={config.colors} style={styles.gradient}>
                <View style={styles.iconContainer}>
                    <Ionicons name={config.icon} size={24} color="#fff" />
                </View>
                <Text style={styles.message}>{message}</Text>
            </LinearGradient>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        zIndex: 9999,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    gradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 12,
        minHeight: 60,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    message: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 20,
        textAlign: 'left',
    },
});
