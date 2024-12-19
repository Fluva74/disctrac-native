import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BaseModal from './BaseModal';
import { getDiscImage } from '../../utils/discUtils';

interface StoreDiscDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  disc: {
    name: string;
    manufacturer: string;
    color: string;
    ownerUsername?: string;
    ownerEmail?: string;
    ownerPhone?: string;
    contactPreferences?: {
      email: boolean;
      phone: boolean;
      inApp: boolean;
    };
    plastic?: string;
    notes?: string;
  };
}

const StoreDiscDetailsModal: React.FC<StoreDiscDetailsModalProps> = ({
  visible,
  onClose,
  disc,
}) => {
  return (
    <BaseModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.title}>Disc Details</Text>
        
        <View style={styles.contentContainer}>
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Owner</Text>
              <Text style={styles.value}>{disc.ownerUsername}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Disc Name</Text>
              <Text style={styles.value}>{disc.name}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Company</Text>
              <Text style={styles.value}>{disc.manufacturer}</Text>
            </View>

            {disc.plastic && (
              <View style={styles.detailRow}>
                <Text style={styles.label}>Plastic Type</Text>
                <Text style={styles.value}>{disc.plastic}</Text>
              </View>
            )}

            {disc.notes && (
              <View style={styles.detailRow}>
                <Text style={styles.label}>Additional Notes</Text>
                <Text style={styles.value}>{disc.notes}</Text>
              </View>
            )}

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Contact Methods</Text>
            {disc.contactPreferences?.email && disc.ownerEmail && (
              <View style={styles.detailRow}>
                <Text style={styles.value}>{disc.ownerEmail}</Text>
              </View>
            )}
            {disc.contactPreferences?.phone && disc.ownerPhone && (
              <View style={styles.detailRow}>
                <Text style={styles.value}>{disc.ownerPhone}</Text>
              </View>
            )}
            {disc.contactPreferences?.inApp && (
              <View style={styles.detailRow}>
                <Text style={styles.value}>In-App Messages</Text>
              </View>
            )}
          </View>

          <Image 
            source={getDiscImage(disc.color)} 
            style={styles.discImage}
            resizeMode="contain"
          />
        </View>

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
    width: '100%',
  },
  title: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 24,
    color: '#44FFA1',
    marginBottom: 24,
  },
  contentContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  detailsContainer: {
    flex: 1,
    marginRight: 16,
  },
  detailRow: {
    marginBottom: 16,
  },
  label: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 14,
    color: '#A1A1AA',
    marginBottom: 4,
  },
  value: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#27272A',
    width: '100%',
    marginVertical: 16,
  },
  sectionTitle: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 14,
    color: '#A1A1AA',
    marginBottom: 12,
  },
  discImage: {
    width: 100,
    height: 100,
    alignSelf: 'center',
  },
  closeButton: {
    width: '100%',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});

export default StoreDiscDetailsModal; 