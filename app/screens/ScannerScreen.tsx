import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../FirebaseConfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { InsideStackParamList } from '../../App';

const ScannerScreen = () => {
  const [hasPermission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NavigationProp<InsideStackParamList>>();

  React.useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  const handleBarcodeScanned = async (data: string) => {
    setLoading(true);

    try {
      const user = FIREBASE_AUTH.currentUser;
      if (!user) {
        navigation.getParent()?.navigate('BottomTabs', {
          screen: 'Bag',
          params: {
            showAlert: true,
            alertTitle: 'Error',
            alertMessage: 'No user is logged in.'
          }
        });
        return;
      }

      const userId = user.uid;

      // First check playerDiscs collection
      const playerDiscsRef = collection(FIREBASE_DB, 'playerDiscs');
      const playerDiscsQuery = query(playerDiscsRef, where('uid', '==', data));
      const playerDiscsSnapshot = await getDocs(playerDiscsQuery);

      if (!playerDiscsSnapshot.empty) {
        // Disc exists in playerDiscs collection
        const discData = playerDiscsSnapshot.docs[0].data();
        
        if (discData.userId === userId) {
          navigation.getParent()?.navigate('BottomTabs', {
            screen: 'Bag',
            params: {
              showAlert: true,
              alertTitle: 'Already Added',
              alertMessage: 'This disc is already in your bag.'
            }
          });
        } else {
          navigation.getParent()?.navigate('BottomTabs', {
            screen: 'Bag',
            params: {
              showAlert: true,
              alertTitle: 'Disc Unavailable',
              alertMessage: 'This disc is already in another player\'s bag.'
            }
          });
        }
        return;
      }

      // If we get here, the disc isn't in any player's bag
      // Check if it exists in the buildQrCodes collection
      const buildQrCodesRef = collection(FIREBASE_DB, 'buildQrCodes');
      const buildQrCodesQuery = query(buildQrCodesRef, where('devId', '==', data));
      const buildQrCodesSnapshot = await getDocs(buildQrCodesQuery);

      if (buildQrCodesSnapshot.empty) {
        navigation.getParent()?.navigate('BottomTabs', {
          screen: 'Bag',
          params: {
            showAlert: true,
            alertTitle: 'Invalid Disc',
            alertMessage: 'This QR code is not associated with any disc.'
          }
        });
      } else {
        navigation.navigate('AddDisc', { scannedData: data });
      }

    } catch (error) {
      console.error('Scan error:', error);
      navigation.getParent()?.navigate('BottomTabs', {
        screen: 'Bag',
        params: {
          showAlert: true,
          alertTitle: 'Error',
          alertMessage: 'Failed to check disc assignment.'
        }
      });
    } finally {
      setLoading(false);
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
