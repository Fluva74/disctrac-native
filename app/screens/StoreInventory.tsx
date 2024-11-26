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
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { FIREBASE_DB } from '../../FirebaseConfig';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { InsideStackParamList } from '../../App';

const colorToImageMap: Record<string, any> = {
  blue: require('../../assets/discBlue.png'),
  red: require('../../assets/discRed.png'),
  yellow: require('../../assets/discYellow.png'),
  green: require('../../assets/discGreen.png'),
  pink: require('../../assets/discPink.png'),
  purple: require('../../assets/discPurple.png'),
  orange: require('../../assets/discOrange.png'),
  white: require('../../assets/discWhite.png'),
  gray: require('../../assets/discGray.png'),
};

interface DiscItem {
  id: string;
  color: string;
  name: string;
  manufacturer: string;
  status: string; // "notifiedPlayer", "yellowAlert", "criticalAlert", or "released"
  uid: string; // Unique ID of the disc
  userId: string; // Player ID associated with the disc
  notifiedAt: string; // Timestamp for sorting
}

const StoreInventory = () => {
  const navigation = useNavigation<NavigationProp<InsideStackParamList>>();

  // Initialize state variables
  const [notifiedDiscs, setNotifiedDiscs] = useState<DiscItem[]>([]);
  const [releasedDiscs, setReleasedDiscs] = useState<DiscItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log(`[DEBUG] Setting up Firestore listener for storeInventory`);
    const storeInventoryRef = collection(FIREBASE_DB, 'storeInventory');

    const unsubscribe = onSnapshot(storeInventoryRef, (querySnapshot) => {
      console.log(`[DEBUG] Firestore data updated`);
      const allDiscs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as DiscItem[];

      console.log(`[DEBUG] Raw data:`, allDiscs);

      const notified = allDiscs
        .filter(
          (disc) =>
            disc.status === 'notifiedPlayer' ||
            disc.status === 'yellowAlert' ||
            disc.status === 'criticalAlert'
        )
        .sort((a, b) => {
          const statusPriority: Record<string, number> = {
            criticalAlert: 1,
            yellowAlert: 2,
            notifiedPlayer: 3,
          };
          const priorityA = statusPriority[a.status] || 0;
          const priorityB = statusPriority[b.status] || 0;

          return priorityA - priorityB || new Date(a.notifiedAt).getTime() - new Date(b.notifiedAt).getTime();
        });

      const released = allDiscs.filter((disc) => disc.status === 'released');

      console.log(`[DEBUG] Notified discs (sorted):`, notified);
      console.log(`[DEBUG] Released discs:`, released);

      setNotifiedDiscs(notified);
      setReleasedDiscs(released);
      setLoading(false);
    });

    return () => {
      console.log(`[DEBUG] Unsubscribing from Firestore listener`);
      unsubscribe();
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'notifiedPlayer':
        return '#4CAF50'; // Green
      case 'yellowAlert':
        return '#FFC107'; // Yellow
      case 'criticalAlert':
        return '#F44336'; // Red
      default:
        return '#333'; // Default
    }
  };

  const removeDiscFromReleased = async (discId: string) => {
    try {
      const discRef = doc(FIREBASE_DB, 'storeInventory', discId);
      await deleteDoc(discRef);
      setReleasedDiscs((prev) => prev.filter((disc) => disc.id !== discId));
    } catch (error) {
      console.error('Error removing disc:', error);
    }
  };

  const removeAllReleased = async () => {
    Alert.alert(
      'Confirm Removal',
      'Are you sure you want to remove all released discs?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              const batch = releasedDiscs.map((disc) =>
                deleteDoc(doc(FIREBASE_DB, 'storeInventory', disc.id))
              );
              await Promise.all(batch);
              setReleasedDiscs([]);
            } catch (error) {
              console.error('Error removing all discs:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderDisc = ({ item }: { item: DiscItem }, isNotified: boolean) => {
    const discImage = colorToImageMap[item.color?.toLowerCase()] || require('../../assets/discGray.png');

    return (
      <View
        style={[
          styles.row,
          isNotified && { backgroundColor: getStatusColor(item.status) },
        ]}
      >
        <Image source={discImage} style={styles.discThumbnail} />
        <Text style={[styles.cell, styles.nameColumn]}>{item.name}</Text>
        <Text style={[styles.cell, styles.manufacturerColumn]}>{item.manufacturer}</Text>
        {!isNotified && (
          <TouchableOpacity onPress={() => removeDiscFromReleased(item.id)}>
            <Text style={styles.removeText}>Remove</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Store Inventory</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : (
        <View style={styles.scrollableContainers}>
          {/* Notified Container */}
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

          {/* Released Container */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Released</Text>
            <FlatList
              data={releasedDiscs}
              renderItem={(item) => renderDisc(item, false)}
              keyExtractor={(item) => item.id}
              style={styles.list}
              contentContainerStyle={styles.listContent}
            />
            {releasedDiscs.length > 0 && (
              <TouchableOpacity style={styles.removeAllButton} onPress={removeAllReleased}>
                <Text style={styles.removeAllButtonText}>Remove All</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Add Disc Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('StoreAddDisc')}
      >
        <Text style={styles.addButtonText}>Add Disc</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1c1c1c', padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#FFF', marginBottom: 20 },
  scrollableContainers: { flex: 1, flexDirection: 'column' },
  section: { flex: 1 },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#555',
  },
  discThumbnail: { width: 40, height: 40, marginRight: 10 },
  cell: { flex: 1, color: '#FFF', textAlign: 'center' },
  nameColumn: { flex: 1 },
  manufacturerColumn: { flex: 1 },
  removeText: { color: '#F44336', fontWeight: 'bold' },
  list: { flex: 1 },
  listContent: { flexGrow: 1 },
  removeAllButton: {
    backgroundColor: '#F44336',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  removeAllButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
});

export default StoreInventory;
