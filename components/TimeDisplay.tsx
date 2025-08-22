import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { formatTime } from '@/utils/timeUtils';

type TimeDisplayProps = {
  startTime: Date;
  endTime?: Date | null;
  isActive?: boolean;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  label?: string;
};

export function TimeDisplay({
  startTime,
  endTime,
  isActive = false,
  size = 'medium',
  showLabel = true,
  label = 'Elapsed Time',
}: TimeDisplayProps) {
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  useEffect(() => {
    // Calculate initial elapsed time
    if (endTime) {
      // If end time is provided, calculate fixed duration
      setElapsedTime(endTime.getTime() - startTime.getTime());
    } else if (isActive) {
      // If active and no end time, calculate current elapsed time
      setElapsedTime(new Date().getTime() - startTime.getTime());
      
      // Set up interval to update elapsed time
      const interval = setInterval(() => {
        setElapsedTime(new Date().getTime() - startTime.getTime());
      }, 1000);
      
      return () => clearInterval(interval);
    } else {
      // If not active and no end time, set elapsed time to 0
      setElapsedTime(0);
    }
  }, [startTime, endTime, isActive]);

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.containerSmall,
          time: styles.timeSmall,
          label: styles.labelSmall,
        };
      case 'large':
        return {
          container: styles.containerLarge,
          time: styles.timeLarge,
          label: styles.labelLarge,
        };
      default:
        return {
          container: styles.containerMedium,
          time: styles.timeMedium,
          label: styles.labelMedium,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const formattedTime = formatTime(elapsedTime, size === 'small' ? 'short' : 'medium');

  return (
    <View style={[styles.container, sizeStyles.container]}>
      <Text style={[styles.time, sizeStyles.time]}>{formattedTime}</Text>
      {showLabel && <Text style={[styles.label, sizeStyles.label]}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerSmall: {
    padding: 8,
  },
  containerMedium: {
    padding: 12,
  },
  containerLarge: {
    padding: 16,
  },
  time: {
    fontWeight: 'bold',
    color: Colors.gray[800],
  },
  timeSmall: {
    fontSize: 16,
  },
  timeMedium: {
    fontSize: 24,
  },
  timeLarge: {
    fontSize: 36,
  },
  label: {
    color: Colors.gray[600],
    marginTop: 4,
  },
  labelSmall: {
    fontSize: 12,
  },
  labelMedium: {
    fontSize: 14,
  },
  labelLarge: {
    fontSize: 16,
  },
});