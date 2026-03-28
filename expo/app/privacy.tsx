import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

export default function PrivacyScreen() {
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Privacy</Text>
			<Text style={styles.body}>We collect session metadata (start/stop times, duration) and shield events (attempts/bypass). We do not collect content of your messages, emails, files, browsing, or screen contents.</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16, backgroundColor: Colors.gray[50] },
	title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
	body: { fontSize: 16, color: Colors.gray[700], lineHeight: 22 },
});