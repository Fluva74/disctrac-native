import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { FIREBASE_DB } from '../../FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { signOut } from 'firebase/auth';
import styles from '../styles'; // Assuming styles.js is set up with current branding styles

const PlayerHome = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [firstName, setFirstName] = useState('');

    // Fetch the user's first name from Firestore
    useEffect(() => {
        const fetchUserData = async () => {
            const user = FIREBASE_AUTH.currentUser;
            if (user) {
                const docRef = doc(FIREBASE_DB, 'players', user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setFirstName(docSnap.data().firstName);
                } else {
                    console.log('No such document!');
                }
            }
        };

        fetchUserData();
    }, []);

     // Sign-out function
     const handleSignOut = async () => {
        try {
            await signOut(FIREBASE_AUTH);
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        } catch (error) {
            console.error('Error signing out:', error);
            Alert.alert('Error', 'Failed to sign out. Please try again.');
        }
    };

    

    return (
        <View style={styles.container}>
            {/* Header Welcome Message */}
            <Text style={styles.welcomeText}>Welcome Back, {firstName}!</Text>
            
            {/* Navigation Links */}
            <TouchableOpacity style={styles.linkButton} onPress={() => Alert.alert('Navigating to News...')}>
                <Text style={styles.linkText}>News</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkButton} onPress={() => Alert.alert('Navigating to Events...')}>
                <Text style={styles.linkText}>Events</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkButton} onPress={() => Alert.alert('Navigating to Settings...')}>
                <Text style={styles.linkText}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkButton} onPress={() => Alert.alert('Navigating to Inventory...')}>
                <Text style={styles.linkText}>Inventory</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleSignOut}>
                <Text style={styles.buttonText}>Sign Out</Text>
            </TouchableOpacity>
           
        </View>
    );
};

export default PlayerHome;
