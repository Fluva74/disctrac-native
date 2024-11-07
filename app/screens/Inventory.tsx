import React, { useEffect, useState, useCallback  } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../FirebaseConfig';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { InsideStackParamList } from '../../App';

import styles from '../styles';

const Inventory = () => {
    const navigation = useNavigation<NavigationProp<InsideStackParamList>>();
    const [discs, setDiscs] = useState<any[]>([]);
    const [selectedDiscId, setSelectedDiscId] = useState<string | null>(null); // Track selected disc
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

            setDiscs(discsList); // Update discs state to display on the page
        } catch (error) {
            console.error('Error fetching discs:', error);
            Alert.alert('Error', 'Could not load inventory.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch discs whenever the screen is focused
    useFocusEffect(
        useCallback(() => {
            const user = FIREBASE_AUTH.currentUser;
            if (user) {
                fetchDiscs(user.uid);
            }
        }, [])
    );

    const handleSelectDisc = (discId: string) => {
        setSelectedDiscId(discId === selectedDiscId ? null : discId); // Toggle selection
    };

    const handleDeleteDisc = async (discId: string) => {
        Alert.alert(
            "Remove Disc",
            "Do you want to remove this disc from your inventory?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Yes",
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(FIREBASE_DB, "userDiscs", discId));
                            setDiscs((prevDiscs) => prevDiscs.filter((disc) => disc.id !== discId)); // Remove disc from state
                            setSelectedDiscId(null);
                            Alert.alert("Success", "Disc removed from inventory.");
                        } catch (error) {
                            console.error("Error deleting disc:", error);
                            Alert.alert("Error", "Failed to remove disc.");
                        }
                    },
                },
            ]
        );
    };

    const renderDisc = ({ item }: { item: any }) => {
        const isSelected = item.id === selectedDiscId;
        return (
            <TouchableOpacity
                style={[styles.row, isSelected && styles.selectedRow]}
                onPress={() => handleSelectDisc(item.id)}
            >
                <Text style={styles.cell}>{item.mold}</Text>
                <Text style={styles.cell}>{item.company}</Text>
                <Text style={styles.cell}>{item.color}</Text>

                {isSelected && (
                    <TouchableOpacity onPress={() => handleDeleteDisc(item.id)}>
                        <Text style={styles.trashText}>Trash</Text>
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.welcomeText}>Inventory</Text>

            {loading ? (
                <Text>Loading...</Text>
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

            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('AddDisc')}
            >
                <Text style={styles.buttonText}>Add Disc</Text>
            </TouchableOpacity>
        </View>
    );
};

export default Inventory;