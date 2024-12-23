import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Modal, ScrollView, RefreshControl, Switch } from 'react-native';
import { Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import ScreenTemplate from '../components/ScreenTemplate';
import { Input } from '../components/Input';
import { PlayerStackParamList } from '../stacks/PlayerStack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PlayerProfile } from '../types/Profile';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Image } from 'react-native';
import { InitialsAvatar } from '../components/InitialsAvatar';
import { NotificationToggle } from '../components/NotificationToggle';
import { useFocusEffect } from '@react-navigation/native';
import { debounce } from 'lodash';

type EditProfileRouteProp = RouteProp<PlayerStackParamList, 'EditProfile'>;

const EditProfile = () => {
  const route = useRoute<EditProfileRouteProp>();
  const navigation = useNavigation();
  const { profile: initialProfile } = route.params;
  const user = FIREBASE_AUTH.currentUser;
  const [profile, setProfile] = useState<PlayerProfile>(initialProfile);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const [firstName, setFirstName] = useState(initialProfile.firstName || '');
  const [lastName, setLastName] = useState(initialProfile.lastName || '');
  const [email, setEmail] = useState(profile.email || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [pdgaNumber, setPdgaNumber] = useState(profile.pdgaNumber || '');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [contactPreferences, setContactPreferences] = useState({
    email: profile.contactPreferences?.email || false,
    phone: profile.contactPreferences?.phone || false,
    inApp: profile.contactPreferences?.inApp ?? true,
  });
  const [showRequiredModal, setShowRequiredModal] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || '');

  const formatPhoneNumber = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    // Limit to 10 digits
    const limited = cleaned.slice(0, 10);
    // Format as (XXX) XXX-XXXX
    if (limited.length >= 6) {
      return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`;
    } else if (limited.length >= 3) {
      return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
    } else if (limited.length > 0) {
      return `(${limited}`;
    }
    return '';
  };

  const handlePhoneChange = (text: string) => {
    const formattedNumber = formatPhoneNumber(text);
    setPhone(formattedNumber);
    
    // Check if phone number is complete (10 digits)
    const phoneDigits = formattedNumber.replace(/\D/g, '');
    if (phoneDigits.length === 10) {
      // Create a temporary profile object with the new phone number
      const tempProfile = {
        ...profile,
        phone: formattedNumber
      };
      setProfile(tempProfile);
    } else {
      // If phone number is incomplete, update profile to remove phone
      const tempProfile = {
        ...profile,
        phone: ''
      };
      setProfile(tempProfile);
      // Also uncheck phone contact preference if it was checked
      if (contactPreferences.phone) {
        setContactPreferences({
          ...contactPreferences,
          phone: false
        });
      }
    }
  };

  const validateForm = () => {
    // Remove formatting to check phone length
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length > 0 && phoneDigits.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        const user = FIREBASE_AUTH.currentUser;
        if (!user) return;

        // Upload image to Firebase Storage
        const storage = getStorage();
        const imageRef = ref(storage, `avatars/${user.uid}`);
        
        const response = await fetch(result.assets[0].uri);
        const blob = await response.blob();
        
        await uploadBytes(imageRef, blob);
        const downloadUrl = await getDownloadURL(imageRef);
        
        setAvatarUrl(downloadUrl);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to update profile picture');
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setIsUpdating(true);
      if (!validateForm()) return;
      if (!user) return;
      
      const userRef = doc(FIREBASE_DB, 'players', user.uid);
      await updateDoc(userRef, {
        firstName,
        lastName,
        email,
        phone,
        pdgaNumber,
        avatarUrl,
        contactPreferences
      });

      await fetchProfile(); // Refresh profile data after update
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePreferenceToggle = async (type: 'email' | 'phone' | 'inApp') => {
    // Prevent toggling inApp messaging
    if (type === 'inApp') return;

    try {
      const newPreferences = {
        ...contactPreferences,
        [type]: !contactPreferences[type]
      };
      
      // Ensure inApp is always true
      newPreferences.inApp = true;

      setContactPreferences(newPreferences);
      
      if (!user) return;
      
      const userRef = doc(FIREBASE_DB, 'players', user.uid);
      await updateDoc(userRef, {
        'contactPreferences': newPreferences
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      Alert.alert('Error', 'Failed to update preferences');
    }
  };

  const fetchProfile = async () => {
    try {
      if (isFetching) return;
      setIsFetching(true);
      setIsLoading(true);
      if (!user) return;
      const docRef = doc(FIREBASE_DB, 'players', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const updatedProfile = docSnap.data() as PlayerProfile;
        setProfile(updatedProfile);
        // Only update contact preferences if they've changed
        const newPreferences = {
          email: updatedProfile.contactPreferences?.email || false,
          phone: updatedProfile.contactPreferences?.phone || false,
          inApp: updatedProfile.contactPreferences?.inApp ?? true,
        };
        if (JSON.stringify(newPreferences) !== JSON.stringify(contactPreferences)) {
          setContactPreferences(newPreferences);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  };

  // Use a more stable version of the debounced fetch
  const debouncedFetch = useCallback(
    debounce(async () => {
      if (!isFetching) {
        await fetchProfile();
      }
    }, 500),
    [isFetching]
  );

  // Clean up debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedFetch.cancel();
    };
  }, [debouncedFetch]);

  const renderSuccessModal = () => (
    <Modal
      transparent
      visible={showSuccessModal}
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Success</Text>
          <Text style={styles.modalMessage}>Profile updated successfully</Text>
          <TouchableOpacity
            onPress={() => {
              setShowSuccessModal(false);
              navigation.goBack();
            }}
          >
            <LinearGradient
              colors={['#44FFA1', '#4D9FFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderRequiredModal = () => (
    <Modal
      transparent
      visible={showRequiredModal}
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Contact Method Required</Text>
          <Text style={styles.modalMessage}>
            At least one contact method must be selected.
          </Text>
          <TouchableOpacity
            onPress={() => setShowRequiredModal(false)}
          >
            <LinearGradient
              colors={['#44FFA1', '#4D9FFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderContactPreferences = () => (
    <View style={styles.settingsSection}>
      <Text style={styles.sectionTitle}>Contact Preferences</Text>
      <Text style={styles.sectionDescription}>
        Choose how you want to be contacted when your disc is found
      </Text>

      <TouchableOpacity style={styles.preferenceItem}>
        <LinearGradient
          colors={['rgba(68, 255, 161, 0.2)', 'rgba(77, 159, 255, 0.2)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.preferenceGradient}
        >
          <View style={styles.preferenceContent}>
            <View>
              <Text style={styles.preferenceLabel}>In-App Messaging</Text>
              <Text style={styles.preferenceDescription}>
                Default messaging method for DiscTrac
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.preferenceItem,
          !profile.email && styles.preferenceItemDisabled
        ]}
        onPress={() => handlePreferenceToggle('email')}
        disabled={!profile.email}
      >
        <LinearGradient
          colors={!profile.email 
            ? ['rgba(24, 24, 27, 0.5)', 'rgba(24, 24, 27, 0.5)']
            : contactPreferences.email 
              ? ['rgba(68, 255, 161, 0.2)', 'rgba(77, 159, 255, 0.2)']
              : ['rgba(24, 24, 27, 0.5)', 'rgba(24, 24, 27, 0.5)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.preferenceGradient}
        >
          <View style={styles.preferenceContent}>
            <Text style={[
              styles.preferenceText,
              !profile.email && styles.preferenceTextDisabled
            ]}>
              Email Contact
            </Text>
            <MaterialCommunityIcons 
              name={contactPreferences.email ? "checkbox-marked" : "checkbox-blank-outline"} 
              size={24} 
              color={!profile.email ? "#52525B" : contactPreferences.email ? "#44FFA1" : "#A1A1AA"} 
            />
          </View>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.preferenceItem,
          !profile.phone && styles.preferenceItemDisabled
        ]}
        onPress={() => handlePreferenceToggle('phone')}
        disabled={!profile.phone}
      >
        <LinearGradient
          colors={!profile.phone 
            ? ['rgba(24, 24, 27, 0.5)', 'rgba(24, 24, 27, 0.5)']
            : contactPreferences.phone 
              ? ['rgba(68, 255, 161, 0.2)', 'rgba(77, 159, 255, 0.2)']
              : ['rgba(24, 24, 27, 0.5)', 'rgba(24, 24, 27, 0.5)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.preferenceGradient}
        >
          <View style={styles.preferenceContent}>
            <Text style={[
              styles.preferenceText,
              !profile.phone && styles.preferenceTextDisabled
            ]}>
              Phone Contact
            </Text>
            <MaterialCommunityIcons 
              name={contactPreferences.phone ? "checkbox-marked" : "checkbox-blank-outline"} 
              size={24} 
              color={!profile.phone ? "#52525B" : contactPreferences.phone ? "#44FFA1" : "#A1A1AA"} 
            />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderNotificationSettings = () => (
    <View style={styles.settingsSection}>
      <Text style={styles.sectionTitle}>Notification Settings</Text>
      <Text style={styles.sectionDescription}>
        Choose when you want to be notified
      </Text>
      
      <NotificationToggle
        userId={user?.uid ?? ''}
        collectionName="players"
        contactPreferences={contactPreferences}
        onUpdate={debouncedFetch}
      />

      <Text style={styles.notificationHint}>
        You'll receive notifications when:
        {'\n'} • Someone finds your disc
        {'\n'} • You receive a message
        {'\n'} • Your disc is at a store for pickup
      </Text>
    </View>
  );

  useFocusEffect(
    React.useCallback(() => {
      fetchProfile();
    }, [])
  );

  return (
    <ScreenTemplate title="Edit Profile">
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchProfile}
            tintColor="#44FFA1"
          />
        }
      >
        <TouchableOpacity 
          style={styles.avatarContainer}
          onPress={pickImage}
        >
          {avatarUrl ? (
            <Image 
              source={{ uri: avatarUrl }}
              style={styles.avatar}
            />
          ) : (
            <InitialsAvatar 
              name={[firstName, lastName].filter(Boolean).join(' ')}
              size={120}
            />
          )}
          <View style={styles.editIconContainer}>
            <MaterialCommunityIcons name="camera" size={20} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <Input
          label="First Name"
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Enter first name"
        />

        <Input
          label="Last Name"
          value={lastName}
          onChangeText={setLastName}
          placeholder="Enter last name"
        />

        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email address"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          label="Phone"
          value={phone}
          onChangeText={handlePhoneChange}
          placeholder="(XXX) XXX-XXXX"
          keyboardType="phone-pad"
        />

        <Input
          label="PDGA Number"
          value={pdgaNumber}
          onChangeText={setPdgaNumber}
          placeholder="Enter PDGA number"
          keyboardType="number-pad"
        />

        {renderContactPreferences()}

        {renderNotificationSettings()}

        <TouchableOpacity style={styles.updateButton} onPress={handleUpdateProfile}>
          <LinearGradient
            colors={['#44FFA1', '#4D9FFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.updateButtonGradient}
          >
            <Text style={styles.updateButtonText}>Update Profile</Text>
          </LinearGradient>
        </TouchableOpacity>
        {renderSuccessModal()}
        {renderRequiredModal()}
      </ScrollView>
    </ScreenTemplate>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  contentContainer: {
    paddingBottom: 100,
    gap: 24,
  },
  updateButton: {
    marginTop: 16,
  },
  updateButtonGradient: {
    padding: 16,
    borderRadius: 8,
  },
  updateButtonText: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'rgba(24, 24, 27, 0.95)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(39, 39, 42, 0.8)',
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  modalMessage: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#A1A1AA',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButton: {
    borderRadius: 8,
    padding: 16,
    paddingHorizontal: 32,
  },
  modalButtonText: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
  },
  preferencesContainer: {
    marginTop: 24,
    gap: 16,
  },
  preferencesTitle: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  preferencesSubtitle: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 14,
    color: '#A1A1AA',
    marginBottom: 8,
  },
  preferenceItem: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  preferenceGradient: {
    width: '100%',
  },
  preferenceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  preferenceLabel: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  preferenceDescription: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 14,
    color: '#A1A1AA',
  },
  preferenceText: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#FFFFFF',
  },
  preferenceTextDisabled: {
    color: '#52525B',
  },
  preferenceItemDisabled: {
    opacity: 0.5,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(24, 24, 27, 0.5)',
    borderWidth: 2,
    borderColor: '#44FFA1',
  },
  editIconContainer: {
    position: 'absolute',
    right: '35%',
    bottom: 0,
    backgroundColor: '#44FFA1',
    borderRadius: 16,
    padding: 8,
    borderWidth: 2,
    borderColor: '#09090B',
  },
  settingsSection: {
    marginTop: 24,
    gap: 16,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  sectionDescription: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 14,
    color: '#A1A1AA',
    marginBottom: 8,
  },
  notificationHint: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 14,
    color: '#A1A1AA',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
    lineHeight: 24,
  },
});

export default EditProfile; 