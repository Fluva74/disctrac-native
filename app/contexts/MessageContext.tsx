import React, { createContext, useContext, useState, useEffect } from 'react';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy,
  doc,
  updateDoc,
  getDoc,
  addDoc,
  serverTimestamp,
  getDocs,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { notificationService } from '../services/notificationService';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: {
    toDate: () => Date;
  } | null;
  read: boolean;
  type: 'message' | 'alert';
  senderName?: string;
  discId?: string;
  participants?: string[];
  createdAt: string;
  deletedBy?: string[];
}

export interface Conversation {
  id: string;
  otherUserId: string;
  otherUserName: string;
  lastMessage: string;
  timestamp: {
    toDate: () => Date;
  } | null;
  createdAt: string;
  unread: boolean;
}

interface MessageContextType {
  messages: Message[];
  unreadCount: number;
  getConversationMessages: (otherUserId: string) => Message[];
  markAsRead: (messageId: string) => Promise<void>;
  sendMessage: (receiverId: string, message: string, discId?: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      console.log('=== Messages Provider: No User ===');
      setMessages([]);
      setUnreadCount(0);
      return;
    }

    try {
      console.log('=== Messages Provider: Setting Up Listener ===');
      console.log('Current user:', user.uid);

      // Register for push notifications once
      notificationService.registerForPushNotifications();

      const messagesRef = collection(FIREBASE_DB, 'messages');
      const messageQuery = query(
        messagesRef,
        where('participants', 'array-contains', user.uid),
        orderBy('timestamp', 'desc')
      );

      console.log('Query params:', {
        participants: user.uid,
        orderBy: 'timestamp'
      });

      const unsubscribe = onSnapshot(
        messageQuery, 
        (snapshot) => {
          console.log('=== Messages Snapshot Update ===');
          console.log('Number of docs:', snapshot.docs.length);
          
          const messageList: Message[] = [];
          let unread = 0;
          
          snapshot.forEach((doc) => {
            const message = { id: doc.id, ...doc.data() } as Message;
            console.log('Processing message:', {
              id: message.id,
              senderId: message.senderId,
              receiverId: message.receiverId,
              isDeleted: message.deletedBy?.includes(user.uid)
            });

            if (!message.deletedBy?.includes(user.uid)) {
              messageList.push(message);
              if (!message.read && message.receiverId === user.uid) {
                unread++;
              }
            }
          });
          
          console.log('Updated message count:', messageList.length);
          console.log('Updated unread count:', unread);
          
          setMessages(messageList);
          setUnreadCount(unread);
        },
        (error) => {
          console.error('=== Messages Snapshot Error ===', error);
        }
      );

      return () => {
        console.log('=== Cleaning up messages listener ===');
        unsubscribe();
      };
    } catch (error) {
      console.error('=== Messages setup error ===', error);
    }
  }, [user]);

  // Rest of the functions remain the same but use user.uid instead of currentUserId
  const sendMessage = async (receiverId: string, message: string, discId?: string) => {
    try {
      console.log('=== Send Message Started ===');
      console.log('Sender:', FIREBASE_AUTH.currentUser?.uid);
      console.log('Receiver:', receiverId);
      console.log('Message:', message);
      console.log('DiscId:', discId);

      const sender = FIREBASE_AUTH.currentUser;
      if (!sender) {
        console.error('No authenticated user found');
        throw new Error('No authenticated user');
      }

      // Check profiles
      console.log('Checking sender profiles...');
      const playerDoc = await getDoc(doc(FIREBASE_DB, 'players', sender.uid));
      const storeDoc = await getDoc(doc(FIREBASE_DB, 'stores', sender.uid));
      
      console.log('Player doc exists:', playerDoc.exists());
      console.log('Store doc exists:', storeDoc.exists());
      
      let senderProfile: any = null;
      let senderType: 'player' | 'store' | null = null;
      
      if (playerDoc.exists()) {
        senderProfile = playerDoc.data();
        senderType = 'player';
      } else if (storeDoc.exists()) {
        senderProfile = storeDoc.data();
        senderType = 'store';
      }

      if (!senderProfile || !senderType) {
        console.error('No sender profile found');
        throw new Error('Sender profile not found');
      }

      console.log('Sender type:', senderType);
      console.log('Sender profile:', senderProfile);

      // Create message data
      const messageData = {
        senderId: sender.uid,
        senderName: senderProfile.username || senderProfile.storeName || 'Unknown',
        senderType,
        receiverId,
        message,
        timestamp: serverTimestamp(),
        read: false,
        participants: [sender.uid, receiverId].sort(),
        createdAt: new Date().toISOString(),
        ...(discId && { discId })
      };

      console.log('Message data to be sent:', messageData);

      // Add to Firestore
      const docRef = await addDoc(collection(FIREBASE_DB, 'messages'), messageData);
      console.log('Message added to Firestore with ID:', docRef.id);

      // Notification logic
      if (sender.uid !== receiverId) {
        console.log('=== Notification Check ===');
        console.log('Current user (sender):', sender.uid);
        console.log('Receiver:', receiverId);
        console.log('Checking receiver notification preferences...');
        
        const receiverDoc = await getDoc(doc(FIREBASE_DB, 'players', receiverId));
        console.log('Receiver doc exists:', receiverDoc.exists());
        
        const receiverProfile = receiverDoc.data();
        console.log('Receiver profile:', receiverProfile);
        console.log('Receiver notification preferences:', receiverProfile?.contactPreferences);

        if (receiverProfile?.contactPreferences?.inApp) {
          console.log('Attempting to send notification to:', receiverId);
          console.log('From sender:', messageData.senderName);
          
          // Use sendMessageNotification instead of scheduleLocalNotification
          await notificationService.sendMessageNotification(
            receiverId,
            messageData.senderName,
            message,
            sender.uid
          );
        }
      }

      console.log('=== Send Message Completed Successfully ===');
    } catch (error) {
      console.error('=== Send Message Error ===');
      console.error('Error details:', error);
      throw error;
    }
  };

  const markAsRead = async (messageId: string) => {
    if (!user) return;
    
    try {
      // Check if message exists and isn't already read
      const messageRef = doc(FIREBASE_DB, 'messages', messageId);
      const messageSnap = await getDoc(messageRef);
      
      if (!messageSnap.exists()) {
        console.log('Message not found:', messageId);
        return;
      }
      
      const messageData = messageSnap.data();
      if (messageData.read) {
        console.log('Message already read:', messageId);
        return;
      }

      await updateDoc(messageRef, {
        read: true
      });
      
      // Update local state
      setMessages(prevMessages => {
        const updatedMessages = prevMessages.map(msg => {
          if (msg.id === messageId) {
            return { ...msg, read: true };
          }
          return msg;
        });
        
        // Recalculate unread count
        const newUnreadCount = updatedMessages.filter(
          msg => !msg.read && msg.receiverId === user.uid
        ).length;
        
        setUnreadCount(newUnreadCount);
        return updatedMessages;
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
      // Don't throw the error to prevent loops
    }
  };

  const getConversationMessages = (otherUserId: string) => {
    console.log('=== Getting Conversation Messages ===');
    console.log('Current user:', user?.uid);
    console.log('Other user:', otherUserId);
    console.log('Total messages:', messages.length);
    
    if (!user) {
      console.log('No user found, returning empty array');
      return [];
    }
    
    const filtered = messages.filter(message => {
      const isInConversation = 
        (message.senderId === user.uid && message.receiverId === otherUserId) ||
        (message.senderId === otherUserId && message.receiverId === user.uid);
      
      console.log('Message check:', {
        messageId: message.id,
        senderId: message.senderId,
        receiverId: message.receiverId,
        isInConversation
      });
      
      return isInConversation;
    });

    console.log('Filtered message count:', filtered.length);
    return filtered.sort((a, b) => {
      const timeA = a.timestamp?.toDate?.()?.getTime() || new Date(a.createdAt).getTime();
      const timeB = b.timestamp?.toDate?.()?.getTime() || new Date(b.createdAt).getTime();
      return timeA - timeB;
    });
  };

  const deleteMessage = async (messageId: string) => {
    if (!user) return;
    try {
      const messageRef = doc(FIREBASE_DB, 'messages', messageId);
      const messageSnap = await getDoc(messageRef);
      
      if (!messageSnap.exists()) {
        console.log('Message not found:', messageId);
        return;
      }

      const messageData = messageSnap.data();
      const deletedBy = messageData.deletedBy || [];
      
      if (deletedBy.includes(user.uid)) {
        console.log('Message already deleted by user');
        return;
      }

      // If this is the first user deleting the message
      if (deletedBy.length === 0) {
        await updateDoc(messageRef, {
          deletedBy: [user.uid]
        });
      } else {
        // If both users have now deleted the message, remove it from Firestore
        await deleteDoc(messageRef);
      }

      console.log('Message deletion handled successfully');
    } catch (error) {
      console.error('Error handling message deletion:', error);
      throw error;
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      if (!user) throw new Error('No authenticated user');

      // Get all messages between these users
      const messagesRef = collection(FIREBASE_DB, 'messages');
      const q = query(
        messagesRef,
        where('participants', 'array-contains', user.uid)
      );

      const querySnapshot = await getDocs(q);
      const batch = writeBatch(FIREBASE_DB);
      let updateCount = 0;

      querySnapshot.forEach((doc) => {
        const messageData = doc.data();
        const messageParticipants = messageData.participants || [];
        
        // Check if this message belongs to the conversation we want to delete
        const participantsMatch = messageParticipants.length === 2 && 
          messageParticipants.includes(user.uid) && 
          messageParticipants.sort().join('_') === conversationId;

        if (participantsMatch) {
          batch.delete(doc.ref);
          updateCount++;
        }
      });

      if (updateCount > 0) {
        await batch.commit();
        console.log(`Deleted ${updateCount} messages from conversation`);
      } else {
        console.log('No messages found to delete');
      }

    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  };

  return (
    <MessageContext.Provider value={{ 
      messages, 
      unreadCount, 
      getConversationMessages, 
      markAsRead, 
      sendMessage,
      deleteMessage,
      deleteConversation
    }}>
      {children}
    </MessageContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
} 