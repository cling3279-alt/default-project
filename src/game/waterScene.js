import { RARITIES } from './fishData.js';
import { STATE } from './fishing.js';

export class WaterScene {
  constructor(canvas, game) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.game = game;
    this.t = 0;
    this.ripples = [];
    this.droplets = [];
    this.jump = null;
    this.biteShake = 0;
  }

  resize() {
    const ctx = this.ctx;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    if (ctx.setTransform) ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  handleEvent(event, payload) {
    if (event === 'cast') this.spawnRipple(payload.x, payload.y, 34);
    if (event === 'caught') this.startJump(payload);
    if (event === 'escape') this.spawnRipple(this.game.bobber.x, this.game.bobber.y, 14);
  }

  startJump(result) {
    const { bobber } = this.game;
    const from = { x: bobber.x, y: bobber.y - 12 };
    const to = { x: 130, y: this.waterTop + 90 };
    this.jump = { result, from, to, progress: 0, duration: 0.9 };
  }

  spawnRipple(x, y, radius) {
    this.ripples.push({ x, y, radius, maxRadius: radius + 46, life: 0, maxLife: 0.9 });
  }

  spawnDroplets(x, y, count) {
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 120;
      this.droplets.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 140,
        life: 0,
        maxLife: 0.5 + Math.random() * 0.3,
      });
    }
  }

  update(dt, gameTime) {
    this.t = gameTime;
    for (const r of this.ripples) r.life += dt;
    this.ripples = this.ripples.filter((r) => r.life < r.maxLife);
    for (const d of this.droplets) {
      d.life += dt;
      d.vy += 700 * dt;
      d.x += d.vx * dt;
      d.y += d.vy * dt;
    }
    this.droplets = this.droplets.filter((d) => d.life < d.maxLife && d.y < this.canvas.height);
    if (this.jump) {
      this.jump.progress += dt / this.jump.duration;
      if (this.jump.progress >= 1) this.jump = null;
    }
    if (this.game.state === STATE.BITING) {
      this.biteShake = Math.min(1, this.biteShake + dt * 5);
      this._bitePulse = (this._bitePulse || 0) + dt;
      if (this._bitePulse >= 0.35) {
        this._bitePulse = 0;
        this.spawnRipple(this.game.bobber.x, this.game.bobber.y + 6, 6);
      }
    } else {
      this.biteShake = Math.max(0, this.biteShake - dt * 6);
    }
  }

  get waterTop() {
    return this.canvas.height * 0.2;
  }

  get waterRect() {
    return {
      x: 0,
      y: this.waterTop,
      w: this.canvas.width,
      h: this.canvas.height - this.waterTop,
    };
  }

  render() {
    const { ctx } = this;
    this.drawBackground(ctx);
    this.drawWater(ctx);
    this.drawLightRays(ctx);
    for (const fish of this.game.ambientFish) {
      this.drawFishSilhouette(ctx, fish);
    }
    this.drawRipples(ctx);
    this.drawRodAndLine(ctx);
    this.drawPlayer(ctx);
    if (this.game.bobber.active) {
      if (this.game.state === STATE.WAITING) this.drawApproachShadow(ctx);
      this.drawBobber(ctx);
    }
    if (this.jump) this.drawJump(ctx);
    this.drawDroplets(ctx);
    if (this.game.state === STATE.BITING) this.drawBiteIndicator(ctx);
  }

  drawApproachShadow(ctx) {
    const progress = Math.min(1, this.game.t / this.game._timers.waitDuration);
    const bx = this.game.bobber.x;
    const by = this.game.bobber.y;
    const from = 90;
    const dist = from * (1 - progress * progress);
    const dir = this.game.bobber.x < this.canvas.width / 2 ? 1 : -1;
    const sx = bx - dir * dist;
    const sy = by + 22 + Math.sin(this.t * 4) * 3;
    const len = 10 + progress * 30;
    ctx.save();
    ctx.fillStyle = 'rgba(3,20,35,0.5)';
    ctx.beginPath();
    ctx.ellipse(sx, sy, len, len * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawBackground(ctx) {
    const { canvas } = this;
    const sky = ctx.createLinearGradient(0, 0, 0, this.waterTop);
    sky.addColorStop(0, '#ff9966');
    sky.addColorStop(1, '#ffd6a5');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, this.waterTop);

    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    const sunX = canvas.width * 0.78;
    const sunY = this.waterTop * 0.5;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 26, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    for (let i = 0; i < 5; i += 1) {
      const cx = ((i * 137 + 62) * 1.3) % canvas.width;
      const cy = ((i * 97 + 40) * 1.7) % this.waterTop;
      ctx.beginPath();
      ctx.arc(cx, cy, 2 + i * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawWater(ctx) {
    const { canvas } = this;
    const rect = this.waterRect;
    const grad = ctx.createLinearGradient(0, rect.y, 0, canvas.height);
    grad.addColorStop(0, 'rgba(32,124,155,0.95)');
    grad.addColorStop(1, 'rgba(7,50,84,0.98)');
    ctx.fillStyle = grad;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);

    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i += 1) {
      const baseY = rect.y + 14 + i * 34;
      ctx.beginPath();
      for (let x = 0; x <= canvas.width; x += 8) {
        const y = baseY + Math.sin(x * 0.012 + this.t * 1.4 + i * 1.7) * 4;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }

  drawLightRays(ctx) {
    const { canvas } = this;
    const rect = this.waterRect;
    ctx.save();
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 4; i += 1) {
      const base = (i * 180 + 60) % (canvas.width + 200) - 100;
      ctx.beginPath();
      ctx.moveTo(base, rect.y);
      ctx.lineTo(base + 60, rect.y);
      ctx.lineTo(base + 160, canvas.height);
      ctx.lineTo(base - 40, canvas.height);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  fishPxLen(fish) {
    return Math.max(14, Math.min(240, fish.len * 1.6));
  }

  drawFishSilhouette(ctx, fish) {
    const rect = this.waterRect;
    const px = fish.x / 100 * rect.w;
    const py = rect.y + (fish.y / 100) * rect.h;
    const len = this.fishPxLen(fish);
    if (px < -len || px > rect.w + len) return;
    const dir = fish.vx >= 0 ? 1 : -1;
    const depth = 0.35 + fish.depth * 0.4;
    ctx.save();
    ctx.globalAlpha = depth;
    this.drawFish(ctx, { ...fish, len, x: px, y: py }, dir, fish.species.shape, true);
    ctx.restore();
  }

  drawRodAndLine(ctx) {
    const { canvas } = this;
    const tipX = 150 + Math.sin(this.t * 1.2) * 2;
    const tipY = this.waterTop + 40;
    const baseX = 34;
    const baseY = canvas.height - 16;

    ctx.strokeStyle = '#8b5a2b';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.quadraticCurveTo(baseX + 40, baseY - 90, tipX, tipY);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(230,230,230,0.9)';
    ctx.lineWidth = 2;
    if (this.game.bobber.active) {
      const p = this.game.state === STATE.CASTING ? this.game.t / 0.7 : 1;
      const bx = this.game.bobber.x;
      const by = this.game.bobber.y;
      const curBx = this.game.state === STATE.CASTING ? tipX + (bx - tipX) * p : bx;
      const curBy = this.game.state === STATE.CASTING ? tipY + (by - tipY) * p : by;
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(curBx, curBy);
      ctx.stroke();
    }
  }

  drawPlayer(ctx) {
    const { canvas } = this;
    const x = 34;
    const y = canvas.height - 16;
    ctx.fillStyle = '#3a2d2b';
    ctx.beginPath();
    ctx.ellipse(x, y, 22, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y - 22, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f1d9c0';
    ctx.beginPath();
    ctx.arc(x, y - 24, 10, 0, Math.PI * 2);
    ctx.fill();
  }

  drawBobber(ctx) {
    const bx = this.game.bobber.x;
    const bob = Math.sin(this.t * 5) * 3;
    let by = this.game.bobber.y + bob;
    if (this.game.state === STATE.CASTING) {
      const p = this.game.t / 0.7;
      by = this.waterTop + (by - this.waterTop) * p;
    }
    let offsetX = 0;
    if (this.game.state === STATE.BITING) {
      offsetX = Math.sin(this.t * 45) * 10 * (0.5 + this.biteShake);
    }
    if (this.game.state === STATE.HOOKED) {
      offsetX = Math.sin(this.t * 30) * 6;
    }

    ctx.save();
    ctx.translate(bx + offsetX, by);
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#3377ff';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -3, 7, Math.PI, 0);
    ctx.fillStyle = '#e74c3c';
    ctx.fill();
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.lineTo(0, 10);
    ctx.stroke();
    ctx.restore();
  }

  drawBiteIndicator(ctx) {
    const bx = this.game.bobber.x + Math.sin(this.t * 45) * 10 * (0.5 + this.biteShake);
    const by = this.game.bobber.y - 34;
    const size = 34 + Math.sin(this.t * 10) * 4;
    ctx.save();
    ctx.shadowColor = '#ff3b30';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#ff3b30';
    ctx.font = `bold ${size}px "Segoe UI", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('！！', bx + 6, by);
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = 0.35 + 0.3 * Math.sin(this.t * 9);
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(bx, this.game.bobber.y, 16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  drawJump(ctx) {
    const { jump } = this;
    if (!jump) return;
    const p = Math.min(1, jump.progress);
    const arc = Math.sin(p * Math.PI) * -90;
    const x = jump.from.x + (jump.to.x - jump.from.x) * p;
    const y = jump.from.y + (jump.to.y - jump.from.y) * p + arc;
    const len = Math.max(24, Math.min(120, jump.result.sizeCm * 0.9));
    const rar = RARITIES[jump.result.species.rarity];
    ctx.save();
    ctx.translate(x, y);
    if (rar.glow) {
      ctx.shadowColor = rar.color;
      ctx.shadowBlur = 22;
    }
    this.drawFishBody(ctx, jump.result.species, len, 1, jump.result.species.color);
    ctx.restore();
  }

  drawRipples(ctx) {
    for (const r of this.ripples) {
      const p = r.life / r.maxLife;
      ctx.strokeStyle = `rgba(255,255,255,${0.55 * (1 - p)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius + (r.maxRadius - r.radius) * p, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  drawDroplets(ctx) {
    for (const d of this.droplets) {
      const p = d.life / d.maxLife;
      ctx.fillStyle = `rgba(220,240,255,${0.9 * (1 - p)})`;
      ctx.beginPath();
      ctx.arc(d.x, d.y, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawFish(ctx, fish, dir, shape, silhouette) {
    const { len } = fish;
    const c = fish.species ? fish.species.color : '#ccc';
    ctx.save();
    ctx.translate(fish.x, fish.y);
    ctx.scale(dir, 1);
    this.drawFishBody(ctx, fish.species || { shape }, len, silhouette ? 0.7 : 1, c);
    ctx.restore();
  }

  drawFishBody(ctx, species, len, alpha, color) {
    const h = Math.max(8, len * 0.36);
    ctx.fillStyle = alpha < 1 ? `rgba(18,18,18,${alpha})` : color;
    ctx.beginPath();
    ctx.ellipse(0, 0, len / 2, h, 0, 0, Math.PI * 2);
    ctx.fill();
    if (alpha >= 1) {
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.beginPath();
      ctx.arc(len * 0.15, -h * 0.25, Math.max(1.5, h * 0.1), 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(len * 0.16, -h * 0.23, Math.max(1, h * 0.06), 0, Math.PI * 2);
      ctx.fill();
    }
    this.drawTail(ctx, species.shape, len, h, color);
    this.drawFins(ctx, species.shape, len, h, color);
  }

  drawTail(ctx, shape, len, h, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-len / 2 + len * 0.05, 0);
    ctx.lineTo(-len / 2 - len * 0.28, -h * 0.7);
    ctx.lineTo(-len / 2 - len * 0.22, 0);
    ctx.lineTo(-len / 2 - len * 0.28, h * 0.7);
    ctx.closePath();
    ctx.fill();
  }

  drawFins(ctx, shape, len, h, color) {
    ctx.fillStyle = color;
    if (shape === 'shark' || shape === 'tuna') {
      ctx.beginPath();
      ctx.moveTo(len * 0.05, -h * 0.2);
      ctx.lineTo(0, -h * 1.4);
      ctx.lineTo(-len * 0.22, -h * 0.1);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(0, -h * 0.5);
      ctx.lineTo(-len * 0.1, -h * 0.95);
      ctx.lineTo(-len * 0.28, -h * 0.2);
      ctx.closePath();
      ctx.fill();
    }
  }
}