import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';

const NotificationModal = ({
    visible,
    notification,
    onDismiss,
  }: {
    visible: boolean;
    notification: {
      name: string;
      manufacturer: string;
      color: string;
      modalMessage: string;
      modalImage: any;
    } | null;
    onDismiss: () => void;
  }) => {
    if (!notification) return null;
  
    return (
      <Modal
        visible={visible}
        animationType="fade"
        transparent={true}
        onRequestClose={onDismiss}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>{notification.modalMessage}</Text>
            <Image source={notification.modalImage} style={styles.discImage} />
            <Text style={styles.modalText}>Name: {notification.name}</Text>
            <Text style={styles.modalText}>
              Manufacturer: {notification.manufacturer}
            </Text>
            <Text style={styles.modalText}>Color: {notification.color}</Text>
            <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
              <Text style={styles.dismissButtonText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };
  
  

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#1c1c1c',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  modalHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  discImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  modalText: {
    fontSize: 16,
    color: '#FFF',
    marginBottom: 10,
  },
  dismissButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  dismissButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default NotificationModal;
