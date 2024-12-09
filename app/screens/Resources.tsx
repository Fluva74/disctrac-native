import React from 'react';
import { View, Text, TouchableOpacity, Linking, Alert, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenBackground from '../components/ScreenBackground';
import ScreenTemplate from '../components/ScreenTemplate';

const Resources = () => {
    const openLink = (url: string) => {
        Linking.openURL(url).catch((err) => {
            console.error('Failed to open URL:', err);
            Alert.alert('Error', 'Failed to open link. Please try again.');
        });
    };

    return (
        <ScreenTemplate title="Resources">
            <View style={styles.gridContainer}>
                <TouchableOpacity
                    style={styles.gridButton}
                    onPress={() => openLink('https://www.pdga.com/tour/event/advanced')}
                >
                    <LinearGradient
                        colors={['#44FFA1', '#4D9FFF']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gridGradient}
                    >
                        <Text style={styles.gridText}>Upcoming Tournaments</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.gridButton}
                    onPress={() => openLink('https://udisc.com/courses')}
                >
                    <LinearGradient
                        colors={['#44FFA1', '#4D9FFF']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gridGradient}
                    >
                        <Text style={styles.gridText}>Nearby Courses</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.gridButton}
                    onPress={() => openLink('https://www.pdga.com/news')}
                >
                    <LinearGradient
                        colors={['#44FFA1', '#4D9FFF']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gridGradient}
                    >
                        <Text style={styles.gridText}>PDGA News</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.gridButton}
                    onPress={() => openLink('https://www.discstore.com/')}
                >
                    <LinearGradient
                        colors={['#44FFA1', '#4D9FFF']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gridGradient}
                    >
                        <Text style={styles.gridText}>Shop Gear</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.gridButton}
                    onPress={() => openLink('https://www.weather.com/')}
                >
                    <LinearGradient
                        colors={['#44FFA1', '#4D9FFF']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gridGradient}
                    >
                        <Text style={styles.gridText}>Weather Forecast</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </ScreenTemplate>
    );
};

const styles = StyleSheet.create({
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        marginTop: 32,
    },
    gridButton: {
        width: '48%',
        marginBottom: 16,
    },
    gridGradient: {
        borderRadius: 8,
        padding: 16,
    },
    gridText: {
        fontFamily: 'LeagueSpartan_700Bold',
        color: '#000000',
        fontSize: 16,
        textAlign: 'center',
    },
});

export default Resources; 