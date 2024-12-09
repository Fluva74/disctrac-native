import React, { createContext, useContext, useState, useEffect } from 'react';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';

interface Notification {
  id: string;
  discId: string;
  discName: string;
  company: string;
  timestamp: any;
  type: 'DISC_FOUND';
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  currentNotification: Notification | null;
  dismissNotification: () => void;
  handleReleaseDisc: (discId: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);

  useEffect(() => {
    const user = FIREBASE_AUTH.currentUser;
    if (!user) {
      console.log('No user logged in for notifications');
      return;
    }

    console.log('Setting up notification listener for user:', user.uid);
    const notificationsRef = collection(FIREBASE_DB, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', user.uid),
      where('read', '==', false),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('Notification snapshot received:', snapshot.size, 'notifications');
      const notificationsList: Notification[] = [];
      
      snapshot.docChanges().forEach((change) => {
        console.log('Notification change type:', change.type);
        if (change.type === 'added') {
          const notification = { 
            id: change.doc.id, 
            ...change.doc.data() 
          } as Notification;
          console.log('New notification:', notification);
          notificationsList.push(notification);
        }
      });

      // If we have new notifications, show the most recent one
      if (notificationsList.length > 0) {
        console.log('Setting current notification:', notificationsList[0]);
        setCurrentNotification(notificationsList[0]);
      }

      setNotifications(prev => {
        const newNotifications = [...notificationsList, ...prev];
        console.log('Updated notifications list:', newNotifications.length);
        return newNotifications;
      });
    }, (error) => {
      console.error('Notification listener error:', error);
    });

    return () => {
      console.log('Cleaning up notification listener');
      unsubscribe();
    };
  }, []);

  const dismissNotification = async () => {
    if (!currentNotification) return;

    try {
      // Mark notification as read
      await updateDoc(doc(FIREBASE_DB, 'notifications', currentNotification.id), {
        read: true
      });
      
      setCurrentNotification(null);
      
      // Show next notification if there is one
      const remainingNotifications = notifications.filter(n => n.id !== currentNotification.id);
      if (remainingNotifications.length > 0) {
        setCurrentNotification(remainingNotifications[0]);
      }
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  const handleReleaseDisc = async (discId: string) => {
    // Handle releasing the disc logic here
    // This might involve updating the disc's status in Firestore
  };

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        currentNotification, 
        dismissNotification,
        handleReleaseDisc
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
} 