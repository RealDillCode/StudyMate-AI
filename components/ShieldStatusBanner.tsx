import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '@/constants/colors';

export function ShieldStatusBanner() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.gray[800] : Colors.gray[100], borderColor: isDark ? Colors.gray[700] : Colors.gray[200] }]}
      accessibilityRole="header"
      accessibilityLabel="Shield status banner"
    >
      <Text style={[styles.text, { color: isDark ? Colors.white : Colors.black }]}>Shield Status: Placeholder</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  text: {
    fontWeight: '600',
  },
});