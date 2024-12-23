import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BaseModal from './BaseModal';

interface MessageOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onDelete: () => Promise<void>;
  onBlock: () => void;
  username: string;
}

const MessageOptionsModal: React.FC<MessageOptionsModalProps> = ({
  visible,
  onClose,
  onDelete,
  onBlock,
  username,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <BaseModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.title}>Chat Options</Text>
        <Text style={styles.subtitle}>Chat with {username}</Text>

        <TouchableOpacity 
          onPress={async () => {
            try {
              console.log('Delete conversation pressed');
              setIsDeleting(true);
              await onDelete();
              console.log('Delete completed successfully');
              onClose();
            } catch (error) {
              console.error('Error in delete handler:', error);
              Alert.alert(
                'Error',
                'Failed to delete conversation. Please try again.'
              );
            } finally {
              setIsDeleting(false);
            }
          }} 
          style={[
            styles.deleteButton,
            isDeleting && styles.deleteButtonDisabled
          ]}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.deleteButtonText}>Delete Conversation</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={onBlock} 
          style={styles.blockButton}
          disabled={isDeleting}
        >
          <Text style={styles.blockButtonText}>Block User</Text>
        </TouchableOpacity>
      </View>
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  title: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#44FFA1',
    marginBottom: 24,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 16,
    backgroundColor: 'rgba(24, 24, 27, 0.5)',
    borderRadius: 8,
    marginBottom: 12,
    gap: 12,
  },
  deleteButtonText: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#FF6B6B',
  },
  blockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 16,
    backgroundColor: 'rgba(24, 24, 27, 0.5)',
    borderRadius: 8,
    marginBottom: 12,
    gap: 12,
  },
  blockButtonText: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#FF6B6B',
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
});

export default MessageOptionsModal; 