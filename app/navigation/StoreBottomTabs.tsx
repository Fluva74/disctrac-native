import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import StoreHome from '../screens/StoreHome';
import NotifiedOwner from '../screens/NotifiedOwner';
import DiscGolfVideos from '../screens/DiscGolfVideos';
import ReleasedToStore from '../screens/ReleasedToStore';
import Messages from '../screens/Messages';
import { useMessages } from '../contexts/MessageContext';
import { FIREBASE_AUTH } from '../../FirebaseConfig';

const Tab = createBottomTabNavigator();

export type StoreBottomTabParamList = {
  Home: undefined;
  Videos: undefined;
  Inventory: undefined;
  Resources: undefined;
  Messages: undefined;
};

export default function StoreBottomTabs() {
  const { messages } = useMessages();
  const unreadCount = React.useMemo(() => {
    const currentUser = FIREBASE_AUTH.currentUser;
    if (!currentUser) return 0;
    
    return messages.filter(msg => 
      msg.receiverId === currentUser.uid && !msg.read
    ).length;
  }, [messages]);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#09090B',
          borderTopColor: '#27272A',
        },
        tabBarActiveTintColor: '#44FFA1',
        tabBarInactiveTintColor: '#71717A',
      }}
    >
      <Tab.Screen
        name="Home"
        component={StoreHome}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Videos"
        component={DiscGolfVideos}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="play-circle" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Inventory"
        component={NotifiedOwner}
        options={{
          tabBarLabel: 'Notified Owner',
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons
              name="disc"
              size={24}
              color={focused ? '#44FFA1' : '#71717A'}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Resources"
        component={ReleasedToStore}
        options={{
          tabBarLabel: 'Released Discs',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="book-open-variant" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={Messages}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="message" color={color} size={size} />
          ),
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: '#44FFA1',
            color: '#000000',
          },
        }}
      />
    </Tab.Navigator>
  );
} 