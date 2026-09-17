import { describe, it, expect, beforeEach } from 'vitest';
import { World } from '../../src/game/core/world.js';
import { Player } from '../../src/game/entities/player.js';
import { Collectible, Enemy } from '../../src/game/entities/index.js';
import { applyCollisions, circlesOverlap } from '../../src/game/systems/collision.js';

describe('circlesOverlap', () => {
  it('detects overlapping circles', () => {
    expect(circlesOverlap({ x: 0, y: 0, radius: 10 }, { x: 15, y: 0, radius: 10 })).toBe(true);
  });

  it('does not detect distant circles', () => {
    expect(circlesOverlap({ x: 0, y: 0, radius: 10 }, { x: 100, y: 0, radius: 10 })).toBe(false);
  });
});

describe('applyCollisions', () => {
  let world;
  let player;

  beforeEach(() => {
    world = new World();
    player = new Player(50, 50);
    world.addEntity(player);
  });

  it('adds score when the player collects a collectible', () => {
    const coin = new Collectible(50, 50, 10);
    world.addEntity(coin);

    const report = applyCollisions(world, player);

    expect(player.score).toBe(10);
    expect(report.collected).toBe(1);
    expect(world.entities).not.toContain(coin);
  });

  it('kills the player on collision with an enemy', () => {
    const enemy = new Enemy(50, 50);
    world.addEntity(enemy);

    const report = applyCollisions(world, player);

    expect(player.isAlive).toBe(false);
    expect(report.hit).toBe(true);
  });

  it('returns an empty report when nothing collides', () => {
    const coin = new Collectible(500, 500);
    const enemy = new Enemy(600, 600);
    world.addEntity(coin);
    world.addEntity(enemy);

    const report = applyCollisions(world, player);

    expect(report).toEqual({ collected: 0, hit: false });
    expect(player.score).toBe(0);
    expect(player.isAlive).toBe(true);
  });
});
