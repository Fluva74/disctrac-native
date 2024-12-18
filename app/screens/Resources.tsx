import React from 'react';
import { View, Text, TouchableOpacity, Linking, Alert, StyleSheet, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenTemplate from '../components/ScreenTemplate';

const { width } = Dimensions.get('window');
const cardWidth = width * 0.42; // For the 2x2 grid cards
const largeCardWidth = width * 0.9; // For the weather card

const Resources = () => {
    const openLink = (url: string) => {
        Linking.openURL(url).catch((err) => {
            console.error('Failed to open URL:', err);
            Alert.alert('Error', 'Failed to open link. Please try again.');
        });
    };

    return (
        <ScreenTemplate>
            <View style={styles.container}>
                {/* Weather Card */}
                <TouchableOpacity
                    style={styles.weatherCard}
                    onPress={() => openLink('https://www.weather.com/')}
                >
                    <View style={styles.imageContainer}>
                        <Image 
                            source={require('../../assets/sunny.jpeg')}
                            style={styles.weatherImage}
                        />
                    </View>
                    <View style={styles.labelBanner}>
                        <Text style={styles.weatherText}>Weather Forecast</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.gridContainer}>
                    {/* Tournaments Card */}
                    <TouchableOpacity
                        style={styles.gridCard}
                        onPress={() => openLink('https://www.pdga.com/tour/event/advanced')}
                    >
                        <View style={styles.imageContainer}>
                            <Image 
                                source={require('../../assets/tournamentred.jpg')}
                                style={styles.gridImage}
                            />
                        </View>
                        <View style={styles.labelBanner}>
                            <Text style={styles.gridText}>Upcoming Tournaments</Text>
                        </View>
                    </TouchableOpacity>

                    {/* Courses Card */}
                    <TouchableOpacity
                        style={styles.gridCard}
                        onPress={() => openLink('https://udisc.com/courses')}
                    >
                        <View style={styles.imageContainer}>
                            <Image 
                                source={require('../../assets/courses.jpg')}
                                style={styles.gridImage}
                            />
                        </View>
                        <View style={styles.labelBanner}>
                            <Text style={styles.gridText}>Nearby Courses</Text>
                        </View>
                    </TouchableOpacity>

                    {/* News Card */}
                    <TouchableOpacity
                        style={styles.gridCard}
                        onPress={() => openLink('https://www.pdga.com/news')}
                    >
                        <View style={styles.imageContainer}>
                            <Image 
                                source={require('../../assets/news.jpg')}
                                style={styles.gridImage}
                            />
                        </View>
                        <View style={styles.labelBanner}>
                            <Text style={styles.gridText}>PDGA News</Text>
                        </View>
                    </TouchableOpacity>

                    {/* Shop Card */}
                    <TouchableOpacity
                        style={styles.gridCard}
                        onPress={() => openLink('https://www.discstore.com/')}
                    >
                        <View style={styles.imageContainer}>
                            <Image 
                                source={require('../../assets/shopping.jpg')}
                                style={styles.gridImage}
                            />
                        </View>
                        <View style={styles.labelBanner}>
                            <Text style={styles.gridText}>Shop Gear</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </ScreenTemplate>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 16,
    },
    imageContainer: {
        flex: 1,
        overflow: 'hidden',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    labelBanner: {
        backgroundColor: 'rgba(24, 24, 27, 0.95)',
        padding: 12,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(68, 255, 161, 0.2)',
    },
    weatherCard: {
        width: largeCardWidth,
        height: 200,
        borderRadius: 16,
        marginBottom: 16,
        backgroundColor: 'rgba(24, 24, 27, 0.5)',
        overflow: 'hidden',
    },
    weatherImage: {
        width: '100%',
        height: '100%',
    },
    weatherText: {
        fontFamily: 'LeagueSpartan_700Bold',
        fontSize: 24,
        color: '#FFFFFF',
        textAlign: 'center',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: largeCardWidth,
    },
    gridCard: {
        width: cardWidth,
        height: 180, // Increased to accommodate banner
        borderRadius: 16,
        marginBottom: 16,
        backgroundColor: 'rgba(24, 24, 27, 0.5)',
        overflow: 'hidden',
    },
    gridImage: {
        width: '100%',
        height: '100%',
    },
    gridText: {
        fontFamily: 'LeagueSpartan_700Bold',
        fontSize: 16,
        color: '#FFFFFF',
        textAlign: 'center',
    },
});

export default Resources; 