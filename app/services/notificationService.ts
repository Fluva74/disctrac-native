import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { FIREBASE_DB } from '../../FirebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const notificationService = {
  isRegistering: false,

  registerForPushNotifications: async () => {
    try {
      if (notificationService.isRegistering) return;
      notificationService.isRegistering = true;

      console.log('=== Registering for Push Notifications ===');
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      console.log('Existing permission status:', existingStatus);
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Push token:', token);
      
      // Save token to user's profile
      const currentUser = FIREBASE_AUTH.currentUser;
      if (currentUser) {
        // Check if user is player or store
        const playerDoc = await getDoc(doc(FIREBASE_DB, 'players', currentUser.uid));
        const storeDoc = await getDoc(doc(FIREBASE_DB, 'stores', currentUser.uid));

        let userRef;
        if (playerDoc.exists()) {
          console.log('Updating player push token');
          userRef = doc(FIREBASE_DB, 'players', currentUser.uid);
        } else if (storeDoc.exists()) {
          console.log('Updating store push token');
          userRef = doc(FIREBASE_DB, 'stores', currentUser.uid);
        } else {
          console.error('User document not found in either collection');
          return null;
        }

        await updateDoc(userRef, {
          expoPushToken: token
        });
        console.log('Push token saved to profile');
      }
      
      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#44FFA1',
        });
      }

      console.log('Push token saved:', token);
      return token;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    } finally {
      notificationService.isRegistering = false;
    }
  },

  async scheduleLocalNotification(title: string, body: string) {
    try {
      console.log('=== Scheduling Local Notification ===');
      console.log('Title:', title);
      console.log('Body:', body);
      console.log('Current user:', FIREBASE_AUTH.currentUser?.uid);

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
        },
        trigger: null,
      });
      console.log('Notification scheduled successfully');
    } catch (error) {
      console.error('Error scheduling local notification:', error);
    }
  },

  async sendMessageNotification(
    receiverId: string,
    senderName: string,
    message: string,
    senderId: string
  ) {
    try {
      console.log('=== Notification Service Start ===');
      console.log('Receiver ID:', receiverId);
      console.log('Sender ID:', senderId);
      console.log('Sender Name:', senderName);

      // Don't proceed if this is the sender's device
      const currentUser = FIREBASE_AUTH.currentUser;
      if (!currentUser || currentUser.uid === senderId) {
        console.log('Skipping notification on sender device');
        return;
      }

      // Only proceed if this is the receiver's device
      if (currentUser.uid !== receiverId) {
        console.log('Skipping notification - not receiver device');
        return;
      }

      // Get receiver's notification settings
      const receiverDoc = await getDoc(doc(FIREBASE_DB, 'players', receiverId));
      if (!receiverDoc.exists()) {
        console.log('Receiver doc not found');
        return;
      }

      const receiverData = receiverDoc.data();
      console.log('Receiver preferences:', receiverData.contactPreferences);
      
      if (!receiverData.contactPreferences?.inApp) {
        console.log('Receiver has notifications disabled');
        return;
      }

      console.log('Scheduling notification for receiver');
      await this.scheduleLocalNotification(
        `New Message from ${senderName}`,
        message
      );
      console.log('Notification scheduled successfully');

    } catch (error) {
      console.error('=== Notification Error ===');
      console.error(error);
    }
  }
}; 