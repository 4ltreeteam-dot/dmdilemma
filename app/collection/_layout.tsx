import { Stack } from 'expo-router';

export default function CollectionLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#111' } }}>
      <Stack.Screen name="characters" />
      <Stack.Screen name="endings" />
    </Stack>
  );
}
