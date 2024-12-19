import React, { createContext, useContext, useState, useEffect } from 'react';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, orderBy, getDoc, setDoc } from 'firebase/firestore';
import NotificationModal from '../components/modals/NotificationModal';
import { useAuth } from './AuthContext';

interface Notification {
  id: string;
  discId: string;
  discName: string;
  company: string;
  timestamp: any;
  type: 'DISC_FOUND';
  read: boolean;
  color: string;
  status?: string;
  message?: string;
  notifiedAt?: string;
  uid?: string;
  name?: string;
  manufacturer?: string;
  storeId?: string;
  storeName?: string;
  scannerUserId?: string;
  scannerName?: string;
  foundAt?: string;
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
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    console.log('\n=== Setting up Notification Listener ===');
    console.log('User ID:', user.uid);

    const playerRef = doc(FIREBASE_DB, 'players', user.uid);
    
    const unsubscribe = onSnapshot(playerRef, (doc) => {
      console.log('\n=== Notification Snapshot Received ===');
      console.log('Document exists:', doc.exists());
      console.log('Document data:', doc.data());
      
      const notification = doc.data()?.notification;
      console.log('Notification data:', notification);

      if (notification) {
        console.log('Setting current notification');
        setCurrentNotification(notification);
      } else {
        console.log('No notification found, clearing current notification');
        setCurrentNotification(null);
      }
    });

    return () => {
      console.log('Cleaning up notification listener');
      unsubscribe();
    };
  }, [user]);

  const dismissNotification = async () => {
    console.log('\n=== Dismissing Notification ===');
    if (!user) return;

    try {
      console.log('Clearing notification for user:', user.uid);
      const playerRef = doc(FIREBASE_DB, 'players', user.uid);
      await updateDoc(playerRef, {
        notification: null
      });
      console.log('Notification cleared successfully');
      setCurrentNotification(null);
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  const handleReleaseDisc = async (discId: string) => {
    console.log('\n=== Handling Disc Release ===');
    if (!user) return;

    try {
      console.log('Disc ID:', discId);
      console.log('User ID:', user.uid);

      // Get the current notification data
      const playerRef = doc(FIREBASE_DB, 'players', user.uid);
      const playerDoc = await getDoc(playerRef);
      const notification = playerDoc.data()?.notification;

      if (!notification) {
        console.log('No notification found');
        return;
      }

      // Update store inventory status to 'released' immediately
      console.log('Updating store inventory to released status...');
      const storeInventoryRef = doc(FIREBASE_DB, 'storeInventory', discId);
      await setDoc(storeInventoryRef, {
        ...notification,  // Keep existing disc data
        status: 'released',
        releasedAt: new Date().toISOString(),
        releasedBy: user.uid
      }, { merge: true });

      // Remove disc from player's inventory
      console.log('Removing disc from player inventory...');
      const playerDiscRef = doc(FIREBASE_DB, 'playerDiscs', `${user.uid}_${discId}`);
      await deleteDoc(playerDiscRef);

      // Notify store with proper message
      console.log('Notifying store...');
      const storeRef = doc(FIREBASE_DB, 'stores', notification.storeId);
      const storeNotification = {
        type: 'DISC_RELEASED',
        discId,
        discName: notification.discName,
        discColor: notification.color,  // Add color for the image
        message: `${notification.discName} has been released by ${user.displayName || 'the player'} and added to your released inventory.`,
        timestamp: new Date().toISOString(),
        status: 'released',
        company: notification.company,
        manufacturer: notification.manufacturer,
        userId: user.uid,
        userName: user.displayName || 'Player'
      };

      await updateDoc(storeRef, {
        notification: storeNotification
      });

      console.log('Store notification sent:', storeNotification);

      // Clear the player's notification
      console.log('Clearing player notification...');
      await updateDoc(playerRef, {
        notification: null
      });

      // Update local state and close modal
      setCurrentNotification(null);
      console.log('=== Disc Release Complete ===\n');

    } catch (error) {
      console.error('Error releasing disc:', error);
      // Don't show error alert since the operation partially succeeded
      // Just clear the notification to close the modal
      try {
        const playerRef = doc(FIREBASE_DB, 'players', user.uid);
        await updateDoc(playerRef, {
          notification: null
        });
        setCurrentNotification(null);
      } catch (clearError) {
        console.error('Error clearing notification:', clearError);
      }
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