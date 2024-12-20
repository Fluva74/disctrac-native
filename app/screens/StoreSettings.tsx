import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import ScreenTemplate from '../components/ScreenTemplate';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StoreStackParamList } from '../stacks/StoreStack';

type StoreNavigationProp = NativeStackNavigationProp<StoreStackParamList>;

const StoreSettings = () => {
  console.log('\n=== StoreSettings Screen ===');
  console.log('Rendering StoreSettings component');
  const navigation = useNavigation<StoreNavigationProp>();

  const handleSignOut = async () => {
    console.log('Attempting sign out');
    try {
      await FIREBASE_AUTH.signOut();
      console.log('Sign out successful');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  return (
    <ScreenTemplate>
      <View style={styles.container}>
        <Text style={styles.title}>Store Settings</Text>

        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.option}
            onPress={() => navigation.navigate('StoreDetails')}
          >
            <MaterialCommunityIcons name="account" size={24} color="#FFFFFF" />
            <Text style={styles.optionText}>Store Details</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.option}
            onPress={handleSignOut}
          >
            <MaterialCommunityIcons name="logout" size={24} color="#FF6B6B" />
            <Text style={[styles.optionText, styles.logoutText]}>Sign Out</Text>
          </TouchableOpacity>
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
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 32,
  },
  section: {
    backgroundColor: 'rgba(24, 24, 27, 0.5)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  optionText: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 16,
  },
  logoutText: {
    color: '#FF6B6B',
  },
});

export default StoreSettings; 