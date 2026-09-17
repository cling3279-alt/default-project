import { Entity } from '../core/entity.js';

export class Collectible extends Entity {
  constructor(x = 0, y = 0, value = 10, radius = 10) {
    super(x, y);
    this.value = value;
    this.radius = radius;
  }
}

export class Enemy extends Entity {
  constructor(x = 0, y = 0, radius = 14) {
    super(x, y);
    this.radius = radius;
    this.speed = 100;
  }
}
