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
import { FIREBASE_DB } from '../../FirebaseConfig';
import { collection, query, getDocs } from 'firebase/firestore';
import { useMessages } from '../contexts/MessageContext';
import ScreenTemplate from '../components/ScreenTemplate';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { PlayerStackParamList } from '../stacks/PlayerStack';

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
}

const NewMessage = () => {
  const navigation = useNavigation<NavigationProp<PlayerStackParamList>>();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { sendMessage } = useMessages();

  useEffect(() => {
    const fetchUsers = async () => {
      const usersRef = collection(FIREBASE_DB, 'players');
      const querySnapshot = await getDocs(usersRef);
      const usersList = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          username: data.username || 'unknown',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
        };
      }) as User[];
      setUsers(usersList);
      setFilteredUsers(usersList);
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    const searchTerm = text.toLowerCase();
    const filtered = users.filter(user => 
      user.username.toLowerCase().includes(searchTerm) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm)
    );
    setFilteredUsers(filtered);
  };

  const handleSend = async () => {
    if (!selectedUser || !message.trim()) return;

    try {
      console.log('Sending message:', {
        receiverId: selectedUser.id,
        message: message,
        selectedUser
      });
      await sendMessage(selectedUser.id, message);
      navigation.goBack();
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
      onPress={() => setSelectedUser(user)}
    >
      <View style={styles.userInfo}>
        <Text style={styles.userName}>@{user.username}</Text>
        <Text style={styles.userFullName}>
          {user.firstName} {user.lastName}
        </Text>
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
                placeholder="Search by username or name..."
                placeholderTextColor="#A1A1AA"
                value={searchQuery}
                onChangeText={handleSearch}
                autoCapitalize="none"
              />
            </View>
            <FlatList
              data={filteredUsers}
              renderItem={renderUser}
              keyExtractor={(item) => item.id}
              style={styles.userList}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {searchQuery ? 'No users found' : 'No users available'}
                  </Text>
                </View>
              }
            />
            
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
                  onPress={handleSend}
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
  userFullName: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 14,
    color: '#A1A1AA',
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