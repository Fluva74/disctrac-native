import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Image,
} from 'react-native';
import { useRoute, RouteProp, NavigationProp, useNavigation } from '@react-navigation/native';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../FirebaseConfig';
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';
import { InsideStackParamList } from '../../App';

// Static imports for selected color images
const colorImages = {
  discAqua: require('../../assets/discAqua.png'),
  discBlack: require('../../assets/discBlack.png'),
  discBlue: require('../../assets/discBlue.png'),
  discBrown: require('../../assets/discBrown.png'),
  discClear: require('../../assets/discClear.png'),
  discCream: require('../../assets/discCream.png'),
  discDarkBlue: require('../../assets/discDarkBlue.png'),
  discGlow: require('../../assets/discGlow.png'),
  discGray: require('../../assets/discGray.png'),
  discGreen: require('../../assets/discGreen.png'),
  discHotPink: require('../../assets/discHotPink.png'),
  discLime: require('../../assets/discLime.png'),
  discMaroon: require('../../assets/discMaroon.png'),
  discOrange: require('../../assets/discOrange.png'),
  discPaleBlue: require('../../assets/discPaleBlue.png'),
  discPaleGreen: require('../../assets/discPaleGreen.png'),
  discPalePink: require('../../assets/discPalePink.png'),
  discPalePurple: require('../../assets/discPalePurple.png'),
  discPink: require('../../assets/discPink.png'),
  discPurple: require('../../assets/discPurple.png'),
  discRed: require('../../assets/discRed.png'),
  discSkyBlue: require('../../assets/discSkyBlue.png'),
  discTeal: require('../../assets/discTeal.png'),
  discTieDye: require('../../assets/discTieDye.png'),
  discWhite: require('../../assets/discWhite.png'),
  discYellow: require('../../assets/discYellow.png'),
};

// Map of color names to hex codes for swatches
const colorSwatches = {
  discAqua: '#00FFFF',
  discBlack: '#000000',
  discBlue: '#0000FF',
  discBrown: '#8B4513',
  discClear: '#FFFFFF', // Transparent
  discCream: '#FFFDD0',
  discDarkBlue: '#00008B',
  discGlow: '#D0FF14',
  discGray: '#808080',
  discGreen: '#008000',
  discHotPink: '#FF69B4',
  discLime: '#00FF00',
  discMaroon: '#800000',
  discOrange: '#FFA500',
  discPaleBlue: '#AFEEEE',
  discPaleGreen: '#98FB98',
  discPalePink: '#FFD1DC',
  discPalePurple: '#DDA0DD',
  discPink: '#FFC0CB',
  discPurple: '#800080',
  discRed: '#FF0000',
  discSkyBlue: '#87CEEB',
  discTeal: '#008080',
  discTieDye: '#FFD700',
  discWhite: '#FFFFFF',
  discYellow: '#FFFF00',
};

type Suggestion = {
  id: string;
  title: string;
  manufacturer: string;
};

const AddDisc = () => {
  const route = useRoute<RouteProp<InsideStackParamList, 'AddDisc'>>();
  const navigation = useNavigation<NavigationProp<InsideStackParamList>>();
  const scannedData = route.params?.scannedData;

  // State variables
  const [name, setName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [color, setColor] = useState<keyof typeof colorImages>('discWhite'); // Default color
  const [plastic, setPlastic] = useState('');
  const [notes, setNotes] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

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
        manufacturer: doc.data().manufacturer,
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

  const handleColorSelect = (selectedColor: keyof typeof colorSwatches) => {
    setColor(selectedColor);
    setShowColorPicker(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add Disc</Text>

      <View style={styles.formContainer}>
        <View style={styles.section}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Name"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (text.length >= 2) {
                fetchNameSuggestions(text);
              } else {
                setSuggestions([]);
                setShowSuggestions(false);
              }
            }}
          />
          {showSuggestions && suggestions.length > 0 && (
            <FlatList
              data={suggestions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleNameSelect(item.title, item.manufacturer)}>
                  <Text style={styles.suggestionText}>{item.title}</Text>
                </TouchableOpacity>
              )}
              style={styles.suggestionsList}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Manufacturer</Text>
          <TextInput
            style={styles.input}
            placeholder="Auto-filled by Name"
            value={manufacturer}
            editable={false}
          />
        </View>

        <View style={styles.imageContainer}>
          <Image source={colorImages[color] || colorImages['discWhite']} style={styles.discImage} />
          <TouchableOpacity style={styles.editColorButton} onPress={() => setShowColorPicker(true)}>
            <Text style={styles.editColorButtonText}>Edit Color</Text>
          </TouchableOpacity>
        </View>

        {showColorPicker && (
          <Modal
            animationType="slide"
            transparent={true}
            visible={showColorPicker}
            onRequestClose={() => setShowColorPicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalHeader}>Select Color</Text>
                <FlatList
  data={Object.keys(colorSwatches) as Array<keyof typeof colorSwatches>}
  numColumns={4}
  keyExtractor={(item) => item}
  renderItem={({ item }) => (
    <TouchableOpacity
      style={[
        styles.colorSwatch,
        item === 'discTieDye'
          ? styles.tieDyeSwatch // Custom tie-dye style
          : item === 'discGlow'
          ? [styles.glowSwatch, { backgroundColor: colorSwatches[item] }]
          : { backgroundColor: colorSwatches[item] }, // Solid color for others
      ]}
      onPress={() => handleColorSelect(item)}
    >
      {item === 'discTieDye' ? (
        <View style={styles.tieDyeOverlay}>
          <Image
            source={require('../../assets/discTieDye.png')} // Tie-dye image
            style={styles.tieDyeImage}
          />
        </View>
      ) : item === 'discGlow' ? (
        <Text style={styles.glowText}>Glow</Text>
      ) : null}
    </TouchableOpacity>
  )}
/>

              </View>
            </View>
          </Modal>
        )}

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

        <TouchableOpacity style={styles.button} onPress={handleSaveDisc}>
          <Text style={styles.buttonText}>Save Disc</Text>
        </TouchableOpacity>

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
    maxHeight: 150,
  },
  suggestionText: { color: '#fff', padding: 10 },
  imageContainer: { alignItems: 'center', marginBottom: 20 },
  discImage: { width: 150, height: 150, resizeMode: 'contain' },
  editColorButton: { marginTop: 10, backgroundColor: '#2196F3', padding: 10, borderRadius: 5 },
  editColorButtonText: { color: '#fff', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { backgroundColor: '#2c2c2c', width: '80%', borderRadius: 10, padding: 16, alignItems: 'center' },
  modalHeader: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  colorSwatch: { width: 40, height: 40, borderRadius: 20, margin: 5, alignItems: 'center', justifyContent: 'center' },
  glowSwatch: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#D0FF14', shadowColor: '#D0FF14', shadowOpacity: 0.8, shadowRadius: 15 },
  tieDyeSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFD700', // Fallback yellow color
    borderWidth: 2,
    borderColor: '#FF7EB3', // Simulates colorful tie-dye border
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', // Ensures the image stays within the circle
  },
  glowText: { color: '#000', fontWeight: 'bold', textAlign: 'center', fontSize: 10 },
  tieDyeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover', // Cover to fill the circle
  },
  tieDyeOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  button: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 5, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  cancelButton: { backgroundColor: '#FF5252', padding: 10, borderRadius: 5, alignItems: 'center', marginTop: 10 },
  cancelButtonText: { color: '#fff', fontWeight: 'bold' },
});

export default AddDisc;
