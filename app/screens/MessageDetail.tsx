import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  FlatList,
  Keyboard,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { PlayerStackParamList } from '../stacks/PlayerStack';
import { useMessages } from '../contexts/MessageContext';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import type { Message } from '../contexts/MessageContext';
import * as Haptics from 'expo-haptics';
import ScreenTemplate from '../components/ScreenTemplate';
import { doc, getDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '../../FirebaseConfig';

type MessageDetailRouteProp = RouteProp<PlayerStackParamList, 'MessageDetail'>;

interface ReceiverInfo {
  id: string;
  name: string;
  discName?: string;
  initialMessage?: string;
}

const MessageDetail = () => {
  const route = useRoute<MessageDetailRouteProp>();
  const navigation = useNavigation();
  const { messageId, receiverInfo } = route.params;
  const { messages, sendMessage, deleteMessage, deleteConversation, markAsRead } = useMessages();
  const [replyText, setReplyText] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const currentUser = FIREBASE_AUTH.currentUser;

  const otherUserId = React.useMemo(() => {
    if (!currentUser) return null;
    const [user1, user2] = messageId.split('_');
    return user1 === currentUser.uid ? user2 : user1;
  }, [messageId, currentUser]);

  const conversationMessages = React.useMemo(() => {
    if (!currentUser || !otherUserId) return [];
    return messages
      .filter(msg => 
        (msg.senderId === currentUser.uid && msg.receiverId === otherUserId) ||
        (msg.senderId === otherUserId && msg.receiverId === currentUser.uid)
      )
      .sort((a, b) => {
        const timeA = a.timestamp?.toDate?.()?.getTime() || 0;
        const timeB = b.timestamp?.toDate?.()?.getTime() || 0;
        return timeB - timeA;
      });
  }, [messages, currentUser, otherUserId]);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const handleSend = async () => {
    if (!replyText.trim() || !otherUserId) return;
    try {
      await sendMessage(otherUserId, replyText);
      setReplyText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleLongPressMessage = async (message: Message) => {
    // Trigger haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      'Message Options',
      'What would you like to do?',
      [
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMessage(message.id);
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error('Error deleting message:', error);
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

  const renderMessage = ({ item }: { item: Message }) => (
    <TouchableOpacity
      onLongPress={() => handleLongPressMessage(item)}
      delayLongPress={500}
    >
      <View style={[
        styles.messageContainer,
        item.senderId === currentUser?.uid ? styles.sentMessage : styles.receivedMessage
      ]}>
        <LinearGradient
          colors={item.senderId === currentUser?.uid 
            ? ['rgba(68, 255, 161, 0.3)', 'rgba(68, 255, 161, 0.2)']
            : ['rgba(77, 159, 255, 0.3)', 'rgba(77, 159, 255, 0.2)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.messageGradient}
        >
          <Text style={styles.messageText}>{item.message}</Text>
          <Text style={styles.timestamp}>
            {item.timestamp?.toDate ? 
              new Date(item.timestamp.toDate()).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              }) : ''
            }
          </Text>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );

  // Add state for other user's name
  const [otherUserName, setOtherUserName] = useState<string>('');

  // Add useEffect to fetch other user's name
  useEffect(() => {
    const fetchOtherUserName = async () => {
      if (!currentUser || !otherUserId) return;
      
      try {
        const userDoc = await getDoc(doc(FIREBASE_DB, 'players', otherUserId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setOtherUserName(userData.username || 'Unknown User');
        }
      } catch (error) {
        console.error('Error fetching user name:', error);
        setOtherUserName('Unknown User');
      }
    };

    fetchOtherUserName();
  }, [currentUser, otherUserId]);

  // Add this useEffect to mark messages as read when viewing them
  useEffect(() => {
    if (!currentUser || !otherUserId) return;

    // Mark unread messages in this conversation as read
    const unreadMessages = messages.filter(msg => 
      !msg.read && 
      msg.receiverId === currentUser.uid &&
      msg.senderId === otherUserId
    );

    unreadMessages.forEach(msg => {
      markAsRead(msg.id);
    });
  }, [messages, currentUser, otherUserId]);

  // When component mounts, if we have disc info, auto-send the first message
  useEffect(() => {
    const sendInitialMessage = async () => {
      if (!messages.length && receiverInfo?.discName && otherUserId && currentUser) {
        const initialMessage = `Hello! I found your ${receiverInfo.discName} disc!`;
        try {
          await sendMessage(otherUserId, initialMessage);
          console.log('Initial message sent successfully');
        } catch (error) {
          console.error('Error sending initial message:', error);
        }
      }
    };

    sendInitialMessage();
  }, [messages, receiverInfo, otherUserId, currentUser, sendMessage]); // Include all dependencies

  return (
    <ScreenTemplate>
      {/* Add Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerName}>{receiverInfo?.name || 'Chat'}</Text>
        </View>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => {
            Alert.alert(
              'Conversation Options',
              'What would you like to do?',
              [
                {
                  text: 'Delete Conversation',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await deleteConversation(messageId);
                      navigation.goBack();
                    } catch (error) {
                      console.error('Error deleting conversation:', error);
                      Alert.alert('Error', 'Failed to delete conversation');
                    }
                  },
                },
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
              ]
            );
          }}
        >
          <MaterialCommunityIcons name="dots-vertical" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={conversationMessages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={[
            styles.messagesList,
            { paddingBottom: keyboardHeight > 0 ? keyboardHeight : 16 }
          ]}
          inverted
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={replyText}
            onChangeText={setReplyText}
            placeholder="Type your message..."
            placeholderTextColor="#A1A1AA"
            multiline
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!replyText.trim()}
            style={styles.sendButton}
          >
            <LinearGradient
              colors={['#44FFA1', '#4D9FFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sendButtonGradient}
            >
              <MaterialCommunityIcons name="send" size={24} color="#000000" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenTemplate>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090B',
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    marginVertical: 4,
    width: '70%',
  },
  sentMessage: {
    alignSelf: 'flex-end',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
  },
  messageGradient: {
    borderRadius: 16,
    padding: 12,
  },
  messageText: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  timestamp: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 12,
    color: '#A1A1AA',
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(68, 255, 161, 0.2)',
    backgroundColor: '#09090B',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(24, 24, 27, 0.5)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    color: '#FFFFFF',
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    maxHeight: 100,
    minHeight: 40,
  },
  sendButton: {
    alignSelf: 'flex-end',
    width: 40,
    height: 40,
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(68, 255, 161, 0.2)',
    backgroundColor: '#09090B',
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerName: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  menuButton: {
    padding: 8,
  },
});

export default MessageDetail;
