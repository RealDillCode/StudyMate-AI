import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { AppUsage } from '@/types';
import { formatTime } from '@/utils/timeUtils';

type AppUsageItemProps = {
  app: AppUsage;
  onToggle?: () => void;
  showToggle?: boolean;
};

export function AppUsageItem({ app, onToggle, showToggle = false }: AppUsageItemProps) {
  const { appName, appCategory, usageTime, isWorkApp, iconUrl } = app;
  
  const getCategoryColor = () => {
    switch (appCategory) {
      case 'productivity':
        return Colors.secondary;
      case 'communication':
        return Colors.primary;
      case 'social':
        return Colors.accent;
      case 'entertainment':
        return Colors.warning;
      case 'games':
        return Colors.danger;
      default:
        return Colors.gray[500];
    }
  };

  const categoryColor = getCategoryColor();
  const formattedTime = formatTime(usageTime, 'short');
  
  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        {iconUrl ? (
          <Image source={{ uri: iconUrl }} style={styles.icon} />
        ) : (
          <View style={[styles.iconPlaceholder, { backgroundColor: categoryColor }]}>
            <Text style={styles.iconPlaceholderText}>{appName.charAt(0)}</Text>
          </View>
        )}
        <View style={styles.infoContainer}>
          <Text style={styles.appName}>{appName}</Text>
          <View style={styles.categoryContainer}>
            <View style={[styles.categoryDot, { backgroundColor: categoryColor }]} />
            <Text style={styles.categoryText}>{appCategory}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.rightContainer}>
        <Text style={styles.timeText}>{formattedTime}</Text>
        {showToggle && (
          <TouchableOpacity 
            style={[
              styles.toggleButton, 
              { backgroundColor: isWorkApp ? Colors.secondary : Colors.gray[300] }
            ]}
            onPress={onToggle}
          >
            <Text style={styles.toggleText}>{isWorkApp ? 'Allowed' : 'Blocked'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightContainer: {
    alignItems: 'flex-end',
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  iconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPlaceholderText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoContainer: {
    marginLeft: 12,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[800],
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    color: Colors.gray[600],
    textTransform: 'capitalize',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[700],
    marginBottom: 4,
  },
  toggleButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
});