import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Linking, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { InsideStackParamList } from '../../App';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const PlayerHome = () => {
    const navigation = useNavigation<NavigationProp<InsideStackParamList>>();
    const [firstName, setFirstName] = useState<string>('Guest');

    useEffect(() => {
        const fetchUserData = async () => {
            const user = FIREBASE_AUTH.currentUser;
            if (user) {
                try {
                    const docRef = doc(FIREBASE_DB, 'players', user.uid);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        setFirstName(userData.firstName || 'Guest');
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    Alert.alert('Error', 'Failed to load user data.');
                }
            }
        };
        fetchUserData();
    }, []);

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
            console.error('Failed to open URL:', err);
            Alert.alert('Error', 'Failed to open link. Please try again.');
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.welcomeText}>Welcome, {firstName}!</Text>

            <View style={styles.gridContainer}>
                <TouchableOpacity
                    style={styles.gridButton}
                    onPress={() => navigation.navigate('Inventory')}
                >
                    <Text style={styles.gridText}>Inventory</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.gridButton}
                    onPress={() => navigation.navigate('DiscGolfVideos')}
                >
                    <Text style={styles.gridText}>Videos</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.gridButton}
                    onPress={() => openLink('https://www.pdga.com/tour/event/advanced')}
                >
                    <Text style={styles.gridText}>Upcoming Tournaments</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.gridButton}
                    onPress={() => openLink('https://udisc.com/courses')}
                >
                    <Text style={styles.gridText}>Nearby Courses</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.gridButton}
                    onPress={() => openLink('https://www.pdga.com/news')}
                >
                    <Text style={styles.gridText}>PDGA News</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.gridButton}
                    onPress={() => openLink('https://www.discstore.com/')}
                >
                    <Text style={styles.gridText}>Shop Gear</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.gridButton}
                    onPress={() => openLink('https://www.weather.com/')}
                >
                    <Text style={styles.gridText}>Weather Forecast</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.gridButton}
                    onPress={() => navigation.navigate('ColorChanger')}
                >
                    <Text style={styles.gridText}>Color Changer</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1E1E1E', // Same as the login screen background color
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center', // Center content vertically
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginBottom: 10, // Reduced spacing below title
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 20, // Reduced spacing below grid
    },
    gridButton: {
        backgroundColor: '#2E2E2E',
        width: 140,
        height: 90,
        margin: 10, // Slightly reduced spacing between buttons
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gridText: {
        color: '#FFFFFF',
        fontSize: 16,
        textAlign: 'center',
    },
    signOutButton: {
        backgroundColor: '#4CAF50', // Same color as the login button
        borderRadius: 10,
        padding: 15,
        width: '80%',
        alignItems: 'center',
        marginTop: 20, // Adds spacing above the sign out button
    },
    signOutText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});


export default PlayerHome;
