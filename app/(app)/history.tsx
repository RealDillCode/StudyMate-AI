import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '@/constants/colors';

export default function HistoryScreen() {
	const scheme = useColorScheme();
	const isDark = scheme === 'dark';
	return (
		<View style={[styles.container, { backgroundColor: isDark ? Colors.gray[900] : Colors.gray[50] }]}> 
			<Text style={{ color: isDark ? Colors.white : Colors.black }}>No history yet.</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
});