//file.StoreInventory.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { FIREBASE_DB } from '../../FirebaseConfig';
import { collection, onSnapshot, updateDoc, deleteDoc, doc } from 'firebase/firestore';
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
}

const StoreInventory = () => {
  const navigation = useNavigation<NavigationProp<InsideStackParamList>>();
  const [notifiedDiscs, setNotifiedDiscs] = useState<DiscItem[]>([]);
  const [releasedDiscs, setReleasedDiscs] = useState<DiscItem[]>([]);
  const [loading, setLoading] = useState(true);
  const timerRefs = useRef<{ [key: string]: NodeJS.Timeout }>({});

  useEffect(() => {
    console.log('[Firestore] Setting up snapshot listener for storeInventory...');
    const storeInventoryRef = collection(FIREBASE_DB, 'storeInventory');

    const unsubscribe = onSnapshot(storeInventoryRef, (querySnapshot) => {
      console.log('[Firestore] Data updated.');
      const allDiscs: DiscItem[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as DiscItem[];

      console.log('[Firestore] Raw data:', allDiscs);

      const notified = allDiscs.filter(
        (disc) => disc.status === 'notifiedPlayer' || disc.status === 'yellowAlert' || disc.status === 'criticalAlert'
      );
      const released = allDiscs.filter((disc) => disc.status === 'released');

      console.log('[Firestore] Notified Discs:', notified);
      console.log('[Firestore] Released Discs:', released);

      setNotifiedDiscs(notified);
      setReleasedDiscs(released);
      setLoading(false);

      // Start timers for newly notified discs
      notified.forEach((disc) => {
        if (!timerRefs.current[disc.id]) {
          console.log(`[Timer] Starting timer for disc ${disc.id}`);
          startCountdown(disc);
        }
      });
    });

    return () => {
      unsubscribe();
      Object.values(timerRefs.current).forEach(clearInterval);
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

  const handleTimerEnd = async (disc: DiscItem) => {
    try {
      console.log(`[Timer] Timer ended for disc ${disc.id}. Moving to released...`);

      // Update the status to "released" in Firestore
      const discRef = doc(FIREBASE_DB, 'storeInventory', disc.id);
      await updateDoc(discRef, { status: 'released' });
      console.log(`[Firestore] Disc ${disc.id} status updated to released.`);

      // Remove the disc from the player's inventory
      const playerDiscRef = doc(FIREBASE_DB, 'userDiscs', `${disc.userId}_${disc.uid}`);
      await deleteDoc(playerDiscRef);
      console.log(`[Firestore] Disc ${disc.id} removed from player's inventory.`);
    } catch (error) {
      console.error(`[Error] handleTimerEnd failed for disc ${disc.id}:`, error);
    }
  };

  const startCountdown = (disc: DiscItem) => {
    let timeLeft = 60; // Total timer duration in seconds
    console.log(`[Timer] Starting countdown for disc ${disc.id}, total time: ${timeLeft}s`);

    const interval = setInterval(async () => {
      console.log(`[Timer] Timer tick for disc ${disc.id}, timeLeft: ${timeLeft}s`);
      timeLeft -= 20; // Decrease by 20 seconds per interval

      const discRef = doc(FIREBASE_DB, 'storeInventory', disc.id);

      try {
        if (timeLeft === 40) {
          console.log(`[Firestore] Updating disc ${disc.id} to yellow alert.`);
          await updateDoc(discRef, { status: 'yellowAlert' });
        } else if (timeLeft === 20) {
          console.log(`[Firestore] Updating disc ${disc.id} to red alert.`);
          await updateDoc(discRef, { status: 'criticalAlert' });
        } else if (timeLeft <= 0) {
          console.log(`[Timer] Timer ended for disc ${disc.id}.`);
          clearInterval(interval); // Stop the timer
          delete timerRefs.current[disc.id]; // Clean up reference
          handleTimerEnd(disc); // Final step: Move to released
        }
      } catch (error) {
        console.error(`[Error] Timer update failed for disc ${disc.id}:`, error);
        clearInterval(interval); // Stop the timer on error
        delete timerRefs.current[disc.id]; // Clean up reference
      }
    }, 20000); // Execute every 20 seconds

    // Save the interval ID for cleanup
    timerRefs.current[disc.id] = interval;
  };

  const renderDisc = ({ item }: { item: DiscItem }, isNotified: boolean) => {
    const discImage = colorToImageMap[item.color?.toLowerCase()] || require('../../assets/discGray.png');

    console.log(`[UI] Rendering disc ${item.id} with status ${item.status}.`);

    return (
      <View style={[styles.row, isNotified && { backgroundColor: getStatusColor(item.status) }]}>
        <Image source={discImage} style={styles.discThumbnail} />
        <Text style={[styles.cell, styles.nameColumn]}>{item.name}</Text>
        <Text style={[styles.cell, styles.manufacturerColumn]}>{item.manufacturer}</Text>
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
            />
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
  scrollableContainers: { flex: 1, flexDirection: 'column', justifyContent: 'space-between' },
  section: { flex: 1, marginBottom: 10 },
  sectionHeader: { fontSize: 20, fontWeight: 'bold', color: '#FFF', marginBottom: 10, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderColor: '#555' },
  discThumbnail: { width: 40, height: 40, marginRight: 10 },
  cell: { flex: 1, color: '#FFF', textAlign: 'center' },
  nameColumn: { flex: 1 },
  manufacturerColumn: { flex: 1 },
  list: { flex: 1 },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  addButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
});

export default StoreInventory;
