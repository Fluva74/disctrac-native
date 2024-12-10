import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from './app/contexts/AuthContext';
import { MessageProvider } from './app/contexts/MessageContext';

// Import all screens
import Login from './app/screens/Login';
import AccountSelection from './app/screens/AccountSelection';
import PlayerCreate from './app/screens/PlayerCreate';
import StoreCreate from './app/screens/StoreCreate';
import PlayerStackNavigator from './app/stacks/PlayerStack';
import StoreStackNavigator from './app/stacks/StoreStack';

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

// Create a separate navigator component that uses the auth context
function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#09090B' }}>
        <ActivityIndicator size="large" color="#44FFA1" />
      </View>
    );
  }

  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName={user ? "PlayerStack" : "Login"}
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

export default function App() {
  return (
    <AuthProvider>
      <MessageProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </MessageProvider>
    </AuthProvider>
  );
}
