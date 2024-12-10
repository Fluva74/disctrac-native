import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BaseModal from './BaseModal';

interface AddDiscConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onAddDisc: () => void;
}

const AddDiscConfirmationModal: React.FC<AddDiscConfirmationModalProps> = ({
  visible,
  onClose,
  onAddDisc,
}) => {
  return (
    <BaseModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.message}>
          This disc does not seem to belong to any other player. Would you like to add the disc to your bag?
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={onAddDisc} style={styles.addButton}>
            <LinearGradient
              colors={['#44FFA1', '#4D9FFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradient}
            >
              <Text style={styles.addButtonText}>Add Disc</Text>
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
  message: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#A1A1AA',
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  addButton: {
    width: '100%',
  },
  gradient: {
    borderRadius: 8,
    padding: 16,
  },
  addButtonText: {
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

export default AddDiscConfirmationModal; 