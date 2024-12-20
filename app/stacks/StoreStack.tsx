//StoreStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StoreBottomTabs from '../navigation/StoreBottomTabs';
import StoreScanResult from '../screens/StoreScanResult';
import StoreAddDisc from '../screens/StoreAddDisc';
import StoreSettings from '../screens/StoreSettings';
import StoreDetails from '../screens/StoreDetails';
import { StoreProfile } from '../types/Profile';
import EditStoreProfile from '../screens/EditStoreProfile';
import StoreInventory from '../screens/StoreInventory';

export type StoreStackParamList = {
  StoreBottomTabs: undefined;
  StoreScanResult: {
    scannedData: string;
  };
  StoreAddDisc: undefined;
  StoreSettings: undefined;
  StoreDetails: undefined;
  EditStoreProfile: { profile: StoreProfile };
  StoreInventory: { storeId: string };
};

const Stack = createNativeStackNavigator<StoreStackParamList>();

export default function StoreStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="StoreBottomTabs" 
        component={StoreBottomTabs} 
      />
      <Stack.Screen 
        name="StoreScanResult" 
        component={StoreScanResult} 
      />
      <Stack.Screen 
        name="StoreAddDisc" 
        component={StoreAddDisc} 
      />
      <Stack.Screen 
        name="StoreSettings" 
        component={StoreSettings} 
      />
      <Stack.Screen 
        name="StoreDetails" 
        component={StoreDetails} 
      />
      <Stack.Screen 
        name="EditStoreProfile" 
        component={EditStoreProfile} 
      />
      <Stack.Screen 
        name="StoreInventory"
        component={StoreInventory}
        initialParams={{ storeId: 'oHbdQ0UK9NYztDYLAsy9Oq67dld2' }}
      />
    </Stack.Navigator>
  );
}
