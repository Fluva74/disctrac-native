import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { InsideStackParamList, RootStackParamList } from '../../App';
import { signOut } from 'firebase/auth';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import styles from '../styles';

const PlayerHome = () => {
    const navigation = useNavigation<NavigationProp<InsideStackParamList>>();
    const [firstName, setFirstName] = useState<string>('');

    useEffect(() => {
        const fetchUserData = async () => {
            const user = FIREBASE_AUTH.currentUser;
            if (user) {
                console.log("User UID:", user.uid); // Log the UID for debugging
    
                try {
                    const docRef = doc(FIREBASE_DB, 'players', user.uid);
                    const docSnap = await getDoc(docRef);
    
                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        console.log("User Data from Firestore:", userData); // Log fetched data
                        setFirstName(userData.firstName || 'Guest');
                    } else {
                        console.log('No document found for this user UID in Firestore.');
                        setFirstName('Guest');
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    Alert.alert('Error', 'Failed to load user data.');
                    setFirstName('Guest');
                }
            } else {
                console.log("No user is logged in.");
                setFirstName('Guest');
            }
        };
        fetchUserData();
    }, [firstName]);

    const handleSignOut = async () => {
        try {
            await FIREBASE_AUTH.signOut();
            
            // Reset the root navigation stack to go to Login
            (navigation as any).reset({
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
            <Text style={styles.welcomeText}>Welcome, {firstName}!</Text>
            
            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('Inventory')}
            >
                <Text style={styles.buttonText}>Inventory</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={handleSignOut}
            >
                <Text style={styles.buttonText}>Sign Out</Text>
            </TouchableOpacity>
        </View>
    );
};

export default PlayerHome;