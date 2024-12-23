import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { createUserWithEmailAndPassword, User } from 'firebase/auth';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../../App';
import { doc, setDoc } from 'firebase/firestore';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { handleNewSignIn } = useAuth();

  const handleSignUp = async () => {
    try {
      setIsLoading(true);
      const userCredential = await createUserWithEmailAndPassword(
        FIREBASE_AUTH,
        email,
        password
      );

      if (userCredential.user) {
        await createUserProfile(userCredential.user);
        navigation.navigate('PlayerCreate');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Rest of the component code */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Add your styles here
  },
});

export default SignUp; 

async function createUserProfile(user: User) {
  try {
    const userRef = doc(FIREBASE_DB, 'players', user.uid);
    await setDoc(userRef, {
      email: user.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      role: 'player',
      contactPreferences: {
        email: false,
        phone: false,
        inApp: false
      },
      pushEnabled: false,
      expoPushToken: null
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}
