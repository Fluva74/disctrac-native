import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PlayerHome from '../screens/PlayerHome';
import List from '../screens/List';
import Details from '../screens/Details';
import Inventory from '../screens/Inventory';
import AddDisc from '../screens/AddDisc';
import DiscGolfVideos from '../screens/DiscGolfVideos';
import ProVideos from '../screens/ProVideos';
import AmateurVideos from '../screens/AmateurVideos';

export type PlayerStackParamList = {
    PlayerHome: undefined;
    List: undefined;
    Details: undefined;
    Inventory: undefined;
    AddDisc: undefined;
    DiscGolfVideos: undefined;
    ProVideos: undefined;
    AmateurVideos: undefined;
};

const PlayerStack = createNativeStackNavigator<PlayerStackParamList>();

export default function PlayerStackNavigator() {
    return (
        <PlayerStack.Navigator initialRouteName="PlayerHome" screenOptions={{ headerShown: false }}>
            <PlayerStack.Screen name="PlayerHome" component={PlayerHome} />
            <PlayerStack.Screen name="List" component={List} />
            <PlayerStack.Screen name="Details" component={Details} />
            <PlayerStack.Screen name="Inventory" component={Inventory} />
            <PlayerStack.Screen name="AddDisc" component={AddDisc} />
            <PlayerStack.Screen name="DiscGolfVideos" component={DiscGolfVideos} />
            <PlayerStack.Screen name="ProVideos" component={ProVideos} />
            <PlayerStack.Screen name="AmateurVideos" component={AmateurVideos} />
        </PlayerStack.Navigator>
    );
}
