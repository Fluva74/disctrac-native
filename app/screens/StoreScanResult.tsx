import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ScreenTemplate from '../components/ScreenTemplate';

const StoreScanResult = () => {
  return (
    <ScreenTemplate>
      <View style={styles.container}>
        <Text style={styles.title}>Scan Result</Text>
      </View>
    </ScreenTemplate>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 32,
    color: '#FFFFFF',
    marginBottom: 24,
  },
});

export default StoreScanResult; 