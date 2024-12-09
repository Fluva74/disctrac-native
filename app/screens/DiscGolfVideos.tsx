import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { PlayerStackParamList } from '../stacks/PlayerStack';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, LeagueSpartan_400Regular, LeagueSpartan_700Bold } from '@expo-google-fonts/league-spartan';

const DiscGolfVideos = () => {
    const navigation = useNavigation<NavigationProp<PlayerStackParamList>>();
    const [fontsLoaded] = useFonts({
        LeagueSpartan_400Regular,
        LeagueSpartan_700Bold,
    });

    if (!fontsLoaded) {
        return null;
    }

    return (
        <LinearGradient
            colors={['transparent', 'transparent', 'rgba(59, 130, 246, 0.2)']}
            style={styles.container}
            locations={[0, 0.5, 1]}
        >
            {/* Logo Header */}
            <View style={styles.header}>
                <Text style={styles.logo}>disctrac</Text>
            </View>

            {/* Main Content */}
            <View style={styles.content}>
                <Text style={styles.title}>Disc Golf Videos</Text>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                        onPress={() => navigation.navigate('ProVideos')}
                        style={styles.buttonWrapper}
                    >
                        <LinearGradient
                            colors={['#44FFA1', '#4D9FFF']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.buttonGradient}
                        >
                            <Text style={styles.buttonText}>Pro Player Videos</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={() => navigation.navigate('AmateurVideos')}
                        style={styles.buttonWrapper}
                    >
                        <LinearGradient
                            colors={['#44FFA1', '#4D9FFF']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.buttonGradient}
                        >
                            <Text style={styles.buttonText}>Amateur Videos</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#09090B',
    },
    header: {
        paddingTop: 32,
        paddingHorizontal: 32,
    },
    logo: {
        fontFamily: 'LeagueSpartan_700Bold',
        fontSize: 32,
        textAlign: 'center',
        color: '#44FFA1',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        marginTop: '22%',
        alignItems: 'center',
    },
    title: {
        fontFamily: 'LeagueSpartan_700Bold',
        fontSize: 40,
        color: '#FFFFFF',
        marginTop: 60,

        marginBottom: 48,
        textAlign: 'center',
    },
    buttonContainer: {
        width: '100%',
        gap: 70,
        marginTop: 70,
    },
    buttonWrapper: {
        width: '100%',
    },
    buttonGradient: {
        borderRadius: 8,
        padding: 16,
    },
    buttonText: {
        fontFamily: 'LeagueSpartan_700Bold',
        color: '#000000',
        fontSize: 18,
        textAlign: 'center',
    },
});

export default DiscGolfVideos;
