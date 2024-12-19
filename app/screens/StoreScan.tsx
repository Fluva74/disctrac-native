import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CameraView } from 'expo-camera';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import ScreenTemplate from '../components/ScreenTemplate';
import { StoreStackParamList } from '../stacks/StoreStack';

const StoreScan = () => {
  const navigation = useNavigation<NavigationProp<StoreStackParamList>>();
  const [scannedData, setScannedData] = useState<string | null>(null);

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (!scannedData) {
      setScannedData(data);
      navigation.navigate('StoreScanResult', { scannedData: data });
    }
  };

  return (
    <ScreenTemplate>
      <View style={styles.container}>
        <Text style={styles.title}>Scan Disc</Text>
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            onBarcodeScanned={handleBarcodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr', 'ean13', 'code128'],
            }}
          />
        </View>
      </View>
    </ScreenTemplate>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 32,
    color: '#FFFFFF',
    marginBottom: 24,
  },
  cameraContainer: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: 'rgba(24, 24, 27, 0.5)',
  },
  camera: {
    flex: 1,
  },
});

export default StoreScan; 