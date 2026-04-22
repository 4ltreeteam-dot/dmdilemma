import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import type { DmAction, DmScreenState } from '@/shared/types/campaign';

type Props = {
  state: DmScreenState;
  onAction: (action: DmAction) => void;
};

type SlotDef = {
  action: DmAction;
  labelKo: string;
  icon: string;
  description: string;
};

const SLOTS: SlotDef[] = [
  { action: 'retcon',      labelKo: '리트콘',       icon: '🌀', description: '방금 카드를 취소하고 다시 뽑는다' },
  { action: 'cool_ruling', labelKo: 'Cool Ruling', icon: '🎭', description: '다음 카드 +2 보정' },
  { action: 'npc_cameo',   labelKo: 'NPC 카메오',  icon: '🧙', description: '특별 NPC 카드를 삽입한다' },
];

function remaining(action: DmAction, state: DmScreenState): number {
  switch (action) {
    case 'retcon':      return state.retconUsed ? 0 : 1;
    case 'cool_ruling': return state.coolRulingRemaining;
    case 'npc_cameo':   return state.npcCameoUsed ? 0 : 1;
  }
}

export function DmScreenPanel({ state, onAction }: Props) {
  return (
    <View style={styles.row}>
      {SLOTS.map(slot => {
        const left = remaining(slot.action, state);
        const disabled = left <= 0;
        return (
          <Pressable
            key={slot.action}
            disabled={disabled}
            onPress={() => {
              Alert.alert(slot.labelKo, slot.description, [
                { text: '취소' },
                { text: '사용', onPress: () => onAction(slot.action) },
              ]);
            }}
            style={[styles.slot, disabled && styles.disabled]}
          >
            <Text style={styles.icon}>{slot.icon}</Text>
            <Text style={styles.label}>{slot.labelKo}</Text>
            <Text style={styles.count}>×{left}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 },
  slot: { alignItems: 'center', paddingVertical: 6, paddingHorizontal: 8, minWidth: 76, backgroundColor: '#1a1a1a', borderRadius: 8 },
  disabled: { opacity: 0.35 },
  icon: { fontSize: 20 },
  label: { color: '#ddd', fontSize: 10, marginTop: 2 },
  count: { color: '#7c3', fontSize: 10, marginTop: 2 },
});
