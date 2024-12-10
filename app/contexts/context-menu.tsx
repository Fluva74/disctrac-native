// app/contexts/context-menu.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ContextMenuItem {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

interface ContextMenuProps {
  visible: boolean;
  onClose: () => void;
  items: ContextMenuItem[];
  position?: { x: number; y: number };
}

export function ContextMenu({ visible, onClose, items, position }: ContextMenuProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View 
          style={[
            styles.menu,
            position && {
              top: position.y,
              left: position.x
            }
          ]}
        >
          <LinearGradient
            colors={['rgba(24, 24, 27, 0.95)', 'rgba(24, 24, 27, 0.98)']}
            style={styles.menuGradient}
          >
            {items.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() => {
                  onClose();
                  item.onPress();
                }}
              >
                <View style={styles.menuItemContent}>
                  {item.icon}
                  <Text 
                    style={[
                      styles.menuItemText,
                      item.destructive && styles.destructiveText
                    ]}
                  >
                    {item.label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </LinearGradient>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menu: {
    position: 'absolute',
    minWidth: 200,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(68, 255, 161, 0.2)',
  },
  menuGradient: {
    padding: 8,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#FFFFFF',
  },
  destructiveText: {
    color: '#EF4444',
  },
});
