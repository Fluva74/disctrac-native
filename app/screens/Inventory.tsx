//file.Inventory.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  Linking,
  ActivityIndicator,
  StyleSheet,
  Image,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../FirebaseConfig';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { InsideStackParamList } from '../../App';

const colorToImageMap: { [key: string]: any } = {
  blue: require('../../assets/discBlue.png'),
  brown: require('../../assets/discBrown.png'),
  gray: require('../../assets/discGray.png'),
  green: require('../../assets/discGreen.png'),
  orange: require('../../assets/discOrange.png'),
  pink: require('../../assets/discPink.png'),
  purple: require('../../assets/discPurple.png'),
  red: require('../../assets/discRed.png'),
  white: require('../../assets/discWhite.png'),
  yellow: require('../../assets/discYellow.png'),
};

const Inventory = () => {
  const navigation = useNavigation<NavigationProp<InsideStackParamList>>();
  const [discs, setDiscs] = useState<any[]>([]);
  const [selectedDisc, setSelectedDisc] = useState<any | null>(null); // State for the selected disc
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = FIREBASE_AUTH.currentUser;
    if (user) {
      const userDiscsRef = collection(FIREBASE_DB, 'userDiscs');
      const q = query(userDiscsRef, where('userId', '==', user.uid));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const discsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDiscs(discsList);
        setLoading(false);
      });

      return () => unsubscribe(); // Cleanup listener on unmount
    } else {
      setLoading(false);
    }
  }, []);

  const handleSelectDisc = (disc: any) => {
    setSelectedDisc(selectedDisc?.id === disc.id ? null : disc); // Toggle selection
  };

  const handleDeleteDisc = async (discId: string) => {
    Alert.alert('Remove Disc', 'Do you want to remove this disc from your inventory?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          try {
            await deleteDoc(doc(FIREBASE_DB, 'userDiscs', discId));
            setSelectedDisc(null);
          } catch (error) {
            console.error('Error deleting disc:', error);
            Alert.alert('Error', 'Failed to remove disc.');
          }
        },
      },
    ]);
  };

  const handleWatchReviews = (manufacturer: string, name: string) => {
    const searchQuery = `disc golf disc review: ${manufacturer} ${name}`;
    const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
    Linking.openURL(youtubeUrl);
  };

  const navigateToHome = () => {
    navigation.navigate('PlayerHome');
  };

  const getDiscImage = (color: string) => {
    return colorToImageMap[color.toLowerCase()] || require('../../assets/discGray.png');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'notified':
        return '#F44336'; // Red for notified
      default:
        return '#333'; // Default background color
    }
  };

  const renderDisc = ({ item }: { item: any }) => (
    <TouchableOpacity style={[styles.row, { backgroundColor: getStatusColor(item.status) }]} onPress={() => handleSelectDisc(item)}>
      <Image source={getDiscImage(item.color)} style={styles.discThumbnail} />
      <Text style={[styles.cell, styles.nameColumn]}>{item.name}</Text>
      <Text style={[styles.cell, styles.manufacturerColumn]}>{item.manufacturer}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Inventory</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : discs.length === 0 ? (
        <Text style={styles.noDiscsText}>You have no discs in your bag.</Text>
      ) : (
        <FlatList
          data={discs}
          renderItem={renderDisc}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, styles.imageColumn]}>Disc</Text>
              <Text style={[styles.headerCell, styles.nameColumn]}>Name</Text>
              <Text style={[styles.headerCell, styles.manufacturerColumn]}>Manufacturer</Text>
            </View>
          }
        />
      )}

      {/* Card for the selected disc */}
      {selectedDisc && (
        <View style={styles.card}>
          <Image source={getDiscImage(selectedDisc.color)} style={styles.discImage} />
          <Text style={styles.cardText}>Name: {selectedDisc.name}</Text>
          <Text style={styles.cardText}>Manufacturer: {selectedDisc.manufacturer}</Text>
          <Text style={styles.cardText}>Color: {selectedDisc.color}</Text>
          <TouchableOpacity
            style={styles.cardButton}
            onPress={() => handleWatchReviews(selectedDisc.manufacturer, selectedDisc.name)}
          >
            <Text style={styles.cardButtonText}>Watch Disc Reviews</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cardButton} onPress={() => handleDeleteDisc(selectedDisc.id)}>
            <Text style={styles.cardButtonText}>Remove Disc</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.homeButton]} onPress={navigateToHome}>
          <Text style={styles.buttonText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ScannerScreen')}>
          <Text style={styles.buttonText}>Add Disc</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1c1c1c', padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#FFF', marginBottom: 20 },
  tableHeader: { flexDirection: 'row', marginBottom: 10, borderBottomWidth: 1, borderColor: '#555' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderColor: '#333' },
  discThumbnail: { width: 40, height: 40, marginRight: 10 },
  cell: { flex: 1, color: '#FFF', textAlign: 'center' },
  headerCell: { flex: 1, color: '#FFF', textAlign: 'center', fontWeight: 'bold' },
  imageColumn: { flex: 0.5 },
  nameColumn: { flex: 1 },
  manufacturerColumn: { flex: 1 },
  buttonContainer: { flexDirection: 'row', marginTop: 20 },
  button: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 5, margin: 5, alignItems: 'center' },
  homeButton: { backgroundColor: '#2196F3' },
  buttonText: { color: '#FFF', fontWeight: 'bold' },
  noDiscsText: { color: '#FFF', textAlign: 'center', marginTop: 20 },
  card: {
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  cardText: { color: '#FFF', fontSize: 16, marginBottom: 10 },
  cardButton: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 5, marginTop: 10 },
  cardButtonText: { color: '#FFF', fontWeight: 'bold' },
  discImage: { width: 100, height: 100, marginBottom: 10 },
});

export default Inventory;
