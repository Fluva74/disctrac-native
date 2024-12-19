import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface StoreNotificationModalProps {
  visible: boolean;
  onClose: () => void;
  discName: string;
  manufacturer: string;
  discImage: any;
}

const StoreNotificationModal = ({ 
  visible, 
  onClose, 
  discName, 
  manufacturer,
  discImage,
}: StoreNotificationModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Time to Celebrate!</Text>
          <Text style={styles.subtitle}>Your Disc Has Been Found!</Text>

          <View style={styles.discInfo}>
            <Text style={styles.label}>Disc Name</Text>
            <Text style={styles.value}>{discName}</Text>

            <Text style={styles.label}>Company</Text>
            <Text style={styles.value}>{manufacturer}</Text>
          </View>

          <Image 
            source={discImage}
            style={styles.discImage}
            resizeMode="contain"
          />

          <LinearGradient
            colors={['#44FFA1', '#4D9FFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <TouchableOpacity 
              style={styles.button}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#18181B',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
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
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  discImage: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  buttonGradient: {
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

export default StoreNotificationModal; 