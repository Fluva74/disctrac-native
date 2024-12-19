import React, { createContext, useContext, useState, useEffect } from 'react';
import { FIREBASE_DB } from '../../FirebaseConfig';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import StoreDiscReleasedModal from '../components/modals/StoreDiscReleasedModal';

interface StoreNotificationContextType {
  currentNotification: any;
  dismissNotification: () => Promise<void>;
}

const StoreNotificationContext = createContext<StoreNotificationContextType | undefined>(undefined);

export function StoreNotificationProvider({ children }: { children: React.ReactNode }) {
  const [currentNotification, setCurrentNotification] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    console.log('\n=== Setting up Store Notification Listener ===');
    const storeRef = doc(FIREBASE_DB, 'stores', user.uid);
    
    const unsubscribe = onSnapshot(storeRef, (doc) => {
      console.log('Store notification snapshot:', doc.data()?.notification);
      setCurrentNotification(doc.data()?.notification);
    });

    return () => unsubscribe();
  }, [user]);

  const dismissNotification = async () => {
    if (!user) return;
    const storeRef = doc(FIREBASE_DB, 'stores', user.uid);
    await updateDoc(storeRef, { notification: null });
    setCurrentNotification(null);
  };

  return (
    <StoreNotificationContext.Provider value={{ currentNotification, dismissNotification }}>
      {children}
      {currentNotification?.type === 'DISC_RELEASED' && (
        <StoreDiscReleasedModal
          visible={true}
          onClose={dismissNotification}
          discName={currentNotification.discName}
        />
      )}
    </StoreNotificationContext.Provider>
  );
} 