//file.StoreCreate.tsx

import React, { useState } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Import Picker
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import styles from '../styles';

// List of US states
const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const StoreCreate = () => {
    const [storeName, setStoreName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState(''); // State is initially empty
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const handleSubmit = async () => {
        if (!storeName || !email || !password || !confirmPassword || !city || !state) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
            const user = userCredential.user;

            await setDoc(doc(FIREBASE_DB, 'stores', user.uid), {
                uid: user.uid,
                storeName,
                email,
                city,
                state,
                role: 'store',
            });

            navigation.navigate('Inside', { screen: 'StoreHome' });
        } catch (error: any) {
            console.error('Registration Error: ', error);
            Alert.alert('Registration Error', error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.loginHeader}>Store Registration</Text>

            <TextInput
                placeholder="Store Name (Required)"
                style={styles.input}
                value={storeName}
                onChangeText={setStoreName}
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
                placeholder="City (Required)"
                style={styles.input}
                value={city}
                onChangeText={setCity}
            />

            {/* State Picker */}
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={state}
                    onValueChange={(itemValue) => setState(itemValue)}
                    style={styles.picker}
                >
                    <Picker.Item label="Select your state" value="" />
                    {states.map((stateCode) => (
                        <Picker.Item key={stateCode} label={stateCode} value={stateCode} />
                    ))}
                </Picker>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
        </View>
    );
};

export default StoreCreate;
