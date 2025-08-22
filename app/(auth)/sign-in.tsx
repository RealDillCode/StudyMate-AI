import React from 'react';
import { View, Text, TextInput, StyleSheet, useColorScheme, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { Colors } from '@/constants/colors';
import { Button } from '@/components/Button';
import { useAuthStore } from '@/lib/state/authStore';

const schema = z.object({
	email: z.string().min(5).email(),
	password: z.string().min(8, 'Password must be at least 8 characters'),
});

type FormValues = z.infer<typeof schema>;

export default function SignInScreen() {
	const scheme = useColorScheme();
	const isDark = scheme === 'dark';
	const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: { email: '', password: '' },
	});
	const signIn = useAuthStore(s => s.signIn);

	const onSubmit = async (data: FormValues) => {
		await signIn(data.email, data.password);
	};

	return (
		<KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={[styles.container, { backgroundColor: isDark ? Colors.gray[900] : Colors.gray[50] }]}>
			<View style={styles.card}>
				<Text style={[styles.title, { color: isDark ? Colors.white : Colors.black }]} accessibilityRole="header">Sign in</Text>

				<Text style={[styles.label, { color: isDark ? Colors.gray[300] : Colors.gray[600] }]}>Email</Text>
				<Controller control={control} name="email" render={({ field: { onChange, onBlur, value } }) => (
					<TextInput
						accessible
						accessibilityLabel="Email"
						autoCapitalize="none"
						keyboardType="email-address"
						style={[styles.input, { backgroundColor: isDark ? Colors.gray[800] : Colors.white, color: isDark ? Colors.white : Colors.black, borderColor: errors.email ? Colors.danger : (isDark ? Colors.gray[700] : Colors.gray[300]) }]}
						onBlur={onBlur}
						onChangeText={onChange}
						value={value}
					/>
				)} />
				{errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

				<Text style={[styles.label, { color: isDark ? Colors.gray[300] : Colors.gray[600] }]}>Password</Text>
				<Controller control={control} name="password" render={({ field: { onChange, onBlur, value } }) => (
					<TextInput
						accessible
						accessibilityLabel="Password"
						secureTextEntry
						style={[styles.input, { backgroundColor: isDark ? Colors.gray[800] : Colors.white, color: isDark ? Colors.white : Colors.black, borderColor: errors.password ? Colors.danger : (isDark ? Colors.gray[700] : Colors.gray[300]) }]}
						onBlur={onBlur}
						onChangeText={onChange}
						value={value}
					/>
				)} />
				{errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

				<Button title="Sign in" onPress={handleSubmit(onSubmit)} loading={isSubmitting} fullWidth style={{ marginTop: 16 }} />
			</View>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, justifyContent: 'center', padding: 16 },
	card: { borderRadius: 12, padding: 16, backgroundColor: 'transparent' },
	title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
	label: { fontSize: 14, marginBottom: 6 },
	input: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 8 },
	error: { color: Colors.danger, marginBottom: 8 },
});