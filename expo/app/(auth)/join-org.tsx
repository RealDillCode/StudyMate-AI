import React from 'react';
import { View, Text, TextInput, StyleSheet, useColorScheme, KeyboardAvoidingView, Platform } from 'react-native';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { Colors } from '@/constants/colors';
import { Button } from '@/components/Button';
import { useAuthStore } from '@/lib/state/authStore';

const schema = z.object({ code: z.string().min(3) });

type FormValues = z.infer<typeof schema>;

export default function JoinOrgScreen() {
	const scheme = useColorScheme();
	const isDark = scheme === 'dark';
	const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { code: '' } });
	const redeemCode = useAuthStore(s => s.redeemCode);

	const onSubmit = async (data: FormValues) => {
		await redeemCode(data.code);
	};

	return (
		<KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={[styles.container, { backgroundColor: isDark ? Colors.gray[900] : Colors.gray[50] }]}
			accessibilityLabel="Join organization"
		>
			<View style={styles.card}>
				<Text style={[styles.title, { color: isDark ? Colors.white : Colors.black }]} accessibilityRole="header">Join your company</Text>

				<Text style={[styles.label, { color: isDark ? Colors.gray[300] : Colors.gray[600] }]}>Company code</Text>
				<Controller control={control} name="code" render={({ field: { onChange, onBlur, value } }) => (
					<TextInput
						accessible
						accessibilityLabel="Company code"
						autoCapitalize="characters"
						style={[styles.input, { backgroundColor: isDark ? Colors.gray[800] : Colors.white, color: isDark ? Colors.white : Colors.black, borderColor: errors.code ? Colors.danger : (isDark ? Colors.gray[700] : Colors.gray[300]) }]}
						onBlur={onBlur}
						onChangeText={onChange}
						value={value}
					/>
				)} />
				{errors.code && <Text style={styles.error}>{errors.code.message}</Text>}

				<Button title="Continue" onPress={handleSubmit(onSubmit)} loading={isSubmitting} fullWidth style={{ marginTop: 16 }} />
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