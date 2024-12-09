import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Image,
  ScrollView,
} from 'react-native';
import { useRoute, RouteProp, NavigationProp, useNavigation } from '@react-navigation/native';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../FirebaseConfig';
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';
import { InsideStackParamList } from '../../App';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts, LeagueSpartan_400Regular, LeagueSpartan_700Bold } from '@expo-google-fonts/league-spartan';
import ScreenTemplate from '../components/ScreenTemplate';
import { Input } from '../components/Input';

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

// Add type for suggestions
interface Suggestion {
  id: string;
  title: string;
  manufacturer: string;
}

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
      navigation.getParent()?.navigate('BottomTabs', {
        screen: 'Bag'
      });
    } catch (error) {
      console.error('Error saving disc data:', error);
      Alert.alert('Error', 'Failed to save disc data.');
    }
  };

  const handleCancel = () => {
    navigation.getParent()?.navigate('BottomTabs', {
      screen: 'Bag'
    });
  };

  const handleColorSelect = (selectedColor: keyof typeof colorSwatches) => {
    setColor(selectedColor);
    setShowColorPicker(false);
  };

  const [fontsLoaded] = useFonts({
    LeagueSpartan_400Regular,
    LeagueSpartan_700Bold,
  });

  // Update onChangeText handler with proper typing
  const handleNameChange = (text: string) => {
    setName(text);
    if (text.length >= 2) {
      fetchNameSuggestions(text);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ScreenTemplate>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={handleCancel}
          >
            <MaterialCommunityIcons name="close" size={24} color="#A1A1AA" />
          </TouchableOpacity>
          <Text style={styles.title}>Add Disc</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Input
              label="Name"
              placeholder="Enter disc name"
              value={name}
              onChangeText={handleNameChange}
            />
            {showSuggestions && suggestions.length > 0 && (
              <View style={styles.suggestionsWrapper}>
                <FlatList
                  nestedScrollEnabled
                  style={styles.suggestionsList}
                  data={suggestions}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      style={styles.suggestionItem}
                      onPress={() => handleNameSelect(item.title, item.manufacturer)}
                    >
                      <Text style={styles.suggestionText}>{item.title}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          </View>

          <ScrollView 
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            <Input
              label="Manufacturer"
              placeholder="Auto-filled by Name"
              value={manufacturer}
              editable={false}
            />

            <View style={styles.imageContainer}>
              <Image source={colorImages[color]} style={styles.discImage} />
              <TouchableOpacity
                onPress={() => setShowColorPicker(true)}
              >
                <LinearGradient
                  colors={['#44FFA1', '#4D9FFF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.editColorButton}
                >
                  <Text style={styles.editColorButtonText}>Edit Color</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <Input
              label="Plastic (Optional)"
              placeholder="Enter plastic type"
              value={plastic}
              onChangeText={setPlastic}
            />

            <Input
              label="Notes"
              placeholder="Enter any notes"
              value={notes}
              onChangeText={setNotes}
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveDisc}
              >
                <LinearGradient
                  colors={['#44FFA1', '#4D9FFF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>Add Disc</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
      </View>
    </ScreenTemplate>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  closeButton: {
    position: 'absolute',
    left: 0,
    zIndex: 1,
  },
  title: {
    flex: 1,
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 40,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    zIndex: 1, // Keep suggestions dropdown above other content
  },
  scrollContainer: {
    flex: 1,
  },
  suggestionsWrapper: {
    maxHeight: 200,
  },
  suggestionsList: {
    backgroundColor: 'rgba(24, 24, 27, 0.8)',
    borderRadius: 8,
    marginTop: -8,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  suggestionText: {
    fontFamily: 'LeagueSpartan_400Regular',
    color: '#FFFFFF',
    fontSize: 16,
  },
  imageContainer: {
    alignItems: 'center',
    gap: 16,
  },
  discImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  editColorButton: {
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 24,
  },
  editColorButtonText: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 8,
  },
  buttonGradient: {
    borderRadius: 8,
    padding: 16,
  },
  buttonText: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
  },
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
  saveButton: {
    width: '100%',
  },
});

export default AddDisc;
