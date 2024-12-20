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
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { collection, onSnapshot, deleteDoc, doc, query, where } from 'firebase/firestore';
import ScreenTemplate from '../components/ScreenTemplate';
import { getDiscImage } from '../utils/discUtils';

interface DiscItem {
  id: string;
  color: string;
  name: string;
  manufacturer: string;
  status: string;
  uid: string;
  userId: string;
  notifiedAt: string;
}

const ReleasedInventory = () => {
  const [releasedDiscs, setReleasedDiscs] = useState<DiscItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = FIREBASE_AUTH.currentUser;
    if (!user) return;

    const storeInventoryRef = collection(FIREBASE_DB, 'storeInventory');
    
    const storeQuery = query(
      storeInventoryRef,
      where('storeId', '==', user.uid),
      where('status', '==', 'released')
    );
    
    const unsubscribe = onSnapshot(storeQuery, (querySnapshot) => {
      const released = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DiscItem[];

      setReleasedDiscs(released);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const removeDiscFromReleased = async (discId: string) => {
    try {
      console.log('\n=== Removing Released Disc ===');
      console.log('Disc ID:', discId);

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

  const renderDisc = ({ item }: { item: DiscItem }) => (
    <View style={styles.row}>
      <Image 
        source={getDiscImage(item.color)} 
        style={styles.discThumbnail} 
        resizeMode="contain"
      />
      <Text style={[styles.cell, styles.nameColumn]}>{item.name}</Text>
      <Text style={[styles.cell, styles.manufacturerColumn]}>{item.manufacturer}</Text>
      <TouchableOpacity onPress={() => removeDiscFromReleased(item.id)}>
        <Text style={styles.removeText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenTemplate>
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#44FFA1" />
        ) : (
          <>
            <View style={styles.headerContainer}>
              <Text style={styles.header}>Released</Text>
              {releasedDiscs.length > 0 && (
                <TouchableOpacity onPress={removeAllReleased}>
                  <Text style={styles.removeAllText}>Remove all</Text>
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={releasedDiscs}
              renderItem={renderDisc}
              keyExtractor={(item) => item.id}
              style={styles.list}
              contentContainerStyle={styles.listContent}
            />
          </>
        )}
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  header: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 24,
    color: '#FFFFFF',
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
  removeAllText: {
    color: '#FF6B6B',
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 16,
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
});

export default ReleasedInventory; 