import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './app/screens/Login';
import List from './app/screens/List';
import Details from './app/screens/Details';
import AccountSelection from './app/screens/AccountSelection';
import PlayerCreate from './app/screens/PlayerCreate';
import StoreCreate from './app/screens/StoreCreate';
import PlayerHome from './app/screens/PlayerHome';
import Inventory from './app/screens/Inventory'; // Add Inventory here
import AddDisc from './app/screens/AddDisc';     // Add AddDisc here
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { FIREBASE_AUTH } from './FirebaseConfig';



export type InsideStackParamList = {
    PlayerHome: undefined;
    List: undefined;
    Details: undefined;
    Inventory: undefined; // Add Inventory here if not already included
    AddDisc: undefined;    // Add AddDisc here

};

export type RootStackParamList = {
    Login: undefined;
    Inside: { screen: keyof InsideStackParamList };
    AccountSelection: undefined;
    PlayerCreate: undefined;
    StoreCreate: undefined;

};

const Stack = createNativeStackNavigator<RootStackParamList>();
const InsideStack = createNativeStackNavigator<InsideStackParamList>();

function InsideLayout() {
    return (
        <InsideStack.Navigator initialRouteName="PlayerHome">
            <InsideStack.Screen name="PlayerHome" component={PlayerHome} />
            <InsideStack.Screen name="List" component={List} />
            <InsideStack.Screen name="Details" component={Details} />
            <InsideStack.Screen name="Inventory" component={Inventory} /> 
            <InsideStack.Screen name="AddDisc" component={AddDisc} />    
        </InsideStack.Navigator>
    );
}

export default function App() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        onAuthStateChanged(FIREBASE_AUTH, (user) => {
            setUser(user);
        });
    }, []);

    return (
      <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
          {user ? (
              <>
                  <Stack.Screen name="Inside" component={InsideLayout} options={{ headerShown: false }} />
              </>
          ) : (
              <>
                  <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
                  <Stack.Screen name="AccountSelection" component={AccountSelection} />
                  <Stack.Screen name="PlayerCreate" component={PlayerCreate} />
                  <Stack.Screen name="StoreCreate" component={StoreCreate} />
              </>
          )}
      </Stack.Navigator>
  </NavigationContainer>
    );
}
