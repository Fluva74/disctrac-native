//StoreStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StoreBottomTabs from '../navigation/StoreBottomTabs';
import StoreScanResult from '../screens/StoreScanResult';
import StoreAddDisc from '../screens/StoreAddDisc';

export type StoreStackParamList = {
  StoreBottomTabs: undefined;
  StoreScanResult: {
    scannedData: string;
  };
  StoreAddDisc: undefined;
};

const Stack = createNativeStackNavigator<StoreStackParamList>();

export default function StoreStackNavigator() {
  console.log('=== Store Stack Navigator ===');
  console.log('Rendering StoreStack');
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="StoreBottomTabs" 
        component={StoreBottomTabs} 
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name="StoreScanResult" component={StoreScanResult} />
      <Stack.Screen name="StoreAddDisc" component={StoreAddDisc} />
    </Stack.Navigator>
  );
}
