import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type ScreenBackgroundProps = {
    children: React.ReactNode;
};

const ScreenBackground = ({ children }: ScreenBackgroundProps) => {
    return (
        <View style={styles.container}>
            {/* Main content */}
            {children}
            
            {/* Multiple gradient layers for softer fade */}
            <LinearGradient
                colors={[
                    'transparent',
                    'rgba(59, 130, 246, 0.01)',
                    'rgba(59, 130, 246, 0.05)',
                ]}
                style={[styles.bottomGradient, { width: 500, height: 500, bottom: -100, right: -100 }]}
                start={{ x: 0.3, y: 0.3 }}
                end={{ x: 0.9, y: 0.9 }}
            />
            <LinearGradient
                colors={[
                    'transparent',
                    'rgba(59, 130, 246, 0.05)',
                    'rgba(59, 130, 246, 0.15)',
                ]}
                style={[styles.bottomGradient, { width: 400, height: 400, bottom: -80, right: -80 }]}
                start={{ x: 0.3, y: 0.3 }}
                end={{ x: 0.9, y: 0.9 }}
            />
            <LinearGradient
                colors={[
                    'transparent',
                    'rgba(59, 130, 246, 0.1)',
                    'rgba(59, 130, 246, 0.2)',
                ]}
                style={[styles.bottomGradient, { width: 300, height: 300, bottom: -50, right: -50 }]}
                start={{ x: 0.3, y: 0.3 }}
                end={{ x: 0.9, y: 0.9 }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#09090B',
    },
    bottomGradient: {
        position: 'absolute',
        borderRadius: 1000, // Large value to ensure perfect circle
        overflow: 'hidden',
    },
});

export default ScreenBackground; 