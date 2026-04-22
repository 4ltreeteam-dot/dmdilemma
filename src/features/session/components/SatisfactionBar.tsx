import { View, StyleSheet } from 'react-native';

type Props = {
  value: number;
};

function colorFor(value: number): string {
  if (value < 20) return '#c33';
  if (value < 40) return '#e80';
  if (value < 70) return '#db0';
  if (value < 90) return '#7c3';
  return '#3c6';
}

export function SatisfactionBar({ value }: Props) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: colorFor(clamped) }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 8, backgroundColor: '#333', borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%' },
});
