// AddDisc.tsx

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../FirebaseConfig';
import { doc, getDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { InsideStackParamList } from '../../App'; // Import InsideStackParamList correctly
import styles from '../styles';


const AddDisc = () => {
    const [discNumber, setDiscNumber] = useState('');
    const [discData, setDiscData] = useState<any | null>(null);
    const navigation = useNavigation<NavigationProp<InsideStackParamList>>();

    // Function to fetch disc data based on disc number
    const fetchDiscData = async () => {
        if (!discNumber) {
            Alert.alert("Please enter a disc number.");
            return;
        }
        
        try {
            // Query `discmain` collection where `uid` field matches `discNumber`
            const discsRef = collection(FIREBASE_DB, 'discmain');
            const q = query(discsRef, where('uid', '==', discNumber));
            const querySnapshot = await getDocs(q);
    
            if (!querySnapshot.empty) {
                // Retrieve the first document that matches the query
                const docSnap = querySnapshot.docs[0];
                setDiscData(docSnap.data());
            } else {
                Alert.alert("Disc not found", "Please enter a valid disc number.");
                setDiscData(null);
            }
        } catch (error) {
            console.error("Error fetching disc data:", error);
            Alert.alert("Error", "Failed to fetch disc data.");
        }
    };

    // Function to add the disc to the user's inventory
    const addDiscToInventory = async () => {
        const user = FIREBASE_AUTH.currentUser;
        if (!user || !discData) return;
    
        try {
            const userDiscsRef = collection(FIREBASE_DB, 'userDiscs');
            await addDoc(userDiscsRef, {
                userId: user.uid,       // Store the user’s unique ID in `userId`
                ...discData             // Add the disc data fields
            });
            
            // Alert.alert("Success", "Disc added to your inventory.");
            navigation.navigate("Inventory"); // Navigate back to Inventory after adding the disc
        } catch (error) {
            console.error("Error adding disc to inventory:", error);
            Alert.alert("Error", "Failed to add disc to inventory.");
        }
    };
    
    return (
        <View style={styles.container}>
            <Text style={styles.loginHeader}>Add Disc</Text>

            <TextInput
                placeholder="Enter Disc Number (e.g., disc_15)"
                style={styles.input}
                value={discNumber}
                onChangeText={setDiscNumber}
            />

            <TouchableOpacity style={styles.button} onPress={fetchDiscData}>
                <Text style={styles.buttonText}>Fetch Disc Info</Text>
            </TouchableOpacity>

            {/* Display disc info if available */}
            {discData && (
                <View style={styles.discInfo}>
                    <Text style={styles.discText}>Mold: {discData.mold}</Text>
                    <Text style={styles.discText}>Company: {discData.company}</Text>
                    <Text style={styles.discText}>Color: {discData.color}</Text>

                    <TouchableOpacity style={styles.button} onPress={addDiscToInventory}>
                        <Text style={styles.buttonText}>Add This Disc</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Cancel button */}
            <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={() => navigation.navigate("Inventory")}
            >
                <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
        </View>
    );
};

export default AddDisc;
