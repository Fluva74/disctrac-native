import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { StoreStackParamList } from '../../app/stacks/StoreStack';
import styles from '../styles';

const StoreHome = () => {
    const navigation = useNavigation<NavigationProp<StoreStackParamList>>();

    return (
        <View style={styles.container}>
            <Text style={styles.welcomeText}>Welcome, Store Owner!</Text>
            
            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('StoreInventory')}
            >
                <Text style={styles.buttonText}>Inventory</Text>
            </TouchableOpacity>
        </View>
    );
};

export default StoreHome;
