import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Clock, LogOut } from 'lucide-react-native';

import { Colors } from '@/constants/colors';

type ClockButtonProps = {
  isClockIn: boolean;
  onPress: () => void;
  disabled?: boolean;
};

export function ClockButton({ isClockIn, onPress, disabled = false }: ClockButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: isClockIn ? Colors.primary : Colors.red },
        disabled && styles.disabledContainer,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.content}>
        {isClockIn ? (
          <Clock size={24} color={Colors.white} />
        ) : (
          <LogOut size={24} color={Colors.white} />
        )}
        <Text style={styles.text}>{isClockIn ? 'Clock In' : 'Clock Out'}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledContainer: {
    backgroundColor: Colors.gray[400],
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
    marginLeft: 8,
  },
});