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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { InsideStackParamList } from '../../App';
import ScreenTemplate from '../components/ScreenTemplate';
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

const NotifiedOwner = () => {
  const [notifiedDiscs, setNotifiedDiscs] = useState<DiscItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDisc, setSelectedDisc] = useState<DiscItem | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    const user = FIREBASE_AUTH.currentUser;
    if (!user) return;

    const storeInventoryRef = collection(FIREBASE_DB, 'storeInventory');
    
    const unsubscribe = onSnapshot(storeInventoryRef, async (querySnapshot) => {
      const allDiscsPromises = querySnapshot.docs.map(async (docSnapshot) => {
        const discData = docSnapshot.data();
        
        try {
          const playerDocRef = doc(FIREBASE_DB, 'players', discData.userId);
          const playerDoc = await getDoc(playerDocRef);
          const playerData = playerDoc.exists() ? playerDoc.data() : null;

          return {
            id: docSnapshot.id,
            ...discData,
            ownerUsername: playerData?.username || 'Unknown',
            ownerEmail: playerData?.email,
            ownerPhone: playerData?.phone,
            contactPreferences: playerData?.contactPreferences || {
              email: false,
              phone: false,
              inApp: false
            },
          };
        } catch (error) {
          console.error('Error fetching player data:', error);
          return {
            id: docSnapshot.id,
            ...discData,
            ownerUsername: 'Unknown',
          };
        }
      });

      const allDiscs = await Promise.all(allDiscsPromises) as DiscItem[];

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

      setNotifiedDiscs(notified);
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

  const renderDisc = ({ item }: { item: DiscItem }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedDisc(item);
        setShowDetailsModal(true);
      }}
      style={[
        styles.row,
        { borderColor: getStatusColor(item.status) },
      ]}
    >
      <Image 
        source={getDiscImage(item.color)} 
        style={styles.discThumbnail} 
        resizeMode="contain"
      />
      <Text style={[styles.cell, styles.nameColumn]}>{item.name}</Text>
      <Text style={[styles.cell, styles.manufacturerColumn]}>{item.manufacturer}</Text>
    </TouchableOpacity>
  );

  return (
    <ScreenTemplate>
      <View style={styles.container}>
        <Text style={styles.title}>Owner Notified Inventory</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#44FFA1" />
        ) : notifiedDiscs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No Discs In Your Inventory</Text>
          </View>
        ) : (
          <FlatList
            data={notifiedDiscs}
            renderItem={renderDisc}
            keyExtractor={(item) => item.id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
          />
        )}

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
  title: {
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
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 18,
    color: '#44FFA1',
    textAlign: 'center',
  },
});

export default NotifiedOwner; 