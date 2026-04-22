import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfileStore } from '@/shared/stores/profileStore';
import endingsData from '@/content/endings.json';
import type { Ending } from '@/shared/types/ending';

const endings = endingsData as unknown as Ending[];

export default function Endings() {
  const profile = useProfileStore(s => s.profile);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>엔딩 도감 ({profile.collectedEndings.length}/{endings.length})</Text>
      <ScrollView contentContainerStyle={styles.list}>
        {endings.map(e => {
          const got = profile.collectedEndings.includes(e.id);
          return (
            <View key={e.id} style={[styles.row, !got && styles.locked]}>
              <Text style={[styles.kind, { color: e.kind === 'legendary' ? '#ffca28' : e.kind === 'good' ? '#7c3' : '#c33' }]}>
                {e.kind}
              </Text>
              <Text style={styles.name}>{got ? e.nameKo : '???'}</Text>
              {got && <Text style={styles.desc}>{e.descriptionKo}</Text>}
            </View>
          );
        })}
      </ScrollView>
      <Pressable style={styles.button} onPress={() => router.replace('/')}>
        <Text style={styles.buttonText}>홈으로</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', padding: 16 },
  title: { color: '#fff', fontSize: 20, textAlign: 'center', marginBottom: 16 },
  list: { paddingVertical: 8 },
  row: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#222' },
  locked: { opacity: 0.35 },
  kind: { fontSize: 10, letterSpacing: 1 },
  name: { color: '#fff', fontSize: 16, marginTop: 2 },
  desc: { color: '#aaa', fontSize: 12, marginTop: 4 },
  button: { backgroundColor: '#3a3', padding: 16, borderRadius: 8, marginTop: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16 },
});
