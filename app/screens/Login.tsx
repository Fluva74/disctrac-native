import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { doc, getDoc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { RootStackParamList } from '../../App';
import { useFonts, LeagueSpartan_400Regular, LeagueSpartan_700Bold } from '@expo-google-fonts/league-spartan';
import { collection, query, where, getDocs } from 'firebase/firestore';

const Login = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [fontsLoaded] = useFonts({
    LeagueSpartan_400Regular,
    LeagueSpartan_700Bold,
  });

  const signIn = async () => {
    setLoading(true);
    try {
      const isEmail = usernameOrEmail.includes('@');
      let emailToUse = usernameOrEmail;

      if (!isEmail) {
        const playersRef = collection(FIREBASE_DB, 'players');
        const q = query(playersRef, where('username', '==', usernameOrEmail.toLowerCase()));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          const storesRef = collection(FIREBASE_DB, 'stores');
          const storeQuery = query(storesRef, where('username', '==', usernameOrEmail.toLowerCase()));
          const storeSnapshot = await getDocs(storeQuery);

          if (storeSnapshot.empty) {
            throw new Error('Username not found');
          }
          emailToUse = storeSnapshot.docs[0].data().email;
        } else {
          emailToUse = querySnapshot.docs[0].data().email;
        }
      }

      const response = await signInWithEmailAndPassword(FIREBASE_AUTH, emailToUse, password);
      const user = response.user;

      let userDoc = await getDoc(doc(FIREBASE_DB, 'players', user.uid));
      if (userDoc.exists()) {
        navigation.navigate('Inside', { screen: 'PlayerHome' });
      } else {
        userDoc = await getDoc(doc(FIREBASE_DB, 'stores', user.uid));
        if (userDoc.exists()) {
          navigation.navigate('Inside', { screen: 'StoreHome' });
        } else {
          alert('User data not found.');
        }
      }
    } catch (error: any) {
      alert('Sign In failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) {
    return <ActivityIndicator />;
  }

  return (
    <LinearGradient
      colors={['transparent', 'transparent', 'rgba(59, 130, 246, 0.2)']}
      style={styles.container}
      locations={[0, 0.5, 1]}
    >
      <View style={styles.content}>
        <Text style={styles.logo}>
          disctrac
        </Text>
        
        <Text style={styles.tagline}>
          Do you know where your disc is?
        </Text>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username or Email</Text>
            <TextInput
              value={usernameOrEmail}
              style={styles.input}
              placeholder="Enter your username or email"
              placeholderTextColor="#666666"
              autoCapitalize="none"
              onChangeText={setUsernameOrEmail}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#666666"
              autoCapitalize="none"
              secureTextEntry
              onChangeText={setPassword}
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
                onPress={signIn}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Sign In</Text>
              </TouchableOpacity>
            </LinearGradient>

            <TouchableOpacity
              style={styles.forgotButton}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Not a member? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('AccountSelection')}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
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
  logo: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 8,
    // Using rgba for the gradient text effect
    color: '#44FFA1',
  },
  tagline: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 14,
    color: '#A1A1AA',
    textAlign: 'center',
    marginBottom: 48,
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
    textAlign: 'left',
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
    marginTop: 35,
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
  forgotButton: {
    backgroundColor: 'rgba(39, 39, 42, 0.3)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  forgotText: {
    fontFamily: 'LeagueSpartan_400Regular',
    color: '#A1A1AA',
    fontSize: 14,
    textAlign: 'center',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontFamily: 'LeagueSpartan_400Regular',
    color: '#71717A',
    fontSize: 14,
  },
  signupLink: {
    fontFamily: 'LeagueSpartan_400Regular',
    color: '#44FFA1',
    fontSize: 14,
  },
});

export default Login;