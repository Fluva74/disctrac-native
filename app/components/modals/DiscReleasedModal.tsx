import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BaseModal from './BaseModal';
import { getDiscImage } from '../../utils/discImageUtils';

interface DiscReleasedModalProps {
  visible: boolean;
  onClose: () => void;
  onAddDisc: () => void;
  discName: string;
  company: string;
  color: string;
  playerName: string;
}

const DiscReleasedModal: React.FC<DiscReleasedModalProps> = ({
  visible,
  onClose,
  onAddDisc,
  discName,
  company,
  color,
  playerName,
}) => {
  return (
    <BaseModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.title}>{playerName} has released this disc</Text>

        <View style={styles.discImageContainer}>
          <Image 
            source={getDiscImage(color)}
            style={styles.discImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.discInfo}>
          <Text style={styles.label}>Disc Name</Text>
          <Text style={styles.value}>{discName}</Text>

          <Text style={styles.label}>Company</Text>
          <Text style={styles.value}>{company}</Text>
        </View>

        <Text style={styles.question}>
          Would You Like To Add This Disc To Your Bag?
        </Text>

        <TouchableOpacity onPress={onAddDisc} style={styles.addButton}>
          <LinearGradient
            colors={['#44FFA1', '#4D9FFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          >
            <Text style={styles.addButtonText}>Add Disc</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 24,
    textAlign: 'center',
  },
  discImageContainer: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  discImage: {
    width: '100%',
    height: '100%',
  },
  discInfo: {
    width: '100%',
    marginBottom: 24,
  },
  label: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 14,
    color: '#A1A1AA',
    marginBottom: 4,
  },
  value: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  question: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 24,
    textAlign: 'center',
  },
  addButton: {
    width: '100%',
  },
  gradient: {
    borderRadius: 8,
    padding: 16,
  },
  addButtonText: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
  },
  cancelButton: {
    width: '100%',
    padding: 16,
  },
  cancelButtonText: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#A1A1AA',
    textAlign: 'center',
  },
});

export default DiscReleasedModal; 