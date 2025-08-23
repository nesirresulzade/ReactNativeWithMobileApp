import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    Image, ImageBackground, ScrollView, Modal, Dimensions
} from 'react-native';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withSpring, 
    withTiming, 
    interpolate,
    runOnJS,
    Easing
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import TaskCard from '../components/TaskCard';
import HistoryDetails from '../components/HistoryDetails';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../Redux/UserSlice';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import CustomAlert from '../components/CustomAlert';

import { db } from '../../firebaseConfig';
import {
    collection, addDoc, onSnapshot, query, orderBy,
    doc, deleteDoc, where, getDocs, writeBatch, Timestamp
} from 'firebase/firestore';

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Home() {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const { user } = useSelector(state => state.user);

    const [tasks, setTasks] = useState([]);
    const [taskText, setTaskText] = useState('');
    const [history, setHistory] = useState([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [todayDate, setTodayDate] = useState(new Date());
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    
    // Custom Alert state
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('info');
    
    // History Details state
    const [historyDetails, setHistoryDetails] = useState(null);

    const timerRef = useRef(null);
    
    // Reanimated animasiya state-ləri
    const scrollY = useSharedValue(0);
    const taskScale = useSharedValue(1);
    const historyScale = useSharedValue(1);
    const drawerSlide = useSharedValue(300);

    // User ID-yə görə dinamik collection adları
    const tasksColRef = collection(db, `users/${user?.uid}/tasks`);
    const historyColRef = collection(db, `users/${user?.uid}/history`);

    const getNextMidnight = () => {
        const now = new Date();
        // Növbəti günün 00:00:00 vaxtını hesabla
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return tomorrow;
    };

    const getLastMidnight = () => {
        const now = new Date();
        // Bu günün 00:00:00 vaxtını hesabla
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        return today;
    };

    const checkAndPerformDailyReset = async () => {
        try {
            // Son reset vaxtını yoxla
            const lastResetTime = await AsyncStorage.getItem('lastDailyReset');
            const now = new Date();
            const lastMidnight = getLastMidnight();
            
            // Əgər son reset bu günün səhəri deyilsə, reset et
            if (!lastResetTime || new Date(lastResetTime) < lastMidnight) {
                console.log('Performing daily reset...');
                await dailyReset();
                // dailyReset funksiyasında reset vaxtı yenilənir, burada təkrarlama
            } else {
                console.log('Daily reset artıq bu gün edilib');
            }
            
            // Əlavə olaraq, tasks collection-da köhnə məlumatlar olub-olmadığını yoxla
            const tasksSnapshot = await getDocs(tasksColRef);
            const hasOldTasks = tasksSnapshot.docs.some(doc => {
                const data = doc.data();
                if (data.createdAt && data.createdAt.seconds) {
                    const taskDate = new Date(data.createdAt.seconds * 1000);
                    return taskDate < lastMidnight;
                } else if (data.addedAt) {
                    // Əgər addedAt varsa, onu da yoxla
                    const taskDate = new Date(data.addedAt);
                    return taskDate < lastMidnight;
                }
                return false;
            });
            
            if (hasOldTasks) {
                console.log('Köhnə task-lar tapıldı, təmizlənir...');
                await dailyReset();
            }
            
        } catch (error) {
            console.error('Daily reset check zamanı xəta:', error);
        }
    };

    const dailyReset = async () => {
        try {
            console.log('Daily reset başladıldı...');
            
            const tasksSnapshot = await getDocs(tasksColRef);
            const tasksList = [];
            tasksSnapshot.forEach(docSnap => {
                const data = docSnap.data();
                // Yalnız text sahəsi olan task-ları al
                if (data && data.text && data.text.trim() !== '') {
                    tasksList.push(data);
                }
            });

            if (tasksList.length > 0) {
                console.log(`${tasksList.length} not history-ə köçürülür...`);
                
                // User-ə aid history collection-a məlumat əlavə et
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1); // Dünənki tarix
                
                // Task-ların əlavə edilmə tarixini yoxla
                const taskDates = tasksList.map(t => {
                    if (t.addedAt) {
                        return new Date(t.addedAt);
                    } else if (t.createdAt && t.createdAt.seconds) {
                        return new Date(t.createdAt.seconds * 1000);
                    }
                    return yesterday; // Default olaraq dünənki tarix
                });
                
                // Ən köhnə task tarixini tap
                const oldestTaskDate = new Date(Math.min(...taskDates.map(d => d.getTime())));
                
                // Başlıq üçün tarix formatını hazırla
                const titleDate = formatDate(oldestTaskDate);
                
                await addDoc(historyColRef, {
                    title: titleDate, // Tarix başlıq olaraq
                    date: oldestTaskDate, // Ən köhnə task tarixi
                    dateString: oldestTaskDate.toDateString(), // Tarix string-i
                    tasks: tasksList.map(t => t.text).filter(text => text && text.trim() !== ''),
                    userId: user?.uid || '',
                    createdAt: Timestamp.now(),
                    archivedAt: new Date().toISOString(), // Arxivlənmə vaxtı
                    originalTaskCount: tasksList.length, // Orijinal task sayı
                });

                // Tasks collection-dan bütün notları sil
                const batch = writeBatch(db);
                tasksSnapshot.forEach(docSnap => {
                    batch.delete(doc(db, `users/${user?.uid}/tasks`, docSnap.id));
                });
                await batch.commit();
                
                console.log('Notlar uğurla history-ə köçürüldü və silindi');
            } else {
                console.log('Köçürüləcək not yoxdur');
            }

            // History-də məlumatlar saxlanılır - avtomatik silinmə yoxdur
            console.log('History məlumatları saxlanılır - istifadəçi özü silə bilər');

            // Timer-i yenilə
            const nextMidnight = getNextMidnight();
            setTimeLeft(nextMidnight.getTime() - Date.now());
            setTodayDate(new Date());
            
            // Reset vaxtını yenilə
            await AsyncStorage.setItem('lastDailyReset', new Date().toISOString());

        } catch (error) {
            console.error('Daily reset zamanı xəta:', error);
        }
    };

    useEffect(() => {
        if (!user?.uid) return;

        // App açıldıqda dərhal daily reset-i yoxla
        const initializeApp = async () => {
            await checkAndPerformDailyReset();
        };
        
        initializeApp();

        const setupTimer = () => {
            const nextResetTime = getNextMidnight().getTime();
            const currentTimeLeft = nextResetTime - Date.now();
            setTimeLeft(currentTimeLeft);

            // Timer-i təmizlə
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }

            timerRef.current = setInterval(async () => {
                const diff = nextResetTime - Date.now();
                if (diff <= 0) {
                    console.log('Gecə yarısı - daily reset başladıldı');
                    clearInterval(timerRef.current);
                    await dailyReset();
                    setupTimer(); // Yeni timer başlat
                } else {
                    setTimeLeft(diff);
                }
            }, 1000);
        };

        setupTimer();

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [user?.uid]);

    useEffect(() => {
        if (!user?.uid) return;

        const qTasks = query(tasksColRef, orderBy('createdAt', 'desc'));
        const unsubscribeTasks = onSnapshot(qTasks, (snapshot) => {
            const arr = [];
            snapshot.forEach(docSnap => {
                const data = docSnap.data();
                // Placeholder document-ləri filter et
                if (!data.placeholder && data.text && data.text.trim() !== '') {
                    arr.push({ id: docSnap.id, ...data });
                }
            });
            setTasks(arr);
        });

        // History üçün bütün məlumatları al - vaxt məhdudiyyəti yoxdur
        const qHistory = query(
            historyColRef,
            orderBy('date', 'desc')
        );

        const unsubscribeHistory = onSnapshot(qHistory, (snapshot) => {
            const arr = [];
            snapshot.forEach(docSnap => {
                const data = docSnap.data();
                // Placeholder document-ləri filter et
                if (!data.placeholder && data.tasks && data.tasks.length > 0) {
                    arr.push({ id: docSnap.id, ...data });
                }
            });
            setHistory(arr);
        });

        return () => {
            unsubscribeTasks();
            unsubscribeHistory();
        };
    }, [user?.uid]);

    const addTask = async () => {
        if (taskText.trim() === '') return;

        try {
            // Task əlavə ediləndə yumşaq görünmə animasiyası (ekrandan çıxmadan)
            taskScale.value = 0.98;
            taskScale.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.cubic) });
            
            const now = new Date();
            await addDoc(tasksColRef, {
                text: taskText,
                createdAt: Timestamp.now(),
                addedAt: now.toISOString(), // Əlavə edilmə vaxtını da saxla
                date: now.toDateString(), // Günün tarixini də saxla
            });
            setTaskText('');
        } catch (error) {
            console.error('Task əlavə edilmədi:', error);
        }
    };

    const deleteTask = async (id) => {
        try {
            // Task silindikdə daha yaxşı animasiya
            taskScale.value = withSpring(0.9, { damping: 8, stiffness: 120 });
            
            await deleteDoc(doc(db, `users/${user?.uid}/tasks`, id));
            
            // Animasiya geri qayıtsın
            setTimeout(() => {
                taskScale.value = withSpring(1, { damping: 12, stiffness: 100 });
            }, 200);
        } catch (error) {
            console.error('Task silinmədi:', error);
        }
    };

    const deleteHistoryItem = async (id) => {
        try {
            // History silindikdə daha yaxşı animasiya
            historyScale.value = withSpring(0.9, { damping: 8, stiffness: 120 });
            
            await deleteDoc(doc(db, `users/${user?.uid}/history`, id));
            console.log('History məlumatı uğurla silindi');
            
            // Animasiya geri qayıtsın
            setTimeout(() => {
                historyScale.value = withSpring(1, { damping: 12, stiffness: 100 });
            }, 200);
        } catch (error) {
            console.error('History məlumatı silinmədi:', error);
        }
    };

    const handleLogout = async () => {
        try {
            // Drawer-i bağla əvvəlcə
            closeDrawer();
            
            // Kısa delay əlavə et state-in stabil olması üçün
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Logout action-i dispatch et
            dispatch(logoutUser());
            
        } catch (error) {
            console.log('Logout error:', error);
        }
    };

    const formatTimeLeft = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const formatDate = (date) => {
        const months = [
            'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun',
            'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'
        ];
        
        // Əgər date Firestore Timestamp-dirsə, Date-ə çevir
        let dateObj;
        if (date && date.seconds) {
            dateObj = new Date(date.seconds * 1000);
        } else if (date instanceof Date) {
            dateObj = date;
        } else {
            dateObj = new Date(date);
        }
        
        // Invalid date yoxla
        if (isNaN(dateObj.getTime())) {
            return 'Tarix bilinmir';
        }
        
        const day = dateObj.getDate();
        const month = months[dateObj.getMonth()];
        const year = dateObj.getFullYear();
        
        return `${day} ${month} ${year}`;
    };

    const openDrawer = () => {
        setIsDrawerOpen(true);
        drawerSlide.value = withSpring(0, { damping: 15, stiffness: 100 });
    };

    const closeDrawer = () => {
        // Immediately close the drawer state for instant response
        setIsDrawerOpen(false);
        // Use faster timing animation instead of spring for better responsiveness
        drawerSlide.value = withTiming(300, { 
            duration: 200, 
            easing: Easing.out(Easing.cubic) 
        });
    };

    // Animasiya stilləri
    const animatedTaskStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: taskScale.value }],
        };
    });

    const animatedHistoryStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: historyScale.value }],
        };
    });

    const animatedDrawerStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: drawerSlide.value }],
        };
    });

    const renderDrawerContent = () => (
        <View style={styles.drawerContainer}>
            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.drawerGradient}>
                <View style={styles.drawerHeader}>
                    <View style={styles.drawerHeaderContent}>
                        <View style={styles.drawerHeaderIcon}>
                            <Ionicons name="menu-outline" size={28} color="#fff" />
                        </View>
                        <Text style={styles.drawerHeaderText}>Menu</Text>
                    </View>
                    <TouchableOpacity
                        onPress={closeDrawer}
                        style={styles.drawerCloseButton}
                    >
                        <Ionicons name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.drawerScrollView} contentContainerStyle={styles.drawerScrollContent}>
                    <TouchableOpacity
                        style={styles.drawerMenuItem}
                        onPress={() => {
                            closeDrawer();
                            navigation.navigate('Profile');
                        }}
                    >
                        <Ionicons name="person-circle-outline" size={24} color="#fff" style={styles.drawerMenuIcon} />
                        <Text style={styles.drawerMenuText}>Profil</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.drawerMenuItem}
                        onPress={() => {
                            closeDrawer();
                            navigation.navigate('Rules');
                        }}
                    >
                        <Ionicons name="document-text-outline" size={24} color="#fff" style={styles.drawerMenuIcon} />
                        <Text style={styles.drawerMenuText}>Qaydalar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleLogout}
                        style={[styles.drawerMenuItem, styles.drawerLogoutItem]}
                    >
                        <Ionicons name="log-out-outline" size={24} color="#ff5555" style={styles.drawerMenuIcon} />
                        <Text style={[styles.drawerMenuText, { color: '#ff5555' }]}>Çıxış</Text>
                    </TouchableOpacity>
                </ScrollView>
            </LinearGradient>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Modern Header */}
            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        <View style={styles.headerIcon}>
                            <Ionicons name="journal-outline" size={28} color="#fff" />
                        </View>
                        <View>
                            <Text style={styles.headerTitle}>Günlük Notlar</Text>
                            <Text style={styles.headerDate}>{formatDate(new Date())}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.menuButton} onPress={openDrawer}>
                        <Ionicons name="menu" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView 
                style={styles.content} 
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
                onScroll={(event) => {
                    scrollY.value = withSpring(event.nativeEvent.contentOffset.y, { damping: 15, stiffness: 100 });
                }}
                scrollEventThrottle={8}
            >
                {/* Timer Card */}
                <View style={styles.timerCard}>
                    <View style={styles.timerIcon}>
                        <Ionicons name="time-outline" size={24} color="#667eea" />
                    </View>
                    <View style={styles.timerContent}>
                        <Text style={styles.timerLabel}>Yeni günə qalıb</Text>
                        <Text style={styles.timerValue}>{formatTimeLeft(timeLeft)}</Text>
                    </View>
                </View>

                {/* Input Section */}
                <View style={styles.inputSection}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Yeni not əlavə et..."
                            placeholderTextColor="#999"
                            value={taskText}
                            onChangeText={setTaskText}
                            onSubmitEditing={addTask}
                            returnKeyType="done"
                        />
                        <TouchableOpacity style={styles.addButton} onPress={addTask}>
                            <Ionicons name="add" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Current Tasks */}
                {tasks.length > 0 && (
                    <Animated.View style={[styles.section, animatedTaskStyle]}>
                        <Text style={styles.sectionTitle}>Bugünkü Notlar</Text>
                        <ScrollView 
                            style={styles.tasksScrollView}
                            showsVerticalScrollIndicator={false}
                            nestedScrollEnabled={true}
                            onScroll={(event) => {
                                scrollY.value = withSpring(event.nativeEvent.contentOffset.y, { damping: 15, stiffness: 100 });
                            }}
                            scrollEventThrottle={8}
                        >
                            {tasks.map((item) => (
                                <TaskCard key={item.id} task={item} onDelete={deleteTask} />
                            ))}
                        </ScrollView>
                    </Animated.View>
                )}

                {/* History Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionIcon}>
                            <Ionicons name="time-outline" size={24} color="#667eea" />
                        </View>
                        <Text style={styles.sectionTitle}>Keçmiş Günlər</Text>
                    </View>
                    
                    {history.length === 0 ? (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIconContainer}>
                                <Ionicons name="folder-open-outline" size={48} color="#ccc" />
                            </View>
                            <Text style={styles.emptyStateText}>Keçmiş not yoxdur</Text>
                            <Text style={styles.emptyStateSubtext}>Yeni notlar əlavə etdikdə burada görünəcək</Text>
                        </View>
                    ) : (
                        <>
                            {history.map((item, index) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={styles.historyCard}
                                    onPress={() => setHistoryDetails(item)}
                                    activeOpacity={0.7}
                                >
                                    <LinearGradient 
                                        colors={['#ffffff', '#f8f9ff']} 
                                        style={styles.historyCardGradient}
                                    >
                                        {/* Header Section */}
                                        <View style={styles.historyHeader}>
                                            <View style={styles.historyDateContainer}>
                                                <View style={styles.dateIcon}>
                                                    <Ionicons name="calendar-outline" size={20} color="#667eea" />
                                                </View>
                                                <Text style={styles.historyDateText}>
                                                    {formatDate(item.date)}
                                                </Text>
                                            </View>
                                            <View style={styles.historyHeaderRight}>
                                                <View style={styles.historyBadge}>
                                                    <Text style={styles.historyBadgeText}>
                                                        {item.tasks ? item.tasks.length : 0} not
                                                    </Text>
                                                </View>
                                                <TouchableOpacity
                                                    style={styles.deleteHistoryButton}
                                                    onPress={() => deleteHistoryItem(item.id)}
                                                >
                                                    <Ionicons name="trash-outline" size={18} color="#ff5555" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        
                                        {/* Content Section */}
                                        <View style={styles.historyContent}>
                                            <View style={styles.historyTitleRow}>
                                                <Ionicons name="journal-outline" size={20} color="#667eea" />
                                                <Text style={styles.historyTitle}>Günlük Notlar</Text>
                                            </View>
                                            
                                            {item.tasks && item.tasks.length > 0 ? (
                                                <View style={styles.tasksList}>
                                                    {item.tasks.slice(0, 3).map((task, taskIndex) => (
                                                        <View key={taskIndex} style={styles.taskItem}>
                                                            <View style={styles.taskBullet}>
                                                                <Ionicons name="checkmark-circle" size={8} color="#667eea" />
                                                            </View>
                                                            <Text style={styles.taskItemText} numberOfLines={2}>
                                                                {task}
                                                            </Text>
                                                        </View>
                                                    ))}
                                                    
                                                    {item.tasks.length > 3 && (
                                                        <View style={styles.moreTasks}>
                                                            <Text style={styles.moreTasksText}>
                                                                +{item.tasks.length - 3} əlavə not
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                            ) : (
                                                <Text style={styles.noTasksText}>Bu gün üçün not yoxdur</Text>
                                            )}
                                        </View>
                                    </LinearGradient>
                                </TouchableOpacity>
                            ))}
                        </>
                    )}
                </View>
                
                {/* Bottom Spacing for Navigation Buttons */}
                <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* Custom Drawer */}
            {isDrawerOpen && (
                <View style={styles.customDrawerOverlay}>
                    <TouchableOpacity
                        style={styles.customDrawerBackdrop}
                        onPress={closeDrawer}
                        activeOpacity={1}
                    />
                    <Animated.View
                        style={[
                            styles.customDrawerContainer,
                            animatedDrawerStyle
                        ]}
                    >
                        {renderDrawerContent()}
                    </Animated.View>
                </View>
            )}
            
            {/* Custom Alert */}
            <CustomAlert
                visible={alertVisible}
                message={alertMessage}
                type={alertType}
                onHide={() => setAlertVisible(false)}
            />

            {/* History Details Modal */}
            {historyDetails && (
                <HistoryDetails
                    historyItem={historyDetails}
                    onClose={() => setHistoryDetails(null)}
                    onDelete={deleteHistoryItem}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    
    // Modern Header
    header: {
        paddingTop: 60,
        paddingBottom: 25,
        paddingHorizontal: 20,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
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
        marginBottom: 4,
    },
    headerDate: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
    },
    menuButton: {
        padding: 12,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Content
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 25,
    },

    // Timer Card
    timerCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    timerIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f0f4ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    timerContent: {
        flex: 1,
        justifyContent: 'center',
    },
    timerLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    timerValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#667eea',
    },

    // Input Section
    inputSection: {
        marginBottom: 25,
    },
    inputContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    input: {
        flex: 1,
        paddingVertical: 16,
        paddingHorizontal: 20,
        fontSize: 16,
        color: '#333',
    },
    addButton: {
        width: 56,
        height: 56,
        backgroundColor: '#667eea',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 4,
    },

    // Sections
    section: {
        marginBottom: 25,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
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
        marginBottom: 20,
    },
    tasksScrollView: {
        maxHeight: 300, // Maksimum hündürlük
        paddingBottom: 10,
    },
    historyScrollView: {
        maxHeight: 400, // History üçün daha böyük hündürlük
        paddingBottom: 10,
    },
    // Animasiya üçün əlavə stillər
    animatedSection: {
        transform: [{ scale: 1 }],
    },
    // Daha yaxşı animasiya üçün
    taskSection: {
        transform: [{ scale: 1 }],
        transition: 'all 0.3s ease',
    },
    historySection: {
        transform: [{ scale: 1 }],
        transition: 'all 0.3s ease',
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
        marginBottom: 10, // Artırıldı - daha çox alt boşluq
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
        marginTop: 10,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#ccc',
        marginTop: 5,
    },
    noTasksText: {
        color: '#999',
        fontSize: 15,
        textAlign: 'center',
        marginTop: 10,
    },

    // History Cards
    historyCard: {
        marginBottom: 15,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    historyCardGradient: {
        flex: 1,
        borderRadius: 16,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    historyHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    historyDateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#f0f4ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    historyDateText: {
        color: '#667eea',
        fontSize: 16,
        fontWeight: 'bold',
    },
    historyBadge: {
        backgroundColor: '#e0e7ff',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    historyBadgeText: {
        color: '#667eea',
        fontSize: 14,
        fontWeight: '600',
    },
    deleteHistoryButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 85, 85, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 85, 85, 0.3)',
    },
    historyContent: {
        padding: 15,
    },
    historyTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    historyTitle: {
        color: '#333',
        fontSize: 18,
        fontWeight: '600',
    },
    tasksList: {
        //
    },
    taskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    taskBullet: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    taskItemText: {
        flex: 1,
        color: '#666',
        fontSize: 15,
        lineHeight: 20,
    },
    moreTasks: {
        alignItems: 'center',
        marginTop: 10,
    },
    moreTasksText: {
        color: '#667eea',
        fontSize: 14,
        fontWeight: '500',
    },

    // Drawer Styles
    drawerContainer: {
        flex: 1,
    },
    drawerGradient: {
        flex: 1,
    },
    drawerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 25,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.2)',
        marginTop: 40,
    },
    drawerHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    drawerHeaderIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    drawerHeaderText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
    },
    drawerCloseButton: {
        padding: 10,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    drawerScrollView: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 30,
    },
    drawerScrollContent: {
        paddingBottom: 20,
        alignItems: 'center',
    },
    drawerMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 20,
        marginBottom: 12,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        width: '90%',
        justifyContent: 'center',
    },
    drawerLogoutItem: {
        backgroundColor: 'rgba(255,85,85,0.15)',
        marginTop: 30,
        borderWidth: 1,
        borderColor: 'rgba(255,85,85,0.3)',
    },
    drawerMenuIcon: {
        marginRight: 15,
        width: 24,
    },
    drawerMenuText: {
        fontSize: 17,
        color: '#fff',
        fontWeight: '600',
    },

    // Custom Drawer
    customDrawerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1000,
    },
    customDrawerBackdrop: {
        flex: 1,
    },
    customDrawerContainer: {
        width: 300,
        height: '100%',
        backgroundColor: 'transparent',
        elevation: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: -2,
            height: 0,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
    },

    // Bottom Spacing
    bottomSpacing: {
        height: 100, // Adjust as needed for spacing below the last content
    },
});
