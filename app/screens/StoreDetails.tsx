import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import ScreenTemplate from '../components/ScreenTemplate';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StoreStackParamList } from '../stacks/StoreStack';
import { StoreProfile } from '../types/Profile';
import { InitialsAvatar } from '../components/InitialsAvatar';

type StoreNavigationProp = NativeStackNavigationProp<StoreStackParamList>;

const StoreDetails = () => {
  const [profile, setProfile] = useState<StoreProfile>({
    name: '',
    contactPreferences: {
      email: false,
      phone: false,
      inApp: true,
    }
  });
  const [storeName, setStoreName] = useState<string>('Store');
  const navigation = useNavigation<StoreNavigationProp>();

  const fetchStoreProfile = async () => {
    const user = FIREBASE_AUTH.currentUser;
    if (user) {
      const docRef = doc(FIREBASE_DB, 'stores', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log('Store Profile Data:', docSnap.data());
        const data = docSnap.data();
        setProfile({
          name: data.name || '',
          contactPreferences: {
            email: data.contactPreferences?.email || false,
            phone: data.contactPreferences?.phone || false,
            inApp: data.contactPreferences?.inApp || true,
          },
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          zipCode: data.zipCode || '',
          website: data.website || '',
          hours: data.hours || '',
          avatarUrl: data.avatarUrl || '',
        });
        setStoreName(data.name || 'Store');
      }
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchStoreProfile();
    }, [])
  );

  const renderProfileItem = (label: string, value?: string) => {
    if (!value) return null;
    
    return (
      <LinearGradient
        colors={['rgba(68, 255, 161, 0.1)', 'rgba(77, 159, 255, 0.1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.profileItem}
      >
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </LinearGradient>
    );
  };

  const renderContactMethods = () => {
    if (!profile.contactPreferences) return null;

    const methods = [];
    if (profile.contactPreferences.email && profile.email) methods.push('Email');
    if (profile.contactPreferences.phone && profile.phone) methods.push('Phone');
    if (profile.contactPreferences.inApp) methods.push('In-App');

    if (methods.length === 0) return null;

    return renderProfileItem('Contact Methods', methods.join(', '));
  };

  const getFullAddress = () => {
    if (!profile.address && !profile.city && !profile.state && !profile.zipCode) return undefined;
    return [
      profile.address,
      profile.city && profile.state ? `${profile.city}, ${profile.state}` : undefined,
      profile.zipCode
    ].filter(Boolean).join(' ');
  };

  return (
    <ScreenTemplate>
      <View style={styles.container}>
        <Text style={styles.title}>{storeName}</Text>
        
        <View style={styles.avatarContainer}>
          {profile.avatarUrl ? (
            <Image 
              source={{ uri: profile.avatarUrl }}
              style={styles.avatar}
            />
          ) : (
            <InitialsAvatar 
              name={storeName}
              size={120}
            />
          )}
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderProfileItem('Store Name', profile.name)}
          {renderProfileItem('Email', profile.email)}
          {renderProfileItem('Phone', profile.phone)}
          {renderProfileItem('Address', getFullAddress())}
          {renderProfileItem('Website', profile.website)}
          {renderProfileItem('Hours', profile.hours)}
          {renderContactMethods()}

          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => navigation.navigate('EditStoreProfile', { profile })}
          >
            <LinearGradient
              colors={['#44FFA1', '#4D9FFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.editButtonGradient}
            >
              <Text style={styles.editButtonText}>Edit Store Details</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </ScreenTemplate>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 32,
    color: '#FFFFFF',
    textAlign: 'center',
    marginVertical: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
    zIndex: 1,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(24, 24, 27, 0.5)',
    borderWidth: 2,
    borderColor: '#44FFA1',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 16,
  },
  profileItem: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(68, 255, 161, 0.2)',
  },
  label: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 14,
    color: '#A1A1AA',
    marginBottom: 4,
  },
  value: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#FFFFFF',
  },
  editButton: {
    marginTop: 16,
    marginBottom: 32,
  },
  editButtonGradient: {
    padding: 16,
    borderRadius: 8,
  },
  editButtonText: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
  },
});

export default StoreDetails; 