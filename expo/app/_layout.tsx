import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ErrorBoundary } from 'react-error-boundary';

import { Colors } from "@/constants/colors";
import { AppStoreProvider } from "@/hooks/useAppStore";
import { AuthProvider } from "@/hooks/useAuth";
import { UserProfileProvider } from "@/hooks/useUserProfile";
import { trpc, trpcClient } from "@/lib/trpc";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
	return (
		<Stack screenOptions={{ headerShown: false }} />
	);
}

function Fallback() {
	return (
		<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
			<Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>Something went wrong</Text>
			<Text style={{ textAlign: 'center', color: Colors.gray[600] }}>Please restart the app. If the problem persists, contact support.</Text>
		</View>
	);
}

export default function RootLayout() {
	useEffect(() => {
		SplashScreen.hideAsync();
	}, []);

	return (
		<trpc.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>
				<GestureHandlerRootView style={{ flex: 1 }}>
					<ErrorBoundary FallbackComponent={Fallback}>
						<AuthProvider>
							<UserProfileProvider>
								<AppStoreProvider>
									<RootLayoutNav />
								</AppStoreProvider>
							</UserProfileProvider>
						</AuthProvider>
					</ErrorBoundary>
				</GestureHandlerRootView>
			</QueryClientProvider>
		</trpc.Provider>
	);
}