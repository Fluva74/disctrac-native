import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, Linking, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../FirebaseConfig';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { InsideStackParamList } from '../../App';

// Mapping colors to their respective image filenames
const colorToImageMap: { [key: string]: any } = {
    blue: require('../../assets/discBlue.png'),
    brown: require('../../assets/discBrown.png'),
    gray: require('../../assets/discGray.png'),
    green: require('../../assets/discGreen.png'),
    orange: require('../../assets/discOrange.png'),
    pink: require('../../assets/discPink.png'),
    purple: require('../../assets/discPurple.png'),
    red: require('../../assets/discRed.png'),
    white: require('../../assets/discWhite.png'),
    yellow: require('../../assets/discYellow.png'),
};

const Inventory = () => {
    const navigation = useNavigation<NavigationProp<InsideStackParamList>>();
    const [discs, setDiscs] = useState<any[]>([]);
    const [selectedDisc, setSelectedDisc] = useState<any | null>(null); // Updated to hold the selected disc object
    const [loading, setLoading] = useState(true);

    const fetchDiscs = async (userId: string) => {
        setLoading(true);
        try {
            const userDiscsRef = collection(FIREBASE_DB, 'userDiscs');
            const q = query(userDiscsRef, where('userId', '==', userId));
            const querySnapshot = await getDocs(q);

            const discsList = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));

            setDiscs(discsList);
        } catch (error) {
            console.error('Error fetching discs:', error);
            Alert.alert('Error', 'Could not load inventory.');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            const user = FIREBASE_AUTH.currentUser;
            if (user) {
                fetchDiscs(user.uid);
            }
        }, [])
    );

    const handleSelectDisc = (disc: any) => {
        setSelectedDisc(selectedDisc?.id === disc.id ? null : disc); // Toggle selection
    };

    const handleDeleteDisc = async (discId: string) => {
        Alert.alert(
            "Remove Disc",
            "Do you want to remove this disc from your inventory?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Yes",
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(FIREBASE_DB, "userDiscs", discId));
                            setDiscs((prevDiscs) => prevDiscs.filter((disc) => disc.id !== discId));
                            setSelectedDisc(null);
                        } catch (error) {
                            console.error("Error deleting disc:", error);
                            Alert.alert("Error", "Failed to remove disc.");
                        }
                    },
                },
            ]
        );
    };

    const handleWatchReviews = (company: string, mold: string) => {
        const searchQuery = `disc golf disc review: ${company} ${mold}`;
        const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
        Linking.openURL(youtubeUrl);
    };

    const navigateToHome = () => {
        navigation.navigate('PlayerHome');
    };

    const renderDisc = ({ item }: { item: any }) => {
        const isFoundByStore = item.status === "foundByStore"; // Check if the disc was found by the store

        return (
            <TouchableOpacity
                style={[
                    styles.row,
                    isFoundByStore && styles.foundRow // Apply red background for discs found by store
                ]}
                onPress={() => handleSelectDisc(item)}
            >
                <Text style={styles.cell}>{item.mold}</Text>
                <Text style={styles.cell}>{item.company}</Text>
                <Text style={styles.cell}>{item.color}</Text>
            </TouchableOpacity>
        );
    };

    const getDiscImage = (color: string) => {
        return colorToImageMap[color.toLowerCase()] || require('../../assets/discGray.png'); // Default to gray
    };

    return (
        <View style={styles.container}>
            <Text style={styles.welcomeText}>Inventory</Text>

            {loading ? (
                <ActivityIndicator size={40} color="#4CAF50" style={styles.loadingIndicator} />
            ) : discs.length === 0 ? (
                <Text style={styles.noDiscsText}>You have no discs in your bag.</Text>
            ) : (
                <View style={styles.table}>
                    <View style={styles.row}>
                        <Text style={styles.headerCell}>Mold</Text>
                        <Text style={styles.headerCell}>Company</Text>
                        <Text style={styles.headerCell}>Color</Text>
                    </View>

                    <FlatList
                        data={discs}
                        renderItem={renderDisc}
                        keyExtractor={(item) => item.id}
                    />
                </View>
            )}

            {selectedDisc && (
                <View style={styles.card}>
                    <Image
                        source={getDiscImage(selectedDisc.color)}
                        style={styles.discImage}
                    />
                    <Text style={styles.cardText}>Mold: {selectedDisc.mold}</Text>
                    <Text style={styles.cardText}>Company: {selectedDisc.company}</Text>
                    <Text style={styles.cardText}>Color: {selectedDisc.color}</Text>
                    <TouchableOpacity
                        style={styles.cardButton}
                        onPress={() => handleWatchReviews(selectedDisc.company, selectedDisc.mold)}
                    >
                        <Text style={styles.cardButtonText}>Watch Disc Reviews</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.cardButton}
                        onPress={() => handleDeleteDisc(selectedDisc.id)}
                    >
                        <Text style={styles.cardButtonText}>Remove Disc</Text>
                    </TouchableOpacity>
                </View>
            )}

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.button, styles.homeButton]} onPress={navigateToHome}>
                    <Text style={styles.buttonText}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AddDisc')}>
                    <Text style={styles.buttonText}>Add Disc</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

// Add the missing style for the card and other elements
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f4f8', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
    table: { width: '100%' },
    row: { flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderColor: '#ccc' },
    cell: { flex: 1, textAlign: 'center' },
    headerCell: { flex: 1, textAlign: 'center', fontWeight: 'bold' },
    buttonContainer: { flexDirection: 'row', marginTop: 20 },
    button: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 5, alignItems: 'center', margin: 5 },
    homeButton: { backgroundColor: '#2196F3' },
    buttonText: { color: '#FFF', fontWeight: 'bold' },
    loadingIndicator: { marginTop: 20 },
    noDiscsText: { textAlign: 'center', color: '#999' },
    welcomeText: { fontSize: 20, marginVertical: 20 },
    card: {
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        marginTop: 20,
        alignItems: 'center',
    },
    cardText: { fontSize: 16, marginBottom: 10 },
    cardButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 10,
    },
    cardButtonText: { color: '#FFF', fontWeight: 'bold' },
    foundRow: { backgroundColor: '#F8D7DA' }, // Red background for found by store discs
    discImage: { width: 100, height: 100, marginBottom: 10 }, // Style for the disc image
});

export default Inventory;
