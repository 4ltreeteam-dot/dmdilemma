import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCampaignStore } from '@/shared/stores/campaignStore';
import scenariosData from '@/content/scenarios.json';
import type { Scenario } from '@/shared/types/scenario';

const scenarios = scenariosData as unknown as Scenario[];

export default function CampaignIntro() {
  const campaign = useCampaignStore(s => s.campaign);
  if (!campaign) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.body}>캠페인이 시작되지 않았습니다.</Text>
        <Pressable style={styles.button} onPress={() => router.replace('/')}>
          <Text style={styles.buttonText}>홈으로</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const scenario = scenarios.find(s => s.id === campaign.scenarioId);
  const theme = scenario?.sessionThemes.find(t => t.sessionIndex === campaign.sessionIndex);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.campaignLabel}>캠페인</Text>
        <Text style={styles.scenarioName}>{scenario?.nameKo ?? '알 수 없음'}</Text>
        <Text style={styles.session}>세션 {campaign.sessionIndex} / {campaign.totalSessions}</Text>

        {theme && (
          <View style={styles.themeBox}>
            <Text style={styles.themeLabel}>이번 세션</Text>
            <Text style={styles.themeName}>{theme.themeKo}</Text>
            <Text style={styles.themeNarrative}>{theme.narrativeKo}</Text>
          </View>
        )}

        <Pressable style={styles.button} onPress={() => router.replace('/session')}>
          <Text style={styles.buttonText}>세션 시작</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  content: { padding: 24, paddingTop: 48 },
  campaignLabel: { color: '#666', fontSize: 11, letterSpacing: 2, textAlign: 'center' },
  scenarioName: { color: '#fff', fontSize: 24, textAlign: 'center', marginTop: 4 },
  session: { color: '#7c3', fontSize: 14, textAlign: 'center', marginTop: 8, marginBottom: 24 },
  themeBox: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 20, marginBottom: 32, borderLeftWidth: 4, borderLeftColor: '#7c3' },
  themeLabel: { color: '#7c3', fontSize: 11, letterSpacing: 1, marginBottom: 4 },
  themeName: { color: '#fff', fontSize: 18, marginBottom: 10 },
  themeNarrative: { color: '#ddd', fontSize: 14, lineHeight: 22 },
  button: { backgroundColor: '#3a3', padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16 },
  body: { color: '#ddd', fontSize: 14, textAlign: 'center', padding: 32 },
});
