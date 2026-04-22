import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfileStore } from '@/shared/stores/profileStore';
import charactersData from '@/content/characters.json';
import type { PlayerCharacter } from '@/shared/types/character';
import { MILESTONE_THRESHOLDS } from '@/shared/types/progress';

const characters = charactersData as unknown as PlayerCharacter[];

export default function Characters() {
  const profile = useProfileStore(s => s.profile);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>캐릭터 도감</Text>
      <ScrollView contentContainerStyle={styles.list}>
        {characters.map(c => {
          const unlocked = profile.unlockedCharacters.includes(c.id);
          const progress = profile.characterProgress[c.id];
          const xp = progress?.xp ?? 0;
          const nextMilestone = Object.entries(MILESTONE_THRESHOLDS).find(([, v]) => xp < v);
          return (
            <View key={c.id} style={[styles.row, !unlocked && styles.locked]}>
              <Text style={styles.name}>{unlocked ? c.nameKo : '???'}</Text>
              <Text style={styles.info}>
                {unlocked ? `XP ${xp}${nextMilestone ? ` / ${nextMilestone[1]}` : ' · 최대'}` : '미해금'}
              </Text>
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
  title: { color: '#fff', fontSize: 22, textAlign: 'center', marginBottom: 16 },
  list: { paddingVertical: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#222' },
  locked: { opacity: 0.35 },
  name: { color: '#fff', fontSize: 16 },
  info: { color: '#888', fontSize: 13 },
  button: { backgroundColor: '#3a3', padding: 16, borderRadius: 8, marginTop: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16 },
});
