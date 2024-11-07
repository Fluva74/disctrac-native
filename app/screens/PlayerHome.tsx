import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { InsideStackParamList, RootStackParamList } from '../../App';
import { signOut } from 'firebase/auth';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import styles from '../styles';

const PlayerHome = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>(); // Use RootStackParamList for navigation
    const [firstName, setFirstName] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            const user = FIREBASE_AUTH.currentUser;
            if (user) {
                try {
                    const docRef = doc(FIREBASE_DB, 'players', user.uid);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        setFirstName(docSnap.data().firstName);
                    } else {
                        console.log('No such document!');
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
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
                routes: [{ name: 'Login' as keyof RootStackParamList }], // Reset to 'Login' in RootStack
            });
        } catch (error) {
            console.error('Error signing out:', error);
            Alert.alert('Error', 'Failed to sign out. Please try again.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.welcomeText}>Welcome Back, {firstName}!</Text>
            
            {/* Navigation button to Inventory */}
            <TouchableOpacity 
                style={styles.linkButton} 
                onPress={() => navigation.navigate('Inside', { screen: 'Inventory' } as any)}
            >
                <Text style={styles.linkText}>Inventory</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.button} onPress={handleSignOut}>
                <Text style={styles.buttonText}>Sign Out</Text>
            </TouchableOpacity>
        </View>
    );
};

export default PlayerHome;
