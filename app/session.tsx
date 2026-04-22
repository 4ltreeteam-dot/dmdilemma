import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '@/shared/stores/gameStore';
import { useCampaignStore } from '@/shared/stores/campaignStore';
import { CharacterFrame } from '@/features/session/components/CharacterFrame';
import { CardView } from '@/features/session/components/CardView';
import { SwipeableCard } from '@/features/session/components/SwipeableCard';
import { DmScreenPanel } from '@/features/session/components/DmScreenPanel';
import { DiceRollOverlay } from '@/features/session/components/DiceRollOverlay';
import { SceneBanner } from '@/features/session/components/SceneBanner';
import { isDiceChoice } from '@/shared/types/card';
import { resolveDiceChoice, type DiceResolution } from '@/features/session/engine/diceResolver';
import charactersData from '@/content/characters.json';
import scenariosData from '@/content/scenarios.json';
import type { PlayerCharacter, CharacterId } from '@/shared/types/character';
import type { SwipeDirection } from '@/shared/types/card';
import type { Scenario } from '@/shared/types/scenario';

const characters = charactersData as unknown as PlayerCharacter[];
const scenarios = scenariosData as unknown as Scenario[];

function nameOf(id: CharacterId): string {
  return characters.find(c => c.id === id)?.nameKo ?? id;
}

export default function SessionScreen() {
  const session = useGameStore(s => s.session);
  const roller = useGameStore(s => s.roller);
  const startSession = useGameStore(s => s.startSession);
  const applyChoice = useGameStore(s => s.applyChoice);
  const situations = useGameStore(s => s.situations);
  const situationProgress = useGameStore(s => s.situationProgress);
  const campaign = useCampaignStore(s => s.campaign);
  const useDmAction = useCampaignStore(s => s.useDmAction);

  const [diceVisible, setDiceVisible] = useState(false);
  const [resolution, setResolution] = useState<DiceResolution | null>(null);
  const pendingChoice = useRef<SwipeDirection | null>(null);

  useEffect(() => {
    if (!session) startSession();
  }, [session, startSession]);

  useEffect(() => {
    if (session?.isEnded) {
      const target = campaign?.isEnded ? '/campaign/ending' : '/session-summary';
      const t = setTimeout(() => router.replace(target as any), 400);
      return () => clearTimeout(t);
    }
  }, [session?.isEnded, campaign?.isEnded]);

  const handleSwipe = (direction: SwipeDirection) => {
    if (!session?.currentCard) return;
    const choice = session.currentCard.choices.find(c => c.direction === direction);
    if (!choice) return;
    if (isDiceChoice(choice)) {
      const res = resolveDiceChoice(choice, roller);
      setResolution(res);
      setDiceVisible(true);
      pendingChoice.current = direction;
    } else {
      applyChoice(direction);
    }
  };

  const handleDiceDone = () => {
    setDiceVisible(false);
    setResolution(null);
    if (pendingChoice.current) {
      applyChoice(pendingChoice.current);
      pendingChoice.current = null;
    }
  };

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.info}>Loading...</Text>
      </SafeAreaView>
    );
  }

  const [p1, p2, p3, p4] = session.party;
  const scenario = campaign ? scenarios.find(s => s.id === campaign.scenarioId) : null;
  const theme = scenario?.sessionThemes.find(t => t.sessionIndex === session.sessionIndex);

  const currentSituation = situations && situationProgress ? situations[situationProgress.situationIndex] : null;
  const situationLabel = currentSituation && situations
    ? `${situationProgress!.situationIndex + 1}/${situations.length}`
    : undefined;

  const sessionLabel = campaign
    ? `S${campaign.sessionIndex}/${campaign.totalSessions} · ${theme?.themeKo ?? session.phase}`
    : `Session 1 · ${session.phase}`;

  const diceSides =
    session.currentCard &&
    pendingChoice.current &&
    (() => {
      const c = session.currentCard.choices.find(x => x.direction === pendingChoice.current);
      return c && isDiceChoice(c) ? c.dice.sides : 20;
    })();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.headerText}>{sessionLabel}</Text>
        <Pressable onPress={() => router.replace('/')}>
          <Text style={styles.exitText}>홈</Text>
        </Pressable>
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
      {campaign && (
        <DmScreenPanel state={campaign.dmScreen} onAction={useDmAction} />
      )}
      {currentSituation && (
        <SceneBanner
          sceneKo={currentSituation.sceneKo}
          narrativeKo={currentSituation.narrativeKo}
          situationLabel={situationLabel}
        />
      )}
      <View style={styles.cardArea}>
        {session.currentCard && !session.isEnded ? (
          <SwipeableCard onSwipe={handleSwipe}>
            <CardView card={session.currentCard} />
          </SwipeableCard>
        ) : (
          <Text style={styles.info}>Session ending...</Text>
        )}
      </View>
      <DiceRollOverlay
        visible={diceVisible}
        resolution={resolution}
        sides={typeof diceSides === 'number' ? diceSides : 20}
        onDone={handleDiceDone}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4, paddingHorizontal: 12 },
  headerText: { color: '#888', fontSize: 11 },
  exitText: { color: '#666', fontSize: 11 },
  partyGrid: { paddingVertical: 2, borderBottomWidth: 1, borderBottomColor: '#222' },
  partyRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 1 },
  cardArea: { flex: 1, paddingHorizontal: 8, paddingVertical: 4 },
  info: { color: '#fff', textAlign: 'center' },
});
