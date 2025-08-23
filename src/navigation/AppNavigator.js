import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { autoLogin } from '../Redux/UserSlice';

import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Home from '../pages/Home';
import Loading from '../components/Loading';
import Rules from '../pages/Rules';
import Profile from '../pages/Profile';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const [isInitializing, setIsInitializing] = useState(true);
    const [showLoading, setShowLoading] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);
    const dispatch = useDispatch();
    const { user, isLoading } = useSelector(state => state.user);

    useEffect(() => {
        const initializeApp = async () => {
            try {
                await dispatch(autoLogin());
            } catch (error) {
                console.log('AppNavigator: Auto login failed:', error);
            } finally {
                setIsInitializing(false);
            }
        };

        initializeApp();
    }, [dispatch]);

    // Logout loading-i izlə - user state dəyişəndə
    useEffect(() => {
        if (!user && !isLoading && !isInitializing) {
            // User logout olduqda 2 saniyəlik loading göstər
            setLogoutLoading(true);
            const timer = setTimeout(() => {
                setLogoutLoading(false);
            }, 2000); // 2 seconds for logout
            
            return () => clearTimeout(timer);
        }
    }, [user, isLoading, isInitializing]);

    // Loading state-i izlə və 2-3 saniyə göstər
    useEffect(() => {
        if (isLoading) {
            setShowLoading(true);
        } else {
            // Loading bitdikdən sonra +1 saniyə daha gözlə
            const timer = setTimeout(() => {
                setShowLoading(false);
            }, 1000);
            
            return () => clearTimeout(timer);
        }
    }, [isLoading]);

    const handleSkipLoading = () => {
        setShowLoading(false);
    };

    const handleSkipLogoutLoading = () => {
        setLogoutLoading(false);
    };

    // İlkin yükləmə
    if (isInitializing) {
        return <Loading onSkip={() => setIsInitializing(false)} />;
    }

    // Login/Signup zamanı loading
    if (showLoading) {
        return <Loading onSkip={handleSkipLoading} />;
    }

    // Logout zamanı loading
    if (logoutLoading) {
        return <Loading type="logout" onSkip={handleSkipLogoutLoading} />;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator 
                initialRouteName={user ? "Home" : "Login"} 
                screenOptions={{ headerShown: false }}
            >
                {user ? (
                    // User giriş etmişsə
                    <>
                        <Stack.Screen name="Home" component={Home} />
                        <Stack.Screen name="Rules" component={Rules} />
                        <Stack.Screen name="Profile" component={Profile} />
                    </>
                ) : (
                    // User giriş etməyibsə
                    <>
                        <Stack.Screen name="Login" component={Login} />
                        <Stack.Screen name="Signup" component={Signup} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
