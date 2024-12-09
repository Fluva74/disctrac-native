import React from 'react';
import { Text, StyleSheet } from 'react-native';

export const Logo = () => {
  return (
    <Text style={styles.logo}>
      disctrac
    </Text>
  );
};

const styles = StyleSheet.create({
  logo: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 32,
    textAlign: 'center',
    color: '#44FFA1',
  },
}); 