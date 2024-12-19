import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BaseModal from './BaseModal';

interface StoreDiscReleasedModalProps {
  visible: boolean;
  onClose: () => void;
  discName: string;
}

const StoreDiscReleasedModal: React.FC<StoreDiscReleasedModalProps> = ({
  visible,
  onClose,
  discName,
}) => {
  return (
    <BaseModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.title}>Disc Released</Text>
        <Text style={styles.message}>
          {discName} has been released by the player and added to your released inventory.
        </Text>

        <LinearGradient
          colors={['#44FFA1', '#4D9FFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          <TouchableOpacity 
            style={styles.button}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </LinearGradient>
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
    marginBottom: 16,
  },
  message: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
  },
  gradient: {
    borderRadius: 8,
    width: '100%',
  },
  button: {
    padding: 16,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 16,
    color: '#000000',
  },
});

export default StoreDiscReleasedModal; 