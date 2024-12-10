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
      setMessages([]);
      setUnreadCount(0);
      return;
    }

    try {
      const messagesRef = collection(FIREBASE_DB, 'messages');
      const messageQuery = query(
        messagesRef,
        where('participants', 'array-contains', user.uid),
        orderBy('timestamp', 'desc')
      );

      const unsubscribe = onSnapshot(
        messageQuery, 
        (snapshot) => {
          const messageList: Message[] = [];
          let unread = 0;
          
          snapshot.forEach((doc) => {
            const message = { id: doc.id, ...doc.data() } as Message;
            if (!message.deletedBy?.includes(user.uid)) {
              messageList.push(message);
              if (!message.read && message.receiverId === user.uid) {
                unread++;
              }
            }
          });
          
          setMessages(messageList);
          setUnreadCount(unread);
        },
        (error) => {
          console.error('Messages subscription error:', error);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('Messages setup error:', error);
    }
  }, [user]);

  useEffect(() => {
    const currentUser = FIREBASE_AUTH.currentUser;
    if (!currentUser) return;

    // Register for push notifications
    notificationService.registerForPushNotifications();

    const messagesRef = collection(FIREBASE_DB, 'messages');
    const q = query(
      messagesRef,
      where('receiverId', '==', currentUser.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const message = change.doc.data() as Message;
          // Show notification for new messages when app is in background
          if (message.senderId !== currentUser.uid && !message.read) {
            notificationService.scheduleLocalNotification(
              'New Message',
              `${message.senderName || 'Someone'} sent you a message`
            );
          }
        }
      });
      
      // Update messages state
      const newMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, []);

  // Rest of the functions remain the same but use user.uid instead of currentUserId
  const sendMessage = async (receiverId: string, message: string, discId?: string) => {
    if (!user) return;
    
    try {
      // Validate inputs
      if (!receiverId.trim() || !message.trim()) {
        throw new Error('Invalid message parameters');
      }

      const userDoc = await getDoc(doc(FIREBASE_DB, 'players', user.uid));
      if (!userDoc.exists()) {
        throw new Error('Sender profile not found');
      }

      // Verify receiver exists
      const receiverDoc = await getDoc(doc(FIREBASE_DB, 'players', receiverId));
      if (!receiverDoc.exists()) {
        throw new Error('Receiver not found');
      }

      const senderName = userDoc.data().username || 'Unknown User';
      const now = new Date();

      const messageData = {
        senderId: user.uid,
        senderName,
        receiverId,
        message: message.trim(),
        timestamp: serverTimestamp(),
        read: false,
        type: discId ? 'alert' : 'message',
        participants: [user.uid, receiverId],
        ...(discId && { discId }),
        createdAt: now.toISOString(),
      };

      const messagesRef = collection(FIREBASE_DB, 'messages');
      await addDoc(messagesRef, messageData);

    } catch (error: any) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const markAsRead = async (messageId: string) => {
    if (!user) return;
    
    try {
      await updateDoc(doc(FIREBASE_DB, 'messages', messageId), {
        read: true
      });
      
      // Update local unread count immediately
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
    }
  };

  const getConversationMessages = (otherUserId: string) => {
    if (!user) return [];
    
    return messages.filter(message => 
      (message.senderId === user.uid && message.receiverId === otherUserId) ||
      (message.senderId === otherUserId && message.receiverId === user.uid)
    ).sort((a, b) => {
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
      
      if (messageSnap.exists()) {
        const message = messageSnap.data();
        const deletedBy = message.deletedBy || [];
        
        if (!deletedBy.includes(user.uid)) {
          await updateDoc(messageRef, {
            deletedBy: [...deletedBy, user.uid]
          });
        }
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  };

  const deleteConversation = async (conversationId: string) => {
    if (!user) return;
    try {
      const [user1, user2] = conversationId.split('_');
      const otherUserId = user1 === user.uid ? user2 : user1;
      
      const messagesRef = collection(FIREBASE_DB, 'messages');
      const q = query(
        messagesRef,
        where('participants', 'array-contains', user.uid)
      );
      
      const snapshot = await getDocs(q);
      const batch = writeBatch(FIREBASE_DB);
      
      snapshot.docs.forEach((doc) => {
        const message = doc.data();
        if (
          (message.senderId === user.uid && message.receiverId === otherUserId) ||
          (message.senderId === otherUserId && message.receiverId === user.uid)
        ) {
          const deletedBy = message.deletedBy || [];
          if (!deletedBy.includes(user.uid)) {
            batch.update(doc.ref, {
              deletedBy: [...deletedBy, user.uid]
            });
          }
        }
      });
      
      await batch.commit();
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