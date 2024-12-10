import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabs from '../navigation/BottomTabs';
import AddDisc from '../screens/AddDisc';
import ScannerScreen from '../screens/ScannerScreen';
import Settings from '../screens/Settings';
import Profile from '../screens/Profile';
import EditProfile from '../screens/EditProfile';
import Messages from '../screens/Messages';
import MessageDetail from '../screens/MessageDetail';
import NewMessage from '../screens/NewMessage';
import DiscGolfVideos from '../screens/DiscGolfVideos';
import ProVideos from '../screens/ProVideos';
import AmateurVideos from '../screens/AmateurVideos';
import { InsideStackParamList } from '../../App';

export type PlayerStackParamList = {
  BottomTabs: undefined;
  AddDisc: { scannedData?: string };
  ScannerScreen: undefined;
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
  DiscGolfVideos: undefined;
  ProVideos: undefined;
  AmateurVideos: undefined;
};

const Stack = createNativeStackNavigator<InsideStackParamList>();

export default function PlayerStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BottomTabs" component={BottomTabs} />
      <Stack.Screen name="AddDisc" component={AddDisc} />
      <Stack.Screen name="ScannerScreen" component={ScannerScreen} />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="Messages" component={Messages} />
      <Stack.Screen name="MessageDetail" component={MessageDetail} />
      <Stack.Screen name="NewMessage" component={NewMessage} />
      <Stack.Screen name="DiscGolfVideos" component={DiscGolfVideos} />
      <Stack.Screen name="ProVideos" component={ProVideos} />
      <Stack.Screen name="AmateurVideos" component={AmateurVideos} />
    </Stack.Navigator>
  );
}

