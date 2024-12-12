import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import NotificationModal from '../screens/NotificationModal';
import { DiscReleasedModal } from '../components/modals';

interface Notification {
  id: string;
  discId: string;
  discName: string;
  company: string;
  timestamp: any;
  type: 'DISC_FOUND' | 'DISC_RELEASED';
  read: boolean;
  userId: string;
  scannerUserId?: string;
  color?: string;
  modalMessage?: string;
  modalImage?: any;
  name: string;
  manufacturer: string;
}

interface NotificationContextType {
  notifications: Notification[];
  currentNotification: Notification | null;
  dismissNotification: () => void;
  handleReleaseDisc: (discId: string) => Promise<boolean>;
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
        if (change.type === 'added' || change.type === 'modified') {
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
        setNotifications(prev => {
          const newNotifications = [...notificationsList, ...prev.filter(n => 
            !notificationsList.some(newN => newN.id === n.id)
          )];
          console.log('Updated notifications list:', newNotifications.length);
          return newNotifications;
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const dismissNotification = async () => {
    if (!currentNotification) return;

    try {
      console.log('Dismissing notification:', currentNotification.id);
      
      // Mark notification as read in Firestore
      await updateDoc(doc(FIREBASE_DB, 'notifications', currentNotification.id), {
        read: true
      });
      
      // Update local notifications list
      setNotifications(prev => prev.filter(n => n.id !== currentNotification.id));
      
      // Clear current notification
      setCurrentNotification(null);
      
      // Show next notification if there is one
      const remainingNotifications = notifications.filter(n => 
        n.id !== currentNotification.id && !n.read
      );
      
      console.log('Remaining notifications:', remainingNotifications.length);
      
      if (remainingNotifications.length > 0) {
        setCurrentNotification(remainingNotifications[0]);
      }
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  const handleReleaseDisc = async (discId: string): Promise<boolean> => {
    try {
      const user = FIREBASE_AUTH.currentUser;
      if (!user) {
        console.error('No user logged in');
        return false;
      }

      if (!currentNotification?.scannerUserId) {
        console.error('No scanner ID found in notification');
        Alert.alert('Error', 'Unable to notify disc finder. Please try again.');
        return false;
      }

      // Get the disc document ID from the notification
      const discDocId = `${user.uid}_${discId}`;
      console.log('Attempting to release disc:', discDocId);

      try {
        // Delete the disc from playerDiscs collection
        const discDocRef = doc(FIREBASE_DB, 'playerDiscs', discDocId);
        await deleteDoc(discDocRef);
        console.log('Disc deleted from playerDiscs:', discDocId);

        // Create a DISC_RELEASED notification for the scanner (finder)
        if (currentNotification) {
          console.log('Creating release notification for scanner:', currentNotification.scannerUserId);
          
          // Ensure we have a valid color, defaulting to 'White' if none exists
          const discColor = currentNotification.color || 'White';
          
          const notificationData = {
            userId: currentNotification.scannerUserId,
            discId: currentNotification.discId,
            discName: currentNotification.discName,
            company: currentNotification.company,
            color: discColor,  // Use the validated color
            timestamp: serverTimestamp(),
            type: 'DISC_RELEASED' as const,
            read: false,
            scannerUserId: currentNotification.scannerUserId,
            name: currentNotification.discName,
            manufacturer: currentNotification.company
          };

          // Add the notification
          const notificationsRef = collection(FIREBASE_DB, 'notifications');
          await addDoc(notificationsRef, notificationData);
          console.log('Release notification created with color:', discColor);

          // Mark the original notification as read
          await updateDoc(doc(FIREBASE_DB, 'notifications', currentNotification.id), {
            read: true
          });
          console.log('Original notification marked as read');
        }

        // Clear current notification
        setCurrentNotification(null);

        // Update notifications list
        setNotifications(prev => prev.filter(n => n.id !== currentNotification?.id));

        return true;
      } catch (error) {
        console.error('Error in disc release operations:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error releasing disc:', error);
      Alert.alert('Error', 'Failed to release disc. Please try again.');
      return false;
    }
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