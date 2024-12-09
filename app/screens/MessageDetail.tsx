import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import ScreenTemplate from '../components/ScreenTemplate';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, RouteProp } from '@react-navigation/native';
import { PlayerStackParamList } from '../stacks/PlayerStack';

type MessageDetailRouteProp = RouteProp<PlayerStackParamList, 'MessageDetail'>;

const MessageDetail = () => {
  const route = useRoute<MessageDetailRouteProp>();
  const { messageId } = route.params;
  const [message, setMessage] = useState<any>(null);

  useEffect(() => {
    const fetchMessage = async () => {
      const messageRef = doc(FIREBASE_DB, 'messages', messageId);
      const messageSnap = await getDoc(messageRef);
      
      if (messageSnap.exists()) {
        setMessage(messageSnap.data());
        // Mark as read
        if (!messageSnap.data().read) {
          await updateDoc(messageRef, { read: true });
        }
      }
    };

    fetchMessage();
  }, [messageId]);

  if (!message) {
    return (
      <ScreenTemplate>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </ScreenTemplate>
    );
  }

  return (
    <ScreenTemplate>
      <View style={styles.container}>
        <Text style={styles.pageTitle}>Message</Text>
        <View style={styles.messageContainer}>
          <View style={styles.messageHeader}>
            <Text style={styles.senderName}>{message.senderName || 'Unknown'}</Text>
            <Text style={styles.timestamp}>
              {new Date(message.timestamp?.toDate()).toLocaleString()}
            </Text>
          </View>
          <Text style={styles.messageText}>{message.message}</Text>
          {message.discId && (
            <TouchableOpacity style={styles.discButton}>
              <LinearGradient
                colors={['#44FFA1', '#4D9FFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.discButtonGradient}
              >
                <Text style={styles.discButtonText}>View Disc</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScreenTemplate>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pageTitle: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 32,
    color: '#FFFFFF',
    textAlign: 'center',
    marginVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#A1A1AA',
  },
  messageContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: 'rgba(24, 24, 27, 0.5)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(68, 255, 161, 0.2)',
  },
  messageHeader: {
    marginBottom: 16,
  },
  senderName: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  timestamp: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 14,
    color: '#A1A1AA',
  },
  messageText: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  discButton: {
    marginTop: 24,
  },
  discButtonGradient: {
    padding: 16,
    borderRadius: 8,
  },
  discButtonText: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
  },
});

export default MessageDetail; 