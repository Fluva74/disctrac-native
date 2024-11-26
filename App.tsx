// App.tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AutocompleteDropdownContextProvider } from 'react-native-autocomplete-dropdown';
import Login from './app/screens/Login';
import AccountSelection from './app/screens/AccountSelection';
import PlayerCreate from './app/screens/PlayerCreate';
import StoreCreate from './app/screens/StoreCreate';
import PlayerStackNavigator from './app/stacks/PlayerStack'; // Updated for player stack
import StoreStackNavigator from './app/stacks/StoreStack'; // Updated for store stack
import { onAuthStateChanged, User } from 'firebase/auth';
import { FIREBASE_AUTH, FIREBASE_DB } from './FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

// Define RootStackParamList for app-level navigation
export type RootStackParamList = {
    Login: undefined;
    Inside: undefined;
    AccountSelection: undefined;
    PlayerCreate: undefined;
    StoreCreate: undefined;
};

// App.tsx

export type InsideStackParamList = {
    PlayerHome: undefined;
    StoreHome: undefined;
    Inventory: undefined;
    StoreInventory: undefined;
    StoreAddDisc: undefined;
    AddDisc: { scannedData?: string };
    ColorChanger: undefined;
    ScannerScreen: undefined;
    CustomizeDisc: undefined;
    DiscGolfVideos: undefined;
    ProVideos: undefined;
    AmateurVideos: undefined;
    TestAutoCompleteDropdown: undefined;
    YourDiscFoundNotification: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

function App() {
    const [user, setUser] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<'player' | 'store' | null>(null);
    const [initialRoute, setInitialRoute] = useState<string | null>(null);

    useEffect(() => {
        onAuthStateChanged(FIREBASE_AUTH, async (authUser) => {
            setUser(authUser);

            if (authUser) {
                const playerDoc = await getDoc(doc(FIREBASE_DB, 'players', authUser.uid));
                if (playerDoc.exists()) {
                    const playerData = playerDoc.data();

                    // Check for notification
                    if (playerData.notification) {
                        setInitialRoute('YourDiscFoundNotification'); // Notification screen
                    } else {
                        setInitialRoute('PlayerHome'); // Default for players
                    }
                    setUserRole('player');
                } else {
                    const storeDoc = await getDoc(doc(FIREBASE_DB, 'stores', authUser.uid));
                    if (storeDoc.exists()) {
                        setInitialRoute('StoreHome'); // Default for stores
                        setUserRole('store');
                    } else {
                        console.log('User role not found.');
                    }
                }
            } else {
                setInitialRoute(null);
                setUserRole(null);
            }
        });
    }, []);

    return (
        <AutocompleteDropdownContextProvider>
            <NavigationContainer>
                <RootStack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
                    {user && initialRoute ? (
                        userRole === 'player' ? (
                            <RootStack.Screen
                                name="Inside"
                                component={PlayerStackNavigator} // Player stack
                            />
                        ) : (
                            <RootStack.Screen
                                name="Inside"
                                component={StoreStackNavigator} // Store stack
                            />
                        )
                    ) : (
                        <>
                            <RootStack.Screen name="Login" component={Login} />
                            <RootStack.Screen name="AccountSelection" component={AccountSelection} />
                            <RootStack.Screen name="PlayerCreate" component={PlayerCreate} />
                            <RootStack.Screen name="StoreCreate" component={StoreCreate} />
                        </>
                    )}
                </RootStack.Navigator>
            </NavigationContainer>
        </AutocompleteDropdownContextProvider>
    );
}

export default App;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f0f4f8',
    },
});
