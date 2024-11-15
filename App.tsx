// App.tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './app/screens/Login';
import AccountSelection from './app/screens/AccountSelection';
import PlayerCreate from './app/screens/PlayerCreate';
import StoreCreate from './app/screens/StoreCreate';
import PlayerHome from './app/screens/PlayerHome';
import StoreHome from './app/screens/StoreHome';
import Inventory from './app/screens/Inventory';
import AddDisc from './app/screens/AddDisc';
import DiscGolfVideos from './app/screens/DiscGolfVideos';
import ProVideos from './app/screens/ProVideos';
import AmateurVideos from './app/screens/AmateurVideos';
import { onAuthStateChanged, User } from 'firebase/auth';
import { FIREBASE_AUTH, FIREBASE_DB } from './FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export type RootStackParamList = {
    Login: undefined;
    Inside: { screen: keyof InsideStackParamList };
    AccountSelection: undefined;
    PlayerCreate: undefined;
    StoreCreate: undefined;
};

// Define and export InsideStackParamList for screens in InsideLayout
export type InsideStackParamList = {
    PlayerHome: undefined;
    StoreHome: undefined;
    Inventory: undefined;
    AddDisc: undefined;
    DiscGolfVideos: undefined;
    ProVideos: undefined;
    AmateurVideos: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
    const [user, setUser] = useState<User | null>(null);
    const [initialRoute, setInitialRoute] = useState<keyof InsideStackParamList | null>(null); 

    useEffect(() => {
        onAuthStateChanged(FIREBASE_AUTH, async (authUser) => {
            setUser(authUser);

            if (authUser) {
                const playerDoc = await getDoc(doc(FIREBASE_DB, 'players', authUser.uid));
                if (playerDoc.exists()) {
                    setInitialRoute('PlayerHome');  
                } else {
                    const storeDoc = await getDoc(doc(FIREBASE_DB, 'stores', authUser.uid));
                    if (storeDoc.exists()) {
                        setInitialRoute('StoreHome');
                    } else {
                        console.log('User role not found.');
                    }
                }
            } else {
                setInitialRoute(null);
            }
        });
    }, []);

    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
                {user && initialRoute ? (
                    <Stack.Screen name="Inside">
                        {() => <InsideLayout initialRoute={initialRoute} />}
                    </Stack.Screen>
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

const InsideLayout = ({ initialRoute }: { initialRoute: keyof InsideStackParamList }) => {
    const InsideStack = createNativeStackNavigator<InsideStackParamList>();
    return (
        <InsideStack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
            <InsideStack.Screen name="PlayerHome" component={PlayerHome} />
            <InsideStack.Screen name="StoreHome" component={StoreHome} />
            <InsideStack.Screen name="Inventory" component={Inventory} />
            <InsideStack.Screen name="AddDisc" component={AddDisc} />
            <InsideStack.Screen name="DiscGolfVideos" component={DiscGolfVideos} />
            <InsideStack.Screen name="ProVideos" component={ProVideos} />
            <InsideStack.Screen name="AmateurVideos" component={AmateurVideos} />
        </InsideStack.Navigator>
    );
};

export default App;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f0f4f8',
    },
});
