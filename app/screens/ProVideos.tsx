//ProVideos.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Linking, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFonts, LeagueSpartan_400Regular, LeagueSpartan_700Bold } from '@expo-google-fonts/league-spartan';
import ScreenTemplate from '../components/ScreenTemplate';

const proLinks = [
    { name: 'Simon Lizotte', url: 'https://www.youtube.com/results?search_query=Simon+Lizotte+disc+golf' },
    { name: 'Eagle McMahon', url: 'https://www.youtube.com/results?search_query=Eagle+McMahon+disc+golf' },
    { name: 'Paul McBeth', url: 'https://www.youtube.com/results?search_query=Paul+McBeth+disc+golf' },
    { name: 'Brodie Smith', url: 'https://www.youtube.com/results?search_query=Brodie+Smith+disc+golf' },
    { name: 'Drew Gibson', url: 'https://www.youtube.com/results?search_query=Drew+Gibson+disc+golf' },
    { name: 'Ezra Aderhold', url: 'https://www.youtube.com/results?search_query=Ezra+Aderhold+disc+golf' },
    { name: 'Paige Pierce', url: 'https://www.youtube.com/results?search_query=Paige+Pierce+disc+golf' },
    { name: 'Nate Sexton', url: 'https://www.youtube.com/results?search_query=Nate+Sexton+disc+golf' },
    { name: 'Paul Ulibarri', url: 'https://www.youtube.com/results?search_query=Paul+Ulibarri+disc+golf' },
    { name: 'Kevin Jones', url: 'https://www.youtube.com/results?search_query=Kevin+Jones+disc+golf' },
    { name: 'James Conrad', url: 'https://www.youtube.com/results?search_query=James+Conrad+disc+golf' },
    { name: 'Ricky Wysocki', url: 'https://www.youtube.com/results?search_query=Ricky+Wysocki+disc+golf' },
    { name: 'Nikko Locastro', url: 'https://www.youtube.com/results?search_query=Nikko+Locastro+disc+golf' },
    { name: 'Chris Dickerson', url: 'https://www.youtube.com/results?search_query=Chris+Dickerson+disc+golf' },
    { name: 'Garrett Gurthie', url: 'https://www.youtube.com/results?search_query=Garrett+Gurthie+disc+golf' },
    { name: 'Hannah McBeth', url: 'https://www.youtube.com/results?search_query=Hannah+McBeth+disc+golf' },
    { name: 'Sarah Hokom', url: 'https://www.youtube.com/results?search_query=Sarah+Hokom+disc+golf' },
    { name: 'Jeremy Koling', url: 'https://www.youtube.com/results?search_query=Jeremy+Koling+disc+golf' },
    { name: 'Nate Doss', url: 'https://www.youtube.com/results?search_query=Nate+Doss+disc+golf' },
    { name: 'Valarie Jenkins', url: 'https://www.youtube.com/results?search_query=Valarie+Jenkins+disc+golf' }
];

const ProVideos = () => {
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
                <Text style={styles.title}>Pro Player Videos</Text>

                {/* Grid of Players */}
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.gridContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {proLinks.map((link, index) => (
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

export default ProVideos;