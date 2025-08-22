import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, useColorScheme, Dimensions } from 'react-native';
import { Colors } from '@/constants/colors';
import { Button } from '@/components/Button';
import { StatTile } from '@/components/StatTile';
import { useSessionStore, CompletedSession } from '@/lib/state/sessionStore';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { computeFocusStreak, computeWeeklyTotals } from '@/utils/stats';
import { BarChart } from 'react-native-chart-kit';

const STORAGE_KEY = 'optivise:sessions';

export default function HomeScreen() {
	const scheme = useColorScheme();
	const isDark = scheme === 'dark';
	const { status, startSession, stopSession } = useSessionStore();
	const [sessions, setSessions] = useState<CompletedSession[]>([]);

	useEffect(() => {
		const load = async () => {
			const raw = await AsyncStorage.getItem(STORAGE_KEY);
			setSessions(raw ? JSON.parse(raw) : []);
		};
		load();
	}, []);

	const streak = computeFocusStreak(sessions);
	const weekly = computeWeeklyTotals(sessions);

	return (
		<View style={[styles.container, { backgroundColor: isDark ? Colors.gray[900] : Colors.gray[50] }]}> 
			<Text style={[styles.title, { color: isDark ? Colors.white : Colors.black }]}>Welcome</Text>
			<View style={styles.row}>
				<StatTile label="Streak" value={`${streak}d`} style={{ flex: 1, marginRight: 8 }} />
				<StatTile label="Sessions" value={`${sessions.length}`} style={{ flex: 1, marginLeft: 8 }} />
			</View>
			<View style={{ height: 16 }} />
			<BarChart
				data={{ labels: weekly.labels, datasets: [{ data: weekly.minutes }] }}
				width={Dimensions.get('window').width - 32}
				height={160}
				fromZero
				yAxisLabel=""
				yAxisSuffix="m"
				chartConfig={{
					backgroundGradientFrom: isDark ? Colors.gray[900] : Colors.gray[50],
					backgroundGradientTo: isDark ? Colors.gray[900] : Colors.gray[50],
					color: () => Colors.primary,
					labelColor: () => (isDark ? Colors.gray[300] : Colors.gray[600]),
					barPercentage: 0.5,
				}}
				style={{ borderRadius: 12 }}
			/>
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