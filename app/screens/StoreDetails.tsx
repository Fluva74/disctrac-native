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
import { formatAddress, formatPhoneNumber, format12Hour } from '../utils/stringUtils';

type StoreNavigationProp = NativeStackNavigationProp<StoreStackParamList>;

const StoreDetails = () => {
  const [profile, setProfile] = useState<StoreProfile>({
    storeName: '',
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
          storeName: data.storeName || '',
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
        setStoreName(data.storeName || 'Store');
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

  const getFullAddress = () => {
    if (!profile.address && !profile.city && !profile.state && !profile.zipCode) {
      return undefined;
    }
    return formatAddress(
      profile.address,
      profile.city,
      profile.state,
      profile.zipCode
    );
  };

  const formatStoreHours = (hoursString: string | undefined) => {
    if (!hoursString) return '-';
    
    return hoursString.split('\n').map(line => {
      const [day, times] = line.split(': ');
      if (times === 'Closed') return `${day}: Closed`;
      
      const [openTime, closeTime] = times.split(' - ');
      const [time1, period1] = openTime.split(' ');
      const [time2, period2] = closeTime.split(' ');
      
      return `${day}: ${format12Hour(time1, period1 as 'AM' | 'PM')} - ${format12Hour(time2, period2 as 'AM' | 'PM')}`;
    }).join('\n');
  };

  return (
    <ScreenTemplate>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.avatarContainer}>
            {profile.avatarUrl ? (
              <Image 
                source={{ uri: profile.avatarUrl }}
                style={styles.avatar}
              />
            ) : (
              <InitialsAvatar 
                name={profile.storeName || 'Store'}
                size={60}
              />
            )}
          </View>
          <Text style={styles.title}>{profile.storeName || 'Store Details'}</Text>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Location & Details Card */}
          <LinearGradient
            colors={['rgba(68, 255, 161, 0.1)', 'rgba(77, 159, 255, 0.1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.card}
          >
            <Text style={styles.cardLabel}>Store Name</Text>
            <Text style={styles.cardValue}>{profile.storeName || '-'}</Text>

            <Text style={styles.cardLabel}>Address</Text>
            <Text style={styles.cardValue}>{getFullAddress() || '-'}</Text>

            <Text style={styles.cardLabel}>Hours</Text>
            <Text style={styles.cardValue}>{formatStoreHours(profile.hours)}</Text>

            <Text style={styles.cardLabel}>Phone</Text>
            <Text style={styles.cardValue}>
              {profile.phone ? formatPhoneNumber(profile.phone) : '-'}
            </Text>

            <Text style={styles.cardLabel}>Website</Text>
            <Text style={styles.cardValue}>{profile.website || '-'}</Text>
          </LinearGradient>

          {/* Policy Card */}
          <LinearGradient
            colors={['rgba(68, 255, 161, 0.1)', 'rgba(77, 159, 255, 0.1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.card}
          >
            <Text style={styles.cardLabel}>Hold Time Policy</Text>
            <Text style={styles.cardValue}>{profile.holdTime ? `${profile.holdTime} Days` : '3 Days'}</Text>
          </LinearGradient>

          {/* Edit Button */}
          <LinearGradient
            colors={['#44FFA1', '#4D9FFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.editButton}
          >
            <TouchableOpacity 
              onPress={() => navigation.navigate('EditStoreProfile', { profile })}
              style={styles.editButtonContent}
            >
              <Text style={styles.editButtonText}>Edit Store Details</Text>
            </TouchableOpacity>
          </LinearGradient>
        </ScrollView>
      </View>
    </ScreenTemplate>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(24, 24, 27, 0.5)',
    borderWidth: 2,
    borderColor: '#44FFA1',
  },
  title: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 32,
    color: '#FFFFFF',
    flex: 1,
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
    borderRadius: 8,
    marginTop: 8,
  },
  editButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  editButtonText: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 16,
    color: '#000000',
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(68, 255, 161, 0.2)',
  },
  cardLabel: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 14,
    color: '#A1A1AA',
    marginTop: 12,
    marginBottom: 4,
  },
  cardValue: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
  },
});

export default StoreDetails; 