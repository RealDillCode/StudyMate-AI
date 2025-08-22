import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Coffee, Utensils, User } from 'lucide-react-native';

import { Colors } from '@/constants/colors';

type BreakButtonProps = {
  type: 'lunch' | 'coffee' | 'personal';
  onPress: () => void;
  disabled?: boolean;
};

export function BreakButton({ type, onPress, disabled = false }: BreakButtonProps) {
  const getTypeInfo = () => {
    switch (type) {
      case 'lunch':
        return {
          icon: <Utensils size={24} color={Colors.white} />,
          label: 'Lunch Break',
          color: Colors.accent,
        };
      case 'coffee':
        return {
          icon: <Coffee size={24} color={Colors.white} />,
          label: 'Coffee Break',
          color: Colors.primary,
        };
      case 'personal':
        return {
          icon: <User size={24} color={Colors.white} />,
          label: 'Personal Break',
          color: Colors.secondary,
        };
      default:
        return {
          icon: <Coffee size={24} color={Colors.white} />,
          label: 'Break',
          color: Colors.primary,
        };
    }
  };

  const { icon, label, color } = getTypeInfo();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: disabled ? Colors.gray[300] : color },
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.iconContainer}>{icon}</View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 6,
  },
  iconContainer: {
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});