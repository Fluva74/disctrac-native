import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BaseModal from './BaseModal';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../../FirebaseConfig';
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';

interface BlockedUsersModalProps {
  visible: boolean;
  onClose: () => void;
}

interface BlockedUser {
  id: string;
  username: string;
}

const BlockedUsersModal: React.FC<BlockedUsersModalProps> = ({
  visible,
  onClose,
}) => {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlockedUsers();
  }, [visible]);

  const fetchBlockedUsers = async () => {
    const currentUser = FIREBASE_AUTH.currentUser;
    if (!currentUser) return;

    try {
      const userDoc = await getDoc(doc(FIREBASE_DB, 'players', currentUser.uid));
      const userData = userDoc.data();
      const blockedIds = userData?.blockedUsers || [];

      const blockedUsersData = await Promise.all(
        blockedIds.map(async (userId: string) => {
          const userDoc = await getDoc(doc(FIREBASE_DB, 'players', userId));
          const userData = userDoc.data();
          return {
            id: userId,
            username: userData?.username || 'Unknown User'
          };
        })
      );

      setBlockedUsers(blockedUsersData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching blocked users:', error);
      setLoading(false);
    }
  };

  const handleUnblock = async (userId: string) => {
    const currentUser = FIREBASE_AUTH.currentUser;
    if (!currentUser) return;

    try {
      await updateDoc(doc(FIREBASE_DB, 'players', currentUser.uid), {
        blockedUsers: arrayRemove(userId)
      });
      
      // Update local state
      setBlockedUsers(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error unblocking user:', error);
    }
  };

  const renderBlockedUser = ({ item }: { item: BlockedUser }) => (
    <View style={styles.userItem}>
      <Text style={styles.username}>@{item.username}</Text>
      <TouchableOpacity 
        style={styles.unblockButton}
        onPress={() => handleUnblock(item.id)}
      >
        <MaterialCommunityIcons name="account-check" size={24} color="#44FFA1" />
        <Text style={styles.unblockText}>Unblock</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <BaseModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.title}>Blocked Users</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#44FFA1" />
        ) : blockedUsers.length > 0 ? (
          <FlatList
            data={blockedUsers}
            renderItem={renderBlockedUser}
            keyExtractor={(item) => item.id}
            style={styles.list}
          />
        ) : (
          <Text style={styles.emptyText}>No blocked users</Text>
        )}

        <TouchableOpacity 
          style={styles.closeButton}
          onPress={onClose}
        >
          <Text style={styles.closeButtonText}>Close</Text>
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
    marginBottom: 24,
  },
  list: {
    width: '100%',
    maxHeight: 300,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(24, 24, 27, 0.5)',
    borderRadius: 8,
    marginBottom: 12,
  },
  username: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#FFFFFF',
  },
  unblockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unblockText: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 14,
    color: '#44FFA1',
  },
  emptyText: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#A1A1AA',
    marginBottom: 24,
  },
  closeButton: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  closeButtonText: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#A1A1AA',
    textAlign: 'center',
  },
});

export default BlockedUsersModal; 