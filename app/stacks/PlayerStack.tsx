// PlayerStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PlayerHome from '../screens/PlayerHome';
import Inventory from '../screens/Inventory';
import AddDisc from '../screens/AddDisc';
import ColorChanger from '../screens/ColorChanger';
import ScannerScreen from '../screens/ScannerScreen';
// import CustomizeDisc from '../screens/CustomizeDisc';
import DiscGolfVideos from '../screens/DiscGolfVideos';
import ProVideos from '../screens/ProVideos';
import AmateurVideos from '../screens/AmateurVideos';
import TestAutoCompleteDropdown from '../screens/TestAutoCompleteDropdown'; // Import the test screen

export type PlayerStackParamList = {
    PlayerHome: undefined;
    Details: undefined;
    Inventory: undefined;
    AddDisc: { scannedData?: string };
    ColorChanger: undefined;
    ScannerScreen: undefined;
    CustomizeDisc: undefined;
    DiscGolfVideos: undefined;
    ProVideos: undefined;
    AmateurVideos: undefined;
    TestAutoCompleteDropdown: undefined; // Add type definition for the test screen
};

const PlayerStack = createNativeStackNavigator<PlayerStackParamList>();

export default function PlayerStackNavigator() {
    return (
        <PlayerStack.Navigator initialRouteName="PlayerHome" screenOptions={{ headerShown: false }}>
            <PlayerStack.Screen name="PlayerHome" component={PlayerHome} />
            <PlayerStack.Screen name="Inventory" component={Inventory} />
            <PlayerStack.Screen name="AddDisc" component={AddDisc} />
            <PlayerStack.Screen name="ColorChanger" component={ColorChanger} />
            <PlayerStack.Screen name="ScannerScreen" component={ScannerScreen} />
            {/* <PlayerStack.Screen name="CustomizeDisc" component={CustomizeDisc} /> */}
            <PlayerStack.Screen name="DiscGolfVideos" component={DiscGolfVideos} />
            <PlayerStack.Screen name="ProVideos" component={ProVideos} />
            <PlayerStack.Screen name="AmateurVideos" component={AmateurVideos} />
            <PlayerStack.Screen name="TestAutoCompleteDropdown" component={TestAutoCompleteDropdown} /> {/* Add the test screen */}
        </PlayerStack.Navigator>
    );
}
