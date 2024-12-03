// /Login.tsx
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator, Image } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { doc, getDoc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { RootStackParamList } from '../../App';
import { StyleSheet } from 'react-native';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const signIn = async () => {
        setLoading(true);
        try {
            const response = await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
            const user = response.user;

            // Check user role
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
            console.error("Error during sign-in:", error);
        } finally {
            setLoading(false);
        }
    };

    const goToAccountSelection = () => {
        navigation.navigate('AccountSelection');
    };

    return (
        <View style={styles.container}>
            <Image
                source={require('../../assets/dtLogoGreen.png')} // Path to the logo
                style={styles.logo}
                resizeMode="contain"
            />

            <Text style={styles.tagline}>The leading lost disc finding solution</Text>

            <TextInput
                value={email}
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#B0B0B0"
                autoCapitalize="none"
                onChangeText={(text) => setEmail(text)}
            />

            <TextInput
                secureTextEntry
                value={password}
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#B0B0B0"
                autoCapitalize="none"
                onChangeText={(text) => setPassword(text)}
            />

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.link}>Forgot Password</Text>
            </TouchableOpacity>

            {loading ? (
                <ActivityIndicator size={40} color="#4CAF50" style={styles.loadingIndicator} />
            ) : (
                <>
                    <TouchableOpacity style={styles.button} onPress={signIn}>
                        <Text style={styles.buttonText}>Login</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={goToAccountSelection}>
                        <Text style={styles.link}>Create Account</Text>
                    </TouchableOpacity>
                    <Text style={styles.footer}>©2025</Text>
                </>
                
            )}

            {/* <Text style={styles.footer}>©2025</Text> */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start', // Align content towards the top
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        padding: 20,
        marginTop: '10%', // Moves content up by approximately 30%
    },
    logo: {
        width: 150,
        height: 150,
        marginBottom: '10%', // Add vertical spacing below the logo
    },
    tagline: {
        color: '#FFFFFF',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: '10%', // Add spacing below tagline
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: '#2E2E2E',
        borderRadius: 10,
        paddingHorizontal: 15,
        color: '#FFFFFF',
        marginBottom: '10%', // Add vertical spacing below input fields
    },
    button: {
        width: '100%',
        height: 50,
        backgroundColor: '#4CAF50',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '10%', // Add spacing below buttons
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    link: {
        color: '#FFA726',
        fontSize: 14,
        marginVertical: '5%', // Add consistent vertical spacing for links
    },
    footer: {
        color: '#4CAF50',
        fontSize: 14,
        position: 'absolute',
        bottom: 20,
    },
    loadingIndicator: {
        marginVertical: 10,
    },
});



export default Login;
