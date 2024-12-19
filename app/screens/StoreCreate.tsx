//file.StoreCreate.tsx

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Alert, 
  TouchableOpacity, 
  StyleSheet,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { doc, setDoc, collection, query, where, getDocs, getDoc } from 'firebase/firestore';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import ScreenTemplate from '../components/ScreenTemplate';
import { Input } from '../components/Input';
import { Ionicons } from '@expo/vector-icons';

const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const StoreCreate = () => {
    const [storeName, setStoreName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [isStateModalVisible, setIsStateModalVisible] = useState(false);
    const [stateSearch, setStateSearch] = useState('');
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const checkUsernameAvailability = async (username: string) => {
        // Check stores collection
        const storesRef = collection(FIREBASE_DB, 'stores');
        const storesQuery = query(storesRef, where('username', '==', username.toLowerCase()));
        const storesSnapshot = await getDocs(storesQuery);

        // Check players collection
        const playersRef = collection(FIREBASE_DB, 'players');
        const playersQuery = query(playersRef, where('username', '==', username.toLowerCase()));
        const playersSnapshot = await getDocs(playersQuery);

        return storesSnapshot.empty && playersSnapshot.empty;
    };

    const handleSubmit = async () => {
        try {
            console.log('=== Store Creation Process ===');
            console.log('Starting store creation with data:', {
                storeName,
                username,
                email,
                city,
                state
            });

            // Validation checks
            if (!storeName || !username || !email || !password || !confirmPassword || !city || !state) {
                Alert.alert('Error', 'Please fill all required fields');
                return;
            }

            if (password !== confirmPassword) {
                Alert.alert('Error', 'Passwords do not match');
                return;
            }

            console.log('Checking username availability...');
            const isUsernameAvailable = await checkUsernameAvailability(username);
            if (!isUsernameAvailable) {
                Alert.alert('Error', 'Username is already taken');
                return;
            }

            console.log('Creating Firebase auth account...');
            const userCredential = await createUserWithEmailAndPassword(
                FIREBASE_AUTH, 
                email, 
                password
            );
            console.log('Auth account created:', userCredential.user.uid);

            const storeData = {
                uid: userCredential.user.uid,
                storeName,
                username: username.toLowerCase(),
                email,
                city,
                state,
                role: 'store',
                createdAt: new Date().toISOString(),
            };

            console.log('Creating store document:', {
                path: `stores/${userCredential.user.uid}`,
                data: storeData
            });

            const storeRef = doc(FIREBASE_DB, 'stores', userCredential.user.uid);
            await setDoc(storeRef, storeData);

            // Verify creation
            const verifyDoc = await getDoc(storeRef);
            console.log('Store document created:', {
                exists: verifyDoc.exists(),
                data: verifyDoc.data()
            });

            console.log('Navigating to StoreStack');

            // After successful store creation
            console.log('=== Store Creation ===');
            console.log('Created store with ID:', userCredential.user.uid);
            console.log('Navigating to:', 'StoreStack');
            navigation.reset({
                index: 0,
                routes: [{ 
                    name: 'StoreStack'
                }]
            });

        } catch (error: any) {
            console.error('Registration Error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            console.error('Full error object:', JSON.stringify(error, null, 2));

            if (error.code === 'auth/email-already-in-use') {
                Alert.alert('Error', 'This email is already registered.');
            } else if (error.code === 'auth/invalid-email') {
                Alert.alert('Error', 'Invalid email address.');
            } else if (error.code === 'auth/weak-password') {
                Alert.alert('Error', 'Password should be at least 6 characters.');
            } else {
                Alert.alert(
                    'Error', 
                    `Failed to create account: ${error.message || 'Unknown error'}`
                );
            }
        }
    };

    const filteredStates = states.filter(stateCode => 
        stateCode.toLowerCase().includes(stateSearch.toLowerCase())
    );

    return (
        <LinearGradient
            colors={['transparent', 'transparent', 'rgba(59, 130, 246, 0.2)']}
            style={styles.container}
            locations={[0, 0.5, 1]}
        >
            <View style={styles.header}>
                <Text style={styles.logo}>disctrac</Text>
                <Text style={styles.title}>Store Sign Up</Text>
            </View>

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
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Store Name*</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter store name"
                            placeholderTextColor="#666666"
                            value={storeName}
                            onChangeText={setStoreName}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email*</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter email"
                            placeholderTextColor="#666666"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password*</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter password"
                            placeholderTextColor="#666666"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Confirm Password*</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm password"
                            placeholderTextColor="#666666"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>City*</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter city"
                            placeholderTextColor="#666666"
                            value={city}
                            onChangeText={setCity}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>State*</Text>
                        <TouchableOpacity
                            style={styles.input}
                            onPress={() => setIsStateModalVisible(true)}
                        >
                            <Text style={[
                                styles.inputText,
                                !state && styles.placeholderText
                            ]}>
                                {state || "Select your state"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <LinearGradient
                        colors={['#44FFA1', '#4D9FFF']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradient}
                    >
                        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                            <Text style={styles.buttonText}>Sign Up</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>
            </ScrollView>

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
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.stateItem}
                                    onPress={() => {
                                        setState(item);
                                        setIsStateModalVisible(false);
                                        setStateSearch('');
                                    }}
                                >
                                    <Text style={styles.stateName}>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
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
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#27272A',
    },
    stateName: {
        fontFamily: 'LeagueSpartan_400Regular',
        fontSize: 16,
        color: '#FFFFFF',
    },
});

export default StoreCreate;
