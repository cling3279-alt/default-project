import { describe, it, expect } from 'vitest';
import { FishingGame, STATE } from '../../src/game/fishing.js';
import { rollRarity, rollSpecies, rollSize, weightFor, scoreFor, catchResult, FISH_SPECIES, RARITIES } from '../../src/game/fishData.js';

function seededRandom(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function guaranteedHook(game) {
  game.random = () => 0.01;
}

function stepUntilBiting(game) {
  for (let i = 0; i < 100; i += 1) {
    game.update(0.1);
    if (game.state === STATE.BITING) return true;
    if (game.state === STATE.ESCAPED) return false;
  }
  return false;
}

describe('fish data', () => {
  it('has species in every rarity tier', () => {
    for (const rarity of Object.values(RARITIES)) {
      expect(FISH_SPECIES.some((s) => s.rarity === rarity.key)).toBe(true);
    }
  });

  it('rolls rarity within defined weights', () => {
    const counts = {};
    for (let i = 0; i < 5000; i += 1) {
      const r = rollRarity(seededRandom(i + 1));
      counts[r.key] = (counts[r.key] || 0) + 1;
    }
    expect(counts.common).toBeGreaterThan(counts.legendary);
    expect(counts.common + counts.uncommon).toBeGreaterThan(counts.rare + counts.epic + counts.legendary);
  });

  it('rolls species matching the rarity', () => {
    for (const rarity of Object.values(RARITIES)) {
      const species = rollSpecies(rarity.key, seededRandom(7));
      expect(species.rarity).toBe(rarity.key);
    }
  });

  it('keeps rolled sizes within species bounds', () => {
    for (const species of FISH_SPECIES) {
      for (let i = 1; i <= 200; i += 1) {
        const size = rollSize(species, seededRandom(i));
        expect(size).toBeGreaterThanOrEqual(species.minSize);
        expect(size).toBeLessThanOrEqual(species.maxSize);
      }
    }
  });

  it('computes positive weight and score', () => {
    for (const species of FISH_SPECIES) {
      const size = rollSize(species, seededRandom(3));
      expect(weightFor(species, size, seededRandom(4))).toBeGreaterThan(0);
      expect(scoreFor(species, size, seededRandom(5))).toBeGreaterThan(0);
    }
  });

  it('legendary species score strictly higher than common base', () => {
    const legendary = FISH_SPECIES.find((s) => s.rarity === 'legendary');
    const common = FISH_SPECIES.find((s) => s.rarity === 'common');
    expect(legendary.baseScore * RARITIES[legendary.rarity].multiplier).toBeGreaterThan(
      common.baseScore * RARITIES[common.rarity].multiplier
    );
  });

  it('catchResult returns a full result object', () => {
    const result = catchResult(seededRandom(9));
    expect(result.species).toBeTruthy();
    expect(result.rarity).toBeTruthy();
    expect(result.sizeCm).toBeGreaterThan(0);
    expect(result.weightKg).toBeGreaterThan(0);
    expect(result.score).toBeGreaterThan(0);
  });
});

describe('FishingGame cast flow', () => {
  it('rejects casting while not idle', () => {
    const game = new FishingGame({ random: seededRandom(1) });
    game.state = STATE.WAITING;
    expect(game.cast(300, 400)).toBe(false);
  });

  it('casts and transitions casting -> waiting -> biting', () => {
    const game = new FishingGame({ random: seededRandom(2) });
    expect(game.cast(300, 400)).toBe(true);
    expect(game.state).toBe(STATE.CASTING);
    game.update(0.3);
    expect(game.state).toBe(STATE.CASTING);
    game.update(0.6);
    expect(game.state).toBe(STATE.WAITING);
    game.update(5);
    expect(game.state).toBe(STATE.BITING);
    expect(game.pendingCatch).toBeTruthy();
  });

  it('biting state expires into escaped', () => {
    const game = new FishingGame({ random: seededRandom(3) });
    game.cast(300, 400);
    game.update(5);
    expect(game.state).toBe(STATE.BITING);
    game.update(3);
    expect(game.state).toBe(STATE.ESCAPED);
    expect(game.escapes).toBe(1);
  });

  it('hooks during bite window and resolves a catch', () => {
    const game = new FishingGame({ random: seededRandom(4) });
    game.cast(300, 400);
    expect(stepUntilBiting(game)).toBe(true);
    guaranteedHook(game);
    expect(game.tryHook()).toBe(true);
    expect(game.state).toBe(STATE.HOOKED);
    expect(game.reelTap).toBeGreaterThan(0);
    const taps = Math.ceil(1 / game.reelTap);
    for (let i = 0; i < taps; i += 1) game.tap();
    expect(game.state).toBe(STATE.CAUGHT);
    expect(game.catchCount).toBe(1);
    expect(game.totalScore).toBeGreaterThan(0);
    expect(game.history.length).toBe(1);
  });

  it('fails reeling when not tapped (meter decays to escape)', () => {
    const game = new FishingGame({ random: seededRandom(6) });
    game.cast(300, 400);
    expect(stepUntilBiting(game)).toBe(true);
    guaranteedHook(game);
    game.tryHook();
    expect(game.state).toBe(STATE.HOOKED);
    game.update(5);
    expect(game.state).toBe(STATE.ESCAPED);
    expect(game.escapes).toBe(1);
  });

  it('continue resets to idle after caught', () => {
    const game = new FishingGame({ random: seededRandom(5) });
    game.cast(300, 400);
    expect(stepUntilBiting(game)).toBe(true);
    guaranteedHook(game);
    game.tryHook();
    const taps = Math.ceil(1 / game.reelTap);
    for (let i = 0; i < taps; i += 1) game.tap();
    expect(game.state).toBe(STATE.CAUGHT);
    expect(game.continue()).toBe(true);
    expect(game.state).toBe(STATE.IDLE);
    expect(game.bobber.active).toBe(false);
  });

  it('reels back to idle while casting or waiting', () => {
    const game = new FishingGame({ random: seededRandom(9) });
    game.cast(300, 400);
    expect(game.reel()).toBe(true);
    expect(game.state).toBe(STATE.IDLE);
    expect(game.bobber.active).toBe(false);
    game.cast(300, 400);
    game.update(0.9);
    expect(game.state).toBe(STATE.WAITING);
    expect(game.reel()).toBe(true);
    expect(game.state).toBe(STATE.IDLE);
    expect(game.reel()).toBe(false);
  });

  it('continue does nothing in the middle of fishing', () => {
    const game = new FishingGame({ random: seededRandom(6) });
    game.cast(300, 400);
    expect(game.continue()).toBe(false);
  });

  it('emits events for cast, bite and caught', () => {
    const game = new FishingGame({ random: seededRandom(7) });
    const events = [];
    for (const name of ['cast', 'bite', 'caught', 'statechange']) {
      game.on(name, () => events.push(name));
    }
    game.cast(300, 400);
    expect(stepUntilBiting(game)).toBe(true);
    guaranteedHook(game);
    game.tryHook();
    const taps = Math.ceil(1 / game.reelTap);
    for (let i = 0; i < taps; i += 1) game.tap();
    expect(events).toContain('cast');
    expect(events).toContain('bite');
    expect(events).toContain('caught');
  });
});

describe('FishingGame determinism', () => {
  it('produces identical results with the same seed', () => {
    const a = new FishingGame({ random: seededRandom(42) });
    const b = new FishingGame({ random: seededRandom(42) });
    a.cast(100, 200);
    b.cast(100, 200);
    for (let i = 0; i < 40; i += 1) {
      a.update(0.1);
      b.update(0.1);
    }
    a.tryHook();
    b.tryHook();
    for (let i = 0; i < 40; i += 1) {
      a.update(0.1);
      b.update(0.1);
    }
    expect(a.history[0]).toEqual(b.history[0]);
  });
});