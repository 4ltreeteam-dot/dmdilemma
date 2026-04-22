import { useEffect } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming } from 'react-native-reanimated';
import type { DiceResolution } from '@/features/session/engine/diceResolver';

type Props = {
  visible: boolean;
  resolution: DiceResolution | null;
  sides: number;
  onDone: () => void;
};

export function DiceRollOverlay({ visible, resolution, sides, onDone }: Props) {
  const scale = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (!visible) return;
    scale.value = 0;
    rotate.value = 0;
    scale.value = withSequence(
      withTiming(1.2, { duration: 300 }),
      withTiming(1, { duration: 150 }),
    );
    rotate.value = withTiming(720, { duration: 450 });
    const t = setTimeout(onDone, 1500);
    return () => clearTimeout(t);
  }, [visible]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
  }));

  if (!resolution) return null;

  const color = resolution.isCritical ? '#7c3' : resolution.isCritFail ? '#c33' : '#fff';

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.backdrop}>
        <Animated.View style={[styles.die, style, { borderColor: color }]}>
          <Text style={[styles.result, { color }]}>{resolution.roll}</Text>
        </Animated.View>
        <Text style={styles.label}>
          {resolution.isCritical ? '자연의 20!' : resolution.isCritFail ? '자연의 1!' : `d${sides}`}
        </Text>
        {resolution.flavorKo && <Text style={styles.flavor}>{resolution.flavorKo}</Text>}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center' },
  die: { width: 120, height: 120, borderRadius: 16, borderWidth: 3, alignItems: 'center', justifyContent: 'center', backgroundColor: '#111' },
  result: { fontSize: 52, fontWeight: '700' },
  label: { color: '#aaa', fontSize: 14, marginTop: 16 },
  flavor: { color: '#ddd', fontSize: 12, marginTop: 8, paddingHorizontal: 24, textAlign: 'center' },
});
