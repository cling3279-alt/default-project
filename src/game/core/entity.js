/**
 * Base class for all game objects (player, enemies, collectibles, etc.).
 */
export class Entity {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.alive = true;
  }

  update(_deltaSeconds, _world) {
    this.x += this.vx;
    this.y += this.vy;
  }

  get isAlive() {
    return this.alive;
  }
}
