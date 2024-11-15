// Login.tsx
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { doc, getDoc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { RootStackParamList } from '../../App';
import styles from '../styles';

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
            <Text style={styles.loginHeader}>disctrac</Text> 

            <TextInput
                value={email}
                style={styles.input}
                placeholder="Email"
                autoCapitalize="none"
                onChangeText={(text) => setEmail(text)}
            />

            <TextInput
                secureTextEntry
                value={password}
                style={styles.input}
                placeholder="Password"
                autoCapitalize="none"
                onChangeText={(text) => setPassword(text)}
            />

            {loading ? (
                <ActivityIndicator size="large" color="#4CAF50" style={styles.loadingIndicator} />
            ) : (
                <>
                    <TouchableOpacity style={styles.button} onPress={signIn}>
                        <Text style={styles.buttonText}>Login</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={goToAccountSelection}>
                        <Text style={styles.buttonText}>Create Account</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
};

export default Login;
