import { GameLoop } from './game/core/loop.js';
import { World } from './game/core/world.js';
import { Player } from './game/entities/player.js';
import { Collectible, Enemy } from './game/entities/index.js';
import { applyCollisions } from './game/systems/collision.js';
import { randomBetween } from './utils/math.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const world = new World();
const player = new Player(world.width / 2, world.height / 2);
world.addEntity(player);

function spawnCollectible() {
  world.addEntity(
    new Collectible(randomBetween(30, world.width - 30), randomBetween(30, world.height - 30))
  );
}

function spawnEnemy() {
  world.addEntity(
    new Enemy(randomBetween(30, world.width - 30), randomBetween(30, world.height - 30))
  );
}

for (let i = 0; i < 5; i += 1) spawnCollectible();
spawnEnemy();

window.addEventListener('keydown', (event) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
    event.preventDefault();
  }
  player.press(event.key);
});

window.addEventListener('keyup', (event) => {
  player.release(event.key);
});

function update(deltaSeconds) {
  world.update(deltaSeconds);

  const report = applyCollisions(world, player);
  if (report.collected > 0) spawnCollectible();
  if (report.hit) {
    loop.stop();
    ctx.fillStyle = '#e94560';
    ctx.font = '48px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
  }
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const entity of world.entities) {
    if (entity === player) {
      ctx.fillStyle = '#4cc9f0';
      ctx.fillRect(
        player.x - player.size / 2,
        player.y - player.size / 2,
        player.size,
        player.size
      );
    } else if (entity instanceof Collectible) {
      ctx.fillStyle = '#e94560';
      ctx.beginPath();
      ctx.arc(entity.x, entity.y, entity.radius, 0, Math.PI * 2);
      ctx.fill();
    } else if (entity instanceof Enemy) {
      ctx.fillStyle = '#9b2226';
      ctx.beginPath();
      ctx.arc(entity.x, entity.y, entity.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.fillStyle = '#eaeaea';
  ctx.font = '20px Segoe UI';
  ctx.textAlign = 'left';
  ctx.fillText(`Score: ${player.score}`, 16, 32);
}

const loop = new GameLoop({ update, render });
loop.start();
