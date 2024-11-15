// Inventory.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, Linking, ActivityIndicator } from 'react-native';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../FirebaseConfig';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { InsideStackParamList } from '../../App';
import { FontAwesome } from '@expo/vector-icons';
import styles from '../styles';

const Inventory = () => {
    const navigation = useNavigation<NavigationProp<InsideStackParamList>>();
    const [discs, setDiscs] = useState<any[]>([]);
    const [selectedDiscId, setSelectedDiscId] = useState<string | null>(null);
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

    const handleSelectDisc = (discId: string) => {
        setSelectedDiscId(discId === selectedDiscId ? null : discId);
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
                            setSelectedDiscId(null);
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
        const isSelected = item.id === selectedDiscId;
        return (
            <TouchableOpacity
                style={[styles.row, isSelected && styles.selectedRow]}
                onPress={() => handleSelectDisc(item.id)}
            >
                <Text style={[styles.cell, isSelected && styles.selectedRowText]}>{item.mold}</Text>
                <Text style={[styles.cell, isSelected && styles.selectedRowText]}>{item.company}</Text>
                <Text style={[styles.cell, isSelected && styles.selectedRowText]}>{item.color}</Text>
                
                {isSelected && (
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity onPress={() => handleDeleteDisc(item.id)} style={styles.actionButton}>
                            <FontAwesome name="trash" size={20} style={styles.trashIcon} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleWatchReviews(item.company, item.mold)} style={styles.actionButton}>
                            <Text style={styles.watchReviewsText}>Watch Disc Reviews</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.welcomeText}>Inventory</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#4CAF50" style={styles.loadingIndicator} />
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

export default Inventory;
