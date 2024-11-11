import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../FirebaseConfig';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { InsideStackParamList } from '../../App';
import { BarCodeScanner } from 'expo-barcode-scanner';
import styles from '../styles';

interface DiscData {
  uid: string;
  company: string;
  mold: string;
  color: string;
}

interface NewDiscData {
  company: string;
  mold: string;
  color: string;
}

const AddDisc = () => {
  const [discData, setDiscData] = useState<DiscData | null>(null);
  const [newDisc, setNewDisc] = useState<NewDiscData>({ company: '', mold: '', color: '' });
  const [showScanner, setShowScanner] = useState(false);
  const [isNewDisc, setIsNewDisc] = useState(false);
  const [scanned, setScanned] = useState(false); // New state to prevent multiple alerts
  const navigation = useNavigation<NavigationProp<InsideStackParamList>>();

  const initiateScan = () => {
    // Reset all states before starting a new scan
    setDiscData(null);
    setNewDisc({ company: '', mold: '', color: '' });
    setIsNewDisc(false);
    setScanned(false); // Reset scanned state
    setShowScanner(true);
  };

  const fetchDiscData = async (scannedCode: string) => {
    console.log("Fetching disc data for scannedCode:", scannedCode);
    const discsRef = collection(FIREBASE_DB, 'discmain');
    const q = query(discsRef, where('uid', '==', scannedCode));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      const data = docSnap.data() as DiscData;
      console.log("Disc found in database:", data);

      // Check if this disc is already in another player's inventory
      const userDiscsRef = collection(FIREBASE_DB, 'userDiscs');
      const ownershipQuery = query(userDiscsRef, where('uid', '==', scannedCode));
      const ownershipSnapshot = await getDocs(ownershipQuery);

      if (!ownershipSnapshot.empty) {
        const ownerDoc = ownershipSnapshot.docs[0].data();
        if (ownerDoc.userId !== FIREBASE_AUTH.currentUser?.uid) {
          // Disc is already owned by another user
          Alert.alert("Sorry", "This disc has already been added to another player's bag.");
          setScanned(true); // Set scanned to true to prevent repeated alerts
          setShowScanner(false); // Hide the scanner
          return;
        } else {
          // Disc is already in current user's inventory
          Alert.alert("Info", "You already have this disc in your bag.");
          setScanned(true); // Prevent repeated alerts
          setShowScanner(false); // Hide the scanner
          return;
        }
      }

      // If no owner, proceed with adding the disc
      setDiscData(data);
      if (data.company === 'N/A' || data.mold === 'N/A' || data.color === 'N/A') {
        setIsNewDisc(true); // Show form if attributes are missing
      } else {
        setIsNewDisc(false); // Otherwise, do not show form
      }
    } else {
      console.log("Disc not found, this should not happen for predefined UIDs.");
      Alert.alert("Error", "This disc ID does not exist in the database.");
    }

    setShowScanner(false); // Hide scanner after scan
  };

  const handleScanQRCode = async ({ data }: { data: string }) => {
    if (!scanned) { // Only process if not already scanned
      console.log("Scanned QR Code:", data);
      setScanned(true); // Set scanned to true immediately after scan to prevent duplicates
      fetchDiscData(data);
    }
  };

  const addNewDiscToInventory = async () => {
    if (!newDisc.company || !newDisc.mold || !newDisc.color) {
      Alert.alert("Please fill out all fields.");
      return;
    }
    try {
      console.log("Adding new disc data:", newDisc);

      // Update the existing disc in 'discmain' collection
      const discDocRef = doc(FIREBASE_DB, 'discmain', discData!.uid);
      await updateDoc(discDocRef, {
        company: newDisc.company,
        mold: newDisc.mold,
        color: newDisc.color
      });

      // Add the disc to user's inventory
      await addDoc(collection(FIREBASE_DB, 'userDiscs'), {
        userId: FIREBASE_AUTH.currentUser?.uid,
        uid: discData?.uid,
        ...newDisc
      });

      Alert.alert("Success", "Disc added to your inventory.");
      navigation.navigate("Inventory");
    } catch (error) {
      console.error("Error adding disc to inventory:", error);
      Alert.alert("Error", "Failed to add disc to inventory.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.loginHeader}>Add Disc</Text>

      {showScanner ? (
        <BarCodeScanner
          onBarCodeScanned={handleScanQRCode}
          style={{ width: '100%', height: 300 }}
        />
      ) : (
        <TouchableOpacity style={styles.button} onPress={initiateScan}>
          <Text style={styles.buttonText}>Scan QR Code</Text>
        </TouchableOpacity>
      )}

      {discData && !isNewDisc ? (
        <View style={styles.discInfo}>
          <Text>Disc Info:</Text>
          <Text>UID: {discData.uid}</Text>
          <Text>Company: {discData.company}</Text>
          <Text>Mold: {discData.mold}</Text>
          <Text>Color: {discData.color}</Text>
          <TouchableOpacity style={styles.button} onPress={addNewDiscToInventory}>
            <Text style={styles.buttonText}>Add This Disc</Text>
          </TouchableOpacity>
        </View>
      ) : isNewDisc ? (
        <View style={styles.newDiscForm}>
          <Text>This disc is missing details. Please enter the information:</Text>
          <TextInput
            placeholder="Company"
            style={styles.input}
            value={newDisc.company}
            onChangeText={(text) => setNewDisc({ ...newDisc, company: text })}
          />
          <TextInput
            placeholder="Mold"
            style={styles.input}
            value={newDisc.mold}
            onChangeText={(text) => setNewDisc({ ...newDisc, mold: text })}
          />
          <TextInput
            placeholder="Color"
            style={styles.input}
            value={newDisc.color}
            onChangeText={(text) => setNewDisc({ ...newDisc, color: text })}
          />
          <TouchableOpacity style={styles.button} onPress={addNewDiscToInventory}>
            <Text style={styles.buttonText}>Add This Disc</Text>
          </TouchableOpacity>
        </View>
      ) : null}

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
