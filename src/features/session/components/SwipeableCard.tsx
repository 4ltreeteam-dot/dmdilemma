import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { GestureHandlerRootView, Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, runOnJS, withSpring, withTiming } from 'react-native-reanimated';
import type { SwipeDirection } from '@/shared/types/card';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

type Props = {
  children: React.ReactNode;
  onSwipe: (direction: SwipeDirection) => void;
};

export function SwipeableCard({ children, onSwipe }: Props) {
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);

  const commit = (direction: SwipeDirection) => {
    onSwipe(direction);
    translateX.value = 0;
    rotate.value = 0;
  };

  const pan = Gesture.Pan()
    .onUpdate(e => {
      translateX.value = e.translationX;
      rotate.value = (e.translationX / SCREEN_WIDTH) * 15;
    })
    .onEnd(() => {
      if (translateX.value > SWIPE_THRESHOLD) {
        translateX.value = withTiming(SCREEN_WIDTH, { duration: 200 });
        runOnJS(commit)('right');
      } else if (translateX.value < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-SCREEN_WIDTH, { duration: 200 });
        runOnJS(commit)('left');
      } else {
        translateX.value = withSpring(0);
        rotate.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { rotateZ: `${rotate.value}deg` }],
  }));

  return (
    <GestureHandlerRootView style={styles.root}>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.container, animatedStyle]}>{children}</Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1 },
});
