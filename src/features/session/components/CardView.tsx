import { View, Text, StyleSheet } from 'react-native';
import type { Card } from '@/shared/types/card';
import { isDiceChoice } from '@/shared/types/card';

type Props = {
  card: Card;
};

export function CardView({ card }: Props) {
  const leftChoice = card.choices.find(c => c.direction === 'left');
  const rightChoice = card.choices.find(c => c.direction === 'right');

  const leftLabel = leftChoice ? (isDiceChoice(leftChoice) ? `🎲 ${leftChoice.labelKo}` : leftChoice.labelKo) : '';
  const rightLabel = rightChoice ? (isDiceChoice(rightChoice) ? `🎲 ${rightChoice.labelKo}` : rightChoice.labelKo) : '';

  return (
    <View style={styles.card}>
      {card.narrativeKo && (
        <Text style={styles.narrative}>{card.narrativeKo}</Text>
      )}
      <View style={styles.promptBlock}>
        <Text style={styles.promptLabel}>DM의 결정</Text>
        <Text style={styles.prompt}>{card.promptKo}</Text>
      </View>
      <View style={styles.choicesRow}>
        <Text style={styles.choiceLeft} numberOfLines={2}>◄ {leftLabel}</Text>
        <Text style={styles.choiceRight} numberOfLines={2}>{rightLabel} ►</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 20,
    minHeight: 300,
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#444',
  },
  narrative: { color: '#ddd', fontSize: 14, lineHeight: 22, marginBottom: 16 },
  promptBlock: { marginTop: 8 },
  promptLabel: { color: '#7c3', fontSize: 10, letterSpacing: 1, marginBottom: 4 },
  prompt: { color: '#fff', fontSize: 15, lineHeight: 21 },
  choicesRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  choiceLeft: { color: '#d77', fontSize: 12, flex: 1, marginRight: 8 },
  choiceRight: { color: '#7d7', fontSize: 12, flex: 1, textAlign: 'right', marginLeft: 8 },
});
