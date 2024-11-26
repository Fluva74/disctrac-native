// //YourDiscFoundNotification.tsx
// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   TouchableOpacity,
//   Alert,
//   ActivityIndicator,
// } from 'react-native';
// import { useNavigation, NavigationProp } from '@react-navigation/native';
// import { FIREBASE_DB } from '../../FirebaseConfig';
// import { doc, getDoc, updateDoc } from 'firebase/firestore';
// import { InsideStackParamList } from '../../App';

// interface NotificationData {
//   uid: string;
//   name: string;
//   manufacturer: string;
//   color: string;
// }

// const YourDiscFoundNotification = () => {
//   const [notification, setNotification] = useState<NotificationData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const navigation = useNavigation<NavigationProp<InsideStackParamList>>();

//   const colorToImageMap: Record<string, any> = {
//     blue: require('../../assets/discBlue.png'),
//     red: require('../../assets/discRed.png'),
//     yellow: require('../../assets/discYellow.png'),
//     green: require('../../assets/discGreen.png'),
//     pink: require('../../assets/discPink.png'),
//     purple: require('../../assets/discPurple.png'),
//     orange: require('../../assets/discOrange.png'),
//     white: require('../../assets/discWhite.png'),
//     gray: require('../../assets/discGray.png'), // Default
//   };
  

//   useEffect(() => {
//     const fetchNotification = async () => {
//       setLoading(true);
//       try {
//         const userId = 'CURRENT_PLAYER_USER_ID'; // Replace with actual user ID from auth
//         const playerDoc = await getDoc(doc(FIREBASE_DB, 'players', userId));

//         if (playerDoc.exists() && playerDoc.data().notification) {
//           setNotification(playerDoc.data().notification);
//         }
//       } catch (error) {
//         console.error('Error fetching notification:', error);
//         Alert.alert('Error', 'Failed to fetch notification data.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchNotification();
//   }, []);

//   const handleClose = async () => {
//     try {
//       const userId = 'CURRENT_PLAYER_USER_ID'; // Replace with actual user ID from auth
//       const playerDocRef = doc(FIREBASE_DB, 'players', userId);

//       // Remove the notification
//       await updateDoc(playerDocRef, {
//         notification: null,
//       });

//       navigation.navigate('PlayerHome'); // Navigate to PlayerHome screen
//     } catch (error) {
//       console.error('Error dismissing notification:', error);
//     }
//   };

//   if (loading) {
//     return <ActivityIndicator size="large" color="#4CAF50" />;
//   }

//   if (!notification) {
//     return null; // No notification to display
//   }

//   return (
//     <View style={styles.container}>
//       <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
//         <Text style={styles.closeButtonText}>X</Text>
//       </TouchableOpacity>
//       <Text style={styles.header}>Your Disc Has Been Found!</Text>
//       <View style={styles.card}>
//       <Image
//         source={
//             colorToImageMap[notification.color.toLowerCase()] ||
//             require('../../assets/discGray.png') // Fallback to a default image
//         }
//         style={styles.discImage}
//         />
//         <Text style={styles.cardText}>Name: {notification.name}</Text>
//         <Text style={styles.cardText}>Manufacturer: {notification.manufacturer}</Text>
//         <Text style={styles.cardText}>Color: {notification.color}</Text>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#f0f4f8', padding: 16 },
//   header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
//   card: { backgroundColor: '#fff', padding: 20, borderRadius: 10, alignItems: 'center' },
//   cardText: { fontSize: 16, marginBottom: 10 },
//   discImage: { width: 100, height: 100, marginBottom: 10 },
//   closeButton: {
//     position: 'absolute',
//     top: 20,
//     right: 20,
//     backgroundColor: '#F44336',
//     borderRadius: 20,
//     padding: 10,
//   },
//   closeButtonText: { color: '#fff', fontWeight: 'bold' },
// });

// export default YourDiscFoundNotification;