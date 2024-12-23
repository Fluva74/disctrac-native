// PlayerCreate.tsx
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Modal, FlatList, Alert } from 'react-native';
import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { useFonts, LeagueSpartan_400Regular, LeagueSpartan_700Bold } from '@expo-google-fonts/league-spartan';
import { Ionicons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { hasPushNotificationBeenAsked, setPushNotificationAsked } from '../utils/storage';
import * as Notifications from 'expo-notifications';
import { notificationService } from '../services/notificationService';

const US_STATES = [
  { name: 'Alabama', abbreviation: 'AL' },
  { name: 'Alaska', abbreviation: 'AK' },
  { name: 'Arizona', abbreviation: 'AZ' },
  { name: 'Arkansas', abbreviation: 'AR' },
  { name: 'California', abbreviation: 'CA' },
  { name: 'Colorado', abbreviation: 'CO' },
  { name: 'Connecticut', abbreviation: 'CT' },
  { name: 'Delaware', abbreviation: 'DE' },
  { name: 'Florida', abbreviation: 'FL' },
  { name: 'Georgia', abbreviation: 'GA' },
  { name: 'Hawaii', abbreviation: 'HI' },
  { name: 'Idaho', abbreviation: 'ID' },
  { name: 'Illinois', abbreviation: 'IL' },
  { name: 'Indiana', abbreviation: 'IN' },
  { name: 'Iowa', abbreviation: 'IA' },
  { name: 'Kansas', abbreviation: 'KS' },
  { name: 'Kentucky', abbreviation: 'KY' },
  { name: 'Louisiana', abbreviation: 'LA' },
  { name: 'Maine', abbreviation: 'ME' },
  { name: 'Maryland', abbreviation: 'MD' },
  { name: 'Massachusetts', abbreviation: 'MA' },
  { name: 'Michigan', abbreviation: 'MI' },
  { name: 'Minnesota', abbreviation: 'MN' },
  { name: 'Mississippi', abbreviation: 'MS' },
  { name: 'Missouri', abbreviation: 'MO' },
  { name: 'Montana', abbreviation: 'MT' },
  { name: 'Nebraska', abbreviation: 'NE' },
  { name: 'Nevada', abbreviation: 'NV' },
  { name: 'New Hampshire', abbreviation: 'NH' },
  { name: 'New Jersey', abbreviation: 'NJ' },
  { name: 'New Mexico', abbreviation: 'NM' },
  { name: 'New York', abbreviation: 'NY' },
  { name: 'North Carolina', abbreviation: 'NC' },
  { name: 'North Dakota', abbreviation: 'ND' },
  { name: 'Ohio', abbreviation: 'OH' },
  { name: 'Oklahoma', abbreviation: 'OK' },
  { name: 'Oregon', abbreviation: 'OR' },
  { name: 'Pennsylvania', abbreviation: 'PA' },
  { name: 'Rhode Island', abbreviation: 'RI' },
  { name: 'South Carolina', abbreviation: 'SC' },
  { name: 'South Dakota', abbreviation: 'SD' },
  { name: 'Tennessee', abbreviation: 'TN' },
  { name: 'Texas', abbreviation: 'TX' },
  { name: 'Utah', abbreviation: 'UT' },
  { name: 'Vermont', abbreviation: 'VT' },
  { name: 'Virginia', abbreviation: 'VA' },
  { name: 'Washington', abbreviation: 'WA' },
  { name: 'West Virginia', abbreviation: 'WV' },
  { name: 'Wisconsin', abbreviation: 'WI' },
  { name: 'Wyoming', abbreviation: 'WY' }
];

const PlayerCreate = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: '',
    state: '',
    pdgaNumber: ''
  });

  const [fontsLoaded] = useFonts({
    LeagueSpartan_400Regular,
    LeagueSpartan_700Bold,
  });

  const [isStateModalVisible, setIsStateModalVisible] = useState(false);
  const [stateSearch, setStateSearch] = useState('');

  const filteredStates = US_STATES.filter(state => 
    state.name.toLowerCase().includes(stateSearch.toLowerCase()) ||
    state.abbreviation.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const [username, setUsername] = useState('');

  const askForNotificationPermission = async () => {
    try {
      const hasBeenAsked = await hasPushNotificationBeenAsked();
      if (true) {
        return new Promise<void>((resolve) => {
          Alert.alert(
            "Enable Notifications",
            "Allow notifications to receive updates when:\n\n" +
            "• Someone finds your disc\n" +
            "• You receive a message\n" +
            "• Your disc is ready for pickup",
            [
              {
                text: "Not Now",
                style: "cancel",
                onPress: async () => {
                  await setPushNotificationAsked();
                  await updateDoc(doc(FIREBASE_DB, 'players', FIREBASE_AUTH.currentUser!.uid), {
                    pushEnabled: false
                  });
                  resolve();
                }
              },
              {
                text: "Enable",
                onPress: async () => {
                  const { status } = await Notifications.requestPermissionsAsync();
                  await setPushNotificationAsked();
                  if (status === Notifications.PermissionStatus.GRANTED) {
                    await notificationService.registerForPushNotifications();
                    await updateDoc(doc(FIREBASE_DB, 'players', FIREBASE_AUTH.currentUser!.uid), {
                      pushEnabled: true
                    });
                  }
                  resolve();
                }
              }
            ]
          );
        });
      }
    } catch (error) {
      console.error('Error asking for notification permission:', error);
    }
  };

  const handleSignUp = async () => {
    try {
      if (!formData.email || !formData.password || !username || !formData.firstName || !formData.lastName) {
        Alert.alert('Error', 'Please fill in all required fields.');
        return;
      }

      // Create the user account
      const userCredential = await createUserWithEmailAndPassword(
        FIREBASE_AUTH,
        formData.email,
        formData.password
      );

      // Create the player document in Firestore
      const playerRef = doc(FIREBASE_DB, 'players', userCredential.user.uid);
      await setDoc(playerRef, {
        username,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        pdgaNumber: formData.pdgaNumber,
        city: formData.city,
        state: formData.state,
        teamName: '',
        phone: '',
        contactPreferences: {
          email: true,
          phone: true,
          inApp: false
        },
        pushEnabled: false,
        createdAt: new Date().toISOString(),
      });

      // Ask for notification permission before navigating
      await askForNotificationPermission();

      // Navigate only after notification decision
      navigation.reset({
        index: 0,
        routes: [{ name: 'PlayerStack' }],
      });

    } catch (error: any) {
      console.error('Sign up error:', error);
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Error', 'This email is already registered.');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Error', 'Invalid email address.');
      } else if (error.code === 'auth/weak-password') {
        Alert.alert('Error', 'Password should be at least 6 characters.');
      } else {
        Alert.alert('Error', 'Failed to create account. Please try again.');
      }
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <LinearGradient
      colors={['transparent', 'transparent', 'rgba(59, 130, 246, 0.2)']}
      style={styles.container}
      locations={[0, 0.5, 1]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>disctrac</Text>
        <Text style={styles.title}>Player Sign Up</Text>
      </View>

      {/* Form */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username*</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter username"
              placeholderTextColor="#A1A1AA"
              value={username}
              onChangeText={setUsername}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your first name"
              placeholderTextColor="#666666"
              value={formData.firstName}
              onChangeText={(text) => setFormData({ ...formData, firstName: text })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your last name"
              placeholderTextColor="#666666"
              value={formData.lastName}
              onChangeText={(text) => setFormData({ ...formData, lastName: text })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#666666"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#666666"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              placeholderTextColor="#666666"
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your city"
              placeholderTextColor="#666666"
              value={formData.city}
              onChangeText={(text) => setFormData({ ...formData, city: text })}
            />
          </View>

          <View style={styles.inputContainer}>
  <Text style={styles.label}>State</Text>
  <TouchableOpacity
    style={styles.input}
    onPress={() => setIsStateModalVisible(true)}
  >
    <Text style={[
      styles.inputText,
      !formData.state && styles.placeholderText
    ]}>
      {formData.state || "Select your state"}
    </Text>
  </TouchableOpacity>

  <Modal
    visible={isStateModalVisible}
    animationType="slide"
    transparent={true}
  >
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Select State</Text>
          <TouchableOpacity
            onPress={() => setIsStateModalVisible(false)}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Search states..."
          placeholderTextColor="#666666"
          value={stateSearch}
          onChangeText={setStateSearch}
        />

        <FlatList
          data={filteredStates}
          keyExtractor={(item) => item.abbreviation}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.stateItem}
              onPress={() => {
                setFormData({ ...formData, state: item.abbreviation });
                setIsStateModalVisible(false);
                setStateSearch('');
              }}
            >
              <Text style={styles.stateName}>{item.name}</Text>
              <Text style={styles.stateAbbrev}>{item.abbreviation}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  </Modal>
</View>


          <View style={styles.inputContainer}>
            <Text style={styles.label}>PDGA Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your PDGA number"
              placeholderTextColor="#666666"
              value={formData.pdgaNumber}
              onChangeText={(text) => setFormData({ ...formData, pdgaNumber: text })}
              keyboardType="number-pad"
            />
          </View>

          <LinearGradient
            colors={['#44FFA1', '#4D9FFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          >
            <TouchableOpacity style={styles.button} onPress={handleSignUp}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </ScrollView>

      {/* Navigation Bar */}
      {/* <View style={styles.navbar}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color="#A1A1AA" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="camera" size={24} color="#A1A1AA" />
        </TouchableOpacity>
        <View style={styles.centerButton}>
          <LinearGradient
            colors={['#44FFA1', '#4D9FFF']}
            style={styles.centerButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Feather name="shopping-bag" size={28} color="#000000" />
          </LinearGradient>
        </View>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="globe" size={24} color="#A1A1AA" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="settings" size={24} color="#A1A1AA" />
        </TouchableOpacity>
      </View> */}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090B',
  },
  header: {
    paddingTop: 32,
    paddingHorizontal: 32,
  },
  logo: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 32,
    textAlign: 'center',
    color: '#44FFA1',
  },
  title: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 24,
    color: '#FFFFFF',
    marginTop: 64,
  },
  scrollView: {
    flex: 1,
    marginTop: 32,
  },
  scrollViewContent: {
    paddingBottom: 120,
  },
  form: {
    paddingHorizontal: 32,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    fontFamily: 'LeagueSpartan_400Regular',
    height: 48,
    backgroundColor: 'rgba(24, 24, 27, 0.5)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27272A',
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 16,
  },
  gradient: {
    borderRadius: 8,
    marginTop: 24,
  },
  button: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(39, 39, 42, 0.5)',
    backgroundColor: 'rgba(9, 9, 11, 0.8)',
  },
  navItem: {
    padding: 12,
  },
  centerButton: {
    marginTop: -40,
  },
  centerButtonGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#09090B',
  },

  inputText: {
    fontFamily: 'LeagueSpartan_400Regular',
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 10,
  },
  placeholderText: {
    color: '#666666',
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(9, 9, 11, 0.95)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  modalContent: {
    backgroundColor: '#18181B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272A',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  modalTitle: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 20,
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  searchInput: {
    fontFamily: 'LeagueSpartan_400Regular',
    height: 48,
    backgroundColor: 'rgba(24, 24, 27, 0.5)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27272A',
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 16,
    margin: 16,
  },
  stateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  stateName: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#FFFFFF',
  },
  stateAbbrev: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 14,
    color: '#A1A1AA',
  },
  signUpButton: {
    marginTop: 24,
    marginBottom: 32,
  },
  gradientButton: {
    borderRadius: 8,
    padding: 16,
  },
});

export default PlayerCreate;
