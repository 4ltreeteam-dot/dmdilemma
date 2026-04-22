import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#111' } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="session" />
      <Stack.Screen name="session-summary" />
      <Stack.Screen name="campaign" />
      <Stack.Screen name="collection" />
    </Stack>
  );
}
