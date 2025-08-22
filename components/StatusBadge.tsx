import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';

type StatusBadgeProps = {
  status: 'working' | 'on-break' | 'not-working';
  size?: 'small' | 'medium' | 'large';
};

export function StatusBadge({ status, size = 'medium' }: StatusBadgeProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'working':
        return Colors.primary;
      case 'on-break':
        return Colors.accent;
      case 'not-working':
        return Colors.gray[500];
      default:
        return Colors.gray[500];
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'working':
        return 'Working';
      case 'on-break':
        return 'On Break';
      case 'not-working':
        return 'Not Working';
      default:
        return 'Unknown';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.containerSmall,
          text: styles.textSmall,
          dot: styles.dotSmall,
        };
      case 'large':
        return {
          container: styles.containerLarge,
          text: styles.textLarge,
          dot: styles.dotLarge,
        };
      default:
        return {
          container: styles.containerMedium,
          text: styles.textMedium,
          dot: styles.dotMedium,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const statusColor = getStatusColor();
  const statusText = getStatusText();

  return (
    <View style={[styles.container, sizeStyles.container, { backgroundColor: `${statusColor}20` }]}>
      <View style={[styles.dot, sizeStyles.dot, { backgroundColor: statusColor }]} />
      <Text style={[styles.text, sizeStyles.text, { color: statusColor }]}>{statusText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  containerSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  containerMedium: {},
  containerLarge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  dotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  dotMedium: {},
  dotLarge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  text: {
    fontWeight: '600',
  },
  textSmall: {
    fontSize: 12,
  },
  textMedium: {
    fontSize: 14,
  },
  textLarge: {
    fontSize: 16,
  },
});