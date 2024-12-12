import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BaseModal from './BaseModal';
import { useNotifications } from '../../contexts/NotificationContext';

interface ReleaseConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  discName: string;
  company: string;
  discId: string;
  onSuccess?: () => void;
}

const ReleaseConfirmationModal: React.FC<ReleaseConfirmationModalProps> = ({
  visible,
  onClose,
  onConfirm,
  discName,
  company,
  discId,
  onSuccess,
}) => {
  const { handleReleaseDisc } = useNotifications();

  const handleConfirmRelease = async () => {
    try {
      const success = await handleReleaseDisc(discId);
      if (success) {
        onConfirm();
        if (onSuccess) {
          onSuccess(); // This will handle navigation
        }
      } else {
        Alert.alert('Error', 'Failed to release disc. Please try again.');
      }
    } catch (error) {
      console.error('Error in handleConfirmRelease:', error);
      Alert.alert('Error', 'Failed to release disc. Please try again.');
    }
  };

  return (
    <BaseModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.title}>OK, Got It! You want to</Text>
        <Text style={styles.releaseText}>RELEASE</Text>
        <Text style={styles.explanation}>
          Releasing your disc will remove it from your bag permanently. Click confirm button below to release.
        </Text>

        <View style={styles.discInfo}>
          <Text style={styles.label}>Disc Name</Text>
          <Text style={styles.value}>{discName}</Text>

          <Text style={styles.label}>Company</Text>
          <Text style={styles.value}>{company}</Text>
        </View>

        <TouchableOpacity onPress={handleConfirmRelease} style={styles.confirmButton}>
          <LinearGradient
            colors={['#44FFA1', '#4D9FFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          >
            <Text style={styles.confirmButtonText}>Confirm Release</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    position: 'relative',
    width: '100%',
  },
  title: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  releaseText: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 28,
    color: '#44FFA1',
    marginBottom: 16,
  },
  discInfo: {
    width: '100%',
    marginBottom: 32,
  },
  label: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 14,
    color: '#A1A1AA',
    marginBottom: 4,
  },
  value: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  confirmButton: {
    width: '100%',
    marginBottom: 12,
  },
  gradient: {
    borderRadius: 8,
    padding: 16,
  },
  confirmButtonText: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
  },
  explanation: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#A1A1AA',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  cancelButton: {
    width: '100%',
    padding: 16,
  },
  cancelButtonText: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#A1A1AA',
    textAlign: 'center',
  },
});

export default ReleaseConfirmationModal; 