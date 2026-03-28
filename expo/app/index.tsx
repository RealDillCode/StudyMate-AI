import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/lib/state/authStore';
import { Colors } from '@/constants/colors';

export default function Index() {
	const { hydrated, accessToken, refreshToken, orgId } = useAuthStore();

	if (!hydrated) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.gray[50] }}>
				<ActivityIndicator size="large" color={Colors.primary} />
			</View>
		);
	}

	if (!accessToken || !refreshToken) {
		return <Redirect href="/(auth)/sign-in" />;
	}

	if (!orgId) {
		return <Redirect href="/(auth)/join-org" />;
	}

	return <Redirect href="/(app)/home" />;
}