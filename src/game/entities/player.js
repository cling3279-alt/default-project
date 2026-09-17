import { Entity } from '../core/entity.js';

export class Player extends Entity {
  constructor(x = 0, y = 0, size = 24, speed = 300) {
    super(x, y);
    this.size = size;
    this.speed = speed;
    this.score = 0;
    this.keys = new Set();
  }

  press(key) {
    this.keys.add(key);
  }

  release(key) {
    this.keys.delete(key);
  }

  update(deltaSeconds, world) {
    const moveX = (this.keys.has('ArrowRight') ? 1 : 0) - (this.keys.has('ArrowLeft') ? 1 : 0);
    const moveY = (this.keys.has('ArrowDown') ? 1 : 0) - (this.keys.has('ArrowUp') ? 1 : 0);

    this.vx = moveX * this.speed;
    this.vy = moveY * this.speed;

    super.update(deltaSeconds, world);

    if (this.x < this.size) this.x = this.size;
    if (this.y < this.size) this.y = this.size;
    if (this.x > world.width - this.size) this.x = world.width - this.size;
    if (this.y > world.height - this.size) this.y = world.height - this.size;
  }
}
