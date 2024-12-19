// StoreHome.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { InsideStackParamList } from '../../App';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenTemplate from '../components/ScreenTemplate';

const { width } = Dimensions.get('window');
const QR_SIZE = width * 0.7;

const StoreHome = () => {
    console.log('=== Store Home Screen ===');
    const navigation = useNavigation<NavigationProp<InsideStackParamList>>();
    const [storeName, setStoreName] = useState('');

    useEffect(() => {
        const fetchStoreData = async () => {
            console.log('Fetching store data...');
            const user = FIREBASE_AUTH.currentUser;
            console.log('Current user:', user?.uid);

            if (user) {
                try {
                    const storeRef = doc(FIREBASE_DB, 'stores', user.uid);
                    console.log('Fetching from path:', `stores/${user.uid}`);
                    
                    const storeDoc = await getDoc(storeRef);
                    console.log('Store document:', {
                        exists: storeDoc.exists(),
                        data: storeDoc.data()
                    });
                    
                    if (storeDoc.exists()) {
                        const data = storeDoc.data();
                        setStoreName(data.storeName || '');
                        console.log('Store name set to:', data.storeName);
                    }
                } catch (error) {
                    console.error('Error in store data fetch:', error);
                }
            }
        };

        fetchStoreData();
    }, []);

    return (
        <ScreenTemplate>
            <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeText}>Welcome,</Text>
                <Text style={styles.storeName}>{storeName}</Text>
            </View>

            {/* Stats Section */}
            <View style={styles.statsContainer}>
                <LinearGradient
                    colors={['rgba(68, 255, 161, 0.1)', 'rgba(77, 159, 255, 0.1)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.statsGradient}
                >
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>127</Text>
                        <Text style={styles.statLabel}>Discs Scanned</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>23</Text>
                        <Text style={styles.statLabel}>Owners Found</Text>
                    </View>
                </LinearGradient>
            </View>

            {/* Quick Actions */}
            <View style={styles.actionsContainer}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionButtons}>
                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('StoreScan' as never)}
                    >
                        <LinearGradient
                            colors={['rgba(68, 255, 161, 0.1)', 'rgba(77, 159, 255, 0.1)']}
                            style={styles.actionGradient}
                        >
                            <MaterialCommunityIcons name="qrcode-scan" size={32} color="#44FFA1" />
                            <Text style={styles.actionText}>Scan Disc</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('StoreInventory' as never)}
                    >
                        <LinearGradient
                            colors={['rgba(68, 255, 161, 0.1)', 'rgba(77, 159, 255, 0.1)']}
                            style={styles.actionGradient}
                        >
                            <MaterialCommunityIcons name="disc" size={32} color="#44FFA1" />
                            <Text style={styles.actionText}>View Inventory</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Recent Activity Section */}
            <View style={styles.recentContainer}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                {/* Add recent activity items here */}
            </View>
        </ScreenTemplate>
    );
};

const styles = StyleSheet.create({
    welcomeContainer: {
        marginTop: '22%',
        marginBottom: 32,
    },
    welcomeText: {
        fontFamily: 'LeagueSpartan_700Bold',
        fontSize: 40,
        color: '#FFFFFF',
        textAlign: 'center',
    },
    storeName: {
        fontFamily: 'LeagueSpartan_700Bold',
        fontSize: 40,
        color: '#44FFA1',
        textAlign: 'center',
    },
    statsContainer: {
        width: '100%',
        marginBottom: 32,
    },
    statsGradient: {
        flexDirection: 'row',
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(68, 255, 161, 0.2)',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontFamily: 'LeagueSpartan_700Bold',
        fontSize: 32,
        color: '#FFFFFF',
        marginBottom: 4,
    },
    statLabel: {
        fontFamily: 'LeagueSpartan_400Regular',
        fontSize: 14,
        color: '#A1A1AA',
    },
    statDivider: {
        width: 1,
        backgroundColor: 'rgba(68, 255, 161, 0.2)',
        marginHorizontal: 16,
    },
    actionsContainer: {
        width: '100%',
        marginBottom: 32,
    },
    sectionTitle: {
        fontFamily: 'LeagueSpartan_700Bold',
        fontSize: 24,
        color: '#FFFFFF',
        marginBottom: 16,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 16,
    },
    actionButton: {
        flex: 1,
    },
    actionGradient: {
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(68, 255, 161, 0.2)',
    },
    actionText: {
        fontFamily: 'LeagueSpartan_400Regular',
        fontSize: 16,
        color: '#FFFFFF',
        marginTop: 8,
    },
    recentContainer: {
        width: '100%',
    },
});

export default StoreHome;
