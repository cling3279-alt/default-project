export const RARITIES = {
  common: { key: 'common', name: '普通', multiplier: 1, color: '#a8b2c1', weight: 55, biteWindowMs: 2200, hookChance: 0.95, taps: 4, decay: 0.08, glow: false },
  uncommon: { key: 'uncommon', name: '稀有', multiplier: 1.6, color: '#2ec4b6', weight: 26, biteWindowMs: 1900, hookChance: 0.88, taps: 6, decay: 0.1, glow: false },
  rare: { key: 'rare', name: '珍貴', multiplier: 2.8, color: '#7b61ff', weight: 12, biteWindowMs: 1500, hookChance: 0.78, taps: 8, decay: 0.12, glow: false },
  epic: { key: 'epic', name: '史詩', multiplier: 5, color: '#ff5d8f', weight: 5.5, biteWindowMs: 1200, hookChance: 0.65, taps: 10, decay: 0.15, glow: false },
  legendary: { key: 'legendary', name: '傳說', multiplier: 10, color: '#ffb703', weight: 1.5, biteWindowMs: 950, hookChance: 0.5, taps: 12, decay: 0.18, glow: true },
};

export const FISH_SPECIES = [
  { id: 'guppy', name: '小鱂魚', rarity: 'common', minSize: 8, maxSize: 18, weightPerCm: 0.008, baseScore: 12, color: '#e9c46a', shape: 'minnow' },
  { id: 'tilapia', name: '吳郭魚', rarity: 'common', minSize: 20, maxSize: 40, weightPerCm: 0.022, baseScore: 16, color: '#90a4ae', shape: 'tilapia' },
  { id: 'bream', name: '黑鯛', rarity: 'common', minSize: 18, maxSize: 36, weightPerCm: 0.02, baseScore: 18, color: '#6d8b74', shape: 'bream' },
  { id: 'carp', name: '鯉魚', rarity: 'uncommon', minSize: 30, maxSize: 75, weightPerCm: 0.032, baseScore: 28, color: '#f4a261', shape: 'carp' },
  { id: 'grasscarp', name: '草魚', rarity: 'uncommon', minSize: 35, maxSize: 85, weightPerCm: 0.03, baseScore: 30, color: '#80b918', shape: 'carp' },
  { id: 'eel', name: '海鰻', rarity: 'uncommon', minSize: 40, maxSize: 110, weightPerCm: 0.02, baseScore: 34, color: '#5f6caf', shape: 'eel' },
  { id: 'catfish', name: '鯰魚', rarity: 'rare', minSize: 45, maxSize: 120, weightPerCm: 0.05, baseScore: 55, color: '#7d5a50', shape: 'catfish' },
  { id: 'seabass', name: '海鱸魚', rarity: 'rare', minSize: 30, maxSize: 80, weightPerCm: 0.035, baseScore: 58, color: '#48cae4', shape: 'perch' },
  { id: 'salmon', name: '鮭魚', rarity: 'rare', minSize: 55, maxSize: 100, weightPerCm: 0.03, baseScore: 62, color: '#ef476f', shape: 'salmon' },
  { id: 'tuna', name: '鮪魚', rarity: 'epic', minSize: 90, maxSize: 220, weightPerCm: 0.09, baseScore: 150, color: '#0077b6', shape: 'tuna' },
  { id: 'lobster', name: '龍蝦', rarity: 'epic', minSize: 20, maxSize: 65, weightPerCm: 0.02, baseScore: 155, color: '#e63946', shape: 'lobster' },
  { id: 'sturgeon', name: '鱘龍魚', rarity: 'epic', minSize: 100, maxSize: 250, weightPerCm: 0.08, baseScore: 175, color: '#6c757d', shape: 'sturgeon' },
  { id: 'goldfish', name: '黃金魚', rarity: 'legendary', minSize: 25, maxSize: 60, weightPerCm: 0.02, baseScore: 320, color: '#ffd166', shape: 'goldfish', glow: true },
  { id: 'dragonfish', name: '龍魚', rarity: 'legendary', minSize: 70, maxSize: 180, weightPerCm: 0.07, baseScore: 500, color: '#ff006e', shape: 'dragon', glow: true },
];

export function rarityPool() {
  return Object.values(RARITIES);
}

export function speciesOf(rarityKey) {
  return FISH_SPECIES.filter((species) => species.rarity === rarityKey);
}

export function rollRarity(random = Math.random) {
  const pool = rarityPool();
  const total = pool.reduce((sum, r) => sum + r.weight, 0);
  let roll = random() * total;
  for (const rarity of pool) {
    roll -= rarity.weight;
    if (roll <= 0) return rarity;
  }
  return pool[pool.length - 1];
}

export function rollSpecies(rarityKey, random = Math.random) {
  const candidates = speciesOf(rarityKey);
  return candidates[Math.floor(random() * candidates.length)];
}

export function rollSize(species, random = Math.random) {
  const norm = 0.15 + 0.85 * Math.pow(random(), 1.7);
  const size = species.minSize + (species.maxSize - species.minSize) * norm;
  return Math.round(size);
}

export function weightFor(species, sizeCm, random = Math.random) {
  const jitter = 0.85 + random() * 0.3;
  const kg = sizeCm * species.weightPerCm * jitter;
  return Math.round(kg * 10) / 10;
}

export function scoreFor(species, sizeCm, random = Math.random) {
  const norm = (sizeCm - species.minSize) / (species.maxSize - species.minSize);
  const factor = 0.75 + 0.55 * norm + random() * 0.2;
  return Math.max(1, Math.round(species.baseScore * RARITIES[species.rarity].multiplier * factor));
}

export function catchResult(random = Math.random) {
  const rarity = rollRarity(random);
  const species = rollSpecies(rarity.key, random);
  const sizeCm = rollSize(species, random);
  const weightKg = weightFor(species, sizeCm, random);
  const score = scoreFor(species, sizeCm, random);
  return { species, rarity, sizeCm, weightKg, score };
}