import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import HsvColorPicker from 'react-native-hsv-color-picker';

const ColorTest = () => {
  const [color, setColor] = useState({
    hue: 0,
    saturation: 0,
    value: 1,
  });

  const onSatValPickerChange = ({ saturation, value }: { saturation: number; value: number }) => {
    setColor((prev) => ({
      ...prev,
      saturation,
      value,
    }));
  };

  const onHuePickerChange = ({ hue }: { hue: number }) => {
    setColor((prev) => ({
      ...prev,
      hue,
    }));
  };

  const calculateHexColor = () => {
    const { hue, saturation, value } = color;
    const c = value * saturation;
    const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
    const m = value - c;
    let [r, g, b] = [0, 0, 0];

    if (hue < 60) [r, g, b] = [c, x, 0];
    else if (hue < 120) [r, g, b] = [x, c, 0];
    else if (hue < 180) [r, g, b] = [0, c, x];
    else if (hue < 240) [r, g, b] = [0, x, c];
    else if (hue < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];

    const toHex = (channel: number) =>
      Math.round((channel + m) * 255)
        .toString(16)
        .padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const hexColor = calculateHexColor();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HSV Color Picker</Text>
      <HsvColorPicker
        huePickerHue={color.hue}
        onHuePickerDragMove={onHuePickerChange}
        onHuePickerPress={onHuePickerChange}
        satValPickerHue={color.hue}
        satValPickerSaturation={color.saturation}
        satValPickerValue={color.value}
        onSatValPickerDragMove={onSatValPickerChange}
        onSatValPickerPress={onSatValPickerChange}
      />
      <View style={[styles.colorPreview, { backgroundColor: hexColor }]} />
      <Text style={styles.colorCode}>{`Selected Color: ${hexColor}`}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f4f4f4',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  colorPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#000',
  },
  colorCode: {
    fontSize: 18,
    fontWeight: '500',
  },
});

export default ColorTest;
