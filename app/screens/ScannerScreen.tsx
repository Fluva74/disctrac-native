//file.ScannerScreen.tsx

import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../FirebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { InsideStackParamList } from '../../App';

const ScannerScreen = () => {
  const [hasPermission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NavigationProp<InsideStackParamList>>();

  React.useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  const handleBarcodeScanned = async (data: string) => {
    setLoading(true);

    try {
      const user = FIREBASE_AUTH.currentUser;
      if (!user) {
        Alert.alert('Error', 'No user is logged in.');
        setLoading(false);
        return;
      }

      const userId = user.uid;

      // Check if the scanned disc is already assigned
      const discsCollection = collection(FIREBASE_DB, 'userDiscs');
      const q = query(discsCollection, where('uid', '==', data));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const discData = doc.data();

        if (discData.userId === userId) {
          // Disc is already assigned to the current user
          Alert.alert('Info', 'This disc is already in your bag.');
          navigation.navigate('Inventory');
        } else {
          // Disc is assigned to another user
          Alert.alert('Info', 'This disc is already in another player\'s bag.');
          navigation.navigate('Inventory');
        }
      } else {
        // Disc is not assigned; proceed to AddDisc
        navigation.navigate('AddDisc', { scannedData: data });
      }
    } catch (error) {
      console.error('Error checking disc assignment:', error);
      Alert.alert('Error', 'Failed to check disc assignment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Code Scanner</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : (
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            onBarcodeScanned={({ data }) => handleBarcodeScanned(data)}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1c1c1c', padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20, textAlign: 'center' },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    width: 300, // Set camera width
    height: 300, // Set camera height
    borderRadius: 10,
    overflow: 'hidden',
  },
});

export default ScannerScreen;
