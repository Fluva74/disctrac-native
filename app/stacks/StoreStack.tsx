//StoreStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StoreHome from '../screens/StoreHome';
import StoreInventory from '../screens/StoreInventory';

export type StoreStackParamList = {
    StoreHome: undefined;
    StoreInventory: undefined;
};

const StoreStack = createNativeStackNavigator<StoreStackParamList>();

export default function StoreStackNavigator() {
    return (
        <StoreStack.Navigator initialRouteName="StoreHome" screenOptions={{ headerShown: false }}>
            <StoreStack.Screen name="StoreHome" component={StoreHome} />
            <StoreStack.Screen name="StoreInventory" component={StoreInventory} />
        </StoreStack.Navigator>
    );
}
