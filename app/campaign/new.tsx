import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfileStore } from '@/shared/stores/profileStore';
import { useCampaignStore } from '@/shared/stores/campaignStore';
import charactersData from '@/content/characters.json';
import type { CharacterId, PlayerCharacter } from '@/shared/types/character';

const all = charactersData as unknown as PlayerCharacter[];

export default function PartyFormation() {
  const unlocked = useProfileStore(s => s.profile.unlockedCharacters);
  const startCampaign = useCampaignStore(s => s.startCampaign);
  const [selected, setSelected] = useState<CharacterId[]>([]);

  const toggle = (id: CharacterId) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 4 ? [...prev, id] : prev,
    );
  };

  const ready = selected.length === 4;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>파티 편성</Text>
      <Text style={styles.subtitle}>4명 선택 ({selected.length}/4)</Text>
      <ScrollView contentContainerStyle={styles.grid}>
        {all.filter(c => unlocked.includes(c.id)).map(c => {
          const picked = selected.includes(c.id);
          return (
            <Pressable key={c.id} style={[styles.slot, picked && styles.picked]} onPress={() => toggle(c.id)}>
              <Text style={styles.name}>{c.nameKo}</Text>
              <Text style={styles.type}>{c.archetype}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <Pressable
        style={[styles.start, !ready && styles.disabled]}
        disabled={!ready}
        onPress={() => {
          startCampaign(selected);
          router.replace('/campaign/intro');
        }}
      >
        <Text style={styles.startText}>캠페인 시작</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', padding: 16 },
  title: { color: '#fff', fontSize: 22, marginBottom: 4, textAlign: 'center' },
  subtitle: { color: '#888', fontSize: 13, marginBottom: 16, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' },
  slot: { width: 140, height: 100, margin: 8, backgroundColor: '#1a1a1a', borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#2a2a2a' },
  picked: { borderColor: '#3c6', backgroundColor: '#222' },
  name: { color: '#fff', fontSize: 16 },
  type: { color: '#888', fontSize: 11, marginTop: 4 },
  start: { backgroundColor: '#3a3', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  disabled: { opacity: 0.4 },
  startText: { color: '#fff', fontSize: 16 },
});
