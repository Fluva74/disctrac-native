import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import BaseModal from './BaseModal';

interface DiscWaitingForReleaseModalProps {
  visible: boolean;
  onClose: () => void;
  storeName?: string;
}

const DiscWaitingForReleaseModal: React.FC<DiscWaitingForReleaseModalProps> = ({
  visible,
  onClose,
  storeName = 'store',
}) => {
  return (
    <BaseModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.title}>Disc Pending Release</Text>
        <Text style={styles.message}>
          This disc is currently waiting to be released from {storeName}. Please either:
        </Text>
        <View style={styles.bulletPoints}>
          <Text style={styles.bullet}>• Contact the store to release your disc</Text>
          <Text style={styles.bullet}>• Apply a new QR code sticker to your disc</Text>
        </View>

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
  message: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  bulletPoints: {
    alignSelf: 'flex-start',
    marginBottom: 24,
    paddingLeft: 16,
  },
  bullet: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
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

export default DiscWaitingForReleaseModal; 