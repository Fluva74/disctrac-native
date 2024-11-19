// PlayerHome.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Linking, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { InsideStackParamList } from '../../App';
import { signOut } from 'firebase/auth';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
// import styles from '../styles';

const PlayerHome = () => {
    const navigation = useNavigation<NavigationProp<InsideStackParamList>>();
    const [firstName, setFirstName] = useState<string>('');

    useEffect(() => {
        const fetchUserData = async () => {
            const user = FIREBASE_AUTH.currentUser;
            if (user) {
                console.log("User UID:", user.uid);
                try {
                    const docRef = doc(FIREBASE_DB, 'players', user.uid);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        console.log("User Data from Firestore:", userData);
                        setFirstName(userData.firstName || 'Guest');
                    } else {
                        console.log('No document found for this user UID in Firestore.');
                        setFirstName('Guest');
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    Alert.alert('Error', 'Failed to load user data.');
                    setFirstName('Guest');
                }
            } else {
                console.log("No user is logged in.");
                setFirstName('Guest');
            }
        };
        fetchUserData();
    }, [firstName]);

    const handleSignOut = async () => {
        try {
            await FIREBASE_AUTH.signOut();
            (navigation as any).reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        } catch (error) {
            console.error('Error signing out:', error);
            Alert.alert('Error', 'Failed to sign out. Please try again.');
        }
    };

    const openLink = (url: string) => {
        Linking.openURL(url).catch((err) => {
            console.error("Failed to open URL:", err);
            Alert.alert("Error", "Failed to open link. Please try again.");
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.welcomeText}>Welcome, {firstName}!</Text>
            
            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('Inventory')}
            >
                <Text style={styles.buttonText}>Inventory</Text>
            </TouchableOpacity>
            
            {/* Directly navigate to DiscGolfVideos */}
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('DiscGolfVideos')}>
                <Text style={styles.buttonText}>Videos</Text>
            </TouchableOpacity>

            {/* Links */}
            <TouchableOpacity
                style={styles.button}
                onPress={() => openLink('https://www.pdga.com/tour/event/advanced')}
            >
                <Text style={styles.buttonText}>Upcoming Tournaments</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => openLink('https://udisc.com/courses')}
            >
                <Text style={styles.buttonText}>Find Nearby Courses</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => openLink('https://www.pdga.com/news')}
            >
                <Text style={styles.buttonText}>PDGA News</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => openLink('https://www.discstore.com/')}
            >
                <Text style={styles.buttonText}>Shop Disc Golf Gear</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => openLink('https://www.weather.com/')}
            >
                <Text style={styles.buttonText}>Weather Forecast</Text>
            </TouchableOpacity>

            {/* Button to navigate to TestAutoCompleteDropdown */}
            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('TestAutoCompleteDropdown')}
            >
                <Text style={styles.buttonText}>Test Autocomplete</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={handleSignOut}
            >
                <Text style={styles.buttonText}>Sign Out</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 20,
    },
    inputContainer: {
      width: '80%',
    },
    suggestionsContainer: {
      backgroundColor: '#FFF',
      borderColor: '#4CAF50',
      borderWidth: 1,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        width: '80%',
        marginVertical: 5,
    },
    buttonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
  });

export default PlayerHome;
