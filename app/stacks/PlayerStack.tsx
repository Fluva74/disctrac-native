import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AddDisc from '../screens/AddDisc';
import ScannerScreen from '../screens/ScannerScreen';
import BottomTabs from '../navigation/BottomTabs';
import Settings from '../screens/Settings';
import Profile from '../screens/Profile';
import EditProfile from '../screens/EditProfile';
import Messages from '../screens/Messages';
import MessageDetail from '../screens/MessageDetail';

export type PlayerStackParamList = {
    PlayerHome: undefined;
    Details: undefined;
    Inventory: { 
        showAlert?: boolean;
        alertMessage?: string;
        alertTitle?: string;
    } | undefined;
    AddDisc: { scannedData?: string };
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
    MessageDetail: {
        messageId: string;
    };
};

const PlayerStack = createNativeStackNavigator<PlayerStackParamList>();

export default function PlayerStackNavigator() {
    return (
        <PlayerStack.Navigator initialRouteName="BottomTabs" screenOptions={{ headerShown: false }}>
            <PlayerStack.Screen name="BottomTabs" component={BottomTabs} />
            <PlayerStack.Screen name="AddDisc" component={AddDisc} options={{ presentation: 'modal' }} />
            <PlayerStack.Screen name="ScannerScreen" component={ScannerScreen} />
            <PlayerStack.Screen name="Settings" component={Settings} options={{ presentation: 'modal' }} />
            <PlayerStack.Screen name="Profile" component={Profile} options={{ presentation: 'modal' }} />
            <PlayerStack.Screen name="EditProfile" component={EditProfile} options={{ presentation: 'modal' }} />
            <PlayerStack.Screen name="Messages" component={Messages} />
            <PlayerStack.Screen name="MessageDetail" component={MessageDetail} />
        </PlayerStack.Navigator>
    );
}

