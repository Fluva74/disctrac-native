import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './app/screens/Login';
import List from './app/screens/List';
import Details from './app/screens/Details';
import AccountSelection from './app/screens/AccountSelection'; // Import AccountSelection
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { FIREBASE_AUTH } from './FirebaseConfig';
import PlayerCreate from './app/screens/PlayerCreate'; // Import PlayerCreate 
import StoreCreate from './app/screens/StoreCreate'; // Import StoreCreate


export type RootStackParamList = {
    Login: undefined;
    Inside: undefined;
    AccountSelection: undefined;
    PlayerCreate: undefined;
    StoreCreate: undefined;
    // Add other screens as needed
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const InsideStack = createNativeStackNavigator();

function InsideLayout() {
    return (
        <InsideStack.Navigator>
            <InsideStack.Screen name="List" component={List} />
            <InsideStack.Screen name="Details" component={Details} />
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
                    <Stack.Screen name="Inside" component={InsideLayout} options={{ headerShown: false }} />
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
