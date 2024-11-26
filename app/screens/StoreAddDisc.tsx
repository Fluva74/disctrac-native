import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { FIREBASE_DB } from '../../FirebaseConfig';
import { collection, query, where, getDocs, doc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { InsideStackParamList } from '../../App';
import { CameraView } from 'expo-camera';

interface DiscData {
  uid: string;
  name: string;
  manufacturer: string;
  color: string;
  userId: string;
}

const StoreAddDisc = () => {
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [discData, setDiscData] = useState<DiscData | null>(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NavigationProp<InsideStackParamList>>();

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (!scannedData) {
      setScannedData(data);
      await fetchDiscData(data);
    }
  };

  const fetchDiscData = async (scannedCode: string) => {
    setLoading(true);
    try {
      const userDiscsRef = collection(FIREBASE_DB, 'userDiscs');
      const q = query(userDiscsRef, where('uid', '==', scannedCode));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        const data = docSnap.data();
        setDiscData({
          uid: scannedCode,
          name: data.name,
          manufacturer: data.manufacturer,
          color: data.color,
          userId: data.userId,
        });
      } else {
        Alert.alert('Error', 'This disc ID is not assigned to any player.');
        navigation.navigate('StoreInventory');
      }
    } catch (error) {
      console.error('Error fetching disc data:', error);
      Alert.alert('Error', 'Failed to fetch disc information.');
    } finally {
      setLoading(false);
    }
  };

  const handleNotifyPlayer = async () => {
    try {
      if (discData) {
        const { userId, uid, name, manufacturer, color } = discData;
  
        console.log(`[DEBUG] Notifying player for disc: ${uid}`);
  
        // Update user inventory
        const playerDiscRef = doc(FIREBASE_DB, 'userDiscs', `${userId}_${uid}`);
        await updateDoc(playerDiscRef, { status: 'notified' });
        console.log(`[DEBUG] Updated user inventory for disc: ${uid}`);
  
        // Add to store inventory
        const storeInventoryRef = doc(FIREBASE_DB, 'storeInventory', uid);
        await setDoc(storeInventoryRef, {
          uid,
          name,
          manufacturer,
          color,
          status: 'notifiedPlayer',
          userId,
          notifiedAt: new Date().toISOString(),
        });
        console.log(`[DEBUG] Added disc to store inventory with status: notifiedPlayer`);
  
        // Start the timer for store inventory
        startTimer(uid, userId, uid); // Pass discId, userId, and uid
  
        // Add notification for the player
        const playerNotificationRef = doc(FIREBASE_DB, 'players', userId);
        await updateDoc(playerNotificationRef, {
          notification: {
            uid,
            name,
            manufacturer,
            color,
            status: 'found',
            notifiedAt: new Date().toISOString(),
          },
        });
        console.log(`[DEBUG] Added notification for player: ${userId}`);
  
        Alert.alert('Success', 'Player notified and disc added to store inventory.');
        navigation.navigate('StoreInventory');
      }
    } catch (error) {
      console.error(`[ERROR] Failed to notify player:`, error);
      Alert.alert('Error', 'Failed to notify player.');
    }
  };
  
  
  const startTimer = (discId: string, userId: string, uid: string) => {
    let timeLeft = 60; // Total timer duration in seconds
    console.log(`[DEBUG] Starting timer for disc: ${discId}`);
  
    const interval = setInterval(async () => {
      timeLeft -= 20;
      console.log(`[DEBUG] Timer tick for disc: ${discId}, time left: ${timeLeft}s`);
  
      const discRef = doc(FIREBASE_DB, 'storeInventory', discId);
  
      try {
        if (timeLeft === 40) {
          // Update status to yellowAlert
          console.log(`[DEBUG] Updating status to yellowAlert for disc: ${discId}`);
          await updateDoc(discRef, { status: 'yellowAlert' });
        } else if (timeLeft === 20) {
          // Update status to criticalAlert
          console.log(`[DEBUG] Updating status to criticalAlert for disc: ${discId}`);
          await updateDoc(discRef, { status: 'criticalAlert' });
        } else if (timeLeft <= 0) {
          // Move to released status
          console.log(`[DEBUG] Timer ended for disc: ${discId}, moving to released`);
          clearInterval(interval);
  
          // Update store inventory to "released"
          await updateDoc(discRef, { status: 'released' });
  
          // Remove the disc from the player's inventory
          const playerDiscRef = doc(FIREBASE_DB, 'userDiscs', `${userId}_${uid}`);
          await deleteDoc(playerDiscRef);
          console.log(`[DEBUG] Disc ${discId} removed from player's inventory`);
        }
      } catch (error) {
        console.error(`[ERROR] Timer update failed for disc: ${discId}`, error);
        clearInterval(interval);
      }
    }, 20000); // Run every 20 seconds
  };
  
  

  const handleCancel = () => {
    navigation.navigate('StoreInventory');
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : discData ? (
        <View style={styles.card}>
          <Text style={styles.cardText}>Name: {discData.name}</Text>
          <Text style={styles.cardText}>Manufacturer: {discData.manufacturer}</Text>
          <Text style={styles.cardText}>Color: {discData.color}</Text>
          <TouchableOpacity style={styles.button} onPress={handleNotifyPlayer}>
            <Text style={styles.buttonText}>Notify Player</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            onBarcodeScanned={handleBarcodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'code128'] }}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8', alignItems: 'center', justifyContent: 'center' },
  cameraContainer: { width: '100%', height: 300, justifyContent: 'center', alignItems: 'center' },
  camera: { width: '100%', height: '100%' },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 10, alignItems: 'center' },
  cardText: { fontSize: 16, marginBottom: 10 },
  button: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 5, marginVertical: 5 },
  cancelButton: { backgroundColor: '#F44336' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});

export default StoreAddDisc;
