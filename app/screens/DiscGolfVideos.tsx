import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { PlayerStackParamList } from '../stacks/PlayerStack';
import styles from '../styles';

const DiscGolfVideos = () => {
    const navigation = useNavigation<NavigationProp<PlayerStackParamList>>();

    return (
        <View style={styles.container}>
            <Text style={styles.welcomeText}>Disc Golf Videos</Text>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ProVideos')}>
                <Text style={styles.buttonText}>Pro Player Videos</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AmateurVideos')}>
                <Text style={styles.buttonText}>Amateur Videos</Text>
            </TouchableOpacity>
        </View>
    );
};

export default DiscGolfVideos;
