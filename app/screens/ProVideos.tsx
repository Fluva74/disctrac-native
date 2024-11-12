import React from 'react';
import { View, ScrollView, Text, TouchableOpacity, Linking, Alert } from 'react-native';
import VideoGrid from './VideoGrid';
import styles from '../styles';

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
    const openLink = (url: string) => {
        Linking.openURL(url).catch(() =>
            Alert.alert("Error", "Failed to open link. Please try again.")
        );
    };
    return (
        <View style={styles.container}>
            <Text style={styles.header}>Pro Player Videos</Text>
            <View style={styles.gridContainer}>
                {proLinks.map((link, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.gridItem}
                        onPress={() => openLink(link.url)}
                    >
                        <Text style={styles.gridItemText}>{link.name}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};
// const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: '#f0f4f8' },
//     header: {
//         fontSize: 24,
//         fontWeight: 'bold',
//         textAlign: 'center',
//         marginVertical: 20,
//         color: '#4CAF50',
//     },
// });

export default ProVideos;