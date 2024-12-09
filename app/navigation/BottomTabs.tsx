import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PlayerHome from '../screens/PlayerHome';
import Inventory from '../screens/Inventory';
import DiscGolfVideos from '../screens/DiscGolfVideos';
import ProVideos from '../screens/ProVideos';
import AmateurVideos from '../screens/AmateurVideos';
import Resources from '../screens/Resources';
import { Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();
const VideoStack = createNativeStackNavigator();

// Video Stack Navigator
const VideoStackNavigator = () => {
  return (
    <VideoStack.Navigator screenOptions={{ headerShown: false }}>
      <VideoStack.Screen name="DiscGolfVideos" component={DiscGolfVideos} />
      <VideoStack.Screen name="ProVideos" component={ProVideos} />
      <VideoStack.Screen name="AmateurVideos" component={AmateurVideos} />
    </VideoStack.Navigator>
  );
};

// Temporary placeholder screens
const PlaceholderScreen = ({ route }: any) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Tab {route.name}</Text>
  </View>
);

const BottomTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#09090B',
          borderTopColor: 'rgba(39, 39, 42, 0.5)',
        },
        tabBarActiveTintColor: '#44FFA1',
        tabBarInactiveTintColor: '#A1A1AA',
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={PlayerHome}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Videos" 
        component={VideoStackNavigator}
        options={{
          tabBarLabel: 'Videos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="play-circle" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Bag" 
        component={Inventory}
        options={{
          tabBarLabel: 'Bag',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bag-personal" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Resources" 
        component={Resources}
        options={{
          tabBarLabel: 'Resources',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="library" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Messages" 
        component={PlaceholderScreen}
        options={{
          tabBarLabel: 'Messages',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabs; 