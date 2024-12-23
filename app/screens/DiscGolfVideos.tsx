import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { PlayerStackParamList } from '../stacks/PlayerStack';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, LeagueSpartan_400Regular, LeagueSpartan_700Bold } from '@expo-google-fonts/league-spartan';
import ScreenTemplate from '../components/ScreenTemplate';

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
        <ScreenTemplate>
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
        </ScreenTemplate>
    );
};

const styles = StyleSheet.create({
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
        marginBottom: 48,
        textAlign: 'center',
    },
    buttonContainer: {
        width: '100%',
        gap: 70,
        marginTop: 70,
        alignItems: 'center',
    },
    buttonWrapper: {
        width: '60%',
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
