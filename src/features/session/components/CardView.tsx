import { View, Text, StyleSheet } from 'react-native';
import type { Card } from '@/shared/types/card';

type Props = {
  card: Card;
};

export function CardView({ card }: Props) {
  const leftChoice = card.choices.find(c => c.direction === 'left');
  const rightChoice = card.choices.find(c => c.direction === 'right');

  return (
    <View style={styles.card}>
      <Text style={styles.prompt}>{card.promptKo}</Text>
      <View style={styles.choicesRow}>
        <Text style={styles.choiceLeft}>◄ {leftChoice?.labelKo ?? ''}</Text>
        <Text style={styles.choiceRight}>{rightChoice?.labelKo ?? ''} ►</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 24,
    minHeight: 280,
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#444',
  },
  prompt: { color: '#fff', fontSize: 16, lineHeight: 22 },
  choicesRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
  choiceLeft: { color: '#d77', fontSize: 13 },
  choiceRight: { color: '#7d7', fontSize: 13 },
});
