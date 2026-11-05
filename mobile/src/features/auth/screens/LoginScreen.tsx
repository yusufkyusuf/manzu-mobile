import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { LogIn } from 'lucide-react-native';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Image, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { errorMessage } from '@/api/errors';
import { Button, Card, CardContent, CardHeader, Input, PinInput, Screen, Text } from '@/components/ui';
import { useIsOnline } from '@/lib/network';
import { colors, gradients } from '@/theme';

import { useLogin } from '../hooks';
import { loginSchema, type LoginFormValues } from '../schemas';
import { useSession } from '../store';

// Mirrors manzu-f app/pharmacy/(auth)/login/page.jsx.
export function LoginScreen() {
  const router = useRouter();
  const online = useIsOnline();
  const loginMutation = useLogin();
  const consumeAuthMessage = useSession((s) => s.consumeAuthMessage);

  const { control, handleSubmit, formState } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', pin: '' },
  });

  useEffect(() => {
    const message = consumeAuthMessage();
    if (message) Toast.show({ type: 'error', text1: message });
  }, [consumeAuthMessage]);

  const onSubmit = handleSubmit((values) => {
    loginMutation.mutate(values, {
      onSuccess: () => Toast.show({ type: 'success', text1: 'Login successful!' }),
      onError: (err) => Toast.show({ type: 'error', text1: errorMessage(err) || 'Login failed. Please try again.' }),
    });
  });

  return (
    <Screen background={gradients.loginBackground} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.container}>
          <View style={styles.logoRow}>
            <Image source={require('../../../../assets/logo.png')} style={styles.logo} resizeMode="contain" accessibilityLabel="Manzu Logo" />
          </View>
          <Text size="2xl" weight="bold" color={colors.brandBlue} align="center" style={styles.title}>
            Pharmacy Login
          </Text>

          <Card elevated>
            <CardHeader tinted>
              <LogIn size={18} color={colors.primary} />
              <Text size="lg" weight="bold" color={colors.brandBlue}>
                Sign In
              </Text>
            </CardHeader>
            <CardContent style={styles.form}>
              <Controller
                control={control}
                name="email"
                render={({ field: { value, onChange, onBlur } }) => (
                  <Input
                    label="Email"
                    required
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Enter your email address here"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    textContentType="emailAddress"
                    returnKeyType="next"
                    error={formState.errors.email?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="pin"
                render={({ field: { value, onChange } }) => (
                  <PinInput label="6-Digit PIN" value={value} onChange={onChange} onSubmit={onSubmit} error={formState.errors.pin?.message} />
                )}
              />
              <Button
                title="Sign In"
                loadingTitle="Signing in..."
                variant="gradient"
                size="lg"
                fullWidth
                loading={loginMutation.isPending}
                disabled={!online}
                onPress={onSubmit}
              />
              {!online ? (
                <Text size="xs" color={colors.orange600} align="center">
                  {"You're offline. Connect to the internet to sign in."}
                </Text>
              ) : null}
              <Button title="Don't have an account? Register" variant="ghost" fullWidth onPress={() => router.push('/register')} />
            </CardContent>
          </Card>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', width: '100%', maxWidth: 448, alignSelf: 'center', paddingVertical: 32 },
  logoRow: { alignItems: 'center', marginBottom: 24 },
  logo: { width: 32, height: 36 },
  title: { marginBottom: 24 },
  form: { gap: 24 },
});
