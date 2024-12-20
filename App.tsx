import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StatusBar, Platform } from 'react-native';
import { AuthProvider, useAuth } from './app/contexts/AuthContext';
import { MessageProvider } from './app/contexts/MessageContext';
import { NotificationProvider, useNotifications } from './app/contexts/NotificationContext';
import { StoreNotificationProvider } from './app/contexts/StoreNotificationContext';
import { StoreProfile } from './app/types/Profile';

// Import all screens
import Login from './app/screens/Login';
import AccountSelection from './app/screens/AccountSelection';
import PlayerCreate from './app/screens/PlayerCreate';
import StoreCreate from './app/screens/StoreCreate';
import PlayerStackNavigator from './app/stacks/PlayerStack';
import StoreStackNavigator from './app/stacks/StoreStack';
import NotificationModal from './app/components/modals/NotificationModal';
import { FIREBASE_DB } from './FirebaseConfig';
import { getDoc, doc } from 'firebase/firestore';

// If you're using Expo
// import * as NavigationBar from 'expo-navigation-bar';

export type RootStackParamList = {
  Login: undefined;
  AccountSelection: undefined;
  PlayerCreate: undefined;
  StoreCreate: undefined;
  Inside: {
    screen: string;
    params?: {
      screen: string;
      params?: {
        screen: string;
      };
    };
  };
  ForgotPassword: undefined;
  PlayerStack: undefined | { screen?: string; params?: any };
  StoreStack: {
    screen: 'StoreBottomTabs';
    params: {
      screen: string;
    };
  };
  StoreBottomTabs: {
    screen?: string;
    params?: any;
  };
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
  MessagesScreen: undefined;
  Messages: undefined;
  MessageDetail: { 
    messageId: string;
    receiverInfo?: {
      id: string;
      name: string;
      discName?: string;
      initialMessage?: string;
    };
  };
  NewMessage: undefined;
  StoreBottomTabs: {
    screen: string;
  };
  StoreDetails: undefined;
  EditStoreProfile: { profile: StoreProfile };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Create a separate navigator component that uses the auth context
function RootNavigator() {
  const { user, loading: authLoading } = useAuth();
  const [isStoreAccount, setIsStoreAccount] = useState<boolean | null>(null);
  const [roleCheckComplete, setRoleCheckComplete] = useState(false);

  useEffect(() => {
    const checkUserRole = async () => {
      if (user) {
        console.log('=== Checking User Role ===');
        try {
          const storeDoc = await getDoc(doc(FIREBASE_DB, 'stores', user.uid));
          const isStore = storeDoc.exists();
          console.log('User ID:', user.uid);
          console.log('Is store account:', isStore);
          setIsStoreAccount(isStore);
          console.log('Navigation should go to:', isStore ? 'StoreStack' : 'PlayerStack');
        } catch (error) {
          console.error('Error checking user role:', error);
          setIsStoreAccount(false); // Default to player on error
        } finally {
          setRoleCheckComplete(true);
        }
      } else {
        setIsStoreAccount(null);
        setRoleCheckComplete(true);
      }
    };
    
    checkUserRole();
  }, [user]);

  // Debug logs
  useEffect(() => {
    console.log('=== Navigation State ===');
    console.log('Auth loading:', authLoading);
    console.log('Role check complete:', roleCheckComplete);
    console.log('User exists:', !!user);
    console.log('Is store account:', isStoreAccount);
    console.log('Should navigate to:', 
      !user ? 'Login' : 
      isStoreAccount ? 'StoreStack' : 
      'PlayerStack'
    );
  }, [authLoading, roleCheckComplete, user, isStoreAccount]);

  // Show loading state while either auth is loading or we're checking the role
  if (authLoading || !roleCheckComplete) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#09090B' }}>
        <ActivityIndicator size="large" color="#44FFA1" />
      </View>
    );
  }

  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName={!user ? 'Login' : (isStoreAccount ? 'StoreStack' : 'PlayerStack')}
    >
      {!user ? (
        // Auth screens
        <>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="AccountSelection" component={AccountSelection} />
          <Stack.Screen name="PlayerCreate" component={PlayerCreate} />
          <Stack.Screen name="StoreCreate" component={StoreCreate} />
        </>
      ) : (
        // App screens
        <>
          <Stack.Screen name="PlayerStack" component={PlayerStackNavigator} />
          <Stack.Screen name="StoreStack" component={StoreStackNavigator} />
        </>
      )}
    </Stack.Navigator>
  );
}

// Wrap the app with NotificationProvider
export default function App() {
  useEffect(() => {
    // Set status bar properties
    StatusBar.setTranslucent(true);
    StatusBar.setBackgroundColor('transparent');
    
    if (Platform.OS === 'android') {
      // Hide system navigation bar
      StatusBar.setHidden(true, 'slide');
    }
  }, []);

  return (
    <NavigationContainer>
      <StatusBar 
        translucent 
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <AuthProvider>
        <NotificationProvider>
          <StoreNotificationProvider>
            <MessageProvider>
              <RootNavigator />
              <NotificationOverlay />
            </MessageProvider>
          </StoreNotificationProvider>
        </NotificationProvider>
      </AuthProvider>
    </NavigationContainer>
  );
}

// Create NotificationOverlay component
function NotificationOverlay() {
  const { currentNotification, dismissNotification, handleReleaseDisc } = useNotifications();
  console.log('NotificationOverlay render, currentNotification:', currentNotification);

  if (!currentNotification) {
    console.log('No current notification to show');
    return null;
  }

  console.log('Showing notification modal for:', currentNotification.discName);
  return (
    <NotificationModal
      visible={true}
      onClose={dismissNotification}
      onReleaseDisc={() => handleReleaseDisc(currentNotification.discId)}
      discName={currentNotification.discName}
      company={currentNotification.company}
      color={currentNotification.color}
    />
  );
}
