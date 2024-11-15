// StoreHome.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { signOut } from 'firebase/auth';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList, InsideStackParamList } from '../../App';
import styles from '../styles';

const StoreHome = () => {
    const navigation = useNavigation<NavigationProp<InsideStackParamList>>();

    const handleSignOut = async () => {
        try {
            await signOut(FIREBASE_AUTH);
    
            // Use the root navigator to go back to the Login screen
            navigation.getParent()?.navigate('Login');
        } catch (error) {
            console.error("Error signing out:", error);
            alert("Failed to sign out. Please try again.");
        }
    };
    

    const goToStoreInventory = () => {
        navigation.navigate('StoreInventory');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Welcome to Store Home</Text>
            
            {/* Store Inventory Button */}
            <TouchableOpacity style={styles.button} onPress={goToStoreInventory}>
                <Text style={styles.buttonText}>View Inventory</Text>
            </TouchableOpacity>
            
            {/* Sign Out Button */}
            <TouchableOpacity style={styles.button} onPress={handleSignOut}>
                <Text style={styles.buttonText}>Sign Out</Text>
            </TouchableOpacity>
        </View>
    );
};

export default StoreHome;
