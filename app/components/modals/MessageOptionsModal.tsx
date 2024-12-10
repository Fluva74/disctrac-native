import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BaseModal from './BaseModal';

interface MessageOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onDelete: () => void;
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
  return (
    <BaseModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.title}>Message Options</Text>
        <Text style={styles.subtitle}>@{username}</Text>

        <TouchableOpacity 
          style={styles.option} 
          onPress={onDelete}
        >
          <MaterialCommunityIcons name="delete-outline" size={24} color="#F87171" />
          <Text style={[styles.optionText, styles.deleteText]}>Delete Conversation</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.option}
          onPress={onBlock}
        >
          <MaterialCommunityIcons name="block-helper" size={24} color="#F87171" />
          <Text style={[styles.optionText, styles.deleteText]}>Block User</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.option, styles.cancelOption]}
          onPress={onClose}
        >
          <Text style={styles.cancelText}>Cancel</Text>
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
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#A1A1AA',
    marginBottom: 24,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 16,
    backgroundColor: 'rgba(24, 24, 27, 0.5)',
    borderRadius: 8,
    marginBottom: 12,
    gap: 12,
  },
  optionText: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#FFFFFF',
  },
  deleteText: {
    color: '#F87171',
  },
  cancelOption: {
    backgroundColor: 'transparent',
    marginTop: 8,
  },
  cancelText: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#A1A1AA',
    textAlign: 'center',
    width: '100%',
  },
});

export default MessageOptionsModal; 