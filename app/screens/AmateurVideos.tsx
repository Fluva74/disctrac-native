//AmateurVideos.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Linking, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFonts, LeagueSpartan_400Regular, LeagueSpartan_700Bold } from '@expo-google-fonts/league-spartan';
import ScreenTemplate from '../components/ScreenTemplate';

const amateurLinks = [
    { name: 'bhirdietime disc golf', url: 'https://www.youtube.com/results?search_query=bhirdietime+disc+golf' },
    { name: 'Overthrow Disc Golf', url: 'https://www.youtube.com/results?search_query=Overthrow+Disc+Golf' },
    { name: 'Trash Panda Disc Golf', url: 'https://www.youtube.com/results?search_query=Trash+Panda+Disc+Golf' },
    { name: 'Robbie C Disc Golf', url: 'https://www.youtube.com/results?search_query=Robbie+C+Disc+Golf' },
    { name: 'Danny Lindahl', url: 'https://www.youtube.com/results?search_query=Danny+Lindahl+disc+golf' },
    { name: 'Disc Golf Nerd', url: 'https://www.youtube.com/results?search_query=Disc+Golf+Nerd' },
    { name: 'Ben\'s Big Drive', url: 'https://www.youtube.com/results?search_query=Ben%27s+Big+Drive+disc+golf' },
    { name: 'Sling Shot Disc Golf', url: 'https://www.youtube.com/results?search_query=Sling+Shot+Disc+Golf' },
    { name: 'Disc Golf Examiner', url: 'https://www.youtube.com/results?search_query=Disc+Golf+Examiner' },
    { name: 'Disc Golf Strong', url: 'https://www.youtube.com/results?search_query=Disc+Golf+Strong' },
    { name: 'IceBerg TV', url: 'https://www.youtube.com/results?search_query=IceBerg+TV+disc+golf' },
    { name: 'Michael Holt - Disc Golf', url: 'https://www.youtube.com/results?search_query=Michael+Holt+Disc+Golf' },
    { name: 'Huck with Hofstra', url: 'https://www.youtube.com/results?search_query=Huck+with+Hofstra' },
    { name: 'Disc Golf Kid', url: 'https://www.youtube.com/results?search_query=Disc+Golf+Kid' },
    { name: 'JustDisc - JD', url: 'https://www.youtube.com/results?search_query=JustDisc' },
    { name: 'Nick Carroll', url: 'https://www.youtube.com/results?search_query=Nick+Carroll+disc+golf' },
    { name: 'Deep Roots Disc Golf', url: 'https://www.youtube.com/results?search_query=Deep+Roots+Disc+Golf' },
    { name: 'Three Decent AMs', url: 'https://www.youtube.com/results?search_query=Three+Decent+AMs' },
    { name: 'Disc and Balls Golf Channel', url: 'https://www.youtube.com/results?search_query=Disc+and+Balls+Golf+Channel' },
    { name: 'Miss Frisbees', url: 'https://www.youtube.com/results?search_query=Miss+Frisbees+disc+golf' }
];

const AmateurVideos = () => {
    const navigation = useNavigation();
    const [fontsLoaded] = useFonts({
        LeagueSpartan_400Regular,
        LeagueSpartan_700Bold,
    });

    const openLink = async (url: string) => {
        try {
            await Linking.openURL(url);
        } catch (error) {
            Alert.alert('Error', 'Failed to open link. Please try again.');
        }
    };

    if (!fontsLoaded) {
        return null;
    }

    return (
        <ScreenTemplate>
            <View style={styles.content}>
                <Text style={styles.title}>Amateur Videos</Text>

                {/* Grid of Players */}
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.gridContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {amateurLinks.map((link, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.gridItem}
                            onPress={() => openLink(link.url)}
                        >
                            <LinearGradient
                                colors={['rgba(68, 255, 161, 0.1)', 'rgba(77, 159, 255, 0.1)']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gridItemGradient}
                            >
                                <View style={styles.iconContainer}>
                                    <MaterialCommunityIcons 
                                        name="youtube" 
                                        size={20} 
                                        color="#44FFA1" 
                                    />
                                </View>
                                <Text style={styles.playerName}>{link.name}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </ScreenTemplate>
    );
};

const styles = StyleSheet.create({
    content: {
        flex: 1,
        paddingHorizontal: 16,
        marginTop: '22%',
    },
    title: {
        fontFamily: 'LeagueSpartan_700Bold',
        fontSize: 40,
        color: '#FFFFFF',
        marginBottom: 32,
        paddingHorizontal: 8,
    },
    scrollView: {
        flex: 1,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingBottom: 80,
    },
    gridItem: {
        width: '48%',
        marginBottom: 12,
    },
    gridItemGradient: {
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(68, 255, 161, 0.2)',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(68, 255, 161, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    playerName: {
        fontFamily: 'LeagueSpartan_400Regular',
        fontSize: 14,
        color: '#E4E4E7',
        textAlign: 'center',
    },
});

export default AmateurVideos;
