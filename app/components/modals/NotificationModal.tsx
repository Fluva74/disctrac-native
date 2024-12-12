import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BaseModal from './BaseModal';
import ReleaseConfirmationModal from './ReleaseConfirmationModal';

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
  onReleaseDisc: () => void;
  discName: string;
  company: string;
  discId: string;
  onReleaseSuccess?: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  onClose,
  onReleaseDisc,
  discName,
  company,
  discId,
  onReleaseSuccess,
}) => {
  const [showReleaseConfirmation, setShowReleaseConfirmation] = useState(false);

  const handleReleaseClick = () => {
    setShowReleaseConfirmation(true);
  };

  const handleConfirmRelease = () => {
    setShowReleaseConfirmation(false);
    onReleaseDisc();
  };

  const handleCancelRelease = () => {
    setShowReleaseConfirmation(false);
  };

  return (
    <>
      <BaseModal visible={visible && !showReleaseConfirmation} onClose={onClose}>
        <View style={styles.container}>
          <Text style={styles.title}>Time to Celebrate!</Text>
          <Text style={styles.subtitle}>Your Disc Has Been Found!</Text>

          <View style={styles.discInfo}>
            <Text style={styles.label}>Disc Name</Text>
            <Text style={styles.value}>{discName}</Text>

            <Text style={styles.label}>Company</Text>
            <Text style={styles.value}>{company}</Text>
          </View>

          <Text style={styles.message}>
            Another player has found your disc! They have sent notification to you and will be holding the 
            disc until you choose your options. If the player chooses to turn the disc in to a retailer, 
            you will be notified.
          </Text>

          <TouchableOpacity onPress={onClose} style={styles.releaseButton}>
            <LinearGradient
              colors={['#44FFA1', '#4D9FFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradient}
            >
              <Text style={styles.releaseButtonText}>Close</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleReleaseClick} style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>Release Disc</Text>
          </TouchableOpacity>
        </View>
      </BaseModal>

      <ReleaseConfirmationModal
        visible={showReleaseConfirmation}
        onClose={handleCancelRelease}
        onConfirm={handleConfirmRelease}
        discName={discName}
        company={company}
        discId={discId}
        onSuccess={onReleaseSuccess}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  title: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 24,
    color: '#44FFA1',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 24,
  },
  discInfo: {
    width: '100%',
    marginBottom: 24,
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
  message: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#A1A1AA',
    textAlign: 'center',
    marginBottom: 24,
  },
  releaseButton: {
    width: '100%',
    marginBottom: 12,
  },
  gradient: {
    borderRadius: 8,
    padding: 16,
  },
  releaseButtonText: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
  },
  deleteButton: {
    width: '100%',
    padding: 16,
  },
  deleteButtonText: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default NotificationModal; 