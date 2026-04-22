import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCampaignStore } from '@/shared/stores/campaignStore';
import { useProfileStore } from '@/shared/stores/profileStore';
import endingsData from '@/content/endings.json';
import type { Ending } from '@/shared/types/ending';

const endings = endingsData as unknown as Ending[];

export default function EndingScreen() {
  const campaign = useCampaignStore(s => s.campaign);
  const resetCampaign = useCampaignStore(s => s.reset);
  const profile = useProfileStore(s => s.profile);

  const ending = campaign?.endingId ? endings.find(e => e.id === campaign.endingId) : null;

  if (!campaign || !ending) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>엔딩 데이터 없음</Text>
        <Pressable style={styles.button} onPress={() => router.replace('/')}>
          <Text style={styles.buttonText}>홈으로</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const kindColor = ending.kind === 'legendary' ? '#ffca28' : ending.kind === 'good' ? '#7c3' : '#c33';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.kind, { color: kindColor }]}>{ending.kind.toUpperCase()}</Text>
        <Text style={styles.name}>{ending.nameKo}</Text>
        <Text style={styles.description}>{ending.descriptionKo}</Text>
        <Text style={styles.reward}>+{ending.legendPoints} 레전드 포인트</Text>
        <Text style={styles.stats}>총 레전드: {profile.legendPoints}</Text>
        <Text style={styles.stats}>엔딩 수집: {profile.collectedEndings.length}</Text>
        <Text style={styles.stats}>해금 캐릭터: {profile.unlockedCharacters.join(', ')}</Text>
        <Pressable
          style={styles.button}
          onPress={() => {
            resetCampaign();
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
  kind: { fontSize: 12, letterSpacing: 2, textAlign: 'center', marginTop: 24 },
  name: { color: '#fff', fontSize: 28, textAlign: 'center', marginTop: 8, marginBottom: 24 },
  description: { color: '#ddd', fontSize: 15, lineHeight: 24, textAlign: 'center', marginBottom: 32 },
  reward: { color: '#ffca28', fontSize: 18, textAlign: 'center', marginBottom: 24 },
  stats: { color: '#888', fontSize: 13, textAlign: 'center', marginVertical: 2 },
  title: { color: '#fff', fontSize: 20, textAlign: 'center', marginTop: 64 },
  button: { backgroundColor: '#3a3', padding: 16, borderRadius: 8, marginTop: 32, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16 },
});
