import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import ScreenTemplate from '../components/ScreenTemplate';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { PlayerStackParamList } from '../stacks/PlayerStack';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  discId?: string;
  message: string;
  timestamp: any;
  read: boolean;
  type: 'message' | 'alert';
  senderName?: string;
}

const Messages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const navigation = useNavigation<NavigationProp<PlayerStackParamList>>();
  const currentUser = FIREBASE_AUTH.currentUser;

  useEffect(() => {
    if (!currentUser) return;

    const messagesRef = collection(FIREBASE_DB, 'messages');
    const q = query(
      messagesRef,
      where('receiverId', '==', currentUser.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageList: Message[] = [];
      snapshot.forEach((doc) => {
        messageList.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(messageList);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const renderMessage = ({ item }: { item: Message }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('MessageDetail', { messageId: item.id })}
    >
      <LinearGradient
        colors={item.read 
          ? ['rgba(68, 255, 161, 0.1)', 'rgba(77, 159, 255, 0.1)']
          : ['rgba(68, 255, 161, 0.2)', 'rgba(77, 159, 255, 0.2)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.messageItem,
          !item.read && styles.unreadMessage
        ]}
      >
        <View style={styles.messageHeader}>
          <Text style={styles.senderName}>{item.senderName || 'Unknown'}</Text>
          <Text style={styles.timestamp}>
            {new Date(item.timestamp?.toDate()).toLocaleDateString()}
          </Text>
        </View>
        <Text style={styles.messagePreview} numberOfLines={2}>
          {item.message}
        </Text>
        {item.type === 'alert' && (
          <View style={styles.alertBadge}>
            <Text style={styles.alertText}>Alert</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <ScreenTemplate>
      <View style={styles.container}>
        <Text style={styles.pageTitle}>Messages</Text>
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet</Text>
          </View>
        ) : (
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
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
  listContent: {
    padding: 16,
    gap: 12,
  },
  messageItem: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(68, 255, 161, 0.2)',
  },
  unreadMessage: {
    borderColor: 'rgba(68, 255, 161, 0.4)',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  senderName: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  timestamp: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 14,
    color: '#A1A1AA',
  },
  messagePreview: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 14,
    color: '#FFFFFF',
  },
  alertBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#44FFA1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  alertText: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 12,
    color: '#000000',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#A1A1AA',
  },
});

export default Messages; 