import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { FIREBASE_DB } from '../../FirebaseConfig';
import { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { InsideStackParamList } from '../../App';
import { CameraView, useCameraPermissions } from 'expo-camera';

interface DiscData {
    uid: string;
    company: string;
    mold: string;
    color: string;
    userId: string; // Ensure userId is optional
}

const StoreAddDisc = () => {
    const [scannedData, setScannedData] = useState<string | null>(null);
    const [discData, setDiscData] = useState<DiscData | null>(null);
    const [hasPermission, requestPermission] = useCameraPermissions();
    const navigation = useNavigation<NavigationProp<InsideStackParamList>>();

    const handleBarcodeScanned = async ({ data }: { data: string }) => {
        if (!scannedData) {
            setScannedData(data);
            await fetchDiscData(data);
        }
    };

    const fetchDiscData = async (scannedCode: string) => {
        try {
            console.log("Fetching disc data from userDiscs for scannedCode:", scannedCode);
    
            // Step 1: Query `userDiscs` collection to find a document with the matching `uid`
            const userDiscsRef = collection(FIREBASE_DB, 'userDiscs');
            const q = query(userDiscsRef, where("uid", "==", scannedCode));
            const querySnapshot = await getDocs(q);
    
            if (!querySnapshot.empty) {
                const docSnap = querySnapshot.docs[0]; // Get the first matching document
                const data = docSnap.data();
                const discInfo: DiscData = {
                    uid: scannedCode,
                    company: data.company || 'N/A',
                    mold: data.mold || 'N/A',
                    color: data.color || 'N/A',
                    userId: data.userId || '' // userId should now be available from the query
                };
    
                console.log("Fetched disc data from userDiscs:", discInfo);
                setDiscData(discInfo);
            } else {
                Alert.alert("Error", "This disc ID does not belong to any player.");
                console.log("userDiscs entry does not exist for scannedCode:", scannedCode);
                navigation.goBack();
            }
        } catch (error) {
            console.error("Error fetching disc data:", error);
            Alert.alert("Error", "Failed to fetch disc information.");
            navigation.goBack();
        }
    };
    
    
    const handleNotifyPlayer = async () => {
        try {
            if (discData && discData.userId) {
                const compositeDocId = `${discData.userId}_${discData.uid}`;
                console.log("Constructed compositeDocId for userDiscs:", compositeDocId);
    
                // Step 1: Update the player's inventory disc status to "foundByStore"
                const playerDiscRef = doc(FIREBASE_DB, 'userDiscs', compositeDocId);
                await updateDoc(playerDiscRef, { status: 'foundByStore' });
    
                // Step 2: Add the disc to the store inventory with status "notifiedPlayer"
                const storeInventoryRef = doc(FIREBASE_DB, 'storeInventory', discData.uid);
                await setDoc(storeInventoryRef, { ...discData, status: 'notifiedPlayer' });
    
                Alert.alert("Success", "Player notified. Disc added to store inventory.");
                navigation.goBack();
            } else {
                Alert.alert("Error", "Disc does not belong to any player.");
            }
        } catch (error) {
            console.error("Error notifying player:", error);
            Alert.alert("Error", "Failed to notify player.");
        }
    };
    
    
    
    const handleCancel = () => {
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            {!scannedData && (
                <View style={styles.cameraContainer}>
                    <CameraView
                        style={styles.camera}
                        onBarcodeScanned={handleBarcodeScanned}
                        barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'ean8', 'code128'] }}
                    />
                </View>
            )}
            {discData && (
                <View style={styles.discContainer}>
                    <Text>Mold: {discData.mold}</Text>
                    <Text>Company: {discData.company}</Text>
                    <Text>Color: {discData.color}</Text>
                    <TouchableOpacity style={styles.button} onPress={handleNotifyPlayer}>
                        <Text style={styles.buttonText}>Notify Player</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={handleCancel}>
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#f0f4f8', 
        alignItems: 'center', 
        justifyContent: 'center', 
        paddingHorizontal: 16 
    },
    cameraContainer: { 
        width: '100%', 
        height: 300, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginVertical: 20 
    },
    camera: { 
        width: '100%', 
        height: '100%' 
    },
    discContainer: { 
        alignItems: 'center', 
        padding: 16, 
        marginTop: 20, 
        backgroundColor: '#fff', 
        borderRadius: 10, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.2, 
        shadowRadius: 4, 
        elevation: 2 
    },
    button: { 
        backgroundColor: '#4CAF50', 
        padding: 10, 
        borderRadius: 5, 
        alignItems: 'center', 
        marginTop: 10 
    },
    buttonText: { 
        color: '#FFF', 
        fontWeight: 'bold' 
    },
});

export default StoreAddDisc;
