import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BaseModal from '../modals/BaseModal';

interface VerifyDiscModalProps {
  visible: boolean;
  onClose: () => void;
  onVerify: () => void;
  discData: {
    ownerName: string;
    discName: string;
    company: string;
  };
}

const VerifyDiscModal: React.FC<VerifyDiscModalProps> = ({
  visible,
  onClose,
  onVerify,
  discData,
}) => {
  return (
    <BaseModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.header}>This Disc Belongs To</Text>
        <Text style={styles.ownerName}>{discData.ownerName}</Text>
        
        <View style={styles.discInfoContainer}>
          <Text style={styles.label}>Disc Name</Text>
          <Text style={styles.value}>{discData.discName}</Text>
          
          <Text style={styles.label}>Company</Text>
          <Text style={styles.value}>{discData.company}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={onVerify} style={styles.verifyButton}>
            <LinearGradient
              colors={['#44FFA1', '#44FFA1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradient}
            >
              <Text style={styles.verifyButtonText}>Verify Player</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
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
  header: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#A1A1AA',
    marginBottom: 8,
  },
  ownerName: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 32,
  },
  discInfoContainer: {
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
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  verifyButton: {
    width: '100%',
  },
  gradient: {
    borderRadius: 8,
    padding: 16,
  },
  verifyButtonText: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
  },
  cancelButton: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default VerifyDiscModal; 