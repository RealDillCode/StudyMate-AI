import { Stack } from 'expo-router';

export default function AppLayout() {
	return (
		<Stack>
			<Stack.Screen name="home" options={{ title: 'Home' }} />
			<Stack.Screen name="session" options={{ title: 'Session' }} />
			<Stack.Screen name="history" options={{ title: 'History' }} />
			<Stack.Screen name="settings" options={{ title: 'Settings' }} />
		</Stack>
	);
}