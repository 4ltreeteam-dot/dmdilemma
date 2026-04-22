import { Stack } from 'expo-router';

export default function CampaignLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#111' } }}>
      <Stack.Screen name="new" />
      <Stack.Screen name="intro" />
      <Stack.Screen name="ending" />
    </Stack>
  );
}
