import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { collection, query, where, getDocs, doc, updateDoc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { InsideStackParamList } from '../../App';
import { CameraView } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenTemplate from '../components/ScreenTemplate';
import { useFonts, LeagueSpartan_400Regular, LeagueSpartan_700Bold } from '@expo-google-fonts/league-spartan';
import StoreConfirmationModal from '../components/modals/StoreConfirmationModal';
import { RootStackParamList } from '../../App';
import { getDiscImage } from '../utils/discUtils';
import DiscAlreadyNotifiedModal from '../components/modals/DiscAlreadyNotifiedModal';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface DiscData {
  uid: string;
  name: string;
  manufacturer: string;
  color: string;
  userId: string;
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

const StoreAddDisc = () => {
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [discData, setDiscData] = useState<DiscData | null>(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NavigationProp>();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [timerRef, setTimerRef] = useState<NodeJS.Timeout | null>(null);
  const [showAlreadyNotifiedModal, setShowAlreadyNotifiedModal] = useState(false);
  const [alreadyNotifiedDisc, setAlreadyNotifiedDisc] = useState<{
    name: string;
    ownerName: string;
    message: string;
  } | null>(null);

  const [fontsLoaded] = useFonts({
    LeagueSpartan_400Regular,
    LeagueSpartan_700Bold,
  });

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (!scannedData) {
      setScannedData(data);
      await fetchDiscData(data);
    }
  };

  const fetchDiscData = async (scannedCode: string) => {
    setLoading(true);
    try {
      // First check if disc is already in ANY store's inventory
      const storeInventoryRef = collection(FIREBASE_DB, 'storeInventory');
      const storeQuery = query(
        storeInventoryRef, 
        where('uid', '==', scannedCode),
        where('status', 'in', ['notifiedPlayer', 'yellowAlert', 'criticalAlert', 'released'])
      );
      const storeSnapshot = await getDocs(storeQuery);
      
      if (!storeSnapshot.empty) {
        const storeDoc = storeSnapshot.docs[0];
        const storeData = storeDoc.data();
        
        // Only proceed if this disc isn't in the current store's inventory
        const currentUser = FIREBASE_AUTH.currentUser;
        if (storeData.storeId !== currentUser?.uid) {
          // Get store name
          const storeRef = doc(FIREBASE_DB, 'stores', storeData.storeId);
          const storeInfo = await getDoc(storeRef);
          const storeName = storeInfo.exists() ? storeInfo.data().name : 'another store';

          setAlreadyNotifiedDisc({
            name: storeData.name,
            ownerName: storeData.ownerUsername || 'Unknown',
            message: `This disc is already in ${storeName}'s inventory.`
          });
          setShowAlreadyNotifiedModal(true);
          setScannedData(null);
          setLoading(false);
          return;
        }
      }

      // Continue with existing disc lookup if not in any store's inventory
      const playerDiscsRef = collection(FIREBASE_DB, 'playerDiscs');
      const q = query(playerDiscsRef, where('uid', '==', scannedCode));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        const data = docSnap.data();

        // Fetch owner's data including contact info
        const playerDoc = await getDoc(doc(FIREBASE_DB, 'players', data.userId));
        const playerData = playerDoc.exists() ? playerDoc.data() : null;

        console.log('Player data:', playerData); // Debug log

        setDiscData({
          uid: scannedCode,
          name: data.name,
          manufacturer: data.manufacturer,
          color: data.color,
          userId: data.userId,
          ownerUsername: playerData?.username || 'Unknown',
          ownerEmail: playerData?.email,
          ownerPhone: playerData?.phone,
          contactPreferences: playerData?.contactPreferences || {
            email: false,
            phone: false,
            inApp: false
          },
          plastic: data.plastic,
          notes: data.notes,
        });
      } else {
        Alert.alert('Error', 'This disc ID is not assigned to any player.');
        navigation.navigate('StoreStack', {
          screen: 'StoreBottomTabs',
          params: { screen: 'Inventory' }
        });
      }
    } catch (error) {
      console.error('Error fetching disc data:', error);
      Alert.alert('Error', 'Failed to fetch disc information.');
    } finally {
      setLoading(false);
    }
  };

  const startTimer = async (discId: string, userId: string, uid: string) => {
    console.log(`\n=== Starting Timer for Disc ${discId} ===`);
    
    // Store timer start time in Firestore with 3 minute duration
    const storeInventoryRef = doc(FIREBASE_DB, 'storeInventory', discId);
    await updateDoc(storeInventoryRef, {
      timerStartedAt: new Date().toISOString(),
      timeoutDuration: 180000, // 3 minutes in milliseconds
    });

    const interval = setInterval(async () => {
      try {
        const discDoc = await getDoc(storeInventoryRef);
        if (!discDoc.exists()) {
          console.log('Disc document no longer exists, clearing timer');
          clearInterval(interval);
          return;
        }

        const discData = discDoc.data();
        const startTime = new Date(discData.timerStartedAt).getTime();
        const currentTime = new Date().getTime();
        const elapsedTime = currentTime - startTime;
        const timeLeft = 180 - Math.floor(elapsedTime / 1000); // 180 seconds total

        console.log(`Timer check - ${timeLeft}s remaining for disc ${discId}`);

        if (discData.status === 'released') {
          console.log('Disc already released, clearing timer');
          clearInterval(interval);
          return;
        }

        // Set yellow alert at 2 minutes remaining (120 seconds)
        if (timeLeft <= 120 && discData.status === 'notifiedPlayer') {
          console.log('Setting yellow alert status');
          await updateDoc(storeInventoryRef, { status: 'yellowAlert' });
        } 
        // Set critical alert at 1 minute remaining (60 seconds)
        else if (timeLeft <= 60 && discData.status === 'yellowAlert') {
          console.log('Setting critical alert status');
          await updateDoc(storeInventoryRef, { status: 'criticalAlert' });
        } 
        // Release at 0 seconds remaining
        else if (timeLeft <= 0 && discData.status === 'criticalAlert') {
          console.log('Timer complete, releasing disc');
          clearInterval(interval);
          
          try {
            // Remove from player inventory only
            console.log('Removing from player inventory...');
            const playerDiscRef = doc(FIREBASE_DB, 'playerDiscs', `${userId}_${uid}`);
            await deleteDoc(playerDiscRef);

            // Update store inventory status to released
            console.log('Updating store inventory status to released...');
            await updateDoc(storeInventoryRef, {
              status: 'released',
              releasedAt: new Date().toISOString()
            });

            console.log('Disc released successfully');
          } catch (error) {
            console.error('Error during disc release:', error);
          }
        }
      } catch (error) {
        console.error('Timer tick error:', error);
        clearInterval(interval);
      }
    }, 5000); // Check every 5 seconds

    return interval;
  };

  // Add this effect to handle timer restoration on component mount
  useEffect(() => {
    const restoreTimer = async () => {
      if (!discData) return;

      const { uid, userId } = discData;
      const storeInventoryRef = doc(FIREBASE_DB, 'storeInventory', uid);
      const discDoc = await getDoc(storeInventoryRef);

      if (discDoc.exists()) {
        const data = discDoc.data();
        if (data.timerStartedAt && !data.status.includes('released')) {
          console.log('Restoring timer for disc:', uid);
          const timer = await startTimer(uid, userId, uid);
          setTimerRef(timer);
        }
      }
    };

    restoreTimer();

    return () => {
      if (timerRef) {
        clearInterval(timerRef);
      }
    };
  }, [discData]);

  const handleNotifyPlayer = async () => {
    try {
      const currentUser = FIREBASE_AUTH.currentUser;
      if (!currentUser) {
        console.log('No user found in handleNotifyPlayer');
        return;
      }

      if (discData) {
        const { userId, uid, name, manufacturer, color } = discData;

        // Create a unique document ID for storeInventory
        const storeInventoryId = `${currentUser.uid}_${uid}`;
        console.log('Creating store inventory entry:', {
          storeInventoryId,
          storeId: currentUser.uid,
          discId: uid
        });

        // Add to store inventory with a unique ID
        const storeInventoryRef = doc(FIREBASE_DB, 'storeInventory', storeInventoryId);
        const storeInventoryData = {
          uid,
          name: capitalizeFirstLetter(name),
          manufacturer: capitalizeFirstLetter(manufacturer),
          color: color.startsWith('disc') ? color : `disc${color.charAt(0).toUpperCase()}${color.slice(1)}`,
          status: 'notifiedPlayer',
          userId,
          notifiedAt: new Date().toISOString(),
          ownerUsername: discData.ownerUsername,
          storeId: currentUser.uid,  // Explicitly set storeId
        };

        // Log before saving
        console.log('Saving store inventory data:', storeInventoryData);
        await setDoc(storeInventoryRef, storeInventoryData);

        // Verify the save
        const verifyDoc = await getDoc(storeInventoryRef);
        console.log('Verified stored data:', verifyDoc.data());

        // Create notification data
        const notificationData = {
          discId: uid,
          uid,
          name: capitalizeFirstLetter(name),
          manufacturer: capitalizeFirstLetter(manufacturer),
          color,
          status: 'found',
          notifiedAt: new Date().toISOString(),
          company: capitalizeFirstLetter(manufacturer),
          discName: capitalizeFirstLetter(name),
          type: 'found',
          message: 'Your disc has been found at a store! The store will hold your disc until you choose your options.',
          storeId: currentUser.uid,
          storeName: 'Store',
          scannerUserId: FIREBASE_AUTH.currentUser?.uid,
          scannerName: 'Store',
          foundAt: new Date().toISOString(),
          discColor: color,
          discImage: getDiscImage(color),
        };

        // Update player document with notification
        console.log('\nUpdating player document with notification...');
        const playerNotificationRef = doc(FIREBASE_DB, 'players', userId);
        await updateDoc(playerNotificationRef, {
          notification: notificationData
        });

        // Update player inventory status
        console.log('\nUpdating player inventory status...');
        const playerDiscRef = doc(FIREBASE_DB, 'playerDiscs', `${userId}_${uid}`);
        await updateDoc(playerDiscRef, { status: 'notified' });

        // Start timer after store inventory is created
        console.log('\nStarting notification timer...');
        if (timerRef) {
          clearInterval(timerRef); // Clear any existing timer
        }
        const timer = startTimer(uid, userId, uid);
        setTimerRef(await timer);
        console.log('Timer started with reference:', timer);

        // Show confirmation
        setShowConfirmation(true);
        console.log('=== Notification Process Complete ===\n');
      }
    } catch (error) {
      console.error('Error in handleNotifyPlayer:', error);
      Alert.alert('Error', 'Failed to process disc.');
    }
  };

  const handleCancel = () => {
    setScannedData(null);
    setDiscData(null);
    navigation.navigate('StoreStack', {
      screen: 'StoreBottomTabs',
      params: { screen: 'Inventory' }
    });
  };

  // Add this helper function near the top of the component
  const capitalizeFirstLetter = (text: string) => {
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <ScreenTemplate>
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#44FFA1" />
        ) : discData ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              This Disc Belongs To
            </Text>
            <Text style={styles.ownerName}>{discData.ownerUsername}</Text>

            <View style={styles.contentContainer}>
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Disc Name</Text>
                  <Text style={styles.detailValue}>{capitalizeFirstLetter(discData.name)}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Company</Text>
                  <Text style={styles.detailValue}>{capitalizeFirstLetter(discData.manufacturer)}</Text>
                </View>

                {discData.plastic && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Plastic Type</Text>
                    <Text style={styles.detailValue}>{discData.plastic}</Text>
                  </View>
                )}

                {discData.notes && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Additional Notes</Text>
                    <Text style={styles.detailValue}>{discData.notes}</Text>
                  </View>
                )}

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>Contact Methods</Text>
                {discData.contactPreferences?.email && discData.ownerEmail && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailValue}>{discData.ownerEmail}</Text>
                  </View>
                )}
                {discData.contactPreferences?.phone && discData.ownerPhone && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailValue}>{discData.ownerPhone}</Text>
                  </View>
                )}
                {discData.contactPreferences?.inApp && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailValue}>In-App Messages</Text>
                  </View>
                )}
              </View>

              <Image 
                source={getDiscImage(discData.color)} 
                style={styles.discImage}
                resizeMode="contain"
              />
            </View>

            <LinearGradient
              colors={['#44FFA1', '#4D9FFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <TouchableOpacity 
                style={styles.button} 
                onPress={handleNotifyPlayer}
              >
                <Text style={styles.buttonText}>Notify Player</Text>
              </TouchableOpacity>
            </LinearGradient>

            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cameraContainer}>
            <CameraView
              style={styles.camera}
              onBarcodeScanned={handleBarcodeScanned}
              barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'code128'] }}
            />
          </View>
        )}

        <StoreConfirmationModal
          visible={showConfirmation}
          onClose={() => {
            setShowConfirmation(false);
            navigation.navigate('StoreStack', {
              screen: 'StoreBottomTabs',
              params: { screen: 'Inventory' }
            });
          }}
        />

        <DiscAlreadyNotifiedModal
          visible={showAlreadyNotifiedModal}
          onClose={() => {
            setShowAlreadyNotifiedModal(false);
            setAlreadyNotifiedDisc(null);
            navigation.navigate('StoreStack', {
              screen: 'StoreBottomTabs',
              params: { screen: 'Inventory' }
            });
          }}
          discName={alreadyNotifiedDisc?.name || ''}
          ownerName={alreadyNotifiedDisc?.ownerName || ''}
          message={alreadyNotifiedDisc?.message || ''}
        />
      </View>
    </ScreenTemplate>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090B',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  cameraContainer: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    overflow: 'hidden',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  card: {
    backgroundColor: '#18181B',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  cardTitle: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#A1A1AA',
    marginBottom: 4,
  },
  ownerName: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 32,
    color: '#FFFFFF',
    marginBottom: 32,
  },
  contentContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 32,
    justifyContent: 'space-between',
  },
  detailsContainer: {
    flex: 1,
    marginRight: 16,
  },
  detailRow: {
    marginBottom: 16,
  },
  detailLabel: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 14,
    color: '#A1A1AA',
    marginBottom: 4,
  },
  detailValue: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  discImage: {
    width: 100,
    height: 100,
    alignSelf: 'center',
  },
  buttonGradient: {
    borderRadius: 8,
    width: '100%',
    marginBottom: 12,
  },
  button: {
    padding: 16,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 16,
    color: '#000000',
  },
  cancelButton: {
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 16,
    color: '#FF6B6B',
  },
  divider: {
    height: 1,
    backgroundColor: '#27272A',
    width: '100%',
    marginVertical: 16,
  },
  sectionTitle: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 14,
    color: '#A1A1AA',
    marginBottom: 12,
  },
});

export default StoreAddDisc;
