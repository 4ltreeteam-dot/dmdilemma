import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCampaignStore } from '@/shared/stores/campaignStore';
import { useProfileStore } from '@/shared/stores/profileStore';

export default function Home() {
  const campaign = useCampaignStore(s => s.campaign);
  const profile = useProfileStore(s => s.profile);
  const hasActive = campaign && !campaign.isEnded;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>DM Dilemma</Text>
        <Text style={styles.subtitle}>Plan 2 · Full Game Loop</Text>
        {hasActive && (
          <Pressable style={styles.button} onPress={() => router.push('/session')}>
            <Text style={styles.buttonText}>이어하기 (세션 {campaign!.sessionIndex})</Text>
          </Pressable>
        )}
        <Pressable style={styles.button} onPress={() => router.push('/campaign/new')}>
          <Text style={styles.buttonText}>새 캠페인</Text>
        </Pressable>
        <Pressable style={styles.secondary} onPress={() => router.push('/collection/characters')}>
          <Text style={styles.secondaryText}>캐릭터 도감</Text>
        </Pressable>
        <Pressable style={styles.secondary} onPress={() => router.push('/collection/endings')}>
          <Text style={styles.secondaryText}>엔딩 도감</Text>
        </Pressable>
        <Text style={styles.stats}>레전드: {profile.legendPoints} · 엔딩: {profile.collectedEndings.length}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { color: '#fff', fontSize: 32, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#888', fontSize: 14, marginBottom: 32 },
  button: { backgroundColor: '#3a3', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 8, marginVertical: 6, width: 240, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16 },
  secondary: { paddingVertical: 12, marginVertical: 4 },
  secondaryText: { color: '#aaa', fontSize: 14 },
  stats: { color: '#666', fontSize: 12, marginTop: 24 },
});
