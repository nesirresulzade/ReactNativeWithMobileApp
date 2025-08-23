import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export default function AnimatedHeader({ title, scrollY }) {
    const headerHeight = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [80, 50],
        extrapolate: 'clamp'
    });

    return (
        <Animated.View style={[styles.header, { height: headerHeight }]}>
            <Text style={styles.title}>{title}</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    header: { backgroundColor: '#4cafef', justifyContent: 'center', alignItems: 'center', width: '100%' },
    title: { color: '#fff', fontSize: 20, fontWeight: 'bold' }
});
