import React from 'react';
import { useColorScheme, View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

export type CardProps = {
  children: React.ReactNode;
  style?: any;
  accessibleLabel?: string;
};

export function Card({ children, style, accessibleLabel }: CardProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return (
    <View
      accessibilityRole="summary"
      accessibilityLabel={accessibleLabel}
      style={[styles.base, { backgroundColor: isDark ? Colors.gray[800] : Colors.white, borderColor: isDark ? Colors.gray[700] : Colors.gray[200] }, style]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
});