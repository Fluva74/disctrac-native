import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface InitialsAvatarProps {
  name?: string;
  size: number;
}

const generatePastelColor = (name: string): string => {
  const baseHue = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;
  return `hsl(${baseHue}, 70%, 80%)`;
};

export const InitialsAvatar = ({ name = '', size }: InitialsAvatarProps) => {
  const getInitials = (text: string) => {
    const parts = text.trim().split(' ').filter(part => part.length > 0);
    
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    
    const firstInitial = parts[0].charAt(0);
    const lastInitial = parts[parts.length - 1].charAt(0);
    
    return (firstInitial + lastInitial).toUpperCase();
  };

  const backgroundColor = generatePastelColor(name);

  return (
    <View style={[
      styles.container,
      {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor,
      }
    ]}>
      <View style={styles.initialsWrapper}>
        <Text style={[
          styles.text,
          {
            fontSize: size * 0.4,
          }
        ]}>
          {getInitials(name)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderColor: '#44FFA1',
    overflow: 'hidden',
  },
  initialsWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    paddingTop: '10%',
  },
  text: {
    fontFamily: 'LeagueSpartan_700Bold',
    color: '#09090B',
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
}); 