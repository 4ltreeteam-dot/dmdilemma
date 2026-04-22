import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import scenariosData from '@/content/scenarios.json';
import type { Scenario } from '@/shared/types/scenario';

const scenarios = scenariosData as unknown as Scenario[];

export default function ScenarioSelect() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>시나리오 선택</Text>
      <Text style={styles.subtitle}>10세션 동안 풀어갈 이야기를 고르세요</Text>
      <ScrollView contentContainerStyle={styles.list}>
        {scenarios.map(s => (
          <Pressable
            key={s.id}
            style={styles.card}
            onPress={() => router.push({ pathname: '/campaign/new', params: { scenarioId: s.id } } as any)}
          >
            <Text style={styles.name}>{s.nameKo}</Text>
            <Text style={styles.summary}>{s.summaryKo}</Text>
            <Text style={styles.sessions}>10 세션</Text>
          </Pressable>
        ))}
      </ScrollView>
      <Pressable style={styles.back} onPress={() => router.replace('/')}>
        <Text style={styles.backText}>취소</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', padding: 16 },
  title: { color: '#fff', fontSize: 22, textAlign: 'center', marginBottom: 4 },
  subtitle: { color: '#888', fontSize: 12, textAlign: 'center', marginBottom: 20 },
  list: { paddingVertical: 8 },
  card: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginVertical: 8, borderWidth: 2, borderColor: '#2a2a2a' },
  name: { color: '#fff', fontSize: 18, marginBottom: 8 },
  summary: { color: '#ccc', fontSize: 13, lineHeight: 20 },
  sessions: { color: '#7c3', fontSize: 11, marginTop: 8 },
  back: { padding: 12, alignItems: 'center' },
  backText: { color: '#666', fontSize: 14 },
});
