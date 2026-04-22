import { View, Text, StyleSheet } from 'react-native';

type Props = {
  sceneKo: string;
  narrativeKo: string;
  situationLabel?: string;
};

export function SceneBanner({ sceneKo, narrativeKo, situationLabel }: Props) {
  return (
    <View style={styles.banner}>
      <View style={styles.row}>
        {situationLabel && <Text style={styles.label}>{situationLabel}</Text>}
        <Text style={styles.scene} numberOfLines={1}>{sceneKo}</Text>
      </View>
      <Text style={styles.narrative} numberOfLines={2}>{narrativeKo}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#7c3',
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 4,
  },
  row: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 2 },
  label: { color: '#7c3', fontSize: 9, letterSpacing: 1, marginRight: 8 },
  scene: { color: '#fff', fontSize: 12, fontWeight: '600', flex: 1 },
  narrative: { color: '#aaa', fontSize: 11, lineHeight: 15 },
});
