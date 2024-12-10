//StoreStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StoreHome from '../screens/StoreHome';
import StoreInventory from '../screens/StoreInventory';
import StoreAddDisc from '../screens/StoreAddDisc';

export type StoreStackParamList = {
    StoreHome: undefined;
    StoreInventory: undefined;
    StoreAddDisc: undefined;
};

const Stack = createNativeStackNavigator<StoreStackParamList>();

export default function StoreStackNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="StoreHome" component={StoreHome} />
            <Stack.Screen name="StoreInventory" component={StoreInventory} />
            <Stack.Screen name="StoreAddDisc" component={StoreAddDisc} />
        </Stack.Navigator>
    );
}
