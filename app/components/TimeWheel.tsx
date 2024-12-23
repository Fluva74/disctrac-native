import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface TimeWheelProps {
  value: string;
  onChange: (value: string) => void;
  period?: 'AM' | 'PM';
  onPeriodChange?: (period: 'AM' | 'PM') => void;
  type: 'hour' | 'minute';
}

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];

export function TimeWheel({ value, onChange, period = 'AM', onPeriodChange, type }: TimeWheelProps) {
  const values = type === 'hour' ? HOURS : MINUTES;
  
  const handleIncrement = () => {
    const currentIndex = values.indexOf(value);
    const nextIndex = (currentIndex + 1) % values.length;
    onChange(values[nextIndex]);
  };

  const handleDecrement = () => {
    const currentIndex = values.indexOf(value);
    const prevIndex = currentIndex <= 0 ? values.length - 1 : currentIndex - 1;
    onChange(values[prevIndex]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.timeControls}>
        <TouchableOpacity 
          style={styles.button}
          onPress={handleIncrement}
        >
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>

        <View style={styles.valueContainer}>
          <Text style={styles.valueText}>{value}</Text>
        </View>

        <TouchableOpacity 
          style={styles.button}
          onPress={handleDecrement}
        >
          <Text style={styles.buttonText}>-</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeControls: {
    alignItems: 'center',
    gap: 4,
  },
  button: {
    width: 60,
    height: 32,
    backgroundColor: 'rgba(24, 24, 27, 0.5)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  buttonText: {
    fontSize: 20,
    color: '#44FFA1',
    fontFamily: 'LeagueSpartan_700Bold',
  },
  valueContainer: {
    width: 60,
    height: 32,
    backgroundColor: 'rgba(68, 255, 161, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#44FFA1',
  },
  valueText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'LeagueSpartan_700Bold',
  },
  periodContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  periodButton: {
    width: 56,
    height: 48,
    borderRadius: 8,
    backgroundColor: 'rgba(24, 24, 27, 0.5)',
    borderWidth: 1,
    borderColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePeriodButton: {
    backgroundColor: 'rgba(68, 255, 161, 0.1)',
    borderColor: 'rgba(68, 255, 161, 0.2)',
  },
  periodText: {
    fontSize: 16,
    color: '#71717A',
    fontFamily: 'LeagueSpartan_400Regular',
  },
  activePeriodText: {
    color: '#FFFFFF',
    fontFamily: 'LeagueSpartan_700Bold',
  },
}); 