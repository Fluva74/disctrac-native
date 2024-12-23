import React, { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { FIREBASE_AUTH } from './FirebaseConfig';
import { RootStackParamList } from './types/navigation';

const App: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      
      if (data.type === 'message') {
        // Now TypeScript knows the correct types for the navigation params
        navigation.navigate('MessageDetail', {
          messageId: `${data.senderId}_${FIREBASE_AUTH.currentUser?.uid}`,
          receiverInfo: {
            id: data.senderId,
            name: ''
          }
        });
      }
    });

    return () => subscription.remove();
  }, [navigation]);

  return null; // Or your actual app content
};

export default App; 