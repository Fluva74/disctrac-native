import React, { createContext, useContext, useState, useEffect } from 'react';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { User } from 'firebase/auth';
import { hasPushNotificationBeenAsked, setPushNotificationAsked } from '../utils/storage';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';
import { notificationService } from '../services/notificationService';

type NotificationPermissionStatus = 
  Notifications.PermissionStatus.GRANTED | 
  Notifications.PermissionStatus.DENIED | 
  Notifications.PermissionStatus.UNDETERMINED;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  handleNewSignIn: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const explainAndRequestPermission = async () => {
    return new Promise<void>((resolve) => {
      Alert.alert(
        "Enable Notifications",
        "Allow notifications to receive updates when:\n\n" +
        "• Someone finds your disc\n" +
        "• You receive a message\n" +
        "• Your disc is ready for pickup\n\n" +
        "You can change this later in settings.",
        [
          {
            text: "Not Now",
            style: "cancel",
            onPress: async () => {
              await setPushNotificationAsked();
              resolve();
            }
          },
          {
            text: "Enable",
            onPress: async () => {
              const { status } = await Notifications.requestPermissionsAsync();
              await setPushNotificationAsked();
              if (status === Notifications.PermissionStatus.GRANTED) {
                await notificationService.registerForPushNotifications();
              }
              resolve();
            }
          }
        ]
      );
    });
  };

  const handleNewSignIn = async () => {
    try {
      const hasBeenAsked = await hasPushNotificationBeenAsked();
    } catch (error) {
      console.error('Error handling new sign in:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = FIREBASE_AUTH.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, handleNewSignIn }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
