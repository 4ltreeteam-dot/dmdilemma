import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCampaignStore } from '@/shared/stores/campaignStore';

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.title}>캠페인 #{campaign.id.slice(-4)}</Text>
        <Text style={styles.session}>세션 {campaign.sessionIndex} / {campaign.totalSessions}</Text>
        <Text style={styles.body}>
          테이블에 네 명의 플레이어가 앉았습니다.{'\n'}
          오늘의 세션을 시작합시다.
        </Text>
        <Pressable style={styles.button} onPress={() => router.replace('/session')}>
          <Text style={styles.buttonText}>세션 시작</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', padding: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { color: '#fff', fontSize: 22, marginBottom: 4 },
  session: { color: '#7c3', fontSize: 14, marginBottom: 24 },
  body: { color: '#ddd', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  button: { backgroundColor: '#3a3', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 8 },
  buttonText: { color: '#fff', fontSize: 16 },
});
