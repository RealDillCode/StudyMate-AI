import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '@/constants/colors';
import { Button } from '@/components/Button';
import { StatTile } from '@/components/StatTile';
import { useSessionStore } from '@/lib/state/sessionStore';
import { router } from 'expo-router';

export default function HomeScreen() {
	const scheme = useColorScheme();
	const isDark = scheme === 'dark';
	const { status, startSession, stopSession } = useSessionStore();

	return (
		<View style={[styles.container, { backgroundColor: isDark ? Colors.gray[900] : Colors.gray[50] }]}> 
			<Text style={[styles.title, { color: isDark ? Colors.white : Colors.black }]}>Welcome</Text>
			<View style={styles.row}>
				<StatTile label="Today" value="--h --m" style={{ flex: 1, marginRight: 8 }} />
				<StatTile label="Sessions" value="--" style={{ flex: 1, marginLeft: 8 }} />
			</View>
			<View style={{ height: 16 }} />
			<Button
				title={status === 'active' ? 'End Session' : 'Start Work Session'}
				onPress={status === 'active' ? stopSession : async () => { await startSession(); router.push('/(app)/session'); }}
				fullWidth
				style={{ paddingVertical: 20 }}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
	title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
	row: { flexDirection: 'row' },
});