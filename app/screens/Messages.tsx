import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from 'react-native';
import ScreenTemplate from '../components/ScreenTemplate';
import { useFonts, LeagueSpartan_400Regular, LeagueSpartan_700Bold } from '@expo-google-fonts/league-spartan';
import { useMessages } from '../contexts/MessageContext';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import type { Message, Conversation } from '../contexts/MessageContext';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { PlayerStackParamList } from '../stacks/PlayerStack';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { formatMessageTimestamp } from '../utils/dateUtils';
import * as Haptics from 'expo-haptics';

const Messages = () => {
  const navigation = useNavigation<NavigationProp<PlayerStackParamList>>();
  const { messages, markAsRead, deleteConversation } = useMessages();
  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [fontsLoaded] = useFonts({
    LeagueSpartan_400Regular,
    LeagueSpartan_700Bold,
  });

  // Group messages into conversations
  const conversations = React.useMemo(() => {
    const currentUser = FIREBASE_AUTH.currentUser;
    if (!currentUser) return [];

    const conversationMap = new Map<string, Conversation>();

    messages.forEach(message => {
      const isCurrentUserSender = message.senderId === currentUser.uid;
      const otherUserId = isCurrentUserSender ? message.receiverId : message.senderId;
      const otherUserName = message.senderName || 'Unknown User';

      // Create a unique conversation ID
      const conversationId = [currentUser.uid, otherUserId].sort().join('_');

      const existing = conversationMap.get(conversationId);
      const existingTime = existing?.timestamp?.toDate?.()?.getTime() || 0;
      const messageTime = message.timestamp?.toDate?.()?.getTime() || 0;

      if (!existing || existingTime < messageTime) {
        conversationMap.set(conversationId, {
          id: conversationId,
          otherUserId,
          otherUserName,
          lastMessage: message.message,
          timestamp: message.timestamp,
          createdAt: message.createdAt,
          unread: !message.read && !isCurrentUserSender
        });
      }
    });

    return Array.from(conversationMap.values()).sort((a, b) => {
      const timeA = a.timestamp?.toDate?.()?.getTime() || 0;
      const timeB = b.timestamp?.toDate?.()?.getTime() || 0;
      return timeB - timeA;
    });
  }, [messages]);

  React.useEffect(() => {
    if (messages) {
      setLoading(false);
    }
  }, [messages]);

  if (!fontsLoaded) {
    return null;
  }

  const handleLongPressConversation = async (conversationId: string) => {
    // Trigger haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      'Conversation Options',
      'What would you like to do?',
      [
        {
          text: 'Delete Conversation',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteConversation(conversationId);
              // Optional: Add success haptic
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error('Error deleting conversation:', error);
              // Optional: Add error haptic
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const renderConversation = ({ item }: { item: Conversation }) => {
    const timestamp = formatMessageTimestamp(item.timestamp, item.createdAt);

    return (
      <TouchableOpacity
        style={[styles.messageContainer, item.unread && styles.unreadMessage]}
        onPress={() => navigation.navigate('MessageDetail', { messageId: item.id })}
        onLongPress={() => handleLongPressConversation(item.id)}
        delayLongPress={500}
      >
        <LinearGradient
          colors={['rgba(68, 255, 161, 0.1)', 'rgba(77, 159, 255, 0.1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.messageContainer}
        >
          <View style={styles.messageContent}>
            <View style={styles.messageHeader}>
              <View style={styles.senderInfo}>
                <MaterialCommunityIcons
                  name="message"
                  size={24}
                  color="#44FFA1"
                />
                <Text style={styles.senderName}>{item.otherUserName}</Text>
              </View>
              <Text style={styles.timestamp}>{timestamp}</Text>
            </View>
            <Text style={styles.messageText} numberOfLines={1}>
              {item.lastMessage}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenTemplate>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Messages</Text>
        </View>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#44FFA1" />
          </View>
        ) : (
          <FlatList
            data={conversations}
            renderItem={renderConversation}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.listContent,
              conversations.length === 0 && styles.emptyListContent
            ]}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => setRefreshing(false)}
                tintColor="#44FFA1"
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons 
                  name="message-text-outline" 
                  size={48} 
                  color="#44FFA1" 
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyText}>No messages yet</Text>
              </View>
            }
          />
        )}
        <TouchableOpacity
          onPress={() => navigation.navigate('NewMessage')}
          style={styles.fabButton}
        >
          <LinearGradient
            colors={['#44FFA1', '#4D9FFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.fabGradient}
          >
            <MaterialCommunityIcons name="message-plus" size={28} color="#000000" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScreenTemplate>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090B',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  title: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 32,
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(68, 255, 161, 0.2)',
    overflow: 'hidden',
  },
  messageContent: {
    padding: 16,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  senderName: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  timestamp: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 12,
    color: '#A1A1AA',
  },
  messageText: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#FFFFFF',
  },
  unreadMessage: {
    backgroundColor: 'rgba(68, 255, 161, 0.05)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 32,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#A1A1AA',
    textAlign: 'center',
  },
  fabButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Messages; 