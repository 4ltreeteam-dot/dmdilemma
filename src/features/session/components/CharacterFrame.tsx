import { View, Text, StyleSheet } from 'react-native';
import { SatisfactionBar } from './SatisfactionBar';
import type { CharacterId } from '@/shared/types/character';

type Props = {
  characterId: CharacterId;
  name: string;
  satisfaction: number;
};

function emojiFor(value: number): string {
  if (value < 20) return '😡';
  if (value < 40) return '😒';
  if (value < 70) return '😐';
  if (value < 90) return '🙂';
  return '😄';
}

export function CharacterFrame({ name, satisfaction }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emojiFor(satisfaction)}</Text>
      <View style={styles.info}>
        <View style={styles.labelRow}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.value}>{Math.round(satisfaction)}</Text>
        </View>
        <SatisfactionBar value={satisfaction} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', width: '48%', paddingHorizontal: 6, paddingVertical: 3 },
  emoji: { fontSize: 20, marginRight: 6 },
  info: { flex: 1 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  name: { color: '#fff', fontSize: 11 },
  value: { color: '#aaa', fontSize: 10 },
});
