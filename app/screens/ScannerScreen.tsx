import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../FirebaseConfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { InsideStackParamList } from '../../App';
import { DiscFoundModal } from '../components/modals';
import { InvalidQRModal } from '../components/modals';
import { AddDiscConfirmationModal } from '../components/modals';
import DiscWaitingForReleaseModal from '../components/modals/DiscWaitingForReleaseModal';
import { getAuth } from 'firebase/auth';

const ScannerScreen = () => {
  const [hasPermission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NavigationProp<InsideStackParamList>>();
  const [showDiscFoundModal, setShowDiscFoundModal] = useState(false);
  const [foundDiscData, setFoundDiscData] = useState<{
    ownerName: string;
    userId: string;
    discId: string;
    discDetails: {
      name: string;
      manufacturer: string;
      color: string;
    };
    contactInfo: {
      email?: string;
      phone?: string;
      inApp: boolean;
      preferredMethod: 'email' | 'phone' | 'inApp';
    };
  } | null>(null);
  const [showInvalidQRModal, setShowInvalidQRModal] = useState(false);
  const [showAddDiscModal, setShowAddDiscModal] = useState(false);
  const [scannedQRData, setScannedQRData] = useState<string | null>(null);
  const [showWaitingForReleaseModal, setShowWaitingForReleaseModal] = useState(false);
  const [storeInfo, setStoreInfo] = useState<{ name: string }>({ name: 'store' });

  React.useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  const handleBarcodeScanned = async (data: string) => {
    if (!scannedQRData) {
      setScannedQRData(data);
      setLoading(true);

      try {
        // First check if disc is in store inventory
        const storeInventoryRef = doc(FIREBASE_DB, 'storeInventory', data);
        const storeDoc = await getDoc(storeInventoryRef);

        if (storeDoc.exists()) {
          // Get store info if available
          if (storeDoc.data().storeId) {
            const storeRef = doc(FIREBASE_DB, 'stores', storeDoc.data().storeId);
            const storeData = await getDoc(storeRef);
            if (storeData.exists()) {
              setStoreInfo({ name: storeData.data().name || 'store' });
            }
          }
          
          setShowWaitingForReleaseModal(true);
          setScannedQRData(null);
          setLoading(false);
          return;
        }

        // Then check playerDiscs
        const playerDiscsRef = collection(FIREBASE_DB, 'playerDiscs');
        const q = query(playerDiscsRef, where('uid', '==', data));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Disc exists in playerDiscs collection
          const discData = querySnapshot.docs[0].data();
          const { currentUser } = getAuth();
          
          if (discData.userId === currentUser?.uid) {
            navigation.getParent()?.navigate('BottomTabs', {
              screen: 'Bag',
              params: {
                showAlert: true,
                alertTitle: 'Already Added',
                alertMessage: 'This disc is already in your bag.'
              }
            });
          } else {
            // Get owner's name
            const ownerDoc = await getDoc(doc(FIREBASE_DB, 'players', discData.userId));
            const ownerData = ownerDoc.exists() ? ownerDoc.data() : null;
            
            setFoundDiscData({
              ownerName: ownerData?.username || 'Unknown Player',
              userId: discData.userId,
              discId: discData.uid,
              discDetails: {
                name: discData.name,
                manufacturer: discData.manufacturer,
                color: discData.color
              },
              contactInfo: {
                email: ownerData?.email,
                phone: ownerData?.phone,
                inApp: true,
                preferredMethod: ownerData?.contactPreferences?.preferred || 'inApp'
              }
            });
            setShowDiscFoundModal(true);
          }
          return;
        }

        // If we get here, the disc isn't in any player's bag
        // Check if it exists in the buildQrCodes collection
        const buildQrCodesRef = collection(FIREBASE_DB, 'buildQrCodes');
        const buildQrCodesQuery = query(buildQrCodesRef, where('devId', '==', data));
        const buildQrCodesSnapshot = await getDocs(buildQrCodesQuery);

        if (buildQrCodesSnapshot.empty) {
          setShowInvalidQRModal(true);
          return;
        } else {
          setScannedQRData(data);
          setShowAddDiscModal(true);
          return;
        }

      } catch (error) {
        console.error('Error scanning disc:', error);
        Alert.alert('Error', 'Failed to scan disc. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>disctrac</Text>
        <Text style={styles.subHeaderText}>Scan QR Code</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#44FFA1" />
        </View>
      ) : (
        <View style={styles.cameraContainer}>
          <View style={styles.cameraFrame}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />
            
            <CameraView
              style={styles.camera}
              onBarcodeScanned={({ data }) => handleBarcodeScanned(data)}
            />
            
            <View style={styles.scanLine} />
          </View>
          
          <Text style={styles.instructionText}>
            Position the QR code within the frame to scan
          </Text>
        </View>
      )}

      {foundDiscData && (
        <DiscFoundModal
          visible={showDiscFoundModal}
          onClose={() => {
            setShowDiscFoundModal(false);
            setFoundDiscData(null);
            navigation.getParent()?.navigate('BottomTabs', {
              screen: 'Home'
            });
          }}
          onNotifyOwner={() => {
            const currentUser = FIREBASE_AUTH.currentUser;
            if (!currentUser) return;
            
            const conversationId = [currentUser.uid, foundDiscData.userId]
              .sort()
              .join('_');

            setShowDiscFoundModal(false);
            setFoundDiscData(null);

            navigation.navigate('MessageDetail', {
              messageId: conversationId,
              receiverInfo: {
                id: foundDiscData.userId,
                name: foundDiscData.ownerName,
                discName: foundDiscData.discDetails.name
              }
            });
          }}
          ownerName={foundDiscData.ownerName}
          userId={foundDiscData.userId}
          discDetails={{
            id: foundDiscData.discId,
            name: foundDiscData.discDetails.name,
            manufacturer: foundDiscData.discDetails.manufacturer,
            color: foundDiscData.discDetails.color
          }}
          contactInfo={foundDiscData.contactInfo}
        />
      )}

      <InvalidQRModal
        visible={showInvalidQRModal}
        onClose={() => {
          setShowInvalidQRModal(false);
          navigation.getParent()?.navigate('BottomTabs', {
            screen: 'Home'
          });
        }}
      />

      <AddDiscConfirmationModal
        visible={showAddDiscModal}
        onClose={() => {
          setShowAddDiscModal(false);
          setScannedQRData(null);
          navigation.getParent()?.navigate('BottomTabs', {
            screen: 'Home'
          });
        }}
        onAddDisc={() => {
          setShowAddDiscModal(false);
          if (scannedQRData) {
            navigation.navigate('AddDisc', { scannedData: scannedQRData });
          }
        }}
      />

      <DiscWaitingForReleaseModal
        visible={showWaitingForReleaseModal}
        onClose={() => {
          setShowWaitingForReleaseModal(false);
          setStoreInfo({ name: 'store' });
        }}
        storeName={storeInfo.name}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090B',
    padding: 16
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#44FFA1',
    marginBottom: 8
  },
  subHeaderText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cameraContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cameraFrame: {
    width: 300,
    height: 300,
    borderRadius: 12,
    backgroundColor: 'rgba(24, 24, 27, 0.9)',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 24
  },
  camera: {
    width: '100%',
    height: '100%'
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 32,
    height: 32,
    borderLeftWidth: 2,
    borderTopWidth: 2,
    borderColor: '#44FFA1',
    zIndex: 1
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRightWidth: 2,
    borderTopWidth: 2,
    borderColor: '#44FFA1',
    zIndex: 1
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 32,
    height: 32,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#44FFA1',
    zIndex: 1
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#44FFA1',
    zIndex: 1
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#44FFA1',
    opacity: 0.5,
    transform: [{ translateY: 0 }],
    zIndex: 2
  },
  instructionText: {
    color: '#A1A1AA',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16
  }
});

export default ScannerScreen;
