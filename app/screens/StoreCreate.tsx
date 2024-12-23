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
import { createUserWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { doc, setDoc, collection, query, where, getDocs, getDoc, limit } from 'firebase/firestore';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import ScreenTemplate from '../components/ScreenTemplate';
import { Input } from '../components/Input';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { formatPhoneNumber } from '../utils/stringUtils';

const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const StoreCreate = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [storeName, setStoreName] = useState('');
    const [phone, setPhone] = useState('');
    const [website, setWebsite] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [holdTime, setHoldTime] = useState('3');
    const [isStateModalVisible, setIsStateModalVisible] = useState(false);
    const [stateSearch, setStateSearch] = useState('');
    const [showHoldTimeTooltip, setShowHoldTimeTooltip] = useState(false);
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const checkUsernameAvailability = async (username: string) => {
        try {
            // Check players collection
            const playerQuery = query(
                collection(FIREBASE_DB, 'players'),
                where('username', '==', username.toLowerCase()),
                limit(1)
            );
            const playerSnapshot = await getDocs(playerQuery);

            // Check stores collection
            const storeQuery = query(
                collection(FIREBASE_DB, 'stores'),
                where('username', '==', username.toLowerCase()),
                limit(1)
            );
            const storeSnapshot = await getDocs(storeQuery);

            return playerSnapshot.empty && storeSnapshot.empty;
        } catch (error) {
            console.error('Error checking username availability:', error);
            throw error;
        }
    };

    const handleSubmit = async () => {
        try {
            console.log('=== Store Creation Process ===');
            console.log('Starting store creation with data:', {
                storeName,
                username,
                email,
                phone,
                city,
                state
            });

            // Validation checks
            if (!username || !email || !password || !confirmPassword) {
                Alert.alert('Error', 'Please fill all account fields');
                return;
            }

            if (!storeName || !address || !city || !state || !holdTime || !phone) {
                Alert.alert('Error', 'Please fill all required store details');
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
                username: username.toLowerCase(),
                email,
                storeName,
                phone,
                website,
                address,
                city,
                state,
                holdTime: parseInt(holdTime),
                role: 'store',
                createdAt: new Date().toISOString(),
                contactPreferences: {
                    email: true,
                    phone: false,
                    inApp: true,
                },
            };

            console.log('Creating store document:', {
                path: `stores/${userCredential.user.uid}`,
                data: storeData
            });

            const storeRef = doc(FIREBASE_DB, 'stores', userCredential.user.uid);
            await setDoc(storeRef, storeData);

            // Verify creation
            const verifyDoc = await getDoc(storeRef);
            if (!verifyDoc.exists()) {
                throw new Error('Failed to create store document');
            }

            // Wait a moment for the document to be fully created
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Force reload auth to update claims
            await FIREBASE_AUTH.currentUser?.reload();
            
            // Navigate to store stack
            navigation.reset({
                index: 0,
                routes: [{ name: 'StoreStack' }],
            });

        } catch (error) {
            console.error('Registration Error:', error);
            Alert.alert('Error', 'Failed to create store account. Please try again.');
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
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Account Details</Text>
                        
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
                            <Text style={styles.label}>Email*</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter email"
                                placeholderTextColor="#A1A1AA"
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
                                placeholderTextColor="#A1A1AA"
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
                                placeholderTextColor="#A1A1AA"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                            />
                        </View>
                    </View>

                    <View style={[styles.section, styles.storeSection]}>
                        <Text style={styles.sectionTitle}>Store Details</Text>
                        <Text style={styles.sectionSubtitle}>All fields required</Text>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Store Name*</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter store name"
                                placeholderTextColor="#A1A1AA"
                                value={storeName}
                                onChangeText={setStoreName}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Phone*</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter phone number"
                                placeholderTextColor="#A1A1AA"
                                value={phone}
                                onChangeText={(text) => {
                                    // Only allow numeric input
                                    const numericOnly = text.replace(/[^\d]/g, '');
                                    // Format as user types
                                    const formattedPhone = formatPhoneNumber(numericOnly);
                                    setPhone(formattedPhone);
                                }}
                                keyboardType="phone-pad"
                                maxLength={12} // Account for the two hyphens
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Store Address*</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter store address"
                                placeholderTextColor="#A1A1AA"
                                value={address}
                                onChangeText={setAddress}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>City*</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter city"
                                placeholderTextColor="#A1A1AA"
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

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Website</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter website URL (optional)"
                                placeholderTextColor="#A1A1AA"
                                value={website}
                                onChangeText={setWebsite}
                                keyboardType="url"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <View style={styles.labelRow}>
                                <Text style={styles.label}>Hold Time (Days)*</Text>
                                <TouchableOpacity 
                                    onPress={() => setShowHoldTimeTooltip(true)}
                                    style={styles.tooltipButton}
                                >
                                    <MaterialCommunityIcons 
                                        name="information" 
                                        size={20} 
                                        color="#44FFA1" 
                                    />
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter hold time in days"
                                placeholderTextColor="#A1A1AA"
                                value={holdTime}
                                onChangeText={setHoldTime}
                                keyboardType="numeric"
                            />
                            <Text style={styles.helpText}>
                                This can be changed later in store settings
                            </Text>
                        </View>
                    </View>

                    <LinearGradient
                        colors={['#44FFA1', '#4D9FFF']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradient}
                    >
                        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                            <Text style={styles.buttonText}>Create Store Account</Text>
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

            <Modal
                visible={showHoldTimeTooltip}
                animationType="fade"
                transparent={true}
            >
                <TouchableOpacity 
                    style={styles.tooltipModal}
                    activeOpacity={1}
                    onPress={() => setShowHoldTimeTooltip(false)}
                >
                    <View style={styles.tooltipContent}>
                        <Text style={styles.tooltipTitle}>Hold Time</Text>
                        <Text style={styles.tooltipText}>
                            This is the number of days your store will hold a disc after notifying its owner. 
                            After this period, if the owner hasn't claimed their disc, it will be automatically released.
                        </Text>
                        <TouchableOpacity 
                            style={styles.tooltipButton}
                            onPress={() => setShowHoldTimeTooltip(false)}
                        >
                            <Text style={styles.tooltipButtonText}>Got it</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
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
    section: {
        marginBottom: 32,
    },
    storeSection: {
        borderWidth: 1,
        borderColor: 'rgba(68, 255, 161, 0.2)',
        borderRadius: 12,
        padding: 16,
    },
    sectionTitle: {
        fontFamily: 'LeagueSpartan_700Bold',
        fontSize: 20,
        color: '#44FFA1',
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontFamily: 'LeagueSpartan_400Regular',
        fontSize: 14,
        color: '#A1A1AA',
        marginBottom: 16,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    tooltipButton: {
        padding: 4,
    },
    helpText: {
        fontFamily: 'LeagueSpartan_400Regular',
        fontSize: 12,
        color: '#A1A1AA',
        marginTop: 4,
    },
    tooltipModal: {
        flex: 1,
        backgroundColor: 'rgba(9, 9, 11, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    tooltipContent: {
        backgroundColor: '#18181B',
        borderRadius: 12,
        padding: 16,
        width: '90%',
        maxWidth: 400,
        borderWidth: 1,
        borderColor: '#44FFA1',
    },
    tooltipTitle: {
        fontFamily: 'LeagueSpartan_700Bold',
        fontSize: 18,
        color: '#44FFA1',
        marginBottom: 8,
    },
    tooltipText: {
        fontFamily: 'LeagueSpartan_400Regular',
        fontSize: 14,
        color: '#FFFFFF',
        marginBottom: 16,
        lineHeight: 20,
    },
    tooltipButtonText: {
        fontFamily: 'LeagueSpartan_700Bold',
        fontSize: 16,
        color: '#44FFA1',
        textAlign: 'center',
    },
});

export default StoreCreate;
