import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { InsideStackParamList } from '../../App';
import ScreenTemplate from '../components/ScreenTemplate';
import { LinearGradient } from 'expo-linear-gradient';
import { FIREBASE_AUTH } from '../../FirebaseConfig';

type StoreNavigationProp = NativeStackNavigationProp<InsideStackParamList>;

const StoreScan = () => {
  const navigation = useNavigation<StoreNavigationProp>();
  const storeName = FIREBASE_AUTH.currentUser?.displayName || 'Store';

  const handleScanPress = () => {
    navigation.navigate('StoreAddDisc');
  };

  return (
    <ScreenTemplate>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>disctrac</Text>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Image 
              source={require('../../assets/settings.png')}
              style={styles.settingsIcon}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.welcomeText}>Welcome, {storeName}!</Text>
        <Text style={styles.subtitle}>Look Up Disc</Text>

        <View style={styles.qrContainer}>
          <Image 
            source={require('../../assets/qr-placeholder.png')}
            style={styles.qrImage}
          />
        </View>

        <LinearGradient
          colors={['#44FFA1', '#4D9FFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.scanButtonGradient}
        >
          <TouchableOpacity 
            style={styles.scanButton}
            onPress={handleScanPress}
          >
            <Text style={styles.scanButtonText}>Scan QR Code</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </ScreenTemplate>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontFamily: 'LeagueSpartan_700Bold',
    color: '#44FFA1',
  },
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    width: 24,
    height: 24,
    tintColor: '#44FFA1',
  },
  welcomeText: {
    fontSize: 32,
    fontFamily: 'LeagueSpartan_700Bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'LeagueSpartan_400Regular',
    color: '#A1A1AA',
    marginBottom: 48,
  },
  qrContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrImage: {
    width: 200,
    height: 200,
    tintColor: '#27272A',
  },
  scanButtonGradient: {
    borderRadius: 8,
    marginBottom: 16,
  },
  scanButton: {
    padding: 16,
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: 'LeagueSpartan_700Bold',
  },
});

export default StoreScan; 