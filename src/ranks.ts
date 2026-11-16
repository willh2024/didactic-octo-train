export type Rank = { name: string; min: number };

// Lower LR bound of each rank, lowest to highest.
export const RANKS: Rank[] = [
  { name: "Iron", min: 0 },
  { name: "Copper", min: 1250 },
  { name: "Bronze", min: 2500 },
  { name: "Silver", min: 4000 },
  { name: "Gold", min: 5500 },
  { name: "Platinum", min: 7000 },
  { name: "Emerald", min: 8250 },
  { name: "Ruby", min: 9500 },
  { name: "Diamond", min: 11000 },
  { name: "Pearl", min: 12000 },
  { name: "Master", min: 13000 },
  { name: "Grandmaster", min: 14000 },
];

export type RankProgress = {
  current: Rank;
  next: Rank | null; // null once the player is in the top rank
  toNext: number; // LR still needed for the next rank (0 in the top rank)
  progress: number; // 0..1 through the current rank (1 in the top rank)
};

export function getRankProgress(lr: number): RankProgress {
  let index = 0;
  for (let i = 0; i < RANKS.length; i++) {
    if (lr >= RANKS[i].min) {
      index = i;
    }
  }

  const current = RANKS[index];
  const next = RANKS[index + 1] ?? null;

  if (next === null) {
    return { current, next: null, toNext: 0, progress: 1 };
  }

  const span = next.min - current.min;
  const progress = Math.min(1, Math.max(0, (lr - current.min) / span));
  return { current, next, toNext: next.min - lr, progress };
}
