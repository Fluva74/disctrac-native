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
  getDocs
} from 'firebase/firestore';

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
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Handle auth state changes
  useEffect(() => {
    const unsubscribeAuth = FIREBASE_AUTH.onAuthStateChanged(user => {
      setCurrentUserId(user?.uid || null);
    });

    return () => unsubscribeAuth();
  }, []);

  // Handle messages subscription
  useEffect(() => {
    if (!currentUserId) {
      setMessages([]);
      setUnreadCount(0);
      return;
    }

    try {
      const messagesRef = collection(FIREBASE_DB, 'messages');
      const messageQuery = query(
        messagesRef,
        where('participants', 'array-contains', currentUserId),
        orderBy('timestamp', 'desc')
      );

      const unsubscribe = onSnapshot(
        messageQuery, 
        (snapshot) => {
          const messageList: Message[] = [];
          let unread = 0;
          
          snapshot.forEach((doc) => {
            const message = { id: doc.id, ...doc.data() } as Message;
            messageList.push(message);
            if (!message.read && message.receiverId === currentUserId) {
              unread++;
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
  }, [currentUserId]);

  // Rest of the functions remain the same but use currentUserId instead of currentUser
  const sendMessage = async (receiverId: string, message: string, discId?: string) => {
    if (!currentUserId) return;
    
    try {
      // Validate inputs
      if (!receiverId.trim() || !message.trim()) {
        throw new Error('Invalid message parameters');
      }

      const userDoc = await getDoc(doc(FIREBASE_DB, 'players', currentUserId));
      if (!userDoc.exists()) {
        throw new Error('Sender profile not found');
      }

      // Verify receiver exists
      const receiverDoc = await getDoc(doc(FIREBASE_DB, 'players', receiverId));
      if (!receiverDoc.exists()) {
        throw new Error('Receiver not found');
      }

      const senderName = `${userDoc.data().firstName} ${userDoc.data().lastName}`.trim() || 'Unknown User';
      const now = new Date();

      const messageData = {
        senderId: currentUserId,
        senderName,
        receiverId,
        message: message.trim(),
        timestamp: serverTimestamp(),
        read: false,
        type: discId ? 'alert' : 'message',
        participants: [currentUserId, receiverId],
        ...(discId && { discId }),
        createdAt: now.toISOString(), // ISO string format
      };

      const messagesRef = collection(FIREBASE_DB, 'messages');
      await addDoc(messagesRef, messageData);

    } catch (error: any) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const markAsRead = async (messageId: string) => {
    if (!currentUserId) return;
    
    try {
      await updateDoc(doc(FIREBASE_DB, 'messages', messageId), {
        read: true
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const getConversationMessages = (otherUserId: string) => {
    if (!currentUserId) return [];
    
    return messages.filter(message => 
      (message.senderId === currentUserId && message.receiverId === otherUserId) ||
      (message.senderId === otherUserId && message.receiverId === currentUserId)
    ).sort((a, b) => {
      const timeA = a.timestamp?.toDate?.()?.getTime() || new Date(a.createdAt).getTime();
      const timeB = b.timestamp?.toDate?.()?.getTime() || new Date(b.createdAt).getTime();
      return timeA - timeB;
    });
  };

  return (
    <MessageContext.Provider value={{ 
      messages, 
      unreadCount, 
      getConversationMessages, 
      markAsRead, 
      sendMessage 
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