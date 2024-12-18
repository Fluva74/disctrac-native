import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BaseModal from './BaseModal';
import { capitalizeFirstLetter } from '../../utils/stringUtils';

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
  onReleaseDisc: () => void;
  discName: string;
  company: string;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  onClose,
  onReleaseDisc,
  discName,
  company,
}) => {
  return (
    <BaseModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.title}>Time to Celebrate!</Text>
        <Text style={styles.subtitle}>Your Disc Has Been Found!</Text>

        <View style={styles.discInfo}>
          <Text style={styles.label}>Disc Name</Text>
          <Text style={styles.value}>{capitalizeFirstLetter(discName)}</Text>

          <Text style={styles.label}>Company</Text>
          <Text style={styles.value}>{company}</Text>
        </View>

        <Text style={styles.message}>
          Another player has found your disc! They have sent notification to you and will be holding the 
          disc until you choose your options. If the player chooses to turn the disc in to a retailer, 
          you will be notified.
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={onReleaseDisc} style={styles.releaseButton}>
            <LinearGradient
              colors={['#44FFA1', '#4D9FFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradient}
            >
              <Text style={styles.releaseButtonText}>Release Disc</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => {
              console.log('Close button pressed in NotificationModal');
              onClose();
            }} 
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BaseModal>
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
  buttonContainer: {
    width: '100%',
    marginTop: 16,
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
  closeButton: {
    width: '100%',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  closeButtonText: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default NotificationModal; 