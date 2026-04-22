import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '@/shared/stores/gameStore';
import { useCampaignStore } from '@/shared/stores/campaignStore';
import charactersData from '@/content/characters.json';
import type { PlayerCharacter, CharacterId } from '@/shared/types/character';

const characters = charactersData as unknown as PlayerCharacter[];
const nameOf = (id: CharacterId) => characters.find(c => c.id === id)?.nameKo ?? id;

export default function SessionSummary() {
  const session = useGameStore(s => s.session);
  const reset = useGameStore(s => s.reset);
  const campaign = useCampaignStore(s => s.campaign);
  const advanceToNextSession = useCampaignStore(s => s.advanceToNextSession);

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
    ? '플레이어가 떠났습니다'
    : '모든 카드 소진';

  const lastResult = campaign?.sessionHistory[campaign.sessionHistory.length - 1];
  const hasNextSession = campaign && !campaign.isEnded;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>세션 종료</Text>
        <Text style={styles.reason}>{reason}</Text>
        {lastResult && (
          <Text style={styles.xp}>+{lastResult.sessionXp} XP · 카드 {lastResult.cardsPlayed}장 · 주사위 {lastResult.diceRolls}회</Text>
        )}
        <Text style={styles.section}>최종 만족도</Text>
        {session.party.map(id => (
          <View key={id} style={styles.row}>
            <Text style={styles.name}>{nameOf(id)}</Text>
            <Text style={styles.value}>{session.satisfaction[id]}</Text>
          </View>
        ))}
        {hasNextSession ? (
          <Pressable
            style={styles.button}
            onPress={() => {
              advanceToNextSession();
              reset();
              router.replace('/campaign/intro');
            }}
          >
            <Text style={styles.buttonText}>다음 세션 ({campaign!.sessionIndex + 1}/{campaign!.totalSessions})</Text>
          </Pressable>
        ) : (
          <Pressable
            style={styles.button}
            onPress={() => {
              reset();
              router.replace((campaign?.isEnded ? '/campaign/ending' : '/') as any);
            }}
          >
            <Text style={styles.buttonText}>{campaign?.isEnded ? '엔딩 보기' : '홈으로'}</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  content: { padding: 24 },
  title: { color: '#fff', fontSize: 24, marginBottom: 8, textAlign: 'center' },
  reason: { color: '#aaa', fontSize: 14, marginBottom: 8, textAlign: 'center' },
  xp: { color: '#7c3', fontSize: 14, marginBottom: 24, textAlign: 'center' },
  section: { color: '#7c3', fontSize: 16, marginTop: 16, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  name: { color: '#ddd', fontSize: 14 },
  value: { color: '#ddd', fontSize: 14 },
  button: { backgroundColor: '#3a3', padding: 16, borderRadius: 8, marginTop: 32, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16 },
});
