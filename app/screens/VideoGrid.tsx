//VideoGrid.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Linking, Alert } from 'react-native';

interface VideoLink {
    name: string;
    url: string;
}

interface VideoGridProps {
    links: VideoLink[];
}

const VideoGrid: React.FC<VideoGridProps> = ({ links }) => {
    const [page, setPage] = useState(0);

    const itemsPerPage = 20;
    const start = page * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedLinks = links.slice(start, end);

    const openLink = (url: string) => {
        Linking.openURL(url).catch((err) => {
            console.error("Failed to open URL:", err);
            Alert.alert("Error", "Failed to open link. Please try again.");
        });
    };

    const renderItem = ({ item }: { item: VideoLink }) => (
        <TouchableOpacity style={styles.button} onPress={() => openLink(item.url)}>
            <Text style={styles.buttonText}>{item.name}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={paginatedLinks}
                renderItem={renderItem}
                keyExtractor={(item) => item.name}
                numColumns={2} // Two columns for grid
                contentContainerStyle={styles.gridContainer}
            />
            <View style={styles.pagination}>
                <TouchableOpacity
                    style={[styles.navButton, page === 0 && styles.disabledButton]}
                    onPress={() => page > 0 && setPage(page - 1)}
                    disabled={page === 0}
                >
                    <Text style={styles.navText}>Previous</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.navButton, end >= links.length && styles.disabledButton]}
                    onPress={() => end < links.length && setPage(page + 1)}
                    disabled={end >= links.length}
                >
                    <Text style={styles.navText}>Next</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10, backgroundColor: '#f0f4f8' },
    gridContainer: { justifyContent: 'space-between' },
    button: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 25,
        margin: 5,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: { fontSize: 16, color: '#ffffff', textAlign: 'center' },
    pagination: { flexDirection: 'row', justifyContent: 'space-between', padding: 10 },
    navButton: { padding: 10, backgroundColor: '#4CAF50', borderRadius: 10 },
    navText: { color: '#ffffff' },
    disabledButton: { backgroundColor: '#cccccc' },
});

export default VideoGrid;
