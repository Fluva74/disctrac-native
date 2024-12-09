import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ColorSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelectColor: (color: string) => void;
}

const COLORS = [
  'Blue',
  'Red',
  'Yellow',
  'Green',
  'Pink',
  'Purple',
  'Orange',
  'White',
  'Gray',
  'Black'
];

export const ColorSelector = ({ visible, onClose, onSelectColor }: ColorSelectorProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <MaterialCommunityIcons name="close" size={24} color="#A1A1AA" />
            </TouchableOpacity>
            <Text style={styles.title}>Select Color</Text>
          </View>

          <View style={styles.colorList}>
            {COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                onPress={() => {
                  onSelectColor(color);
                  onClose();
                }}
              >
                <LinearGradient
                  colors={['rgba(68, 255, 161, 0.1)', 'rgba(77, 159, 255, 0.1)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.colorOption}
                >
                  <Text style={styles.colorText}>{color}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: '#09090B',
    justifyContent: 'flex-start',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  closeButton: {
    position: 'absolute',
    left: 0,
    zIndex: 1,
    padding: 8,
  },
  title: {
    flex: 1,
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 40,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  colorList: {
    gap: 8,
  },
  colorOption: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(68, 255, 161, 0.2)',
  },
  colorText: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
}); 