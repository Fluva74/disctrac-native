// StoreHome.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StoreStackParamList } from '../stacks/StoreStack';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts, LeagueSpartan_400Regular, LeagueSpartan_700Bold } from '@expo-google-fonts/league-spartan';
import ScreenTemplate from '../components/ScreenTemplate';
import { capitalizeUsername } from '../utils/stringUtils';

const { width } = Dimensions.get('window');
const QR_SIZE = width * 0.7;

type StoreNavigationProp = NativeStackNavigationProp<StoreStackParamList>;

const StoreHome = () => {
    const navigation = useNavigation<StoreNavigationProp>();
    const [storeName, setStoreName] = useState<string>('');
    const [fontsLoaded] = useFonts({
        LeagueSpartan_400Regular,
        LeagueSpartan_700Bold,
    });

    useEffect(() => {
        const fetchStoreData = async () => {
            const user = FIREBASE_AUTH.currentUser;
            if (user) {
                try {
                    const docRef = doc(FIREBASE_DB, 'stores', user.uid);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const storeData = docSnap.data();
                        setStoreName(capitalizeUsername(storeData.username) || 'Store');
                    }
                } catch (error) {
                    console.error('Error fetching store data:', error);
                    Alert.alert('Error', 'Failed to load store data.');
                }
            }
        };
        fetchStoreData();
    }, []);

    if (!fontsLoaded) {
        return null;
    }

    return (
        <ScreenTemplate>
            <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeText}>Welcome, {storeName}!</Text>
                <Text style={styles.subtitle}>Look Up Disc</Text>
            </View>

            {/* QR Code Circle */}
            <View style={styles.qrContainer}>
                <View style={styles.outerCircle}>
                    <View style={styles.innerCircle}>
                        <MaterialCommunityIcons 
                            name="qrcode" 
                            size={QR_SIZE * 0.5} 
                            color="rgba(68, 255, 161, 0.3)" 
                        />
                    </View>
                </View>
            </View>

            {/* Scan Button */}
            <LinearGradient
                colors={['#44FFA1', '#4D9FFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
            >
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('StoreAddDisc')}
                >
                    <Text style={styles.buttonText}>Scan QR Code</Text>
                </TouchableOpacity>
            </LinearGradient>
        </ScreenTemplate>
    );
};

const styles = StyleSheet.create({
    welcomeContainer: {
        marginTop: '22%',
        alignItems: 'center',
    },
    welcomeText: {
        fontFamily: 'LeagueSpartan_700Bold',
        fontSize: 40,
        color: '#FFFFFF',
        textAlign: 'center',
    },
    subtitle: {
        fontFamily: 'LeagueSpartan_400Regular',
        fontSize: 18,
        color: '#A1A1AA',
        textAlign: 'center',
    },
    qrContainer: {
        flex: .8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -10,
    },
    outerCircle: {
        width: QR_SIZE,
        height: QR_SIZE,
        borderRadius: QR_SIZE / 2,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerCircle: {
        width: QR_SIZE - 16,
        height: QR_SIZE - 16,
        borderRadius: (QR_SIZE - 16) / 2,
        borderWidth: 1,
        borderColor: '#44FFA1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonGradient: {
        borderRadius: 8,
        padding: 16,
        width: '60%',
        alignSelf: 'center',
    },
    button: {
        alignItems: 'center',
    },
    buttonText: {
        fontFamily: 'LeagueSpartan_700Bold',
        fontSize: 16,
        color: '#000000',
        textAlign: 'center',
    },
});

export default StoreHome;
