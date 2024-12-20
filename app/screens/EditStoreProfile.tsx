import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StoreStackParamList } from '../stacks/StoreStack';
import { StoreProfile } from '../types/Profile';
import ScreenTemplate from '../components/ScreenTemplate';
import { Input } from '../components/Input';
import { Picker } from '@react-native-picker/picker';

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

  // Create a function to generate the initial state
  const createInitialProfile = (): StoreProfile => {
    const defaultProfile: StoreProfile = {
      name: '',
      contactPreferences: {
        email: false,
        phone: false,
        inApp: true,
      }
    };

    if (!route.params?.profile) {
      return defaultProfile;
    }

    const initialProfile = route.params.profile;
    return {
      // Required fields
      name: initialProfile.name || defaultProfile.name,
      contactPreferences: {
        email: initialProfile.contactPreferences?.email || defaultProfile.contactPreferences.email,
        phone: initialProfile.contactPreferences?.phone || defaultProfile.contactPreferences.phone,
        inApp: initialProfile.contactPreferences?.inApp || defaultProfile.contactPreferences.inApp,
      },
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
    };
  };

  const [profile, setProfile] = useState<StoreProfile>(createInitialProfile());

  const handleSave = async () => {
    try {
      const user = FIREBASE_AUTH.currentUser;
      if (!user) return;

      const storeRef = doc(FIREBASE_DB, 'stores', user.uid);
      await updateDoc(storeRef, {
        ...profile,
        updatedAt: new Date().toISOString(),
      });

      Alert.alert(
        'Success',
        'Store profile updated successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error updating store profile:', error);
      Alert.alert('Error', 'Failed to update store profile');
    }
  };

  return (
    <ScreenTemplate>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Edit Store Details</Text>

          <Input
            label="Store Name"
            value={profile.name}
            onChangeText={(text) => setProfile(prev => ({ ...prev, name: text }))}
            placeholder="Enter store name"
          />

          <Input
            label="Email"
            value={profile.email}
            onChangeText={(text) => setProfile(prev => ({ ...prev, email: text }))}
            placeholder="Enter email"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Phone"
            value={profile.phone}
            onChangeText={(text) => setProfile(prev => ({ ...prev, phone: text }))}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />

          <Input
            label="Address"
            value={profile.address}
            onChangeText={(text) => setProfile(prev => ({ ...prev, address: text }))}
            placeholder="Enter street address"
          />

          <Input
            label="City"
            value={profile.city}
            onChangeText={(text) => setProfile(prev => ({ ...prev, city: text }))}
            placeholder="Enter city"
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
          />

          <Input
            label="Website"
            value={profile.website}
            onChangeText={(text) => setProfile(prev => ({ ...prev, website: text }))}
            placeholder="Enter website URL"
            keyboardType="url"
            autoCapitalize="none"
          />

          <Input
            label="Hours"
            value={profile.hours}
            onChangeText={(text) => setProfile(prev => ({ ...prev, hours: text }))}
            placeholder="Enter store hours"
            multiline
          />

          <View style={styles.contactPreferences}>
            <Text style={styles.label}>Contact Preferences</Text>
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setProfile(prev => ({
                  ...prev,
                  contactPreferences: {
                    ...prev.contactPreferences,
                    email: !prev.contactPreferences.email
                  }
                }))}
              >
                <LinearGradient
                  colors={profile.contactPreferences.email ? ['#44FFA1', '#4D9FFF'] : ['transparent', 'transparent']}
                  style={styles.checkboxInner}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.checkboxLabel}>Email</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setProfile(prev => ({
                  ...prev,
                  contactPreferences: {
                    ...prev.contactPreferences,
                    phone: !prev.contactPreferences.phone
                  }
                }))}
              >
                <LinearGradient
                  colors={profile.contactPreferences.phone ? ['#44FFA1', '#4D9FFF'] : ['transparent', 'transparent']}
                  style={styles.checkboxInner}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.checkboxLabel}>Phone</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setProfile(prev => ({
                  ...prev,
                  contactPreferences: {
                    ...prev.contactPreferences,
                    inApp: !prev.contactPreferences.inApp
                  }
                }))}
              >
                <LinearGradient
                  colors={profile.contactPreferences.inApp ? ['#44FFA1', '#4D9FFF'] : ['transparent', 'transparent']}
                  style={styles.checkboxInner}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.checkboxLabel}>In-App</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

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
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenTemplate>
  );
};

const styles = StyleSheet.create({
  container: {
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
    marginBottom: 8,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerWrapper: {
    backgroundColor: 'rgba(24, 24, 27, 0.5)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27272A',
    overflow: 'hidden',
  },
  picker: {
    color: '#FFFFFF',
    height: 50,
  },
  contactPreferences: {
    marginTop: 16,
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  checkbox: {
    borderWidth: 1,
    borderColor: '#27272A',
    borderRadius: 8,
    overflow: 'hidden',
  },
  checkboxInner: {
    padding: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  checkboxLabel: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 14,
    color: '#FFFFFF',
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
});

export default EditStoreProfile; 