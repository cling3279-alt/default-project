import { CONFIG } from './config.js';

/**
 * A simple game world that tracks a player and a list of entities.
 */
export class World {
  constructor({ entities = [] } = {}) {
    this.width = CONFIG.canvasWidth;
    this.height = CONFIG.canvasHeight;
    this.entities = entities;
    this.startedAt = performance.now();
  }

  addEntity(entity) {
    this.entities.push(entity);
    return entity;
  }

  removeEntity(entity) {
    const index = this.entities.indexOf(entity);
    if (index !== -1) this.entities.splice(index, 1);
  }

  update(deltaSeconds) {
    for (const entity of this.entities) {
      entity.update?.(deltaSeconds, this);
    }
  }

  get elapsedSeconds() {
    return (performance.now() - this.startedAt) / 1000;
  }
}
