import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import ScreenTemplate from '../components/ScreenTemplate';
import { useMessages } from '../contexts/MessageContext';
import { format } from 'date-fns';
import { StoreStackParamList } from '../stacks/StoreStack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MessageOptionsModal from '../components/modals/MessageOptionsModal';
import * as Haptics from 'expo-haptics';

interface Conversation {
  id: string;
  otherUserId: string;
  otherUserName: string;
  lastMessage: string;
  timestamp: any;
  unread: boolean;
}

// Add navigation type
type StoreNavigationProp = NavigationProp<StoreStackParamList>;

const StoreMessages = () => {
  const { messages, deleteConversation } = useMessages();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  // Update navigation with type
  const navigation = useNavigation<StoreNavigationProp>();
  const currentUser = FIREBASE_AUTH.currentUser;
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    const conversationMap = new Map<string, Conversation>();

    // Subscribe to messages
    const messagesRef = collection(FIREBASE_DB, 'messages');
    const q = query(
      messagesRef,
      where('participants', 'array-contains', currentUser.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const conversationsToUpdate = new Map<string, Conversation>();

      for (const docSnapshot of snapshot.docs) {
        const messageData = docSnapshot.data();
        const otherUserId = messageData.participants.find(
          (id: string) => id !== currentUser.uid
        );

        if (!otherUserId) continue;

        // Only process if we haven't already processed this conversation
        if (!conversationsToUpdate.has(otherUserId)) {
          try {
            // Get player profile for the conversation
            const playerDocRef = doc(FIREBASE_DB, 'players', otherUserId);
            const playerDocSnap = await getDoc(playerDocRef);
            const playerData = playerDocSnap.exists() ? playerDocSnap.data() : null;

            conversationsToUpdate.set(otherUserId, {
              id: docSnapshot.id,
              otherUserId,
              otherUserName: playerData?.username || 'Unknown User',
              lastMessage: messageData.message,
              timestamp: messageData.timestamp,
              unread: !messageData.read && messageData.receiverId === currentUser.uid
            });
          } catch (error) {
            console.error('Error fetching player data:', error);
          }
        }
      }

      setConversations(Array.from(conversationsToUpdate.values()));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleLongPressConversation = async (conversation: Conversation) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedConversation(conversation);
  };

  const handleBlockUser = async (userId: string) => {
    try {
      const currentUser = FIREBASE_AUTH.currentUser;
      if (!currentUser) return;

      await updateDoc(doc(FIREBASE_DB, 'stores', currentUser.uid), {
        blockedUsers: arrayUnion(userId)
      });

      await deleteConversation(selectedConversation?.id || '');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSelectedConversation(null);
    } catch (error) {
      console.error('Error blocking user:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const renderConversation = ({ item }: { item: Conversation }) => {
    if (!currentUser) return null;
    
    const conversationId = [currentUser.uid, item.otherUserId].sort().join('_');

    return (
      <TouchableOpacity
        style={[styles.conversationItem, item.unread && styles.unreadMessage]}
        onPress={() => navigation.navigate('MessageDetail', { 
          messageId: conversationId,
          receiverInfo: {
            id: item.otherUserId,
            name: item.otherUserName
          }
        })}
        onLongPress={() => handleLongPressConversation(item)}
        delayLongPress={500}
      >
        <View style={styles.conversationContent}>
          <Text style={styles.username}>{item.otherUserName}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timestamp}>
            {item.timestamp?.toDate ? 
              format(item.timestamp.toDate(), 'MMM d, h:mm a') : 
              'Just now'
            }
          </Text>
          {item.unread && <View style={styles.unreadDot} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenTemplate>
      <View style={styles.container}>
        <Text style={styles.title}>Messages</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#44FFA1" />
        ) : conversations.length > 0 ? (
          <FlatList
            data={conversations}
            renderItem={renderConversation}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.newMessageButton}
          onPress={() => navigation.navigate('NewMessage')}
        >
          <LinearGradient
            colors={['#44FFA1', '#4D9FFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <MaterialCommunityIcons name="message-plus" size={24} color="#000000" />
          </LinearGradient>
        </TouchableOpacity>

        {selectedConversation && currentUser && (
          <MessageOptionsModal
            visible={!!selectedConversation}
            onClose={() => setSelectedConversation(null)}
            onDelete={async () => {
              try {
                const conversationId = [currentUser.uid, selectedConversation.otherUserId].sort().join('_');
                await deleteConversation(conversationId);
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              } catch (error) {
                console.error('Error deleting conversation:', error);
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              }
              setSelectedConversation(null);
            }}
            onBlock={() => handleBlockUser(selectedConversation.otherUserId)}
            username={selectedConversation.otherUserName}
          />
        )}
      </View>
    </ScreenTemplate>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 24,
  },
  listContent: {
    flexGrow: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'rgba(24, 24, 27, 0.5)',
    borderRadius: 8,
    marginBottom: 8,
  },
  unreadMessage: {
    backgroundColor: 'rgba(68, 255, 161, 0.05)',
    borderColor: '#44FFA1',
    borderWidth: 1,
  },
  conversationContent: {
    flex: 1,
    marginRight: 16,
  },
  username: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  lastMessage: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 14,
    color: '#A1A1AA',
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  timestamp: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 12,
    color: '#A1A1AA',
    marginBottom: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#44FFA1',
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
  newMessageButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    elevation: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  gradientButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default StoreMessages; 