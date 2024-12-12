import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { DiscReleasedModal } from './modals';
import NotificationModal from '../screens/NotificationModal';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { getDiscImage } from '../utils/discImageUtils';

export const NotificationOverlay = () => {
  const { currentNotification, dismissNotification } = useNotifications();
  const currentUser = FIREBASE_AUTH.currentUser;

  if (!currentNotification || !currentUser) return null;

  // Only show notifications meant for the current user
  if (currentNotification.userId !== currentUser.uid) return null;

  const formattedColor = currentNotification.color?.startsWith('disc') 
    ? currentNotification.color 
    : `disc${currentNotification.color?.charAt(0).toUpperCase()}${currentNotification.color?.slice(1).toLowerCase()}`;

  if (currentNotification.type === 'DISC_RELEASED') {
    return (
      <DiscReleasedModal
        visible={true}
        onClose={dismissNotification}
        onAddDisc={dismissNotification}
        discName={currentNotification.discName}
        company={currentNotification.company}
        color={formattedColor}
        playerName="Original Owner"
      />
    );
  }

  return (
    <NotificationModal
      visible={true}
      notification={{
        name: currentNotification.discName,
        manufacturer: currentNotification.company,
        color: formattedColor,
        modalMessage: 'Your Disc Has Been Found!',
        modalImage: null
      }}
      onDismiss={dismissNotification}
    />
  );
}; 