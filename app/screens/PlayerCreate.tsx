import React, { useState } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { addDoc, collection } from 'firebase/firestore';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App'; 
import styles from '../styles';

const PlayerCreate = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [pdga, setPdga] = useState('');
    const navigation = useNavigation<NavigationProp<RootStackParamList>>(); // Typed navigation

    const handleSubmit = async () => {
        if (!firstName || !lastName || !email || !password || !confirmPassword || !city || !state) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        try {
            // Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
            const user = userCredential.user;

            // Add additional user data to Firestore
            await addDoc(collection(FIREBASE_DB, 'players'), {
                uid: user.uid,
                firstName,
                lastName,
                email,
                phone,
                city,
                state,
                pdga
            });

            // Navigate to PlayerHome after successful registration
            navigation.navigate('Inside', { screen: 'PlayerHome' });

        } catch (error: any) {
            console.error("Registration Error: ", error);
            Alert.alert('Registration Error', error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.loginHeader}>Player Registration</Text>
            
            <TextInput
                placeholder="First Name (Required)"
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
            />
            <TextInput
                placeholder="Last Name (Required)"
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
            />
            <TextInput
                placeholder="Email (Required)"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                placeholder="Password (Required)"
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TextInput
                placeholder="Confirm Password (Required)"
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
            />
            <TextInput
                placeholder="Phone Number (Optional)"
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
            />
            <TextInput
                placeholder="City (Required)"
                style={styles.input}
                value={city}
                onChangeText={setCity}
            />
            <TextInput
                placeholder="State (Required)"
                style={styles.input}
                value={state}
                onChangeText={setState}
            />
            <TextInput
                placeholder="PDGA# (Optional)"
                style={styles.input}
                value={pdga}
                onChangeText={setPdga}
                keyboardType="numeric"
            />

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
        </View>
    );
};

export default PlayerCreate;
