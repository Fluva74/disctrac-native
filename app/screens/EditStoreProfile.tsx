import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StoreStackParamList } from '../stacks/StoreStack';
import { StoreProfile } from '../types/Profile';
import ScreenTemplate from '../components/ScreenTemplate';
import { Input } from '../components/Input';
import { Picker } from '@react-native-picker/picker';
import { formatPhoneNumber } from '../utils/stringUtils';
import { StoreHoursModal } from '../components/modals/StoreHoursModal';
import { SuccessModal } from '../components/modals/SuccessModal';
import { ValidationModal } from '../components/modals/ValidationModal';
import { NotificationToggle } from '../components/NotificationToggle';

type EditStoreProfileRouteProp = RouteProp<StoreStackParamList, 'EditStoreProfile'>;
type StoreNavigationProp = NativeStackNavigationProp<StoreStackParamList>;

const states = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const EditStoreProfile = () => {
  const navigation = useNavigation<StoreNavigationProp>();
  const route = useRoute<EditStoreProfileRouteProp>();
  const { profile: initialProfile } = route.params;
  const user = FIREBASE_AUTH.currentUser;

  const fetchStoreProfile = async () => {
    try {
      if (!user) return;
      const docRef = doc(FIREBASE_DB, 'stores', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const updatedProfile = docSnap.data() as StoreProfile;
        setProfile(updatedProfile);
      }
    } catch (error) {
      console.error('Error fetching store profile:', error);
    }
  };

  const createInitialProfile = (): StoreProfile => {
    const defaultProfile: StoreProfile = {
      storeName: '',
      contactPreferences: {
        inApp: false,
        email: false,
        phone: false
      }
    };

    if (!initialProfile) {
      return defaultProfile;
    }

    return {
      // Required fields
      storeName: initialProfile.storeName || defaultProfile.storeName,
      // Optional fields
      email: initialProfile.email || '',
      phone: initialProfile.phone || '',
      address: initialProfile.address || '',
      city: initialProfile.city || '',
      state: initialProfile.state || '',
      zipCode: initialProfile.zipCode || '',
      website: initialProfile.website || '',
      hours: initialProfile.hours || '',
      avatarUrl: initialProfile.avatarUrl || '',
      holdTime: initialProfile.holdTime || 3,
      contactPreferences: initialProfile.contactPreferences ?? {
        inApp: false,
        email: false,
        phone: false
      }
    };
  };

  const [profile, setProfile] = useState<StoreProfile>(createInitialProfile());
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [validationModal, setValidationModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({
    visible: false,
    title: '',
    message: '',
  });

  const handleSave = async () => {
    try {
      const user = FIREBASE_AUTH.currentUser;
      if (!user) return;

      const storeRef = doc(FIREBASE_DB, 'stores', user.uid);
      await updateDoc(storeRef, {
        ...profile,
        updatedAt: new Date().toISOString(),
      });

      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error updating store profile:', error);
      Alert.alert('Error', 'Failed to update store profile');
    }
  };

  const handleHoldTimeChange = (text: string) => {
    const numericOnly = text.replace(/[^\d]/g, '');
    
    if (numericOnly === '') {
      setProfile(prev => ({ ...prev, holdTime: undefined }));
      return;
    }

    const value = parseInt(numericOnly);

    if (value < 1) {
      setValidationModal({
        visible: true,
        title: 'Invalid Hold Time',
        message: 'Hold time must be at least 1 day.',
      });
      return;
    }
    
    if (value > 365) {
      setValidationModal({
        visible: true,
        title: 'Invalid Hold Time',
        message: 'Hold time cannot exceed 365 days.',
      });
      return;
    }

    setProfile(prev => ({ ...prev, holdTime: value }));
  };

  return (
    <ScreenTemplate>
      <View style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>Edit Store Details</Text>

            <Input
              label="Store Name"
              value={profile.storeName}
              onChangeText={(text) => setProfile(prev => ({ ...prev, storeName: text }))}
              placeholder="Enter store name"
            />

            <Input
              label="Email"
              value={profile.email}
              onChangeText={(text) => setProfile(prev => ({ ...prev, email: text }))}
              placeholder="Enter email"
              keyboardType="email-address"
              autoCapitalize="none"
              containerStyle={{ marginTop: 16 }}

            />

            <Input
              label="Phone"
              value={profile.phone}
              onChangeText={(text) => {
                // Only allow numeric input
                const numericOnly = text.replace(/[^\d]/g, '');
                // Format as user types
                const formattedPhone = formatPhoneNumber(numericOnly);
                setProfile(prev => ({ ...prev, phone: formattedPhone }));
              }}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              maxLength={12} // Account for the two hyphens
              containerStyle={{ marginTop: 16 }}
            />

            <Input
              label="Address"
              value={profile.address}
              onChangeText={(text) => setProfile(prev => ({ ...prev, address: text }))}
              placeholder="Enter street address"
              containerStyle={{ marginTop: 16 }}
            />

            <Input
              label="City"
              value={profile.city}
              onChangeText={(text) => setProfile(prev => ({ ...prev, city: text }))}
              placeholder="Enter city"
              containerStyle={{ marginTop: 16 }}
            />

            <View style={styles.pickerContainer}>
              <Text style={styles.label}>State</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={profile.state}
                  onValueChange={(value) => setProfile(prev => ({ ...prev, state: value }))}
                  style={styles.picker}
                  dropdownIconColor="#FFFFFF"
                >
                  <Picker.Item label="Select state" value="" />
                  {states.map(state => (
                    <Picker.Item key={state} label={state} value={state} />
                  ))}
                </Picker>
              </View>
            </View>

            <Input
              label="ZIP Code"
              value={profile.zipCode}
              onChangeText={(text) => setProfile(prev => ({ ...prev, zipCode: text }))}
              placeholder="Enter ZIP code"
              keyboardType="numeric"
            //   containerStyle={{ marginTop: 16 }}
            />

            <Input
              label="Website"
              value={profile.website}
              onChangeText={(text) => setProfile(prev => ({ ...prev, website: text }))}
              placeholder="Enter website URL (optional)"
              keyboardType="url"
              autoCapitalize="none"
              containerStyle={{ marginTop: 16 }}
            />

            <Input
              label="Hold Time Policy (Days)"
              value={profile.holdTime?.toString() || ''} 
              onChangeText={handleHoldTimeChange}
              placeholder="Enter number of days (1-365)"
              keyboardType="numeric"
              maxLength={3}
              containerStyle={{ marginTop: 16 }}
              labelStyle={{ color: '#FF6B4A' }}
            />

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Store Hours</Text>
              <TouchableOpacity 
                style={styles.hoursButton}
                onPress={() => setShowHoursModal(true)}
              >
                <Text style={styles.hoursButtonText}>
                  {profile.hours ? 'Edit Store Hours' : 'Set Store Hours'}
                </Text>
              </TouchableOpacity>
            </View>

            <NotificationToggle
              userId={user?.uid ?? ''}
              collectionName="stores"
              contactPreferences={profile.contactPreferences ?? {}}
              onUpdate={fetchStoreProfile}
            />
          </ScrollView>
          <View style={styles.buttonWrapper}>
            <SafeAreaView style={styles.buttonContainer}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <LinearGradient
                  colors={['#44FFA1', '#4D9FFF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveButtonGradient}
                >
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </LinearGradient>
              </TouchableOpacity>
            </SafeAreaView>
          </View>
        </KeyboardAvoidingView>
      </View>
      <StoreHoursModal
        visible={showHoursModal}
        onClose={() => setShowHoursModal(false)}
        value={profile.hours}
        onChange={(hours) => setProfile(prev => ({ ...prev, hours }))}
      />
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigation.goBack();
        }}
        message="Store profile updated successfully"
      />
      <ValidationModal
        visible={validationModal.visible}
        onClose={() => setValidationModal(prev => ({ ...prev, visible: false }))}
        title={validationModal.title}
        message={validationModal.message}
      />
    </ScreenTemplate>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090B',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 24,
  },
  label: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 14,
    color: '#A1A1AA',
    marginTop: 16,
    // marginBottom: 8,
  },
  pickerContainer: {
    marginBottom: 24,
  },
  pickerWrapper: {
    backgroundColor: 'rgba(24, 24, 27, 0.5)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27272A',
    overflow: 'hidden',
    marginTop: 8,
  },
  picker: {
    color: '#FFFFFF',
    height: 50,
  },
  saveButton: {
    marginTop: 8,
  },
  saveButtonGradient: {
    borderRadius: 8,
    padding: 16,
  },
  saveButtonText: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
  },
  buttonWrapper: {
    backgroundColor: '#09090B',
    paddingBottom: 24,
  },
  buttonContainer: {
    backgroundColor: '#09090B',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(39, 39, 42, 0.5)',
    marginBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  inputContainer: {
    marginBottom: 24,
  },
  hoursButton: {
    backgroundColor: 'rgba(68, 255, 161, 0.1)',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#44FFA1',
    marginTop: 8,
  },
  hoursButtonText: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 16,
    color: '#44FFA1',
    textAlign: 'center',
  },
});

export default EditStoreProfile; 