import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../FirebaseConfig';
import { doc, getDoc, updateDoc, setDoc, collection, getDocs, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { InsideStackParamList } from '../../App';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';

const AddDisc = () => {
  const [hasPermission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NavigationProp<InsideStackParamList>>();

  const [company, setCompany] = useState('');
  const [mold, setMold] = useState('');
  const [color, setColor] = useState('');

  const [moldSuggestions, setMoldSuggestions] = useState<{ id: string; title: string; company?: string }[]>([]);
  const [availableColors, setAvailableColors] = useState<{ id: string; name: string }[]>([]);

  const [step, setStep] = useState(1);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
    fetchColors(); // Fetch all colors on component mount
  }, [hasPermission]);

  const fetchMolds = useCallback(async (text: string) => {
    if (text.length < 2) return setMoldSuggestions([]);

    const lowerText = text.toLowerCase();

    const querySnapshot = await getDocs(collection(FIREBASE_DB, 'molds'));

    const filteredMolds = querySnapshot.docs
      .map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        title: doc.data().name,
        company: doc.data().company,
      }))
      .filter((item) => item.title.toLowerCase().startsWith(lowerText));

    setMoldSuggestions(filteredMolds);
  }, []);

  const fetchColors = async () => {
    const querySnapshot = await getDocs(collection(FIREBASE_DB, 'colors'));
    setAvailableColors(
      querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }))
    );
  };

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (data !== scannedData) {
      setScannedData(data);
      setLoading(true);

      try {
        const discRef = doc(FIREBASE_DB, 'discmain', data);
        const discSnapshot = await getDoc(discRef);

        if (!discSnapshot.exists()) {
          Alert.alert("Not Found", "We can't find that code.");
          setScannedData(null); // Clear scanned data to allow another scan
          return;
        }

        const user = FIREBASE_AUTH.currentUser;
        if (user) {
          const userDiscRef = doc(FIREBASE_DB, 'userDiscs', `${user.uid}_${data}`);
          const userDiscSnapshot = await getDoc(userDiscRef);

          if (userDiscSnapshot.exists()) {
            if (userDiscSnapshot.data().userId === user.uid) {
              Alert.alert("Already in Bag", "Hey, You already have this disc in your bag!");
              navigation.navigate('Inventory');
            } else {
              Alert.alert("Already Added", "Sorry, this disc is already added to another player's bag.");
              navigation.navigate('Inventory');
            }
            return;
          }
        }

        setStep(1); // Allow user to add new disc details
      } catch (error) {
        console.error("Error fetching disc data:", error);
        Alert.alert("Error", "Failed to fetch disc information.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveField = () => {
    if (step === 1 && mold) setStep(2);
    else if (step === 2 && color) setStep(3);
  };

  const handleMoldSelect = (selectedMold: { id: string; title: string; company?: string } | null) => {
    if (selectedMold) {
      setMold(selectedMold.title);
      setCompany(selectedMold.company ?? '');
    }
  };

  const handleColorSelect = (selectedColor: string) => {
    setColor(selectedColor);
    setStep(3); // Move to the next step to show disc information
  };

  const handleAddDisc = async () => {
    if (!mold || !color) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }

    try {
      const discRef = doc(FIREBASE_DB, 'discmain', scannedData!);
      await updateDoc(discRef, { company, mold, color });

      const user = FIREBASE_AUTH.currentUser;
      if (user) {
        const userDiscRef = doc(FIREBASE_DB, 'userDiscs', `${user.uid}_${scannedData}`);
        await setDoc(userDiscRef, { uid: scannedData, userId: user.uid, company, mold, color });
        Alert.alert("Success", "Disc added to your inventory.");
        navigation.navigate('Inventory');
      } else {
        Alert.alert("Error", "No user is logged in.");
      }
    } catch (error) {
      console.error("Error saving disc data:", error);
      Alert.alert("Error", "Failed to save disc information.");
    }
  };

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
          {loading ? (
            <ActivityIndicator size="large" color="#4CAF50" />
          ) : (
            <>
              {step === 1 && (
                <>
                  <Text style={styles.formTitle}>What is the Mold of your disc?</Text>
                  <AutocompleteDropdown
                    dataSet={moldSuggestions}
                    onChangeText={fetchMolds}
                    onSelectItem={(item) => handleMoldSelect(item as { id: string; title: string; company?: string } | null)}
                    textInputProps={{
                      placeholder: 'Mold',
                      autoCorrect: false,
                      style: styles.input,
                    }}
                  />
                  <TouchableOpacity style={styles.button} onPress={handleSaveField}>
                    <Text style={styles.buttonText}>Submit Mold</Text>
                  </TouchableOpacity>
                </>
              )}
              {step === 2 && (
                <>
                  <Text style={styles.formTitle}>What color is your disc?</Text>
                  <View style={styles.colorPalette}>
                    {availableColors.map((color) => (
                      <TouchableOpacity
                        key={color.id}
                        style={[
                          styles.colorCircle,
                          {
                            backgroundColor: color.name.toLowerCase() === 'clear' ? 'transparent' : color.name.toLowerCase(),
                            borderColor: color.name.toLowerCase() === 'clear' ? '#4CAF50' : 'transparent', // Border for clear color
                            borderWidth: color.name.toLowerCase() === 'clear' ? 1 : 0,
                          },
                        ]}
                        onPress={() => handleColorSelect(color.name)}
                      />
                    ))}
                  </View>
                </>
              )}
              {step === 3 && (
                <>
                  <Text style={styles.formTitle}>Review Disc Information</Text>
                  <Text>Company: {company}</Text>
                  <Text>Mold: {mold}</Text>
                  <Text>Color: {color}</Text>
                  <TouchableOpacity style={styles.button} onPress={handleAddDisc}>
                    <Text style={styles.buttonText}>Add this Disc?</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  cameraContainer: { width: 250, height: 250, borderRadius: 20, borderWidth: 2, borderColor: 'gray', justifyContent: 'center', alignItems: 'center' },
  camera: { width: '100%', height: '100%' },
  formContainer: { marginTop: 20, width: '80%' },
  formTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  colorPalette: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginVertical: 20 },
  colorCircle: { width: 40, height: 40, borderRadius: 20, margin: 5 },
  input: { padding: 10, borderRadius: 5, backgroundColor: '#FFF', borderColor: '#4CAF50', borderWidth: 1 },
  button: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 5, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#FFF', fontWeight: 'bold' },
});

export default AddDisc;
