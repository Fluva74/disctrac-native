import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, TextInput } from 'react-native';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { FIREBASE_DB } from '../../FirebaseConfig';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { InsideStackParamList } from '../../App';
// import { BarCodeScanner } from 'expo-barcode-scanner';
import styles from '../styles';

interface DiscData {
    id: string; // Added id to uniquely identify each disc
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

const StoreInventory = () => {
    const [discData, setDiscData] = useState<DiscData | null>(null);
    const [newDisc, setNewDisc] = useState<NewDiscData>({ company: '', mold: '', color: '' });
    const [showScanner, setShowScanner] = useState(false);
    const [isNewDisc, setIsNewDisc] = useState(false);
    const [scanned, setScanned] = useState(false);
    const [inventory, setInventory] = useState<DiscData[]>([]);
    const navigation = useNavigation<NavigationProp<InsideStackParamList>>();

    const fetchStoreInventory = async () => {
        try {
            const storeInventoryRef = collection(FIREBASE_DB, 'storeInventory');
            const querySnapshot = await getDocs(storeInventoryRef);
            const discsList: DiscData[] = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as Omit<DiscData, 'id'>),
            }));
            setInventory(discsList);
        } catch (error) {
            console.error('Error fetching store inventory:', error);
            Alert.alert('Error', 'Could not load inventory.');
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchStoreInventory();
        }, [])
    );

    const initiateScan = () => {
        setDiscData(null);
        setNewDisc({ company: '', mold: '', color: '' });
        setIsNewDisc(false);
        setScanned(false);
        setShowScanner(true);
    };

    const fetchDiscData = async (scannedCode: string) => {
      const discsRef = collection(FIREBASE_DB, 'discmain');
      const q = query(discsRef, where('uid', '==', scannedCode));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          const data = docSnap.data() as Omit<DiscData, 'id'>; // Exclude id in the type
          setDiscData({ id: docSnap.id, ...data }); // Assign id separately
  
          const storeInventoryRef = collection(FIREBASE_DB, 'storeInventory');
          const ownershipQuery = query(storeInventoryRef, where('uid', '==', scannedCode));
          const ownershipSnapshot = await getDocs(ownershipQuery);
  
          if (!ownershipSnapshot.empty) {
              Alert.alert("Info", "This disc is already in your store inventory.");
              setScanned(true);
              setShowScanner(false);
              return;
          }
  
          if (data.company === 'N/A' || data.mold === 'N/A' || data.color === 'N/A') {
              setIsNewDisc(true);
          } else {
              setIsNewDisc(false);
          }
      } else {
          Alert.alert("Error", "This disc ID does not exist in the database.");
      }
  
      setShowScanner(false);
  };

    const handleScanQRCode = async ({ data }: { data: string }) => {
        if (!scanned) {
            setScanned(true);
            fetchDiscData(data);
        }
    };

    const addNewDiscToInventory = async () => {
        if (!newDisc.company || !newDisc.mold || !newDisc.color) {
            Alert.alert("Please fill out all fields.");
            return;
        }
        try {
            const discDocRef = doc(FIREBASE_DB, 'discmain', discData!.uid);
            await updateDoc(discDocRef, {
                company: newDisc.company,
                mold: newDisc.mold,
                color: newDisc.color
            });

            await addDoc(collection(FIREBASE_DB, 'storeInventory'), {
                uid: discData?.uid,
                ...newDisc
            });

            Alert.alert("Success", "Disc added to store inventory.");

            // Reset states to hide the form and reload inventory
            setDiscData(null);
            setNewDisc({ company: '', mold: '', color: '' });
            setIsNewDisc(false);
            setScanned(false);
            fetchStoreInventory();
        } catch (error) {
            console.error("Error adding disc to inventory:", error);
            Alert.alert("Error", "Failed to add disc to inventory.");
        }
    };

    const renderDisc = ({ item }: { item: DiscData }) => (
        <View style={styles.row}>
            <Text style={styles.cell}>{item.mold}</Text>
            <Text style={styles.cell}>{item.company}</Text>
            <Text style={styles.cell}>{item.color}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Store Inventory</Text>

            <View style={styles.table}>
                <View style={styles.row}>
                    <Text style={styles.headerCell}>Mold</Text>
                    <Text style={styles.headerCell}>Company</Text>
                    <Text style={styles.headerCell}>Color</Text>
                </View>

                <FlatList
                    data={inventory}
                    renderItem={renderDisc}
                    keyExtractor={(item) => item.id}
                />
            </View>

            <TouchableOpacity style={styles.button} onPress={initiateScan}>
                <Text style={styles.buttonText}>Scan QR Code</Text>
            </TouchableOpacity>

            {/* {showScanner && (
                <BarCodeScanner
                    onBarCodeScanned={handleScanQRCode}
                    style={{ width: '100%', height: 300 }}
                />
            )} */}

            {discData && isNewDisc && (
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
            )}
        </View>
    );
};

export default StoreInventory;
