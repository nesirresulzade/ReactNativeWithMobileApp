import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function TaskCard({ task, onDelete }) {
    return (
        <View style={styles.card}>
            <LinearGradient 
                colors={['#f8f9ff', '#ffffff']} 
                style={styles.cardGradient}
            >
                <View style={styles.cardContent}>
                    <View style={styles.taskInfo}>
                        <View style={styles.taskIcon}>
                            <Ionicons name="checkmark-circle-outline" size={20} color="#667eea" />
                        </View>
                        <Text style={styles.taskText} numberOfLines={3}>
                            {task.text}
                        </Text>
                    </View>
                    
                    <TouchableOpacity 
                        style={styles.deleteButton} 
                        onPress={() => onDelete(task.id)}
                        activeOpacity={0.7}
                    >
                        <LinearGradient 
                            colors={['#ff6b6b', '#ee5a52']} 
                            style={styles.deleteGradient}
                        >
                            <Ionicons name="trash-outline" size={18} color="#fff" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: 12,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 6,
    },
    cardGradient: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(102, 126, 234, 0.1)',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
        paddingVertical: 20,
    },
    taskInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    taskIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        marginTop: 2,
    },
    taskText: {
        flex: 1,
        fontSize: 16,
        lineHeight: 22,
        color: '#2c3e50',
        fontWeight: '500',
        textAlign: 'left',
    },
    deleteButton: {
        marginLeft: 15,
    },
    deleteGradient: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#ff6b6b',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
});
