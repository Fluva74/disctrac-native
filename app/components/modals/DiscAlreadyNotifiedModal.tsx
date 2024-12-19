import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import BaseModal from './BaseModal';

interface DiscAlreadyNotifiedModalProps {
  visible: boolean;
  onClose: () => void;
  discName: string;
  ownerName: string;
  message: string;
}

const DiscAlreadyNotifiedModal: React.FC<DiscAlreadyNotifiedModalProps> = ({
  visible,
  onClose,
  discName,
  ownerName,
  message,
}) => {
  return (
    <BaseModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.title}>Disc Already in Inventory</Text>
        <Text style={styles.discInfo}>
          {discName} owned by {ownerName}
        </Text>
        <Text style={styles.message}>{message}</Text>

        <TouchableOpacity 
          style={styles.closeButton}
          onPress={onClose}
        >
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 24,
    color: '#FF6B6B',
    marginBottom: 16,
  },
  discInfo: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
  },
  message: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
  },
  closeButton: {
    width: '100%',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});

export default DiscAlreadyNotifiedModal; 