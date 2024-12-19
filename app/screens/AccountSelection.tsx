import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { useFonts, LeagueSpartan_400Regular, LeagueSpartan_700Bold } from '@expo-google-fonts/league-spartan';

const AccountSelection = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [fontsLoaded] = useFonts({
    LeagueSpartan_400Regular,
    LeagueSpartan_700Bold,
  });

  const goToPlayerCreate = () => {
    navigation.navigate('PlayerCreate');
  };

  const goToStoreCreate = () => {
    navigation.navigate('StoreCreate');
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <LinearGradient
      colors={['transparent', 'transparent', 'rgba(59, 130, 246, 0.2)']}
      style={styles.container}
      locations={[0, 0.5, 1]}
    >
      {/* Logo Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>disctrac</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Choose Account Type</Text>

        <View style={styles.buttonContainer}>
          <View style={styles.buttonGroup}>
            <Text style={styles.buttonLabel}>On the course, throwing discs?</Text>
            <LinearGradient
              colors={['#44FFA1', '#4D9FFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradient}
            >
              <TouchableOpacity
                style={styles.button}
                onPress={goToPlayerCreate}
              >
                <Text style={styles.buttonText}>Player Account</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          <View style={styles.buttonGroup}>
            <Text style={styles.buttonLabel}>At the store, selling discs?</Text>
            <LinearGradient
              colors={['#44FFA1', '#4D9FFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradient}
            >
              <TouchableOpacity
                style={styles.button}
                onPress={goToStoreCreate}
              >
                <Text style={styles.buttonText}>Store Account</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090B',
  },
  header: {
    paddingTop: 32,
    paddingHorizontal: 32,
  },
  logo: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 32,
    textAlign: 'center',
    color: '#44FFA1',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    marginTop: '35%',
    paddingBottom: 100,
  },
  title: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 32,
    color: '#FFFFFF',
    marginBottom: 54,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 48,
  },
  buttonGroup: {
    gap: 12,
  },
  buttonLabel: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 14,
    color: '#A1A1AA',
    textAlign: 'center',
  },
  gradient: {
    borderRadius: 8,
  },
  button: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'LeagueSpartan_700Bold',
    color: '#000000',
    fontSize: 18,
  },
});

export default AccountSelection;