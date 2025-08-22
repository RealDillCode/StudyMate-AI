import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { Colors } from "@/constants/colors";
import { AppStoreProvider } from "@/hooks/useAppStore";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { UserProfileProvider } from "@/hooks/useUserProfile";
import { trpc, trpcClient } from "@/lib/trpc";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.gray[50] }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <Stack screenOptions={{ headerBackTitle: "Back" }}>
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/employer-signup" options={{ headerShown: false }} />
        <Stack.Screen name="auth/employee-join" options={{ headerShown: false }} />
      </Stack>
    );
  }

  // Role-based navigation
  if (user?.role === 'employer') {
    return (
      <Stack screenOptions={{ headerBackTitle: "Back" }}>
        <Stack.Screen name="(employer-tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="employer-settings" options={{ headerShown: false }} />
        <Stack.Screen name="employer-dashboard" options={{ headerShown: false }} />
      </Stack>
    );
  }

  // Employee navigation
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(employee-tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
    </Stack>
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
          <AuthProvider>
            <UserProfileProvider>
              <AppStoreProvider>
                <RootLayoutNav />
              </AppStoreProvider>
            </UserProfileProvider>
          </AuthProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </trpc.Provider>
  );
}