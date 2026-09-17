import { Enemy, Collectible } from '../entities/index.js';

/**
 * Simple circle-vs-circle collision detection system.
 */
export function circlesOverlap(a, b) {
  const radii = (a.radius ?? a.size ?? 0) + (b.radius ?? b.size ?? 0);
  if (radii === 0) return false;
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy <= radii * radii;
}

/**
 * Applies collisions: player collects collectibles, player collides with enemies.
 * Returns a report of what happened during this frame.
 */
export function applyCollisions(world, player) {
  const report = { collected: 0, hit: false };

  for (const entity of [...world.entities]) {
    if (!entity.isAlive) continue;

    if (entity instanceof Collectible && circlesOverlap(player, entity)) {
      player.score += entity.value;
      world.removeEntity(entity);
      report.collected += 1;
    }

    if (entity instanceof Enemy && circlesOverlap(player, entity)) {
      player.alive = false;
      report.hit = true;
    }
  }

  return report;
}
