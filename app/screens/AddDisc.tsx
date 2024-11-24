//file.AddDisc.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useRoute, RouteProp, NavigationProp, useNavigation } from '@react-navigation/native';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../FirebaseConfig';
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';
import { InsideStackParamList } from '../../App';

interface Suggestion {
  id: string;
  title: string;
  manufacturer: string;
}

const AddDisc = () => {
  const route = useRoute<RouteProp<InsideStackParamList, 'AddDisc'>>();
  const navigation = useNavigation<NavigationProp<InsideStackParamList>>();
  const scannedData = route.params?.scannedData;

  const [name, setName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [color, setColor] = useState('');
  const [plastic, setPlastic] = useState('');
  const [notes, setNotes] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fetchNameSuggestions = useCallback(async (text: string) => {
    if (!text) {
      setSuggestions([]);
      return;
    }

    try {
      const discsCollection = collection(FIREBASE_DB, 'discs');
      const q = query(
        discsCollection,
        where('name', '>=', text),
        where('name', '<=', text + '\uf8ff')
      );
      const querySnapshot = await getDocs(q);

      const fetchedSuggestions = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().name,
        manufacturer: doc.data().manufacturer, // Ensure correct field
      }));

      setSuggestions(fetchedSuggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching name suggestions:', error);
    }
  }, []);

  const handleNameSelect = (selectedName: string, selectedManufacturer: string) => {
    setName(selectedName);
    setManufacturer(selectedManufacturer); // Auto-populate manufacturer
    setShowSuggestions(false);
  };

  const handleSaveDisc = async () => {
    if (!name || !manufacturer || !color) {
      Alert.alert('Error', 'Please fill out all required fields (Name, Manufacturer, Color).');
      return;
    }

    try {
      const user = FIREBASE_AUTH.currentUser;
      if (!user) {
        Alert.alert('Error', 'No user is logged in.');
        return;
      }

      const userDiscRef = collection(FIREBASE_DB, 'userDiscs');
      const newDiscDoc = {
        uid: scannedData,
        userId: user.uid,
        name,
        manufacturer,
        color,
        plastic,
        notes,
      };
      await setDoc(doc(userDiscRef, `${user.uid}_${scannedData}`), newDiscDoc);

      Alert.alert('Success', 'Disc added to your inventory.');
      navigation.navigate('Inventory');
    } catch (error) {
      console.error('Error saving disc data:', error);
      Alert.alert('Error', 'Failed to save disc data.');
    }
  };

  const handleCancel = () => {
    navigation.navigate('Inventory');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add Disc</Text>

      <View style={styles.formContainer}>
        {/* Name Field with Autocomplete */}
        <View style={styles.section}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Name"
            value={name}
            onChangeText={(text) => {
              setName(text);
              fetchNameSuggestions(text);
            }}
          />
          {showSuggestions && suggestions.length > 0 && (
            <FlatList
              data={suggestions}
              keyExtractor={(item) => item.id}
              style={styles.suggestionsList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestionItem}
                  onPress={() => handleNameSelect(item.title, item.manufacturer)}
                >
                  <Text style={styles.suggestionText}>{item.title}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        {/* Manufacturer Field */}
        <View style={styles.section}>
          <Text style={styles.label}>Manufacturer</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Manufacturer"
            value={manufacturer}
            onChangeText={setManufacturer}
          />
        </View>

        {/* Other Fields */}
        <View style={styles.section}>
          <Text style={styles.label}>Color</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Color"
            value={color}
            onChangeText={setColor}
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Plastic (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Plastic"
            value={plastic}
            onChangeText={setPlastic}
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Notes"
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.button} onPress={handleSaveDisc}>
          <Text style={styles.buttonText}>Save Disc</Text>
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1c1c1c', padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20, textAlign: 'center' },
  formContainer: { marginTop: 20 },
  section: { marginBottom: 20 },
  label: { color: '#fff', fontSize: 16, marginBottom: 8 },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: 5,
    padding: 10,
    borderWidth: 1,
    borderColor: '#555',
  },
  suggestionsList: {
    backgroundColor: '#444',
    borderRadius: 5,
    marginTop: 5,
    maxHeight: 150, // Limit height of dropdown
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#555',
  },
  suggestionText: { color: '#fff' },
  button: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 5, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  cancelButton: { backgroundColor: '#FF5252', padding: 10, borderRadius: 5, alignItems: 'center', marginTop: 10 },
  cancelButtonText: { color: '#fff', fontWeight: 'bold' },
});

export default AddDisc;
