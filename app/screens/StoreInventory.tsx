import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ListRenderItemInfo,
  GestureResponderEvent,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { collection, onSnapshot, deleteDoc, doc, getDoc, query, where, orderBy, getDocs } from 'firebase/firestore';
import { InsideStackParamList } from '../../App';
import ScreenTemplate from '../components/ScreenTemplate';
import { LinearGradient } from 'expo-linear-gradient';
import { getDiscImage } from '../utils/discUtils';
import StoreDiscDetailsModal from '../components/modals/StoreDiscDetailsModal';

interface DiscItem {
  id: string;
  color: string;
  name: string;
  manufacturer: string;
  status: string;
  uid: string;
  userId: string;
  notifiedAt: string;
  storeId: string;
  ownerUsername?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  contactPreferences?: {
    email: boolean;
    phone: boolean;
    inApp: boolean;
  };
  plastic?: string;
  notes?: string;
}

interface FilteredDiscItem extends Omit<DiscItem, 'ownerUsername' | 'ownerEmail' | 'ownerPhone' | 'contactPreferences'> {
  storeId: string;
  ownerUsername: string;
  ownerEmail: string;
  ownerPhone: string;
  contactPreferences: {
    email: boolean;
    phone: boolean;
    inApp: boolean;
  };
}

const StoreInventory = () => {
  const navigation = useNavigation<NavigationProp<InsideStackParamList>>();
  const [notifiedDiscs, setNotifiedDiscs] = useState<FilteredDiscItem[]>([]);
  const [releasedDiscs, setReleasedDiscs] = useState<FilteredDiscItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDisc, setSelectedDisc] = useState<DiscItem | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const DEBUG_TAG = '🏪 [StoreInventory]';

  // Single useEffect for data fetching
  useEffect(() => {
    const user = FIREBASE_AUTH.currentUser;
    if (!user) return;

    // Simple query for discs belonging to this store
    const storeInventoryRef = collection(FIREBASE_DB, 'storeInventory');
    const storeQuery = query(
      storeInventoryRef,
      where('storeId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(storeQuery, (snapshot) => {
      const processedDiscs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        ownerUsername: doc.data().ownerUsername || 'Unknown',
        ownerEmail: doc.data().ownerEmail || '',
        ownerPhone: doc.data().ownerPhone || '',
        contactPreferences: {
          email: false,
          phone: false,
          inApp: true
        }
      })) as FilteredDiscItem[];

      const notified = processedDiscs.filter(disc => 
        ['notifiedPlayer', 'yellowAlert', 'criticalAlert'].includes(disc.status)
      );
      const released = processedDiscs.filter(disc => disc.status === 'released');

      setNotifiedDiscs(notified);
      setReleasedDiscs(released);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'notifiedPlayer':
        return '#44FFA1';
      case 'yellowAlert':
        return '#FFC107';
      case 'criticalAlert':
        return '#FF6B6B';
      default:
        return '#27272A';
    }
  };

  const removeDiscFromReleased = async (discId: string) => {
    try {
      console.log('\n=== Removing Released Disc ===');
      console.log('Disc ID:', discId);

      // Remove from store inventory completely
      const discRef = doc(FIREBASE_DB, 'storeInventory', discId);
      await deleteDoc(discRef);
      console.log('Disc removed from store inventory');
    } catch (error) {
      console.error('Error removing disc:', error);
      Alert.alert('Error', 'Failed to remove disc. Please try again.');
    }
  };

  const removeAllReleased = () => {
    Alert.alert(
      'Confirm Removal',
      'Are you sure you want to remove all released discs?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              console.log('\n=== Removing All Released Discs ===');
              
              // Remove all released discs from store inventory
              const deletePromises = releasedDiscs.map(async (disc) => {
                console.log('Removing disc:', disc.id);
                return deleteDoc(doc(FIREBASE_DB, 'storeInventory', disc.id));
              });

              await Promise.all(deletePromises);
              console.log('All released discs removed from store inventory');
            } catch (error) {
              console.error('Error removing discs:', error);
              Alert.alert('Error', 'Failed to remove discs. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderDisc = ({ item }: { item: DiscItem }, isNotified: boolean) => (
    <TouchableOpacity
      onPress={() => {
        if (isNotified) {
          setSelectedDisc(item);
          setShowDetailsModal(true);
        }
      }}
      style={[
        styles.row,
        isNotified && { borderColor: getStatusColor(item.status) },
      ]}
    >
      <Image 
        source={getDiscImage(item.color)} 
        style={styles.discThumbnail} 
        resizeMode="contain"
      />
      <Text style={[styles.cell, styles.nameColumn]}>{item.name}</Text>
      <Text style={[styles.cell, styles.manufacturerColumn]}>{item.manufacturer}</Text>
      {!isNotified && (
        <TouchableOpacity onPress={() => removeDiscFromReleased(item.id)}>
          <Text style={styles.removeText}>Remove</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <ScreenTemplate>
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#44FFA1" />
        ) : (
          <View style={styles.scrollableContainers}>
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>Notified</Text>
              <FlatList
                data={notifiedDiscs}
                renderItem={(item) => renderDisc(item, true)}
                keyExtractor={(item) => item.id}
                style={styles.list}
                contentContainerStyle={styles.listContent}
              />
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeaderContainer}>
                <Text style={styles.sectionHeader}>Released</Text>
                {releasedDiscs.length > 0 && (
                  <TouchableOpacity onPress={removeAllReleased}>
                    <Text style={styles.removeAllText}>Remove all</Text>
                  </TouchableOpacity>
                )}
              </View>
              <FlatList
                data={releasedDiscs}
                renderItem={(item) => renderDisc(item, false)}
                keyExtractor={(item) => item.id}
                style={styles.list}
                contentContainerStyle={styles.listContent}
              />
            </View>
          </View>
        )}

        <LinearGradient
          colors={['#44FFA1', '#4D9FFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.addButtonGradient}
        >
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('StoreAddDisc')}
          >
            <Text style={styles.addButtonText}>Add Disc</Text>
          </TouchableOpacity>
        </LinearGradient>

        <StoreDiscDetailsModal
          visible={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          disc={{
            name: selectedDisc?.name || '',
            manufacturer: selectedDisc?.manufacturer || '',
            color: selectedDisc?.color || '',
            ownerUsername: selectedDisc?.ownerUsername,
            ownerEmail: selectedDisc?.ownerEmail,
            ownerPhone: selectedDisc?.ownerPhone,
            contactPreferences: selectedDisc?.contactPreferences,
            plastic: selectedDisc?.plastic,
            notes: selectedDisc?.notes,
          }}
        />
      </View>
    </ScreenTemplate>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingRight: 24,
  },
  scrollableContainers: {
    flex: 1,
    flexDirection: 'column',
  },
  section: {
    flex: 1,
    width: '100%',
  },
  sectionHeader: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(24, 24, 27, 0.5)',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#27272A',
    width: '100%',
  },
  discThumbnail: {
    width: 40,
    height: 40,
    marginRight: 16,
  },
  cell: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
  },
  nameColumn: { flex: 1 },
  manufacturerColumn: { flex: 1 },
  removeText: {
    color: '#FF6B6B',
    fontFamily: 'LeagueSpartan_700Bold',
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  addButtonGradient: {
    borderRadius: 8,
    marginTop: 16,
  },
  addButton: {
    padding: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#000000',
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 16,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  removeAllText: {
    color: '#FF6B6B',
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 16,
    alignSelf: 'flex-end',
  },
});

export default StoreInventory;
