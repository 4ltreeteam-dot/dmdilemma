import { View, Text, StyleSheet } from 'react-native';

type Props = {
  sceneKo: string;
  narrativeKo: string;
  situationLabel?: string;
};

export function SceneBanner({ sceneKo, narrativeKo, situationLabel }: Props) {
  return (
    <View style={styles.banner}>
      {situationLabel && <Text style={styles.label}>{situationLabel}</Text>}
      <Text style={styles.scene}>{sceneKo}</Text>
      <Text style={styles.narrative} numberOfLines={3}>{narrativeKo}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#7c3',
    marginHorizontal: 8,
    marginBottom: 4,
    borderRadius: 6,
  },
  label: { color: '#7c3', fontSize: 10, letterSpacing: 1, marginBottom: 2 },
  scene: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  narrative: { color: '#bbb', fontSize: 12, lineHeight: 17 },
});
