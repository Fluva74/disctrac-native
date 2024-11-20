import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { FIREBASE_DB } from '../../FirebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { InsideStackParamList } from '../../App';
// import styles from '../styles';

interface DiscData {
    id: string;
    uid: string;
    company: string;
    mold: string;
    color: string;
}

const StoreInventory = () => {
    const [inventory, setInventory] = useState<DiscData[]>([]);
    const navigation = useNavigation<NavigationProp<InsideStackParamList>>();

    const fetchStoreInventory = async () => {
        try {
            const storeInventoryRef = collection(FIREBASE_DB, 'storeInventory');
            const querySnapshot = await getDocs(storeInventoryRef);
            const discsList: DiscData[] = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as Omit<DiscData, 'id'>),
            }));
            setInventory(discsList);
        } catch (error) {
            console.error('Error fetching store inventory:', error);
            Alert.alert('Error', 'Could not load inventory.');
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchStoreInventory();
        }, [])
    );

    const renderDisc = ({ item }: { item: any }) => {
        const isNotified = item.status === "notifiedPlayer";
        return (
            <TouchableOpacity style={[styles.row, isNotified && styles.notifiedRow]}>
                <Text style={styles.cell}>{item.mold}</Text>
                <Text style={styles.cell}>{item.company}</Text>
                <Text style={styles.cell}>{item.color}</Text>
            </TouchableOpacity>
        );
    };
    

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Store Inventory</Text>

            <View style={styles.table}>
                <View style={styles.row}>
                    <Text style={styles.headerCell}>Mold</Text>
                    <Text style={styles.headerCell}>Company</Text>
                    <Text style={styles.headerCell}>Color</Text>
                </View>

                <FlatList
                    data={inventory}
                    renderItem={renderDisc}
                    keyExtractor={(item) => item.id}
                />
            </View>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('StoreAddDisc')}>
                <Text style={styles.buttonText}>Scan QR Code</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    table: { width: '100%' },
    row: { flexDirection: 'row', justifyContent: 'space-between', padding: 8 },
    cell: { flex: 1, textAlign: 'center' },
    headerCell: { flex: 1, textAlign: 'center', fontWeight: 'bold' },
    greenRow: { backgroundColor: '#4CAF50' },
    cameraContainer: { width: '100%', height: 300, justifyContent: 'center', alignItems: 'center' },
    camera: { width: '100%', height: '100%' },
    discContainer: { alignItems: 'center', padding: 16, marginTop: 20 },
    button: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 5, alignItems: 'center', marginTop: 10 },
    buttonText: { color: '#FFF', fontWeight: 'bold' },
    notifiedRow: { backgroundColor: '#DFF0D8' },
});

export default StoreInventory;
