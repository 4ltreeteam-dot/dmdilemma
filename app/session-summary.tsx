import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '@/shared/stores/gameStore';
import charactersData from '@/content/characters.json';
import type { PlayerCharacter, CharacterId } from '@/shared/types/character';

const characters = charactersData as unknown as PlayerCharacter[];

function nameOf(id: CharacterId): string {
  return characters.find(c => c.id === id)?.nameKo ?? id;
}

export default function SessionSummary() {
  const session = useGameStore(s => s.session);
  const reset = useGameStore(s => s.reset);

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>세션 없음</Text>
        <Pressable style={styles.button} onPress={() => router.replace('/')}>
          <Text style={styles.buttonText}>홈으로</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const reason = session.endReason === 'player_left'
    ? '플레이어가 떠났습니다 (배드 엔딩)'
    : '모든 카드 소진 (정상 종료)';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>세션 종료</Text>
        <Text style={styles.reason}>{reason}</Text>
        <Text style={styles.section}>최종 만족도</Text>
        {session.party.map(id => (
          <View key={id} style={styles.row}>
            <Text style={styles.name}>{nameOf(id)}</Text>
            <Text style={styles.value}>{session.satisfaction[id]}</Text>
          </View>
        ))}
        <Text style={styles.section}>플레이 카드: {session.cardsPlayed.length}장</Text>
        <Pressable
          style={styles.button}
          onPress={() => {
            reset();
            router.replace('/');
          }}
        >
          <Text style={styles.buttonText}>홈으로</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  content: { padding: 24 },
  title: { color: '#fff', fontSize: 24, marginBottom: 12, textAlign: 'center' },
  reason: { color: '#aaa', fontSize: 14, marginBottom: 24, textAlign: 'center' },
  section: { color: '#7c3', fontSize: 16, marginTop: 16, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  name: { color: '#ddd', fontSize: 14 },
  value: { color: '#ddd', fontSize: 14 },
  button: { backgroundColor: '#3a3', padding: 16, borderRadius: 8, marginTop: 32, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16 },
});
