import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BaseModal from './BaseModal';

interface InvalidQRModalProps {
  visible: boolean;
  onClose: () => void;
}

const InvalidQRModal: React.FC<InvalidQRModalProps> = ({
  visible,
  onClose,
}) => {
  return (
    <BaseModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.title}>Disc Unavailable</Text>
        <Text style={styles.message}>
          This QR Code doesn't seem to be in our database.
        </Text>
        <TouchableOpacity onPress={onClose}>
          <LinearGradient
            colors={['#44FFA1', '#4D9FFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>OK</Text>
          </LinearGradient>
        </TouchableOpacity>
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
    color: '#FFFFFF',
    marginBottom: 12,
  },
  message: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#A1A1AA',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 48,
    borderRadius: 8,
  },
  buttonText: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 16,
    color: '#000000',
  },
});

export default InvalidQRModal; 