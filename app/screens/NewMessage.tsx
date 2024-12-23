import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../FirebaseConfig';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { useMessages } from '../contexts/MessageContext';
import ScreenTemplate from '../components/ScreenTemplate';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { StoreStackParamList } from '../stacks/StoreStack';

interface User {
  id: string;
  username: string;
}

type StoreNavigationProp = NavigationProp<StoreStackParamList>;

const NewMessage = () => {
  const navigation = useNavigation<StoreNavigationProp>();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { sendMessage } = useMessages();

  useEffect(() => {
    const searchUsers = async (searchTerm: string) => {
      try {
        const usersRef = collection(FIREBASE_DB, 'players');
        const q = query(
          usersRef,
          where('username', '>=', searchTerm.toLowerCase()),
          where('username', '<=', searchTerm.toLowerCase() + '\uf8ff')
        );
        const querySnapshot = await getDocs(q);
        
        const usersList: User[] = [];
        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          if (doc.id !== FIREBASE_AUTH.currentUser?.uid) {
            usersList.push({
              id: doc.id,
              username: userData.username || 'Unknown User',
            });
          }
        });
        
        setUsers(usersList);
        setFilteredUsers(usersList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
        setFilteredUsers([]);
        setLoading(false);
      }
    };

    // Initial load with empty search
    searchUsers('');
  }, []);

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setSearchQuery(user.username);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.length > 0) {
      if (selectedUser && text === selectedUser.username) {
        setFilteredUsers([]);
        return;
      }

      const searchTerm = text.toLowerCase();
      const filtered = users.filter(user => 
        user.username.toLowerCase().includes(searchTerm)
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers([]);
      setSelectedUser(null);
    }
  };

  const handleSendMessage = async (receiverId: string, message: string) => {
    try {
      const currentUser = FIREBASE_AUTH.currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'You must be logged in to send messages');
        return;
      }

      await sendMessage(receiverId, message);
      
      // Create conversation ID by sorting UIDs to ensure consistency
      const conversationId = [currentUser.uid, receiverId].sort().join('_');
      
      // Navigate back to Messages and then to MessageDetail
      navigation.navigate('MessageDetail', {
        messageId: conversationId,
        receiverInfo: {
          id: receiverId,
          name: selectedUser?.username || 'Unknown User'
        }
      });
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const renderUser = ({ item: user }: { item: User }) => (
    <TouchableOpacity
      style={[
        styles.userItem,
        selectedUser?.id === user.id && styles.selectedUser
      ]}
      onPress={() => handleUserSelect(user)}
    >
      <View style={styles.userInfo}>
        <Text style={styles.userName}>@{user.username}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenTemplate>
      <View style={styles.container}>
        <Text style={styles.title}>New Message</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#44FFA1" />
        ) : (
          <>
            <Text style={styles.label}>Select User</Text>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by username..."
                placeholderTextColor="#A1A1AA"
                value={searchQuery}
                onChangeText={handleSearch}
                autoCapitalize="none"
              />
            </View>
            
            {searchQuery.length > 0 && !selectedUser && (
              <FlatList
                data={filteredUsers}
                renderItem={renderUser}
                keyExtractor={(item) => item.id}
                style={styles.userList}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                      No users found
                    </Text>
                  </View>
                }
              />
            )}
            
            {selectedUser && (
              <View style={styles.messageContainer}>
                <Text style={styles.label}>Message</Text>
                <TextInput
                  style={styles.input}
                  multiline
                  placeholder="Type your message..."
                  placeholderTextColor="#A1A1AA"
                  value={message}
                  onChangeText={setMessage}
                />
                
                <TouchableOpacity
                  onPress={() => handleSendMessage(selectedUser.id, message)}
                  disabled={!message.trim()}
                >
                  <LinearGradient
                    colors={['#44FFA1', '#4D9FFF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                      styles.sendButton,
                      !message.trim() && styles.disabledButton
                    ]}
                  >
                    <Text style={styles.sendButtonText}>Send Message</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>
    </ScreenTemplate>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090B',
    padding: 16,
  },
  title: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 32,
    color: '#FFFFFF',
    marginBottom: 24,
  },
  label: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  userList: {
    maxHeight: 200,
  },
  userItem: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(24, 24, 27, 0.5)',
    marginBottom: 8,
  },
  selectedUser: {
    backgroundColor: 'rgba(68, 255, 161, 0.1)',
    borderColor: '#44FFA1',
    borderWidth: 1,
  },
  userInfo: {
    gap: 4,
  },
  userName: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 16,
    color: '#44FFA1',
  },
  messageContainer: {
    marginTop: 24,
  },
  input: {
    backgroundColor: 'rgba(24, 24, 27, 0.5)',
    borderRadius: 8,
    padding: 16,
    color: '#FFFFFF',
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  sendButtonText: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: 'rgba(24, 24, 27, 0.5)',
    borderRadius: 8,
    padding: 16,
    color: '#FFFFFF',
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 14,
    color: '#A1A1AA',
  },
});

export default NewMessage; 