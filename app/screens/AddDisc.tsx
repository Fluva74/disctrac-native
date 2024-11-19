import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../FirebaseConfig';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { InsideStackParamList } from '../../App';

const AddDisc = () => {
  const [hasPermission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NavigationProp<InsideStackParamList>>();

  const [company, setCompany] = useState('');
  const [mold, setMold] = useState('');
  const [color, setColor] = useState('');
  const [currentStep, setCurrentStep] = useState('mold'); // Steps: 'mold', 'company', 'color', 'review'
  const [showSubmitButton, setShowSubmitButton] = useState(false);
  const [showAddCompanyButton, setShowAddCompanyButton] = useState(false);

  const [moldSuggestions, setMoldSuggestions] = useState<{ id: string; title: string; company?: string }[]>([]);
  const [companySuggestions, setCompanySuggestions] = useState<{ id: string; title: string }[]>([]);
  const [availableColors, setAvailableColors] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
    fetchColors(); // Fetch all colors on component mount
  }, [hasPermission]);

  const fetchMolds = useCallback(async (text: string) => {
    if (text.length < 2) {
      setMoldSuggestions([]);
      setShowSubmitButton(false);
      return;
    }

    const lowerText = text.toLowerCase();
    const querySnapshot = await getDocs(collection(FIREBASE_DB, 'molds'));

    const filteredMolds = querySnapshot.docs
      .map((doc) => ({
        id: doc.id,
        title: doc.data().name,
        company: doc.data().company, // Get company name for each mold
      }))
      .filter((item) => item.title.toLowerCase().startsWith(lowerText));

    setMoldSuggestions(filteredMolds);
    setShowSubmitButton(filteredMolds.length === 0); // Show CTA only if no suggestions match
  }, []);

  const fetchCompanies = useCallback(async (text: string) => {
    if (text.length < 2) {
      setCompanySuggestions([]);
      setShowAddCompanyButton(false);
      return;
    }

    const querySnapshot = await getDocs(collection(FIREBASE_DB, 'companies'));
    const filteredCompanies = querySnapshot.docs
      .map((doc) => ({
        id: doc.id,
        title: doc.data().name,
      }))
      .filter((item) => item.title.toLowerCase().startsWith(text.toLowerCase()));

    setCompanySuggestions(filteredCompanies);
    setShowAddCompanyButton(filteredCompanies.length === 0); // Show CTA only if no suggestions match
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

  const handleMoldSelect = async (selectedMold: string, companyName?: string) => {
    setMold(selectedMold);
    setMoldSuggestions([]);

    if (companyName) {
      // If the mold is recognized, skip to color selection and set the company
      setCompany(companyName);
      setCurrentStep('color');
    } else {
      // If the mold is new, proceed to company input step
      setCurrentStep('company');
    }
  };

  const handleCompanySelect = (selectedCompany: string) => {
    setCompany(selectedCompany);
    setCompanySuggestions([]);
    setCurrentStep('color'); // Move to color selection
  };

  const handleColorSelect = (selectedColor: string) => {
    setColor(selectedColor);
    setCurrentStep('review'); // Move to review step
  };

  const handleAddDisc = async () => {
    if (!mold || !color || !company) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }

    try {
      const discRef = doc(FIREBASE_DB, 'discmain', scannedData!);
      await setDoc(discRef, { company, mold, color });
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
            onBarcodeScanned={({ data }) => setScannedData(data)}
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
              {currentStep === 'mold' && (
                <>
                  <Text style={styles.formTitle}>What is the Mold of your disc?</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Mold"
                    value={mold}
                    onChangeText={(text) => {
                      setMold(text);
                      fetchMolds(text);
                    }}
                  />
                  {moldSuggestions.length > 0 && (
                    <View style={styles.suggestionsContainer}>
                      {moldSuggestions.map((suggestion) => (
                        <TouchableOpacity
                          key={suggestion.id}
                          onPress={() => handleMoldSelect(suggestion.title, suggestion.company)}
                        >
                          <Text style={styles.suggestionText}>{suggestion.title}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  {showSubmitButton && (
                    <TouchableOpacity style={styles.button} onPress={() => setCurrentStep('company')}>
                      <Text style={styles.buttonText}>Add New Mold</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}

              {currentStep === 'company' && (
                <>
                  <Text style={styles.formTitle}>Disc Company Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Company"
                    value={company}
                    onChangeText={(text) => {
                      setCompany(text);
                      fetchCompanies(text);
                    }}
                  />
                  {companySuggestions.length > 0 && (
                    <View style={styles.suggestionsContainer}>
                      {companySuggestions.map((suggestion) => (
                        <TouchableOpacity key={suggestion.id} onPress={() => handleCompanySelect(suggestion.title)}>
                          <Text style={styles.suggestionText}>{suggestion.title}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  {showAddCompanyButton && (
                    <TouchableOpacity style={styles.button} onPress={() => setCurrentStep('color')}>
                      <Text style={styles.buttonText}>Add New Company</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}

              {currentStep === 'color' && (
                <>
                  <Text style={styles.formTitle}>Choose Your Color</Text>
                  <View style={styles.colorPalette}>
                    {availableColors.map((colorOption) => (
                      <TouchableOpacity
                        key={colorOption.id}
                        style={[
                          styles.colorCircle,
                          { backgroundColor: colorOption.name.toLowerCase() },
                        ]}
                        onPress={() => handleColorSelect(colorOption.name)}
                      />
                    ))}
                  </View>
                </>
              )}

              {currentStep === 'review' && (
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
  input: { padding: 10, borderRadius: 5, backgroundColor: '#FFF', borderColor: '#4CAF50', borderWidth: 1 },
  suggestionsContainer: { backgroundColor: '#FFF', borderRadius: 5, marginTop: 5, padding: 5 },
  suggestionText: { paddingVertical: 5, fontSize: 16 },
  button: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 5, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#FFF', fontWeight: 'bold' },
  colorPalette: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginVertical: 20 },
  colorCircle: { width: 40, height: 40, borderRadius: 20, margin: 5 },
});

export default AddDisc;
