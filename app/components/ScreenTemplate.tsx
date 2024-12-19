import React, { useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Platform, StatusBar, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { PlayerStackParamList } from '../stacks/PlayerStack';
import { Logo } from './Logo';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { getDoc, doc } from 'firebase/firestore';

interface ScreenTemplateProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
}

const ScreenTemplate: React.FC<ScreenTemplateProps> = ({ children, showBackButton = false }) => {
  console.log('=== Screen Template Render ===');
  const navigation = useNavigation<NavigationProp<PlayerStackParamList>>();
  const user = FIREBASE_AUTH.currentUser;
  console.log('Current user in template:', user?.uid);

  useEffect(() => {
    const checkUserType = async () => {
      if (user) {
        const storeDoc = await getDoc(doc(FIREBASE_DB, 'stores', user.uid));
        console.log('User type check:', {
          isStore: storeDoc.exists(),
          userId: user.uid
        });
      }
    };
    checkUserType();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.placeholder} />
            <Logo />
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => navigation.navigate('Settings')}
            >
              <MaterialCommunityIcons name="cog" size={24} color="#44FFA1" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.childrenContainer}>
          {children}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090B',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  content: {
    flex: 1,
  },
  header: {
    height: 60,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  placeholder: {
    width: 24,
  },
  settingsButton: {
    padding: 8,
  },
  childrenContainer: {
    flex: 1,
  },
});

export default ScreenTemplate; 