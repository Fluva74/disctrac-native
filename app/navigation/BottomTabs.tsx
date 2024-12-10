import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import PlayerHome from '../screens/PlayerHome';
import Inventory from '../screens/Inventory';
import DiscGolfVideos from '../screens/DiscGolfVideos';
import Resources from '../screens/Resources';
import Messages from '../screens/Messages';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
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
        component={PlayerHome}
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
        name="Bag"
        component={Inventory}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="disc" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Resources"
        component={Resources}
        options={{
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
        }}
      />
    </Tab.Navigator>
  );
} 