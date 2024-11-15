//StoreHome.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { signOut } from 'firebase/auth';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import styles from '../styles';

const StoreHome = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const handleSignOut = async () => {
        try {
            await signOut(FIREBASE_AUTH);
            navigation.navigate('Login');  // Navigate back to the login screen
        } catch (error) {
            console.error("Error signing out:", error);
            alert("Failed to sign out. Please try again.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Welcome to Store Home</Text>
            
            {/* Sign Out Button */}
            <TouchableOpacity style={styles.button} onPress={handleSignOut}>
                <Text style={styles.buttonText}>Sign Out</Text>
            </TouchableOpacity>
        </View>
    );
};

export default StoreHome;
