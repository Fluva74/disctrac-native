import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ValidationModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export const ValidationModal = ({ visible, onClose, title, message }: ValidationModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient
            colors={['rgba(255, 68, 68, 0.1)', 'rgba(77, 159, 255, 0.1)']} // Red tint for validation
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.content}
          >
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
            <TouchableOpacity 
              onPress={onClose}
              style={styles.button}
            >
              <LinearGradient
                colors={['#44FFA1', '#4D9FFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>OK</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    width: '100%',
    maxWidth: 320,
  },
  content: {
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.2)', // Red tint for validation
    alignItems: 'center',
  },
  title: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 24,
    color: '#FF4444', // Red for validation
    marginBottom: 16,
  },
  message: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    width: '100%',
  },
  buttonGradient: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 16,
    color: '#000000',
  },
}); 