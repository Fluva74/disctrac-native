import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, PanResponder, Animated } from 'react-native';

interface TimeWheelProps {
  value: string;
  onChange: (value: string) => void;
  period?: 'AM' | 'PM';
  onPeriodChange?: (period: 'AM' | 'PM') => void;
}

const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 3;
const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

// Create more repetitions for smoother infinite scroll
const EXTENDED_HOURS = [...HOURS, ...HOURS, ...HOURS, ...HOURS, ...HOURS];
const EXTENDED_MINUTES = [...MINUTES, ...MINUTES, ...MINUTES, ...MINUTES, ...MINUTES];

// Adjust these constants for smoother momentum
const MOMENTUM_MULTIPLIER = 500; // Increased for longer momentum
const VELOCITY_MULTIPLIER = 5; // Increased for smoother deceleration
const TENSION = 15; // Decreased further for even smoother movement
const FRICTION = 3; // Decreased for less resistance
const SPRING_CONFIG = {
  tension: TENSION,
  friction: FRICTION,
  restSpeedThreshold: 0.1, // Much lower for more precise stopping
  restDisplacementThreshold: 0.1, // Much lower for better centering
  overshootClamping: true, // Prevent overshooting
};

export function TimeWheel({ value, onChange, period = 'AM', onPeriodChange }: TimeWheelProps) {
  const [hour, minute] = value.split(':');
  const hourPosition = useRef(new Animated.ValueXY()).current;
  const minutePosition = useRef(new Animated.ValueXY()).current;
  const [isDragging, setIsDragging] = useState(false);
  const [centeredHourValue, setCenteredHourValue] = useState(hour);
  const [centeredMinuteValue, setCenteredMinuteValue] = useState(minute);

  // Move useEffect outside renderWheel
  useEffect(() => {
    const hourListener = hourPosition.y.addListener(({ value }) => {
      const middleOffset = Math.floor(EXTENDED_HOURS.length / 2) * ITEM_HEIGHT;
      const relativeValue = value + middleOffset;
      const index = Math.round(relativeValue / ITEM_HEIGHT);
      const normalizedIndex = normalizeIndex(index, HOURS.length);
      const newCenteredValue = HOURS[normalizedIndex];
      setCenteredHourValue(newCenteredValue);
    });

    const minuteListener = minutePosition.y.addListener(({ value }) => {
      const middleOffset = Math.floor(EXTENDED_MINUTES.length / 2) * ITEM_HEIGHT;
      const relativeValue = value + middleOffset;
      const index = Math.round(relativeValue / ITEM_HEIGHT);
      const normalizedIndex = normalizeIndex(index, MINUTES.length);
      const newCenteredValue = MINUTES[normalizedIndex];
      setCenteredMinuteValue(newCenteredValue);
    });

    return () => {
      hourPosition.y.removeListener(hourListener);
      minutePosition.y.removeListener(minuteListener);
    };
  }, []);

  const normalizeIndex = (index: number, length: number) => {
    return ((index % length) + length) % length;
  };

  const createPanResponder = (type: 'hour' | 'minute') => {
    const position = type === 'hour' ? hourPosition : minutePosition;
    const values = type === 'hour' ? HOURS : MINUTES;
    const extendedValues = type === 'hour' ? EXTENDED_HOURS : EXTENDED_MINUTES;
    const middleOffset = Math.floor(extendedValues.length / 2) * ITEM_HEIGHT;

    const snapToValue = (index: number) => {
      const normalizedIndex = normalizeIndex(index, values.length);
      const currentSetIndex = Math.floor(index / values.length);
      const targetY = ((normalizedIndex + (currentSetIndex * values.length)) * ITEM_HEIGHT) - middleOffset;
      
      return { targetY, normalizedIndex };
    };

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsDragging(true);
        position.stopAnimation((value) => {
          position.setOffset({ x: value.x, y: value.y });
          position.setValue({ x: 0, y: 0 });
        });
      },
      onPanResponderMove: (_, gestureState) => {
        position.setValue({ x: 0, y: gestureState.dy });
      },
      onPanResponderRelease: (_, gestureState) => {
        setIsDragging(false);
        position.flattenOffset();

        position.y.stopAnimation((value) => {
          const velocity = gestureState.vy;
          const projectedOffset = value + (velocity * MOMENTUM_MULTIPLIER);
          const relativeValue = projectedOffset + middleOffset;
          const index = Math.round(relativeValue / ITEM_HEIGHT);
          
          const { targetY, normalizedIndex } = snapToValue(index);
          const newValue = values[normalizedIndex];

          // Two-phase animation for smoother deceleration and precise stopping
          Animated.sequence([
            // First phase: Decelerate with momentum
            Animated.spring(position, {
              toValue: { x: 0, y: targetY },
              useNativeDriver: true,
              velocity: velocity * VELOCITY_MULTIPLIER,
              ...SPRING_CONFIG,
            }),
            // Second phase: Ensure precise centering
            Animated.spring(position, {
              toValue: { x: 0, y: targetY },
              useNativeDriver: true,
              velocity: 0,
              tension: 100,
              friction: 10,
            })
          ]).start(() => {
            if (newValue) {
              onChange(`${type === 'hour' ? newValue : hour}:${type === 'minute' ? newValue : minute}`);
            }
          });
        });
      }
    });
  };

  const renderWheel = (type: 'hour' | 'minute') => {
    const values = type === 'hour' ? EXTENDED_HOURS : EXTENDED_MINUTES;
    const selectedValue = type === 'hour' ? hour : minute;
    const position = type === 'hour' ? hourPosition : minutePosition;
    const centeredValue = type === 'hour' ? centeredHourValue : centeredMinuteValue;
    const panResponder = createPanResponder(type);

    return (
      <View style={styles.wheelContainer}>
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.wheelContent,
            {
              transform: [{
                translateY: position.y
              }]
            }
          ]}
        >
          {values.map((value, index) => (
            <View 
              key={`${value}-${index}`}
              style={[
                styles.item,
                { height: ITEM_HEIGHT }
              ]}
            >
              <Text style={[
                styles.itemText,
                value === centeredValue && styles.selectedItemText
              ]}>
                {value}
              </Text>
            </View>
          ))}
        </Animated.View>
        <View style={styles.selectionOverlay} pointerEvents="none" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderWheel('hour')}
      <Text style={styles.separator}>:</Text>
      {renderWheel('minute')}
      <View style={styles.periodContainer}>
        <TouchableOpacity
          onPress={() => onPeriodChange?.('AM')}
          style={[
            styles.periodButton,
            period === 'AM' && styles.activePeriodButton
          ]}
        >
          <Text style={[
            styles.periodText,
            period === 'AM' && styles.activePeriodText
          ]}>
            AM
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onPeriodChange?.('PM')}
          style={[
            styles.periodButton,
            period === 'PM' && styles.activePeriodButton
          ]}
        >
          <Text style={[
            styles.periodText,
            period === 'PM' && styles.activePeriodText
          ]}>
            PM
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  wheelContainer: {
    width: 80,
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    backgroundColor: 'rgba(24, 24, 27, 0.5)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27272A',
    overflow: 'hidden',
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    fontSize: 18,
    color: '#71717A',
    fontFamily: 'LeagueSpartan_400Regular',
  },
  selectedItemText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'LeagueSpartan_700Bold',
  },
  separator: {
    fontSize: 24,
    color: '#71717A',
    fontFamily: 'LeagueSpartan_700Bold',
  },
  selectionOverlay: {
    position: 'absolute',
    top: ITEM_HEIGHT,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#44FFA1',
    backgroundColor: 'rgba(68, 255, 161, 0.1)',
  },
  periodContainer: {
    gap: 8,
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
  wheelContent: {
    position: 'absolute',
    top: ITEM_HEIGHT,
    left: 0,
    right: 0,
  },
}); 