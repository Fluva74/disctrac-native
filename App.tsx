import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FIREBASE_AUTH, FIREBASE_DB } from './FirebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import NotificationModal from './app/screens/NotificationModal';
import PlayerStackNavigator from './app/stacks/PlayerStack';
import StoreStackNavigator from './app/stacks/StoreStack';
import PlayerCreate from './app/screens/PlayerCreate';
import StoreCreate from './app/screens/StoreCreate';
import AccountSelection from './app/screens/AccountSelection';
import Login from './app/screens/Login';

export type RootStackParamList = {
  Login: undefined;
  AccountSelection: undefined;
  Inside: { screen: keyof InsideStackParamList }; // Nested navigator for Player/Store
  PlayerCreate: undefined;
  StoreCreate: undefined;
  ForgotPassword: undefined;
  
};

export type InsideStackParamList = {
    AddDisc: { scannedData: string };
    StoreInventory: undefined;
    StoreAddDisc: undefined;
    PlayerHome: undefined;
    StoreHome: undefined;
    Inventory: undefined;
    ColorChanger: undefined;
    ScannerScreen: undefined;
    CustomizeDisc: undefined;
    DiscGolfVideos: undefined;
    ProVideos: undefined;
    AmateurVideos: undefined;
    TestAutoCompleteDropdown: undefined;
    // Add other routes as needed
  };
  

const RootStack = createNativeStackNavigator<RootStackParamList>();

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'player' | 'store' | null>(null);
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const [notification, setNotification] = useState<any>(null);
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(FIREBASE_AUTH, async (authUser) => {
      setUser(authUser);

      if (authUser) {
        const playerDoc = await getDoc(doc(FIREBASE_DB, 'players', authUser.uid));
        if (playerDoc.exists()) {
          const playerData = playerDoc.data();
          setUserRole('player');

          if (playerData.notification) {
            setNotification(playerData.notification);
            setModalVisible(true); // Show modal
          }
          setInitialRoute('PlayerHome');
        } else {
          const storeDoc = await getDoc(doc(FIREBASE_DB, 'stores', authUser.uid));
          if (storeDoc.exists()) {
            setUserRole('store');
            setInitialRoute('StoreHome');
          }
        }
      } else {
        setUserRole(null);
        setInitialRoute(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const colorToImageMap: Record<string, any> = {
    blue: require('./assets/discBlue.png'),
    red: require('./assets/discRed.png'),
    yellow: require('./assets/discYellow.png'),
    green: require('./assets/discGreen.png'),
    pink: require('./assets/discPink.png'),
    purple: require('./assets/discPurple.png'),
    orange: require('./assets/discOrange.png'),
    white: require('./assets/discWhite.png'),
    gray: require('./assets/discGray.png'),
  };

  // Listener for Firestore updates
  useEffect(() => {
    if (user && userRole === 'player') {
      const playerRef = doc(FIREBASE_DB, 'players', user.uid);
  
      const unsubscribeListener = onSnapshot(playerRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
  
          if (data.notification) {
            const { status } = data.notification;
  
            // Debug log to confirm the status update
            console.log(`[DEBUG] Notification status: ${status}`);
  
            let modalMessage = 'Your Disc Has Been Found!';
            let modalImage =
              colorToImageMap[data.notification.color.toLowerCase()] ||
              require('./assets/discGray.png');
  
            // Handle specific statuses
            if (status === 'criticalAlert') {
              modalMessage = 'Oh No, Your Disc Will Be Released Soon!';
              console.log('[DEBUG] Showing criticalAlert notification');
            } else if (status === 'released') {
              modalMessage = 'Sorry, Your Disc Has Been Released';
              modalImage = require('./assets/sadFace.png');
              console.log('[DEBUG] Showing released notification');
            }
  
            // Always update modal state
            setNotification({
              ...data.notification,
              modalMessage,
              modalImage,
            });
            setModalVisible(true);
          }
        }
      });
  
      return () => unsubscribeListener();
    }
  }, [user, userRole]);
  
  
  
  
  

  const handleDismiss = async () => {
    if (user) {
      const playerRef = doc(FIREBASE_DB, 'players', user.uid);
      await updateDoc(playerRef, { notification: null });
      setNotification(null);
      setModalVisible(false);
    }
  };

  return (
    <NavigationContainer>
      <NotificationModal
        visible={isModalVisible}
        notification={notification}
        onDismiss={handleDismiss}
      />
      <RootStack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        {user && initialRoute ? (
          userRole === 'player' ? (
            <RootStack.Screen name="Inside" component={PlayerStackNavigator} />
          ) : (
            <RootStack.Screen name="Inside" component={StoreStackNavigator} />
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
  );
}

export default App;
