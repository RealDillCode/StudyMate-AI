import React from 'react';
import { View, Text, StyleSheet, useColorScheme, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/colors';
import { Button } from '@/components/Button';
import { useAuthStore } from '@/lib/state/authStore';
import { router } from 'expo-router';

export default function SettingsScreen() {
	const scheme = useColorScheme();
	const isDark = scheme === 'dark';
	const signOut = useAuthStore(s => s.signOut);
	return (
		<View style={[styles.container, { backgroundColor: isDark ? Colors.gray[900] : Colors.gray[50] }]}> 
			<Text style={[styles.title, { color: isDark ? Colors.white : Colors.black }]}>Settings</Text>
			<TouchableOpacity onPress={() => router.push('/privacy')} accessibilityRole="button" style={{ marginBottom: 16 }}>
				<Text style={{ color: Colors.primary }}>Privacy</Text>
			</TouchableOpacity>
			<Button title="Sign out" variant="danger" onPress={signOut} fullWidth />
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
	title: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
});