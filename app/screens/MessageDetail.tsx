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
  Keyboard
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';
import { PlayerStackParamList } from '../stacks/PlayerStack';
import { useMessages } from '../contexts/MessageContext';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import type { Message } from '../contexts/MessageContext';

type MessageDetailRouteProp = RouteProp<PlayerStackParamList, 'MessageDetail'>;

const MessageDetail = () => {
  const route = useRoute<MessageDetailRouteProp>();
  const { messageId } = route.params;
  const { messages, sendMessage } = useMessages();
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

  const renderMessage = ({ item }: { item: Message }) => (
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
  );

  return (
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
});

export default MessageDetail;
