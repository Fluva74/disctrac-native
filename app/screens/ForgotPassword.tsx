import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { useFonts, LeagueSpartan_400Regular, LeagueSpartan_700Bold } from '@expo-google-fonts/league-spartan';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [fontsLoaded] = useFonts({
    LeagueSpartan_400Regular,
    LeagueSpartan_700Bold,
  });

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    try {
      setIsLoading(true);
      await sendPasswordResetEmail(FIREBASE_AUTH, email);
      Alert.alert(
        'Success',
        'Password reset email sent. Please check your inbox.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
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
      <View style={styles.content}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we'll send you instructions to reset your password.
        </Text>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#666666"
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.buttonContainer}>
            <LinearGradient
              colors={['#44FFA1', '#4D9FFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradient}
            >
              <TouchableOpacity
                style={styles.button}
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? 'Sending...' : 'Reset Password'}
                </Text>
              </TouchableOpacity>
            </LinearGradient>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090B',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: '38%',
  },
  title: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 32,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 14,
    color: '#A1A1AA',
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 14,
    color: '#A1A1AA',
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
  buttonContainer: {
    marginTop: 24,
  },
  gradient: {
    borderRadius: 8,
    marginBottom: 16,
  },
  button: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'LeagueSpartan_700Bold',
    color: '#000000',
    fontSize: 16,
  },
  backButton: {
    backgroundColor: 'rgba(39, 39, 42, 0.3)',
    borderRadius: 8,
    padding: 10,
  },
  backButtonText: {
    fontFamily: 'LeagueSpartan_400Regular',
    color: '#A1A1AA',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ForgotPassword; 