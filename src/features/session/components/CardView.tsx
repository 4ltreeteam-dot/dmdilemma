import { View, Text, StyleSheet, ScrollView } from 'react-native';
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
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {card.narrativeKo && (
          <Text style={styles.narrative}>{card.narrativeKo}</Text>
        )}
        <View style={styles.promptBlock}>
          <Text style={styles.promptLabel}>DM의 결정</Text>
          <Text style={styles.prompt}>{card.promptKo}</Text>
        </View>
      </ScrollView>
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
    padding: 14,
    flex: 1,
    borderWidth: 2,
    borderColor: '#444',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 8 },
  narrative: { color: '#ddd', fontSize: 13, lineHeight: 20, marginBottom: 12 },
  promptBlock: { marginTop: 4 },
  promptLabel: { color: '#7c3', fontSize: 9, letterSpacing: 1, marginBottom: 3 },
  prompt: { color: '#fff', fontSize: 14, lineHeight: 20 },
  choicesRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#333' },
  choiceLeft: { color: '#d77', fontSize: 12, flex: 1, marginRight: 8 },
  choiceRight: { color: '#7d7', fontSize: 12, flex: 1, textAlign: 'right', marginLeft: 8 },
});
