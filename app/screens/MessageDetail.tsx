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
import { useRoute, RouteProp, useNavigation, NavigationProp } from '@react-navigation/native';
import { PlayerStackParamList } from '../stacks/PlayerStack';
import { useMessages } from '../contexts/MessageContext';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import type { Message } from '../contexts/MessageContext';
import * as Haptics from 'expo-haptics';
import ScreenTemplate from '../components/ScreenTemplate';
import { doc, getDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '../../FirebaseConfig';
import { capitalizeFirstLetter } from '../utils/stringUtils';
import { StoreStackParamList } from '../stacks/StoreStack';

// Define a union type for both navigation stacks
type CombinedStackParamList = PlayerStackParamList & StoreStackParamList;

// Define the navigation prop type
type MessageDetailNavigationProp = NavigationProp<CombinedStackParamList>;

// Update the route prop type
type MessageDetailRouteProp = RouteProp<CombinedStackParamList, 'MessageDetail'>;

interface ReceiverInfo {
  id: string;
  name: string;
  discName?: string;
  initialMessage?: string;
}

const MessageDetail = () => {
  const route = useRoute<MessageDetailRouteProp>();
  const navigation = useNavigation<MessageDetailNavigationProp>();
  const { messageId = '', receiverInfo = { id: '', name: '' } } = route.params;
  const { messages, sendMessage, deleteMessage, deleteConversation, markAsRead } = useMessages();
  const [replyText, setReplyText] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const currentUser = FIREBASE_AUTH.currentUser;

  console.log('=== MessageDetail Render ===');
  console.log('Current user:', FIREBASE_AUTH.currentUser?.uid);
  console.log('Route params:', route.params);
  console.log('Receiver info:', receiverInfo);

  useEffect(() => {
    console.log('=== Initial Setup Effect ===');
    if (!currentUser || !messageId) {
      console.log('Missing currentUser or messageId');
      return;
    }

    // Parse messageId to get the other user's ID
    const participantIds = messageId.split('_');
    console.log('Participant IDs:', participantIds);
    
    const otherUserId = participantIds.find(id => id !== currentUser.uid);
    console.log('Derived other user ID:', otherUserId);

    if (!otherUserId) {
      console.log('Could not determine other user ID');
      return;
    }

    // Update receiver info with the correct ID
    const updatedReceiverInfo = {
      ...receiverInfo,
      id: otherUserId
    };
    console.log('Updated receiver info:', updatedReceiverInfo);

    // Update route params
    navigation.setParams({
      messageId,
      receiverInfo: {
        id: otherUserId,
        name: receiverInfo.name || '',
        ...(receiverInfo.discName && { discName: receiverInfo.discName }),
        ...(receiverInfo.initialMessage && { initialMessage: receiverInfo.initialMessage })
      }
    });

    // Fetch user details
    const fetchUserDetails = async () => {
      try {
        console.log('Fetching user details for:', otherUserId);
        const playerDoc = await getDoc(doc(FIREBASE_DB, 'players', otherUserId));
        const storeDoc = await getDoc(doc(FIREBASE_DB, 'stores', otherUserId));

        console.log('Player doc exists:', playerDoc.exists());
        console.log('Store doc exists:', storeDoc.exists());

        let userData;
        if (playerDoc.exists()) {
          userData = playerDoc.data();
          console.log('Found player data:', userData);
        } else if (storeDoc.exists()) {
          userData = storeDoc.data();
          console.log('Found store data:', userData);
        }

        if (userData) {
          const name = userData.username || userData.storeName || 'Unknown User';
          navigation.setParams({
            messageId,
            receiverInfo: {
              id: updatedReceiverInfo.id,
              name,
              ...(updatedReceiverInfo.discName && { discName: updatedReceiverInfo.discName }),
              ...(updatedReceiverInfo.initialMessage && { initialMessage: updatedReceiverInfo.initialMessage })
            }
          });
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, [currentUser, messageId]);

  const conversationMessages = React.useMemo(() => {
    if (!currentUser || !receiverInfo?.id) return [];
    
    console.log('=== Messages Effect ===');
    console.log('Messages length:', messages.length);
    console.log('Current user:', currentUser?.uid);
    console.log('Receiver ID:', receiverInfo?.id);
    
    if (!currentUser || !receiverInfo?.id) {
      console.log('Missing user or receiver info');
      return [];
    }
    
    const filtered = messages.filter(msg => {
      const isInConversation = 
        (msg.senderId === currentUser.uid && msg.receiverId === receiverInfo.id) ||
        (msg.senderId === receiverInfo.id && msg.receiverId === currentUser.uid);
      
      console.log('Message:', {
        id: msg.id,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        isInConversation
      });
      
      return isInConversation;
    });

    console.log('Filtered messages:', filtered.length);
    return filtered;
  }, [messages, currentUser, receiverInfo?.id]);

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
    if (!replyText.trim() || !receiverInfo?.id) return;
    try {
      await sendMessage(receiverInfo.id, replyText.trim());
      setReplyText('');
      Keyboard.dismiss();
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
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
          <Text style={styles.senderName}>
            {item.senderId === currentUser?.uid ? 'Me' : item.senderName}
          </Text>
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
    console.log('=== MessageDetail Mount Effect ===');
    console.log('Current user:', currentUser?.uid);
    console.log('Message ID:', messageId);
    console.log('Receiver info:', receiverInfo);
    console.log('Available messages:', messages.length);

    const fetchOtherUserName = async () => {
      if (!currentUser || !receiverInfo?.id) {
        console.log('Missing user or receiver info');
        return;
      }
      
      try {
        console.log('Fetching user name for:', receiverInfo.id);
        const userDoc = await getDoc(doc(FIREBASE_DB, 'players', receiverInfo.id));
        console.log('User doc exists:', userDoc.exists());
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('User data:', userData);
          setOtherUserName(userData.username || 'Unknown User');
        }
      } catch (error) {
        console.error('Error fetching user name:', error);
        setOtherUserName('Unknown User');
      }
    };

    fetchOtherUserName();
  }, [currentUser, receiverInfo?.id]);

  // Add this useEffect to mark messages as read when viewing them
  useEffect(() => {
    if (!currentUser || !receiverInfo?.id) return;

    // Mark unread messages in this conversation as read
    const unreadMessages = messages.filter(msg => 
      !msg.read && 
      msg.receiverId === currentUser.uid &&
      msg.senderId === receiverInfo.id
    );

    unreadMessages.forEach(msg => {
      markAsRead(msg.id);
    });
  }, [messages, currentUser, receiverInfo?.id]);

  // When component mounts, if we have disc info, auto-send the first message
  useEffect(() => {
    const sendInitialMessage = async () => {
      if (!messages.length && receiverInfo?.discName && receiverInfo.id && currentUser) {
        const discName = receiverInfo.discName ? capitalizeFirstLetter(receiverInfo.discName) : '';
        const initialMessage = `Hello! I found your ${discName} disc!`;
        try {
          await sendMessage(receiverInfo.id, initialMessage);
          console.log('Initial message sent successfully');
        } catch (error) {
          console.error('Error sending initial message:', error);
        }
      }
    };

    sendInitialMessage();
  }, [messages, receiverInfo, receiverInfo.id, currentUser, sendMessage]); // Include all dependencies

  return (
    <ScreenTemplate>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerName}>{receiverInfo.name}</Text>
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

      {/* Wrap content in KeyboardAvoidingView */}
      <KeyboardAvoidingView
        style={styles.contentContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
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

        <View style={[
          styles.inputContainer,
          keyboardHeight > 0 && { paddingBottom: 105 }
        ]}>
          <TextInput
            style={styles.input}
            value={replyText}
            onChangeText={setReplyText}
            placeholder="Type your message..."
            placeholderTextColor="#A1A1AA"
            multiline
          />
          <TouchableOpacity 
            style={styles.sendButton}
            onPress={handleSend}
            disabled={!replyText.trim()}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(68, 255, 161, 0.2)',
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
  messagesList: {
    flexGrow: 1,
    padding: 16,
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: '80%',
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
  senderName: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 68,
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
    minHeight: 40,
  },
  sendButton: {
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
  contentContainer: {
    flex: 1,
    backgroundColor: '#09090B',
  },
});

export default MessageDetail;
