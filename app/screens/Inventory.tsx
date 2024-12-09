import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Alert,
  Linking,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, NavigationProp, useRoute, RouteProp } from '@react-navigation/native';
import { InsideStackParamList } from '../../App';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../FirebaseConfig';
import { collection, query, where, getDocs, doc, getDoc, deleteDoc, onSnapshot, QuerySnapshot, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { useFonts, LeagueSpartan_400Regular, LeagueSpartan_700Bold } from '@expo-google-fonts/league-spartan';
import ScreenTemplate from '../components/ScreenTemplate';

interface Disc {
  id: string;
  name: string;
  manufacturer: string;
  color: string;
  userId?: string;
  plastic?: string;
  notes?: string;
}

interface InventoryRouteParams {
  showAlert?: boolean;
  alertMessage?: string;
  alertTitle?: string;
}

const colorToImageMap: { [key: string]: any } = {
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

const Inventory = () => {
  const navigation = useNavigation<NavigationProp<InsideStackParamList>>();
  const [discs, setDiscs] = useState<Disc[]>([]);
  const [selectedDisc, setSelectedDisc] = useState<Disc | null>(null); // State for the selected disc
  const [loading, setLoading] = useState(true);
  const [fontsLoaded] = useFonts({
    LeagueSpartan_400Regular,
    LeagueSpartan_700Bold,
  });
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertTitle, setAlertTitle] = useState('');
  const route = useRoute<RouteProp<Record<string, InventoryRouteParams>, string>>();

  useEffect(() => {
    const user = FIREBASE_AUTH.currentUser;
    if (user) {
      const playerDiscsRef = collection(FIREBASE_DB, 'playerDiscs');
      const q = query(playerDiscsRef, where('userId', '==', user.uid));

      const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
        const discsList: Disc[] = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
          id: doc.id,
          name: doc.data().name || '',
          manufacturer: doc.data().manufacturer || '',
          color: doc.data().color || '',
          ...doc.data()
        }));
        setDiscs(discsList);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (route.params?.showAlert && route.params?.alertMessage) {
      setAlertMessage(route.params.alertMessage);
      setAlertTitle(route.params?.alertTitle || 'Info');
      setShowAlertModal(true);
    }
  }, [route.params]);

  const handleDeleteDisc = async (discId: string) => {
    Alert.alert('Remove Disc', 'Do you want to remove this disc from your inventory?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          try {
            await deleteDoc(doc(FIREBASE_DB, 'playerDiscs', discId));
            setSelectedDisc(null);
          } catch (error) {
            console.error('Error deleting disc:', error);
            Alert.alert('Error', 'Failed to remove disc.');
          }
        },
      },
    ]);
  };

  const handleWatchReviews = (manufacturer: string, name: string) => {
    const searchQuery = `disc golf disc review: ${manufacturer} ${name}`;
    const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
    Linking.openURL(youtubeUrl);
  };

  const navigateToHome = () => {
    navigation.navigate('PlayerHome');
  };

  const getDiscImage = (color: string) => {
    const formattedColor = color.charAt(0).toLowerCase() + color.slice(1); // Format color keys
    return colorToImageMap[formattedColor] || require('../../assets/discGray.png'); // Default to discGray if color not found
  };

  const renderDiscItem = ({ item }: { item: Disc }) => (
    <TouchableOpacity
      style={styles.discItem}
      onPress={() => setSelectedDisc(selectedDisc?.id === item.id ? null : item)}
    >
      <LinearGradient
        colors={['rgba(24, 24, 27, 0.5)', 'rgba(24, 24, 27, 0.5)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.discItemGradient}
      >
        <View style={styles.discImageContainer}>
          <Image 
            source={getDiscImage(item.color)} 
            style={styles.discImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.discInfo}>
          <Text style={styles.discName}>{item.name}</Text>
          <Text style={styles.discManufacturer}>{item.manufacturer}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderSelectedDiscModal = () => {
    if (!selectedDisc) return null;

    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setSelectedDisc(null)}
          >
            <MaterialCommunityIcons name="close" size={24} color="#A1A1AA" />
          </TouchableOpacity>

          <View style={styles.modalHeader}>
            <Image 
              source={getDiscImage(selectedDisc.color)} 
              style={styles.modalDiscImage}
              resizeMode="contain"
            />
            <View style={styles.modalDiscInfo}>
              <Text style={styles.modalDiscName}>{selectedDisc.name}</Text>
              <Text style={styles.modalDiscManufacturer}>{selectedDisc.manufacturer}</Text>
            </View>
          </View>

          {selectedDisc.plastic && (
            <View style={styles.modalDetailRow}>
              <Text style={styles.modalDetailLabel}>Plastic:</Text>
              <Text style={styles.modalDetailText}>{selectedDisc.plastic}</Text>
            </View>
          )}

          {selectedDisc.notes && (
            <View style={styles.modalDetailRow}>
              <Text style={styles.modalDetailLabel}>Notes:</Text>
              <Text style={styles.modalDetailText}>{selectedDisc.notes}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.watchButton}
            onPress={() => handleWatchReviews(selectedDisc.manufacturer, selectedDisc.name)}
          >
            <LinearGradient
              colors={['#44FFA1', '#4D9FFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.watchButtonGradient}
            >
              <MaterialCommunityIcons name="youtube" size={24} color="#000000" />
              <Text style={styles.watchButtonText}>Watch Reviews</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleDeleteDisc(selectedDisc.id)}
          >
            <MaterialCommunityIcons name="trash-can" size={24} color="#A1A1AA" />
            <Text style={styles.removeButtonText}>Remove Disc</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderAlertModal = () => {
    if (!showAlertModal) return null;

    return (
      <View style={styles.modalOverlay}>
        <View style={styles.alertModalContent}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowAlertModal(false)}
          >
            <MaterialCommunityIcons name="close" size={24} color="#A1A1AA" />
          </TouchableOpacity>
          
          <Text style={styles.alertModalTitle}>{alertTitle}</Text>
          <Text style={styles.alertModalMessage}>{alertMessage}</Text>
          
          <TouchableOpacity
            style={styles.alertModalButton}
            onPress={() => setShowAlertModal(false)}
          >
            <LinearGradient
              colors={['#44FFA1', '#4D9FFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.alertModalButtonGradient}
            >
              <Text style={styles.alertModalButtonText}>OK</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ScreenTemplate>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>What's in Your Bag?</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#44FFA1" style={styles.loader} />
        ) : discs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>You have no discs in your bag.</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('ScannerScreen')}
            >
              <LinearGradient
                colors={['#44FFA1', '#4D9FFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.addButtonGradient}
              >
                <Text style={styles.addButtonText}>Add Your First Disc</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <FlatList
              data={discs}
              renderItem={renderDiscItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
            />
            <View style={styles.bottomButtonContainer}>
              <TouchableOpacity
                style={styles.addDiscButton}
                onPress={() => navigation.navigate('ScannerScreen')}
              >
                <LinearGradient
                  colors={['#44FFA1', '#4D9FFF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.addDiscButtonGradient}
                >
                  <Text style={styles.addDiscButtonText}>Add Disc</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </>
        )}
        {renderSelectedDiscModal()}
        {renderAlertModal()}
      </View>
    </ScreenTemplate>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: '22%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 40,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  discItem: {
    marginBottom: 12,
  },
  discItemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(24, 24, 27, 0.5)',
  },
  discImageContainer: {
    width: 40,
    height: 40,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  discImage: {
    width: '100%',
    height: '100%',
  },
  discInfo: {
    flex: 1,
  },
  discName: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  discManufacturer: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 14,
    color: '#A1A1AA',
  },
  listContent: {
    paddingBottom: 100,
  },
  loader: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#A1A1AA',
    marginBottom: 24,
  },
  addButton: {
    width: '60%',
  },
  addButtonGradient: {
    borderRadius: 8,
    padding: 16,
  },
  addButtonText: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    backgroundColor: 'rgba(24, 24, 27, 0.95)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(39, 39, 42, 0.8)',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalDiscImage: {
    width: 64,
    height: 64,
    marginRight: 16,
  },
  modalDiscInfo: {
    flex: 1,
  },
  modalDiscName: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  modalDiscManufacturer: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#A1A1AA',
  },
  watchButton: {
    marginBottom: 12,
  },
  watchButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  watchButtonText: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 16,
    color: '#000000',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(39, 39, 42, 0.8)',
    gap: 8,
  },
  removeButtonText: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 16,
    color: '#A1A1AA',
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 32,
    left: 16,
    right: 16,
  },
  addDiscButton: {
    width: '100%',
  },
  addDiscButtonGradient: {
    borderRadius: 8,
    padding: 16,
  },
  addDiscButtonText: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
  },
  modalDetailRow: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  modalDetailLabel: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 16,
    color: '#A1A1AA',
    width: 80,
  },
  modalDetailText: {
    flex: 1,
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#FFFFFF',
  },
  alertModalContent: {
    width: '100%',
    backgroundColor: 'rgba(24, 24, 27, 0.95)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(39, 39, 42, 0.8)',
  },
  alertModalTitle: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  alertModalMessage: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#A1A1AA',
    textAlign: 'center',
    marginBottom: 24,
  },
  alertModalButton: {
    width: '60%',
    alignSelf: 'center',
  },
  alertModalButtonGradient: {
    borderRadius: 8,
    padding: 16,
  },
  alertModalButtonText: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
  },
});

export default Inventory;
