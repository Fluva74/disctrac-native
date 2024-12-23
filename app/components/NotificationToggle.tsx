import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Switch, Text, StyleSheet, Platform, Alert, Linking, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PermissionStatus, getPermissionsAsync, requestPermissionsAsync } from 'expo-notifications';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '../FirebaseConfig';
import { notificationService } from '../services/notificationService';
import { hasPushNotificationBeenAsked, setPushNotificationAsked } from '../utils/storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface NotificationToggleProps {
  userId: string;
  collectionName: 'players' | 'stores';
  contactPreferences: {
    phone?: boolean;
    email?: boolean;
    inApp?: boolean;
  };
  onUpdate: () => void;
}

export const NotificationToggle = ({ 
  userId, 
  collectionName,
  contactPreferences,
  onUpdate 
}: NotificationToggleProps) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState(PermissionStatus.UNDETERMINED);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const askForPermissionIfNeeded = useCallback(async () => {
    const hasBeenAsked = await hasPushNotificationBeenAsked();
    if (!hasBeenAsked) {
      const { status } = await getPermissionsAsync();
      if (status === PermissionStatus.UNDETERMINED) {
        await explainAndRequestPermission();
        await setPushNotificationAsked();
      }
    }
  }, []);

  useEffect(() => {
    checkPushEnabled();
    checkPermissions();
    askForPermissionIfNeeded();
  }, [askForPermissionIfNeeded]);

  // Prevent unnecessary updates when the component unmounts
  const isMounted = useRef(true);
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const checkPermissions = async () => {
    const { status } = await getPermissionsAsync();
    switch (status) {
      case PermissionStatus.GRANTED:
      case PermissionStatus.DENIED:
      case PermissionStatus.UNDETERMINED:
        setPermissionStatus(status);
        break;
      default:
        setPermissionStatus(PermissionStatus.UNDETERMINED);
    }
  };

  const requestPermissions = async () => {
    const { status } = await requestPermissionsAsync();
    switch (status) {
      case PermissionStatus.GRANTED:
      case PermissionStatus.DENIED:
      case PermissionStatus.UNDETERMINED:
        setPermissionStatus(status);
        break;
      default:
        setPermissionStatus(PermissionStatus.UNDETERMINED);
    }
    return status;
  };

  const explainAndRequestPermission = async () => {
    const hasBeenAsked = await hasPushNotificationBeenAsked();
    if (hasBeenAsked) return;

    Alert.alert(
      "Enable Notifications",
      "Allow notifications to receive updates when:\n\n" +
      "• Someone finds your disc\n" +
      "• You receive a message\n" +
      "• Your disc is ready for pickup\n\n" +
      "You can change this later in settings.",
      [
        {
          text: "Not Now",
          style: "cancel",
          onPress: () => {
            console.log("Permission denied");
            setPushNotificationAsked();
          }
        },
        {
          text: "Enable",
          onPress: async () => {
            const status = await requestPermissions();
            setPushNotificationAsked();
            if (status !== PermissionStatus.GRANTED) {
              Alert.alert(
                "Notifications Disabled",
                "To enable notifications, go to your device settings and allow notifications for DiscTrac.",
                [{ text: "OK" }]
              );
            }
          }
        }
      ]
    );
  };

  const handlePermissionDenied = () => {
    Alert.alert(
      "Enable Notifications in Settings",
      "To receive notifications:\n\n" +
      "1. Open your device Settings\n" +
      "2. Find DiscTrac\n" +
      "3. Enable notifications\n\n" +
      "This helps ensure you don't miss:\n" +
      "• Found disc notifications\n" +
      "• Messages from finders\n" +
      "• Pickup notifications from stores",
      [
        { text: "Not Now", style: "cancel" },
        { 
          text: "Open Settings",
          onPress: () => Linking.openSettings()
        }
      ]
    );
  };

  const checkAndRequestPermission = async () => {
    const { status: existingStatus } = await getPermissionsAsync();
    
    if (existingStatus === PermissionStatus.GRANTED) {
      return true;
    }

    if (existingStatus === PermissionStatus.DENIED) {
      handlePermissionDenied();
      return false;
    }

    const { status } = await requestPermissionsAsync();
    return status === PermissionStatus.GRANTED;
  };

  const checkPushEnabled = async () => {
    try {
      const docRef = doc(FIREBASE_DB, collectionName, userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setIsEnabled(data.pushEnabled ?? false);
        if (!('pushEnabled' in data)) {
          setIsEnabled(false);
        }
      }
    } catch (error) {
      console.error('Error checking push enabled status:', error);
    }
  };

  const toggleNotifications = async () => {
    try {
      if (isRegistering || isUpdating) return;
      setIsRegistering(true);
      setIsUpdating(true);

      const newState = !isEnabled;
      if (newState) {
        const { status: currentStatus } = await getPermissionsAsync();
        
        if (currentStatus === PermissionStatus.DENIED) {
          handlePermissionDenied();
          return;
        }
        
        let finalStatus = currentStatus;
        if (currentStatus === PermissionStatus.UNDETERMINED) {
          const { status } = await requestPermissionsAsync();
          finalStatus = status as PermissionStatus.GRANTED | PermissionStatus.UNDETERMINED;
        }

        if (finalStatus !== PermissionStatus.GRANTED) {
          Alert.alert(
            "Notifications Disabled",
            "To enable notifications, go to your device settings and allow notifications for DiscTrac.",
            [{ text: "OK" }]
          );
          return;
        }

        await notificationService.registerForPushNotifications();
      }

      // Update Firestore first
      const userRef = doc(FIREBASE_DB, collectionName, userId);
      await updateDoc(userRef, {
        'contactPreferences': {
          ...contactPreferences,
          inApp: newState
        },
        'pushEnabled': newState
      });

      setIsEnabled(newState);
      onUpdate();

    } catch (error) {
      console.error('Error toggling notifications:', error);
      Alert.alert('Error', 'Failed to update notification settings');
    } finally {
      setIsRegistering(false);
      setIsUpdating(false);
    }
  };

  // Prevent multiple rapid toggles
  const handleToggle = () => {
    if (!isRegistering) {
      toggleNotifications();
    }
  };

  const createStyles = (isEnabled: boolean) => StyleSheet.create({
    preferenceItem: {
      marginVertical: 16,
      borderRadius: 8,
      overflow: 'hidden',
    },
    preferenceGradient: {
      width: '100%',
    },
    preferenceContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
    },
    preferenceText: {
      fontFamily: 'LeagueSpartan_400Regular',
      fontSize: 16,
      color: '#FFFFFF',
    },
  });

  const styles = createStyles(!!isEnabled);

  return (
    <TouchableOpacity style={styles.preferenceItem} onPress={handleToggle}>
      <LinearGradient
        colors={isEnabled 
          ? ['rgba(68, 255, 161, 0.2)', 'rgba(77, 159, 255, 0.2)']
          : ['rgba(24, 24, 27, 0.5)', 'rgba(24, 24, 27, 0.5)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.preferenceGradient}
      >
        <View style={styles.preferenceContent}>
          <Text style={styles.preferenceText}>
            Push Notifications
          </Text>
          <MaterialCommunityIcons 
            name={isEnabled ? "checkbox-marked" : "checkbox-blank-outline"} 
            size={24} 
            color={isEnabled ? "#44FFA1" : "#A1A1AA"} 
          />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}; 