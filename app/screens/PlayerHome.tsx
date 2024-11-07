import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { FIREBASE_DB } from '../../FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import styles from '../styles'; // Assuming styles.js is set up with current branding styles

const PlayerHome = () => {
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
        </View>
    );
};

export default PlayerHome;
