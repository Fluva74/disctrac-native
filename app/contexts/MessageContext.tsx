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
  serverTimestamp
} from 'firebase/firestore';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: any;
  read: boolean;
  type: 'message' | 'alert';
  senderName?: string;
  discId?: string;
}

interface MessageContextType {
  messages: Message[];
  unreadCount: number;
  markAsRead: (messageId: string) => Promise<void>;
  sendMessage: (receiverId: string, message: string, discId?: string) => Promise<void>;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
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
      let unread = 0;
      
      snapshot.forEach((doc) => {
        const message = { id: doc.id, ...doc.data() } as Message;
        messageList.push(message);
        if (!message.read) unread++;
      });
      
      setMessages(messageList);
      setUnreadCount(unread);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const markAsRead = async (messageId: string) => {
    if (!currentUser) return;
    
    try {
      await updateDoc(doc(FIREBASE_DB, 'messages', messageId), {
        read: true
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const sendMessage = async (receiverId: string, message: string, discId?: string) => {
    if (!currentUser) return;
    
    try {
      const userDoc = await getDoc(doc(FIREBASE_DB, 'players', currentUser.uid));
      const senderName = userDoc.exists() ? 
        `${userDoc.data().firstName} ${userDoc.data().lastName}`.trim() : 
        'Unknown User';

      await addDoc(collection(FIREBASE_DB, 'messages'), {
        senderId: currentUser.uid,
        senderName,
        receiverId,
        message,
        discId,
        timestamp: serverTimestamp(),
        read: false,
        type: discId ? 'alert' : 'message'
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  return (
    <MessageContext.Provider value={{ messages, unreadCount, markAsRead, sendMessage }}>
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