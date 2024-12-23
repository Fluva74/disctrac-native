import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import ScreenTemplate from '../components/ScreenTemplate';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { PlayerStackParamList } from '../stacks/PlayerStack';
import { PlayerProfile } from '../types/Profile';
import { InitialsAvatar } from '../components/InitialsAvatar';
import { notificationService } from '../services/notificationService';
import * as Notifications from 'expo-notifications';

const Profile = () => {
  const [profile, setProfile] = useState<PlayerProfile>({});
  const [discCount, setDiscCount] = useState(0);
  const navigation = useNavigation<NavigationProp<PlayerStackParamList>>();
  const [username, setUsername] = useState<string>('Profile');

  const fetchProfileAndDiscs = async () => {
    const user = FIREBASE_AUTH.currentUser;
    if (user) {
      // Fetch profile data
      const docRef = doc(FIREBASE_DB, 'players', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        // Log the data to see what we're getting
        console.log('Profile Data:', docSnap.data());
        setProfile(docSnap.data() as PlayerProfile);
        setUsername(docSnap.data().username || 'Profile');
      }

      // Fetch disc count
      const discsRef = collection(FIREBASE_DB, 'playerDiscs');
      const q = query(discsRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      setDiscCount(querySnapshot.size);
    }
  };

  // Replace useEffect with useFocusEffect
  useFocusEffect(
    React.useCallback(() => {
      fetchProfileAndDiscs();
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

  const getFullName = () => {
    if (!profile.firstName && !profile.lastName) return undefined;
    return [profile.firstName, profile.lastName].filter(Boolean).join(' ');
  };

  const promptForNotifications = async () => {
    const user = FIREBASE_AUTH.currentUser;
    if (!user) return;

    // Alert.alert(
    //   "Stay Updated",
    //   "Would you like to be notified when someone finds your disc?\n\n" +
    //   "This helps ensure you don't miss any disc returns.",
    //   [
    //     {
    //       text: "Maybe Later",
    //       style: "cancel"
    //     },
    //     {
    //       text: "Yes, Enable",
    //       onPress: async () => {
    //         const { status } = await Notifications.requestPermissionsAsync();
    //         if (status === 'granted') {
    //           await notificationService.registerForPushNotifications();
    //           // Update user preferences
    //           await updateDoc(doc(FIREBASE_DB, 'players', user.uid), {
    //             'contactPreferences.inApp': true
    //           });
    //         }
    //       }
    //     }
    //   ]
    // );
  };

  // useEffect(() => {
  //   const checkNotificationPreferences = async () => {
  //     try {
  //       const user = FIREBASE_AUTH.currentUser;
  //       if (!user) return;

  //       // Only prompt if this is their first time (no preferences set)
  //       if (!profile.contactPreferences) {
  //         // Wait a moment for the UI to settle
  //         setTimeout(() => {
  //           Alert.alert(
  //             "Welcome to DiscTrac!",
  //             "To help you recover lost discs, we can notify you when:\n\n" +
  //             "• Someone finds your disc\n" +
  //             "• You receive a message\n" +
  //             "• A store has your disc ready for pickup\n\n" +
  //             "Would you like to enable notifications?",
  //             [
  //               {
  //                 text: "Not Now",
  //                 style: "cancel",
  //                 onPress: async () => {
  //                   // Save preference to not ask again immediately
  //                   await updateDoc(doc(FIREBASE_DB, 'players', user.uid), {
  //                     contactPreferences: {
  //                       inApp: false,
  //                       email: false,
  //                       phone: false
  //                     }
  //                   });
  //                 }
  //               },
  //               {
  //                 text: "Enable",
  //                 onPress: async () => {
  //                   const { status } = await Notifications.requestPermissionsAsync();
  //                   if (status === 'granted') {
  //                     const token = await notificationService.registerForPushNotifications();
  //                     if (token) {
  //                       await updateDoc(doc(FIREBASE_DB, 'players', user.uid), {
  //                         contactPreferences: {
  //                           inApp: true,
  //                           email: false,
  //                           phone: false
  //                         },
  //                         expoPushToken: token
  //                       });
  //                       Alert.alert(
  //                         "Notifications Enabled",
  //                         "You'll now receive notifications when someone finds your disc. You can manage notification settings in your profile.",
  //                         [{ text: "OK" }]
  //                       );
  //                     }
  //                   } else {
  //                     Alert.alert(
  //                       "Notifications Disabled",
  //                       "To enable notifications later:\n\n" +
  //                       "1. Go to your device settings\n" +
  //                       "2. Find DiscTrac\n" +
  //                       "3. Enable notifications\n\n" +
  //                       "You can also enable them anytime in your profile settings.",
  //                       [{ text: "OK" }]
  //                     );
  //                   }
  //                 }
  //               }
  //             ]
  //           );
  //         }, 1000);
  //       }
  //     } catch (error) {
  //       console.error('Error checking notification preferences:', error);
  //     }
  //   };

  //   checkNotificationPreferences();
  // }, [profile.contactPreferences]);

  return (
    <ScreenTemplate>
      <View style={styles.container}>
        <Text style={styles.title}>{username}</Text>
        
        <View style={styles.avatarContainer}>
          {profile.avatarUrl ? (
            <Image 
              source={{ uri: profile.avatarUrl }}
              style={styles.avatar}
            />
          ) : (
            <InitialsAvatar 
              name={getFullName()}
              size={120}
            />
          )}
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderProfileItem('Name', getFullName())}
          {renderProfileItem('Email', profile.email)}
          {renderProfileItem('Phone', profile.phone)}
          {profile.city && profile.state && 
            renderProfileItem('Location', `${profile.city}, ${profile.state}`)}
          {renderProfileItem('Team', profile.teamName)}
          {renderProfileItem('PDGA Number', profile.pdgaNumber)}
          {renderProfileItem('Discs in Bag', discCount.toString())}
          {renderContactMethods()}

          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile', { profile })}
          >
            <LinearGradient
              colors={['#44FFA1', '#4D9FFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.editButtonGradient}
            >
              <Text style={styles.editButtonText}>Edit Profile</Text>
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
    marginBottom: 32, // Extra padding for bottom tabs
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

export default Profile; 