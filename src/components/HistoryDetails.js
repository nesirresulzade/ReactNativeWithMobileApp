import React from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function HistoryDetails({ historyItem, onClose, onDelete }) {
    const formatDate = (date) => {
        const months = [
            'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun',
            'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'
        ];
        
        let dateObj;
        if (date && date.seconds) {
            dateObj = new Date(date.seconds * 1000);
        } else if (date instanceof Date) {
            dateObj = date;
        } else {
            dateObj = new Date(date);
        }
        
        if (isNaN(dateObj.getTime())) {
            return 'Tarix bilinmir';
        }
        
        const day = dateObj.getDate();
        const month = months[dateObj.getMonth()];
        const year = dateObj.getFullYear();
        
        return `${day} ${month} ${year}`;
    };

    const formatTime = (date) => {
        let dateObj;
        if (date && date.seconds) {
            dateObj = new Date(date.seconds * 1000);
        } else if (date instanceof Date) {
            dateObj = date;
        } else {
            dateObj = new Date(date);
        }
        
        if (isNaN(dateObj.getTime())) {
            return '';
        }
        
        return dateObj.toLocaleTimeString('az-AZ', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity 
                        style={styles.backButton} 
                        onPress={onClose}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    
                    <View style={styles.headerInfo}>
                        <Text style={styles.headerTitle}>Günlük Detalları</Text>
                        <Text style={styles.headerDate}>{formatDate(historyItem?.date)}</Text>
                    </View>
                    
                    <TouchableOpacity 
                        style={styles.deleteButton} 
                        onPress={() => onDelete(historyItem?.id)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="trash-outline" size={24} color="#ff5555" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Date Info Card */}
                <View style={styles.dateCard}>
                    <LinearGradient colors={['#ffffff', '#f8f9ff']} style={styles.dateCardGradient}>
                        <View style={styles.dateCardHeader}>
                            <View style={styles.dateIcon}>
                                <Ionicons name="calendar-outline" size={24} color="#667eea" />
                            </View>
                            <View style={styles.dateInfo}>
                                <Text style={styles.dateLabel}>Tarix</Text>
                                <Text style={styles.dateValue}>{formatDate(historyItem?.date)}</Text>
                                {historyItem?.archivedAt && (
                                    <Text style={styles.archiveTime}>
                                        Arxivləndi: {formatTime(new Date(historyItem.archivedAt))}
                                    </Text>
                                )}
                            </View>
                        </View>
                        
                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{historyItem?.tasks?.length || 0}</Text>
                                <Text style={styles.statLabel}>Ümumi Not</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>
                                    {historyItem?.originalTaskCount || historyItem?.tasks?.length || 0}
                                </Text>
                                <Text style={styles.statLabel}>Orijinal Say</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </View>

                {/* Tasks List */}
                <View style={styles.tasksSection}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionIcon}>
                            <Ionicons name="journal-outline" size={24} color="#667eea" />
                        </View>
                        <Text style={styles.sectionTitle}>Günlük Notlar</Text>
                    </View>
                    
                    {historyItem?.tasks && historyItem.tasks.length > 0 ? (
                        <View style={styles.tasksList}>
                            {historyItem.tasks.map((task, index) => (
                                <View key={index} style={styles.taskCard}>
                                    <LinearGradient colors={['#ffffff', '#f8f9ff']} style={styles.taskCardGradient}>
                                        <View style={styles.taskHeader}>
                                            <View style={styles.taskNumber}>
                                                <Text style={styles.taskNumberText}>{index + 1}</Text>
                                            </View>
                                            <Text style={styles.taskText}>{task}</Text>
                                        </View>
                                    </LinearGradient>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIconContainer}>
                                <Ionicons name="document-outline" size={48} color="#ccc" />
                            </View>
                            <Text style={styles.emptyStateText}>Bu gün üçün not yoxdur</Text>
                        </View>
                    )}
                </View>

                {/* Bottom Spacing */}
                <View style={styles.bottomSpacing} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#f8f9fa',
        zIndex: 1000,
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
        justifyContent: 'space-between',
        marginTop: 10,
    },
    backButton: {
        padding: 12,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerInfo: {
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    headerDate: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
    },
    deleteButton: {
        padding: 12,
        backgroundColor: 'rgba(255,85,85,0.15)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,85,85,0.3)',
    },
    
    // Content
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 25,
    },
    
    // Date Card
    dateCard: {
        marginBottom: 25,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    dateCardGradient: {
        padding: 20,
    },
    dateCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    dateIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f0f4ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    dateInfo: {
        flex: 1,
    },
    dateLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    dateValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    archiveTime: {
        fontSize: 12,
        color: '#999',
        fontStyle: 'italic',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#667eea',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#eee',
    },
    
    // Tasks Section
    tasksSection: {
        marginBottom: 25,
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
    
    // Tasks List
    tasksList: {
        gap: 12,
    },
    taskCard: {
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    taskCardGradient: {
        padding: 16,
    },
    taskHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    taskNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#667eea',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        marginTop: 2,
    },
    taskNumberText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    taskText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        lineHeight: 22,
    },
    
    // Empty State
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
        backgroundColor: '#fff',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f0f4ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#999',
    },
    
    // Bottom Spacing
    bottomSpacing: {
        height: 100,
    },
});
