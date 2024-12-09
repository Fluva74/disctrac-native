import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import ScreenTemplate from '../components/ScreenTemplate';
import { PlayerStackParamList } from '../stacks/PlayerStack';

const Settings = () => {
  const navigation = useNavigation<NavigationProp<PlayerStackParamList>>();

  const handleSignOut = async () => {
    try {
      await FIREBASE_AUTH.signOut();
      navigation.getParent()?.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <ScreenTemplate>
      <View style={styles.content}>
        <Text style={styles.title}>Settings</Text>
        
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <LinearGradient
            colors={['rgba(68, 255, 161, 0.1)', 'rgba(77, 159, 255, 0.1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.settingItem}
          >
            <Text style={styles.settingText}>Profile</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSignOut}>
          <LinearGradient
            colors={['rgba(68, 255, 161, 0.1)', 'rgba(77, 159, 255, 0.1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.settingItem}
          >
            <Text style={styles.settingText}>Sign Out</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScreenTemplate>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: '22%',
    gap: 16,
  },
  title: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 40,
    color: '#FFFFFF',
    marginBottom: 32,
  },
  settingItem: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(68, 255, 161, 0.2)',
  },
  settingText: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#FFFFFF',
  },
});

export default Settings; 