import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { FIREBASE_DB } from '../../FirebaseConfig';

export const subscribeToMessages = (userId: string, callback: (messages: any[]) => void) => {
  const messagesRef = collection(FIREBASE_DB, 'messages');
  const q = query(
    messagesRef,
    where('receiverId', '==', userId),
    orderBy('timestamp', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(messages);
  });
};

export const sendMessage = async (message: {
  senderId: string;
  receiverId: string;
  content: string;
  type: 'disc_found' | 'general' | 'system';
}) => {
  const messagesRef = collection(FIREBASE_DB, 'messages');
  return addDoc(messagesRef, {
    ...message,
    timestamp: Date.now(),
    read: false,
  });
};

export const markMessageAsRead = async (messageId: string) => {
  const messageRef = doc(FIREBASE_DB, 'messages', messageId);
  return updateDoc(messageRef, { read: true });
}; 