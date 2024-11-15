//AmateurVideos.tsx
import React from 'react';
import { View, ScrollView, Text, TouchableOpacity, Linking, Alert } from 'react-native';
import VideoGrid from './VideoGrid';
import styles from '../styles';

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
    const openLink = (url: string) => {
        Linking.openURL(url).catch(() =>
            Alert.alert("Error", "Failed to open link. Please try again.")
        );
    };
    return (
        <View style={styles.container}>
            <Text style={styles.header}>Pro Player Videos</Text>
            <View style={styles.gridContainer}>
                {amateurLinks.map((link, index) => (
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

export default AmateurVideos;
