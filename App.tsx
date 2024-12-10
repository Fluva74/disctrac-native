import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FIREBASE_AUTH, FIREBASE_DB } from './FirebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Import all screens
import Login from './app/screens/Login';
import AccountSelection from './app/screens/AccountSelection';
import PlayerCreate from './app/screens/PlayerCreate';
import StoreCreate from './app/screens/StoreCreate';
import PlayerStackNavigator from './app/stacks/PlayerStack';
import StoreStackNavigator from './app/stacks/StoreStack';
import { MessageProvider } from './app/contexts/MessageContext';

export type RootStackParamList = {
  Login: undefined;
  AccountSelection: undefined;
  PlayerCreate: undefined;
  StoreCreate: undefined;
  ForgotPassword: undefined;
  PlayerStack: undefined | { screen?: string; params?: any };
  StoreStack: undefined | { screen?: string; params?: any };
};

export type InsideStackParamList = {
  AddDisc: { scannedData: string };
  StoreInventory: undefined;
  StoreAddDisc: undefined;
  PlayerHome: undefined;
  StoreHome: undefined;
  Inventory: {
    showAlert?: boolean;
    alertMessage?: string;
    alertTitle?: string;
  };
  ScannerScreen: undefined;
  CustomizeDisc: undefined;
  DiscGolfVideos: undefined;
  ProVideos: undefined;
  AmateurVideos: undefined;
  BottomTabs: undefined;
  Settings: undefined;
  Profile: undefined;
  EditProfile: {
    profile: {
      email?: string;
      phone?: string;
      pdgaNumber?: string;
      firstName?: string;
      lastName?: string;
      city?: string;
      state?: string;
      teamName?: string;
      avatarUrl?: string;
      contactPreferences?: {
        email: boolean;
        phone: boolean;
        inApp: boolean;
      };
    };
  };
  Messages: undefined;
  MessageDetail: { messageId: string };
  NewMessage: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'player' | 'store' | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(FIREBASE_AUTH, async (authUser) => {
      setUser(authUser);

      if (authUser) {
        // Check if player
        const playerDoc = await getDoc(doc(FIREBASE_DB, 'players', authUser.uid));
        if (playerDoc.exists()) {
          setUserRole('player');
        } else {
          // Check if store
          const storeDoc = await getDoc(doc(FIREBASE_DB, 'stores', authUser.uid));
          if (storeDoc.exists()) {
            setUserRole('store');
          }
        }
      } else {
        setUserRole(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <NavigationContainer>
      <MessageProvider>
        <Stack.Navigator 
          screenOptions={{ headerShown: false }}
          initialRouteName="Login"
        >
          {/* Auth Screens */}
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="AccountSelection" component={AccountSelection} />
          <Stack.Screen name="PlayerCreate" component={PlayerCreate} />
          <Stack.Screen name="StoreCreate" component={StoreCreate} />
          
          {/* Main App Stacks */}
          <Stack.Screen name="PlayerStack" component={PlayerStackNavigator} />
          <Stack.Screen name="StoreStack" component={StoreStackNavigator} />
        </Stack.Navigator>
      </MessageProvider>
    </NavigationContainer>
  );
}

export default App;
