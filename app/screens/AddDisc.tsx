// AddDisc.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../FirebaseConfig';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { InsideStackParamList } from '../../App';

const AddDisc = () => {
  const [hasPermission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [discData, setDiscData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NavigationProp<InsideStackParamList>>();

  const [company, setCompany] = useState('');
  const [mold, setMold] = useState('');
  const [color, setColor] = useState('');

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (data !== scannedData) {
      setScannedData(data);
      setLoading(true);

      try {
        const discRef = doc(FIREBASE_DB, 'discmain', data);
        const discSnapshot = await getDoc(discRef);

        if (discSnapshot.exists()) {
          const disc = discSnapshot.data();
          setDiscData(disc);
          setCompany(disc.company !== 'N/A' ? disc.company : '');
          setMold(disc.mold !== 'N/A' ? disc.mold : '');
          setColor(disc.color !== 'N/A' ? disc.color : '');

          if (disc.company === 'N/A' || disc.mold === 'N/A' || disc.color === 'N/A') {
            Alert.alert("Incomplete Disc Data", "Please complete the disc details.");
          } else {
            Alert.alert("Disc Found", "The disc is already complete.");
          }
        } else {
          Alert.alert("Disc Not Found", "No disc information found for this ID.");
        }
      } catch (error) {
        console.error("Error fetching disc data:", error);
        Alert.alert("Error", "Failed to fetch disc information.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveDisc = async () => {
    if (!company || !mold || !color) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }

    try {
      const discRef = doc(FIREBASE_DB, 'discmain', scannedData!);
      await updateDoc(discRef, {
        company,
        mold,
        color
      });

      const user = FIREBASE_AUTH.currentUser;
      if (user) {
        const userDiscRef = doc(FIREBASE_DB, 'userDiscs', `${user.uid}_${scannedData}`);
        await setDoc(userDiscRef, {
          uid: scannedData,
          userId: user.uid,
          company,
          mold,
          color,
        });

        Alert.alert("Success", "Disc added to your inventory.");

        // Navigate back to the Inventory screen after successful save
        navigation.navigate('Inventory');
      } else {
        Alert.alert("Error", "No user is logged in.");
      }
    } catch (error) {
      console.error("Error saving disc data:", error);
      Alert.alert("Error", "Failed to save disc information.");
    }
  };

  if (!hasPermission) {
    return <View />;
  }

  if (!hasPermission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text>We need your permission to access the camera</Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Disc - Barcode Scanner</Text>

      {!scannedData && (
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            onBarcodeScanned={handleBarcodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'ean8', 'code128'] }}
          />
        </View>
      )}

      {scannedData && (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Edit Disc Information</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#4CAF50" />
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Company"
                value={company}
                onChangeText={setCompany}
              />
              <TextInput
                style={styles.input}
                placeholder="Mold"
                value={mold}
                onChangeText={setMold}
              />
              <TextInput
                style={styles.input}
                placeholder="Color"
                value={color}
                onChangeText={setColor}
              />
              <TouchableOpacity style={styles.button} onPress={handleSaveDisc}>
                <Text style={styles.buttonText}>Save Disc</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  cameraContainer: {
    width: 250,
    height: 250,
    overflow: 'hidden',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'gray',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  formContainer: {
    marginTop: 20,
    width: '80%',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#FFF',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  scannedText: {
    fontSize: 18,
    color: 'black',
    padding: 10,
    backgroundColor: 'lightgray',
    position: 'absolute',
    bottom: 20,
  },
});

export default AddDisc;
