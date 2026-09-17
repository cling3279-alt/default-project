import { RARITIES, catchResult, rollRarity, rollSpecies, rollSize, weightFor, scoreFor } from './fishData.js';

export const STATE = {
  IDLE: 'idle',
  CASTING: 'casting',
  WAITING: 'waiting',
  BITING: 'biting',
  MISSED: 'missed',
  HOOKED: 'hooked',
  CAUGHT: 'caught',
  ESCAPED: 'escaped',
};

export class FishingGame {
  constructor({ random = Math.random, ambientFishCount = 12 } = {}) {
    this.random = random;
    this.state = STATE.IDLE;
    this.totalScore = 0;
    this.catchCount = 0;
    this.escapes = 0;
    this.history = [];
    this.discovered = new Map();
    this.bobber = { x: 0, y: 0, active: false };
    this.pendingCatch = null;
    this.lastResult = null;
    this.ambientFish = this.makeAmbientFish(ambientFishCount);
    this.t = 0;
    this.reelMeter = 0;
    this._timers = {};
    this._events = [];
  }

  makeAmbientFish(count) {
    const fishes = [];
    for (let i = 0; i < count; i += 1) {
      const rarity = rollRarity(this.random);
      const species = rollSpecies(rarity.key, this.random);
      const len = 14 + this.random() * 46;
      fishes.push({
        species,
        len,
        x: this.random() * 100,
        y: 18 + this.random() * 62,
        vx: (this.random() < 0.5 ? -1 : 1) * (10 + this.random() * 26),
        depth: this.random(),
      });
    }
    return fishes;
  }

  on(event, handler) {
    this._events.push([event, handler]);
  }

  emit(event, payload) {
    for (const [ev, handler] of this._events) {
      if (ev === event) handler(payload);
    }
  }

  cast(x, y) {
    if (this.state !== STATE.IDLE && this.state !== STATE.ESCAPED) return false;
    this.state = STATE.CASTING;
    this.bobber = { x, y, active: true };
    this.pendingCatch = null;
    this.lastResult = null;
    this.t = 0;
    this._timers.castDuration = 0.7;
    this._timers.waitDuration = 1.2 + this.random() * 2.6;
    this.emit('cast', { x, y });
    return true;
  }

  update(dtSeconds) {
    this.t += dtSeconds;

    for (const fish of this.ambientFish) {
      fish.x += fish.vx * dtSeconds;
      if (fish.x > 100) fish.vx = -Math.abs(fish.vx);
      if (fish.x < 0) fish.vx = Math.abs(fish.vx);
    }

    if (this.state === STATE.CASTING && this.t >= this._timers.castDuration) {
      this.t -= this._timers.castDuration;
      this.state = STATE.WAITING;
      this.emit('statechange', this.state);
    }

    if (this.state === STATE.WAITING && this.t >= this._timers.waitDuration) {
      this.t -= this._timers.waitDuration;
      this.startBite();
    }

    if (this.state === STATE.BITING && this.t * 1000 >= this.biteUntilMs) {
      this.escape();
    }

    if (this.state === STATE.HOOKED) {
      this.reelMeter = this.reelMeter - this.reelDecay * dtSeconds;
      if (this.reelMeter <= 0) {
        this.reelMeter = 0;
        this.escape();
      } else if (this.reelMeter >= 1) {
        this.reelMeter = 1;
        this.resolveCatch();
      }
    }
  }

  startBite() {
    const rarity = rollRarity(this.random);
    const species = rollSpecies(rarity.key, this.random);
    const sizeCm = rollSize(species, this.random);
    this.pendingCatch = {
      rarity,
      species,
      sizeCm,
      weightKg: weightFor(species, sizeCm, this.random),
      score: scoreFor(species, sizeCm, this.random),
    };
    this.biteUntilMs = rarity.biteWindowMs;
    this.state = STATE.BITING;
    this.emit('statechange', this.state);
    this.emit('bite', this.pendingCatch);
  }

  remainingBiteRatio() {
    if (this.state !== STATE.BITING) return 0;
    const elapsed = this.t * 1000;
    return Math.max(0, 1 - elapsed / this.biteUntilMs);
  }

  tryHook() {
    if (this.state !== STATE.BITING || !this.pendingCatch) return false;
    const freshness = 0.55 + 0.45 * this.remainingBiteRatio();
    const chance = this.pendingCatch.rarity.hookChance * freshness;
    if (this.random() < chance) {
      this.state = STATE.HOOKED;
      this.t = 0;
      this.reelMeter = 0;
      this.reelDecay = this.pendingCatch.rarity.decay;
      this.reelTap = 1 / this.pendingCatch.rarity.taps;
      this.emit('statechange', this.state);
      return true;
    }
    this.escape();
    return false;
  }

  tap() {
    if (this.state !== STATE.HOOKED) return false;
    this.reelMeter = Math.min(1, this.reelMeter + this.reelTap);
    if (this.reelMeter >= 1) this.resolveCatch();
    this.emit('tick', this.reelMeter);
    return true;
  }

  escape() {
    const fish = this.pendingCatch;
    this.pendingCatch = null;
    this.escapes += 1;
    this.state = STATE.ESCAPED;
    this.t = 0;
    this.emit('statechange', this.state);
    this.emit('escape', fish);
  }

  resolveCatch() {
    if (!this.pendingCatch) return;
    const result = { ...this.pendingCatch };
    this.pendingCatch = null;
    this.lastResult = result;
    this.totalScore += result.score;
    this.catchCount += 1;
    this.history.unshift(result);
    const entry = this.discovered.get(result.species.id) || { count: 0, bestScore: 0 };
    entry.count += 1;
    entry.bestScore = Math.max(entry.bestScore, result.score);
    this.discovered.set(result.species.id, entry);
    this.state = STATE.CAUGHT;
    this.emit('statechange', this.state);
    this.emit('caught', result);
  }

  reel() {
    if (this.state !== STATE.CASTING && this.state !== STATE.WAITING) return false;
    this.state = STATE.IDLE;
    this.bobber.active = false;
    this.pendingCatch = null;
    this.t = 0;
    this.emit('statechange', this.state);
    this.emit('reel');
    return true;
  }

  continue() {
    if (this.state === STATE.ESCAPED || this.state === STATE.CAUGHT) {
      this.state = STATE.IDLE;
      this.bobber.active = false;
      this.lastResult = null;
      this.emit('statechange', this.state);
      return true;
    }
    return false;
  }
}

export { RARITIES, catchResult };