// AddDisc.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../FirebaseConfig';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { InsideStackParamList } from '../../App'; // Import InsideStackParamList correctly
import styles from '../styles';

const AddDisc = () => {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);
    const [discData, setDiscData] = useState<any | null>(null);
    const navigation = useNavigation<NavigationProp<InsideStackParamList>>();

    useEffect(() => {
        const getBarCodeScannerPermissions = async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === 'granted');
        };

        getBarCodeScannerPermissions();
    }, []);

    const fetchDiscData = async (discNumber: string) => {
        try {
            const discsRef = collection(FIREBASE_DB, 'discmain');
            const q = query(discsRef, where('uid', '==', discNumber));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
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

    const handleBarCodeScanned = ({ data }: { data: string }) => {
        setScanned(true);
        fetchDiscData(data);
    };

    const addDiscToInventory = async () => {
        const user = FIREBASE_AUTH.currentUser;
        if (!user || !discData) return;

        try {
            const userDiscsRef = collection(FIREBASE_DB, 'userDiscs');
            await addDoc(userDiscsRef, {
                userId: user.uid,
                ...discData,
            });
            navigation.navigate("Inventory");
        } catch (error) {
            console.error("Error adding disc to inventory:", error);
            Alert.alert("Error", "Failed to add disc to inventory.");
        }
    };

    if (hasPermission === null) {
        return <Text>Requesting for camera permission</Text>;
    }
    if (hasPermission === false) {
        return <Text>No access to camera</Text>;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.loginHeader}>Add Disc</Text>

            {!scanned ? (
                <BarCodeScanner
                    onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                    style={{ height: 300, width: 300 }}
                />
            ) : (
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => setScanned(false)}
                >
                    <Text style={styles.buttonText}>Scan Code Again</Text>
                </TouchableOpacity>
            )}

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
