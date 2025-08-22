import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, useColorScheme, FlatList, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CompletedSession } from '@/lib/state/sessionStore';
import { router, useFocusEffect } from 'expo-router';

const STORAGE_KEY = 'optivise:sessions';

function formatHm(totalSeconds: number) {
	const minutes = Math.floor(totalSeconds / 60);
	const hh = Math.floor(minutes / 60).toString().padStart(2,'0');
	const mm = (minutes % 60).toString().padStart(2,'0');
	return `${hh}:${mm}`;
}

export default function HistoryScreen() {
	const scheme = useColorScheme();
	const isDark = scheme === 'dark';
	const [sessions, setSessions] = useState<CompletedSession[]>([]);

	const load = useCallback(async () => {
		const raw = await AsyncStorage.getItem(STORAGE_KEY);
		setSessions(raw ? JSON.parse(raw) : []);
	}, []);

	useFocusEffect(
		useCallback(() => {
			load();
			return () => {};
		}, [load])
	);

	return (
		<View style={[styles.container, { backgroundColor: isDark ? Colors.gray[900] : Colors.gray[50] }]}> 
			<FlatList
				data={sessions}
				keyExtractor={(item) => item.id + item.startedAt}
				renderItem={({ item }) => (
					<TouchableOpacity
						accessibilityRole="button"
						hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
						style={[styles.row, { borderColor: isDark ? Colors.gray[700] : Colors.gray[200] }]}
						onPress={() => router.push({ pathname: '/modal', params: { summary: JSON.stringify(item) } })}
					>
						<View style={{ flex: 1 }}>
							<Text style={{ color: isDark ? Colors.white : Colors.black, fontWeight: '600' }}>{new Date(item.startedAt).toLocaleDateString()}</Text>
							<Text style={{ color: isDark ? Colors.gray[300] : Colors.gray[600] }}>{formatHm(item.durationSeconds)} • {item.events.length} events</Text>
						</View>
					</TouchableOpacity>
				)}
				ListEmptyComponent={<Text style={{ color: isDark ? Colors.gray[300] : Colors.gray[600], textAlign: 'center', marginTop: 24 }}>No history yet.</Text>}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
	row: { paddingVertical: 12, paddingHorizontal: 12, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center' },
});