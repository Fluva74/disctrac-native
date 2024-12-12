import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NotificationProvider } from './contexts/NotificationContext';
import { NotificationOverlay } from './components/NotificationOverlay';
import PlayerStack from './stacks/PlayerStack';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NotificationProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false
          }}
        >
          <Stack.Screen name="PlayerStack" component={PlayerStack} />
        </Stack.Navigator>
        <NotificationOverlay />
      </NavigationContainer>
    </NotificationProvider>
  );
}

export default App; 