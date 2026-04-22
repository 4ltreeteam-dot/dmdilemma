export type DiceRoller = {
  roll: (sides: number) => number;
};

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createRoller(seed: number): DiceRoller {
  const rand = mulberry32(seed);
  return {
    roll(sides: number): number {
      if (!Number.isInteger(sides) || sides < 1) {
        throw new Error(`invalid die: ${sides}`);
      }
      return Math.floor(rand() * sides) + 1;
    },
  };
}
