import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App'; // Adjust the path as needed
import styles from '../styles';

const AccountSelection = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>(); // Initialize navigation within component

    const goToPlayerCreate = () => {
        navigation.navigate('PlayerCreate');
    };

    const goToStoreCreate = () => {
        navigation.navigate('StoreCreate');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.loginHeader}>Choose Account Type</Text>
            
            <TouchableOpacity style={styles.button} onPress={goToPlayerCreate}>
                <Text style={styles.buttonText}>Player</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.button} onPress={goToStoreCreate}>
                <Text style={styles.buttonText}>Store</Text>
            </TouchableOpacity>
        </View>
    );
};

export default AccountSelection;
