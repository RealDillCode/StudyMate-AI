import React from 'react';
import { Text, View, StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '@/constants/colors';

export type StatTileProps = {
  label: string;
  value: string;
  style?: any;
};

export function StatTile({ label, value, style }: StatTileProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.gray[800] : Colors.white, borderColor: isDark ? Colors.gray[700] : Colors.gray[200] }, style]}>
      <Text style={[styles.label, { color: isDark ? Colors.gray[300] : Colors.gray[600] }]}>{label}</Text>
      <Text style={[styles.value, { color: isDark ? Colors.white : Colors.black }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    minWidth: 120,
  },
  label: {
    fontSize: 12,
    marginBottom: 6,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
  },
});