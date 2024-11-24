//file.ColorChanger.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';

const colors = [
  { name: 'Red', hex: 'red' },
  { name: 'Blue', hex: 'blue' },
  { name: 'Green', hex: 'green' },
  { name: 'Yellow', hex: 'yellow' },
  { name: 'Purple', hex: 'purple' },
  { name: 'Orange', hex: 'orange' },
  { name: 'Pink', hex: 'pink' },
  { name: 'Brown', hex: 'brown' },
  { name: 'Gray', hex: 'gray' },
  { name: 'Black', hex: 'black' },
];

const ColorChanger = () => {
  const [selectedColor, setSelectedColor] = useState<string>('transparent');

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Color Changer</Text>

      {/* Disc Image with Overlay */}
      <View style={styles.imageContainer}>
        <Image
          source={require('../../assets/discWhite.png')} // Path to the white disc image
          style={styles.discImage}
        />
        <View
          style={[styles.colorOverlay, { backgroundColor: selectedColor }]}
        />
      </View>

      {/* Color Swatches */}
      <View style={styles.swatchesContainer}>
        {colors.map((color) => (
          <TouchableOpacity
            key={color.name}
            style={[styles.swatch, { backgroundColor: color.hex }]}
            onPress={() => handleColorChange(color.hex)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1c1c1c', padding: 16 },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  imageContainer: {
    position: 'relative',
    alignSelf: 'center',
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  discImage: {
    width: '100%',
    height: '100%',
  },
  colorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.5, // Adjust this for the color intensity
    borderRadius: 100, // Ensures it matches the disc's circular shape
  },
  swatchesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 5,
    borderWidth: 2,
    borderColor: '#fff',
  },
});

export default ColorChanger;
