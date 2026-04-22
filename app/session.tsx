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

  const [top1, top2, bot1, bot2] = session.party;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Session 1 · {session.cardsRemaining} cards left</Text>
      </View>
      <View style={styles.row}>
        <CharacterFrame characterId={top1!} name={nameOf(top1!)} satisfaction={session.satisfaction[top1!]} />
        <CharacterFrame characterId={top2!} name={nameOf(top2!)} satisfaction={session.satisfaction[top2!]} />
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
      <View style={styles.row}>
        <CharacterFrame characterId={bot1!} name={nameOf(bot1!)} satisfaction={session.satisfaction[bot1!]} />
        <CharacterFrame characterId={bot2!} name={nameOf(bot2!)} satisfaction={session.satisfaction[bot2!]} />
      </View>
      <Pressable style={styles.exit} onPress={() => router.replace('/')}>
        <Text style={styles.exitText}>중단하고 홈으로</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  header: { padding: 12, alignItems: 'center' },
  headerText: { color: '#888', fontSize: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-around' },
  cardArea: { flex: 1, justifyContent: 'center' },
  info: { color: '#fff', textAlign: 'center' },
  exit: { padding: 12, alignItems: 'center' },
  exitText: { color: '#666', fontSize: 12 },
});
