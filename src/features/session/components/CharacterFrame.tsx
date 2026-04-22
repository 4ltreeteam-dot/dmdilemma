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
      <Text style={styles.name}>{name}</Text>
      <SatisfactionBar value={satisfaction} />
      <Text style={styles.value}>{Math.round(satisfaction)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: 120, alignItems: 'center', padding: 8 },
  emoji: { fontSize: 36 },
  name: { color: '#fff', fontSize: 14, marginVertical: 4 },
  value: { color: '#aaa', fontSize: 11, marginTop: 2 },
});
