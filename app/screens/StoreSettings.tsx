import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { useNavigation } from '@react-navigation/native';
import ScreenTemplate from '../components/ScreenTemplate';

const StoreSettings = () => {
  const navigation = useNavigation();

  const handleSignOut = async () => {
    try {
      await signOut(FIREBASE_AUTH);
      navigation.getParent()?.navigate('Login');
    } catch (error) {
      console.error("Error signing out:", error);
      Alert.alert("Error", "Failed to sign out. Please try again.");
    }
  };

  return (
    <ScreenTemplate>
      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>
        <TouchableOpacity 
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
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
  signOutButton: {
    padding: 16,
    backgroundColor: 'rgba(24, 24, 27, 0.5)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(68, 255, 161, 0.2)',
  },
  signOutText: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
  },
});

export default StoreSettings; 