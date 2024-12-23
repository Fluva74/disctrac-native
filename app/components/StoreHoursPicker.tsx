import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TimeWheel } from './TimeWheel';

type DayOfWeek = 'Su' | 'M' | 'Tu' | 'W' | 'Th' | 'F' | 'Sa';

interface DayHours {
  open: string;
  close: string;
  openPeriod: 'AM' | 'PM';
  closePeriod: 'AM' | 'PM';
  isClosed: boolean;
}

interface StoreHours {
  [key: string]: DayHours;
}

interface StoreHoursPickerProps {
  value?: string;
  onChange: (hours: string) => void;
}

export const StoreHoursPicker = ({ value = '', onChange }: StoreHoursPickerProps) => {
  const [selectedDay, setSelectedDay] = useState<string>('sunday');
  const [currentField, setCurrentField] = useState<'open' | 'close'>('open');
  const isInitialMount = useRef(true);
  
  // Set default times
  const defaultHours: DayHours = {
    open: '09:00',
    close: '05:00',
    openPeriod: 'AM',
    closePeriod: 'PM',
    isClosed: false
  };

  // Parse existing hours value to set initial state
  const parseExistingHours = () => {
    const initialHours: StoreHours = {
      sunday: { ...defaultHours },
      monday: { ...defaultHours },
      tuesday: { ...defaultHours },
      wednesday: { ...defaultHours },
      thursday: { ...defaultHours },
      friday: { ...defaultHours },
      saturday: { ...defaultHours },
    };

    if (value) {
      value.split('\n').forEach(line => {
        const [day, times] = line.split(': ');
        if (times === 'Closed') {
          initialHours[day].isClosed = true;
        } else {
          const [openTime, closeTime] = times.split(' - ');
          const [openTimeValue, openPeriod] = openTime.split(' ');
          const [closeTimeValue, closePeriod] = closeTime.split(' ');
          
          initialHours[day] = {
            open: openTimeValue,
            close: closeTimeValue,
            openPeriod: openPeriod as 'AM' | 'PM',
            closePeriod: closePeriod as 'AM' | 'PM',
            isClosed: false
          };
        }
      });
    }

    return initialHours;
  };

  const [hours, setHours] = useState<StoreHours>(parseExistingHours());
  const [modifiedDays, setModifiedDays] = useState<Set<string>>(new Set());

  const DAYS: { short: string; full: string }[] = [
    { short: 'Su', full: 'sunday' },
    { short: 'M', full: 'monday' },
    { short: 'Tu', full: 'tuesday' },
    { short: 'W', full: 'wednesday' },
    { short: 'Th', full: 'thursday' },
    { short: 'F', full: 'friday' },
    { short: 'Sa', full: 'saturday' },
  ];

  // Update day selection handler
  const handleDaySelect = (day: string) => {
    setSelectedDay(day);
  };

  const handleTimeChange = (type: 'open' | 'close', timeValue: string) => {
    setModifiedDays(prev => new Set(prev).add(selectedDay));
    setHours((prev: StoreHours): StoreHours => {
      const newHours: StoreHours = {
        ...prev,
        [selectedDay]: {
          ...prev[selectedDay],
          [type]: timeValue,
        }
      };

      return newHours;
    });
  };

  const handlePeriodChange = (type: 'open' | 'close', period: 'AM' | 'PM') => {
    setHours((prev: StoreHours): StoreHours => ({
      ...prev,
      [selectedDay]: {
        ...prev[selectedDay],
        [`${type}Period`]: period
      }
    }));
  };

  const toggleClosed = () => {
    setModifiedDays(prev => new Set(prev).add(selectedDay));
    
    setHours((prev: StoreHours): StoreHours => {
      const newHours: StoreHours = {
        ...prev,
        [selectedDay]: {
          ...prev[selectedDay],
          isClosed: !prev[selectedDay].isClosed
        }
      };

      return newHours;
    });
  };

  // Create a reusable function for formatting hours
  const formatHoursString = (hours: StoreHours): string => {
    return Object.entries(hours)
      .map(([day, times]) => {
        if (times.isClosed) return `${day}: Closed`;
        return `${day}: ${times.open} ${times.openPeriod} - ${times.close} ${times.closePeriod}`;
      })
      .join('\n');
  };

  // Move the formatting and onChange call to useEffect
  useEffect(() => {
    // Skip the first render
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const formattedHours = formatHoursString(hours);
    onChange(formattedHours);
  }, [hours]);

  return (
    <View style={styles.container}>
      <View style={styles.daysContainer}>
        {DAYS.map((day) => (
          <TouchableOpacity
            key={day.short}
            style={[
              styles.dayButton,
              !hours[day.full].isClosed && styles.openDayButton,
              selectedDay === day.full && !hours[day.full].isClosed && styles.selectedDayButton,
              hours[day.full].isClosed && styles.closedDayButton,
              selectedDay === day.full && hours[day.full].isClosed && styles.selectedClosedDayButton,
            ]}
            onPress={() => handleDaySelect(day.full)}
          >
            <Text style={[
              styles.dayText,
              !hours[day.full].isClosed && styles.selectedDayText,
              selectedDay === day.full && styles.selectedDayText,
              hours[day.full].isClosed && styles.closedDayText,
              selectedDay === day.full && { transform: [{ scale: 1.1 }] }
            ]}>
              {day.short}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.timeSection}>
        <View style={styles.timeContainer}>
          <Text style={styles.timeLabel}>Opening Time</Text>
          <View style={styles.timeRow}>
            <View style={styles.timeSelectors}>
              <TimeWheel
                type="hour"
                value={hours[selectedDay].open.split(':')[0]}
                onChange={(time) => handleTimeChange('open', `${time}:${hours[selectedDay].open.split(':')[1]}`)}
              />
              <Text style={styles.timeSeparator}>:</Text>
              <TimeWheel
                type="minute"
                value={hours[selectedDay].open.split(':')[1]}
                onChange={(time) => handleTimeChange('open', `${hours[selectedDay].open.split(':')[0]}:${time}`)}
              />
            </View>
            <View style={styles.periodButtons}>
              <TouchableOpacity
                onPress={() => handlePeriodChange('open', 'AM')}
                style={[
                  styles.periodButton,
                  hours[selectedDay].openPeriod === 'AM' && styles.activePeriodButton
                ]}
              >
                <Text style={[
                  styles.periodText,
                  hours[selectedDay].openPeriod === 'AM' && styles.activePeriodText
                ]}>
                  AM
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handlePeriodChange('open', 'PM')}
                style={[
                  styles.periodButton,
                  hours[selectedDay].openPeriod === 'PM' && styles.activePeriodButton
                ]}
              >
                <Text style={[
                  styles.periodText,
                  hours[selectedDay].openPeriod === 'PM' && styles.activePeriodText
                ]}>
                  PM
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.timeContainer}>
          <Text style={styles.timeLabel}>Closing Time</Text>
          <View style={styles.timeRow}>
            <View style={styles.timeSelectors}>
              <TimeWheel
                type="hour"
                value={hours[selectedDay].close.split(':')[0]}
                onChange={(time) => handleTimeChange('close', `${time}:${hours[selectedDay].close.split(':')[1]}`)}
              />
              <Text style={styles.timeSeparator}>:</Text>
              <TimeWheel
                type="minute"
                value={hours[selectedDay].close.split(':')[1]}
                onChange={(time) => handleTimeChange('close', `${hours[selectedDay].close.split(':')[0]}:${time}`)}
              />
            </View>
            <View style={styles.periodButtons}>
              <TouchableOpacity
                onPress={() => handlePeriodChange('close', 'AM')}
                style={[
                  styles.periodButton,
                  hours[selectedDay].closePeriod === 'AM' && styles.activePeriodButton
                ]}
              >
                <Text style={[
                  styles.periodText,
                  hours[selectedDay].closePeriod === 'AM' && styles.activePeriodText
                ]}>
                  AM
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handlePeriodChange('close', 'PM')}
                style={[
                  styles.periodButton,
                  hours[selectedDay].closePeriod === 'PM' && styles.activePeriodButton
                ]}
              >
                <Text style={[
                  styles.periodText,
                  hours[selectedDay].closePeriod === 'PM' && styles.activePeriodText
                ]}>
                  PM
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.closedButton,
          hours[selectedDay].isClosed && styles.openButton
        ]}
        onPress={toggleClosed}
      >
        <Text style={[
          styles.closedButtonText,
          hours[selectedDay].isClosed && styles.openButtonText
        ]}>
          {hours[selectedDay].isClosed ? 'Open Store' : 'Mark as Closed'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(24, 24, 27, 0.8)',
    borderRadius: 8,
    padding: 16,
    gap: 24,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  dayButton: {
    width: 40,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(24, 24, 27, 0.8)',
  },
  selectedDayButton: {
    transform: [{ scale: 1.25 }],
    backgroundColor: 'rgba(68, 255, 161, 0.2)',
    borderColor: '#44FFA1',
    borderWidth: 1,
    zIndex: 1,
  },
  openDayButton: {
    backgroundColor: 'rgba(68, 255, 161, 0.1)',
  },
  closedDayButton: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
  },
  selectedClosedDayButton: {
    transform: [{ scale: 1.25 }],
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
    borderColor: '#FF4444',
    borderWidth: 1,
    zIndex: 1,
  },
  dayText: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#71717A',
  },
  selectedDayText: {
    fontFamily: 'LeagueSpartan_700Bold',
    color: '#44FFA1',
    transform: [{ scale: 1.1 }],
  },
  closedDayText: {
    fontFamily: 'LeagueSpartan_700Bold',
    color: '#FF4444',
  },
  timeSection: {
    gap: 24,
  },
  timeContainer: {
    gap: 8,
  },
  timeLabel: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 14,
    color: '#A1A1AA',
    marginLeft: 8,
  },
  closedButton: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  openButton: {
    backgroundColor: 'rgba(68, 255, 161, 0.1)',
  },
  closedButtonText: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 16,
    color: '#FF4444',
  },
  openButtonText: {
    color: '#44FFA1',
  },
  separator: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 20,
    color: '#44FFA1',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  timeSelectors: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  periodButtons: {
    gap: 8,
  },
  timeSeparator: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 24,
    color: '#44FFA1',
    marginHorizontal: 4,
  },
  periodButton: {
    width: 48,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(24, 24, 27, 0.5)',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  activePeriodButton: {
    backgroundColor: 'rgba(68, 255, 161, 0.1)',
    borderColor: '#44FFA1',
  },
  periodText: {
    fontFamily: 'LeagueSpartan_400Regular',
    fontSize: 16,
    color: '#71717A',
  },
  activePeriodText: {
    fontFamily: 'LeagueSpartan_700Bold',
    color: '#44FFA1',
  },
}); 