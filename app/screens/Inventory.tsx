import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../FirebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { InsideStackParamList } from '../../App';
import styles from '../styles';

const Inventory = () => {
    const navigation = useNavigation<NavigationProp<InsideStackParamList>>();
    const [discs, setDiscs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Listen for authentication state changes to get the correct user ID
        const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
            if (user) {
                fetchDiscs(user.uid);  // Fetch discs for the current user
            } else {
                setDiscs([]);          // Clear discs when user logs out
            }
        });

        return () => unsubscribe(); // Clean up the listener on component unmount
    }, []);

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

    // Render a single disc item
    const renderDisc = ({ item }: { item: any }) => (
        <View style={styles.row}>
            <Text style={styles.cell}>{item.mold}</Text>
            <Text style={styles.cell}>{item.company}</Text>
            <Text style={styles.cell}>{item.color}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.loginHeader}>Inventory</Text>
            
            {loading ? (
                <Text>Loading...</Text>
            ) : discs.length === 0 ? (
                <Text style={styles.noDiscsText}>You have no discs in your bag.</Text>
            ) : (
                <View style={styles.table}>
                    {/* Table header */}
                    <View style={styles.row}>
                        <Text style={styles.headerCell}>Mold</Text>
                        <Text style={styles.headerCell}>Company</Text>
                        <Text style={styles.headerCell}>Color</Text>
                    </View>

                    {/* Table rows */}
                    <FlatList
                        data={discs}
                        renderItem={renderDisc}
                        keyExtractor={(item) => item.id}
                    />
                </View>
            )}

            {/* CTA to add a disc */}
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
