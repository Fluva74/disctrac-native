import { View, TextInput, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import styles from '../styles';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const auth = FIREBASE_AUTH;

    const signIn = async () => {
        setLoading(true);
        try {
            const response = await signInWithEmailAndPassword(auth, email, password);
            console.log(response);
            // alert('Check your emails!');
        } catch (error: any) {
            console.log(error);
            alert('Sign In failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const goToAccountSelection = () => {
        navigation.navigate('AccountSelection');
    };

    return (
        <View style={styles.container}>
            {/* Header text wrapped in <Text> */}
            <Text style={styles.loginHeader}>disctrac</Text> 
            
            {/* Email input */}
            <TextInput
                value={email}
                style={styles.input}
                placeholder="Email"
                autoCapitalize="none"
                onChangeText={(text) => setEmail(text)}
            />

            {/* Password input */}
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
                    {/* Replaced Button with TouchableOpacity and added <Text> inside */}
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
