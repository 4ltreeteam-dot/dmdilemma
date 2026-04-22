import { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '@/shared/stores/gameStore';
import { CharacterFrame } from '@/features/session/components/CharacterFrame';
import { CardView } from '@/features/session/components/CardView';
import { SwipeableCard } from '@/features/session/components/SwipeableCard';
import charactersData from '@/content/characters.json';
import type { PlayerCharacter, CharacterId } from '@/shared/types/character';

const characters = charactersData as unknown as PlayerCharacter[];

function nameOf(id: CharacterId): string {
  return characters.find(c => c.id === id)?.nameKo ?? id;
}

export default function SessionScreen() {
  const session = useGameStore(s => s.session);
  const startSession = useGameStore(s => s.startSession);
  const applyChoice = useGameStore(s => s.applyChoice);

  useEffect(() => {
    if (!session) startSession();
  }, [session, startSession]);

  useEffect(() => {
    if (session?.isEnded) {
      const t = setTimeout(() => router.replace('/session-summary'), 400);
      return () => clearTimeout(t);
    }
  }, [session?.isEnded]);

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.info}>Loading...</Text>
      </SafeAreaView>
    );
  }

  const [p1, p2, p3, p4] = session.party;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Session 1 · {session.cardsRemaining} cards left</Text>
      </View>
      <View style={styles.partyGrid}>
        <View style={styles.partyRow}>
          <CharacterFrame characterId={p1!} name={nameOf(p1!)} satisfaction={session.satisfaction[p1!]} />
          <CharacterFrame characterId={p2!} name={nameOf(p2!)} satisfaction={session.satisfaction[p2!]} />
        </View>
        <View style={styles.partyRow}>
          <CharacterFrame characterId={p3!} name={nameOf(p3!)} satisfaction={session.satisfaction[p3!]} />
          <CharacterFrame characterId={p4!} name={nameOf(p4!)} satisfaction={session.satisfaction[p4!]} />
        </View>
      </View>
      <View style={styles.cardArea}>
        {session.currentCard && !session.isEnded ? (
          <SwipeableCard onSwipe={dir => applyChoice(dir)}>
            <CardView card={session.currentCard} />
          </SwipeableCard>
        ) : (
          <Text style={styles.info}>Session ending...</Text>
        )}
      </View>
      <Pressable style={styles.exit} onPress={() => router.replace('/')}>
        <Text style={styles.exitText}>중단하고 홈으로</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  header: { paddingVertical: 8, alignItems: 'center' },
  headerText: { color: '#888', fontSize: 12 },
  partyGrid: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#222' },
  partyRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 4 },
  cardArea: { flex: 1, justifyContent: 'center' },
  info: { color: '#fff', textAlign: 'center' },
  exit: { padding: 12, alignItems: 'center' },
  exitText: { color: '#666', fontSize: 12 },
});
