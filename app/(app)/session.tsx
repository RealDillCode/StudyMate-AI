import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '@/constants/colors';
import { ShieldStatusBanner } from '@/components/ShieldStatusBanner';
import { Button } from '@/components/Button';
import { useSessionStore } from '@/lib/state/sessionStore';
import { router } from 'expo-router';

function formatDuration(ms: number) {
	const totalSeconds = Math.floor(ms / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;
	return `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
}

export default function SessionScreen() {
	const scheme = useColorScheme();
	const isDark = scheme === 'dark';
	const { status, startedAt, stopSession, requestBypass, screenTimeAuthorized } = useSessionStore();
	const [now, setNow] = useState(Date.now());

	useEffect(() => {
		const id = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(id);
	}, []);

	const elapsed = useMemo(() => {
		if (!startedAt) return 0;
		return Date.now() - new Date(startedAt).getTime();
	}, [startedAt, now]);

	const onStop = async () => {
		const summary = await stopSession();
		if (summary) {
			router.push({ pathname: '/modal', params: { summary: JSON.stringify(summary) } });
		}
	};

	return (
		<View style={[styles.container, { backgroundColor: isDark ? Colors.gray[900] : Colors.gray[50] }]}> 
			<Text style={[styles.title, { color: isDark ? Colors.white : Colors.black }]}>Active Session</Text>
			{!screenTimeAuthorized && (
				<View style={{ backgroundColor: Colors.warning, padding: 8, borderRadius: 8, marginBottom: 8 }}>
					<Text style={{ color: Colors.black }}>ScreenTime authorization not granted. Shield may be inactive.</Text>
				</View>
			)}
			<Text style={[styles.timer, { color: isDark ? Colors.white : Colors.black }]} accessibilityRole="text" accessibilityLabel={`Elapsed ${formatDuration(elapsed)}`}>{formatDuration(elapsed)}</Text>
			<View style={{ height: 12 }} />
			<ShieldStatusBanner />
			<View style={{ height: 16 }} />
			<Button title="Request Bypass" onPress={requestBypass} variant="outline" fullWidth style={{ marginBottom: 8 }} />
			<Button title="End Session" onPress={onStop} fullWidth />
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
	title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
	timer: { fontSize: 40, fontWeight: '800' },
});