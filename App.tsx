// App.tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './app/screens/Login';
import List from './app/screens/List';
import Details from './app/screens/Details';
import AccountSelection from './app/screens/AccountSelection';
import PlayerCreate from './app/screens/PlayerCreate';
import StoreCreate from './app/screens/StoreCreate';
import PlayerHome from './app/screens/PlayerHome';
import Inventory from './app/screens/Inventory';
import AddDisc from './app/screens/AddDisc';
import { onAuthStateChanged, User } from 'firebase/auth';
import { FIREBASE_AUTH } from './FirebaseConfig';

export type InsideStackParamList = {
    PlayerHome: undefined;
    List: undefined;
    Details: undefined;
    Inventory: undefined;
    AddDisc: undefined;
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
        <InsideStack.Navigator initialRouteName="PlayerHome" screenOptions={{ headerShown: false }}>
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
            <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
                {user ? (
                    <Stack.Screen name="Inside" component={InsideLayout} />
                ) : (
                    <>
                        <Stack.Screen name="Login" component={Login} />
                        <Stack.Screen name="AccountSelection" component={AccountSelection} />
                        <Stack.Screen name="PlayerCreate" component={PlayerCreate} />
                        <Stack.Screen name="StoreCreate" component={StoreCreate} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f0f4f8', // Global background color
    },
});
