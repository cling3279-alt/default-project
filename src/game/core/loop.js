const TICK_INTERVAL_MS = 1000;

/**
 * A fixed-timestep game loop that decouples update rate from render rate.
 */
export class GameLoop {
  constructor({ update, render, fps = 60 } = {}) {
    if (typeof update !== 'function' || typeof render !== 'function') {
      throw new Error('GameLoop requires both update and render callbacks');
    }
    this.update = update;
    this.render = render;
    this.stepMs = 1000 / fps;
    this.accumulator = 0;
    this.lastTime = 0;
    this.running = false;
    this.rafId = null;
    this.fpsCounter = { frames: 0, lastFlush: 0, value: 0 };
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.fpsCounter.lastFlush = this.lastTime;
    this.tick = this.tick.bind(this);
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop() {
    this.running = false;
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }

  tick(now) {
    if (!this.running) return;

    let delta = now - this.lastTime;
    this.lastTime = now;

    if (delta > TICK_INTERVAL_MS) delta = TICK_INTERVAL_MS;
    this.accumulator += delta;

    while (this.accumulator >= this.stepMs) {
      this.update(this.stepMs / 1000);
      this.accumulator -= this.stepMs;
    }

    this.measureFps(now);
    this.render(now);

    this.rafId = requestAnimationFrame(this.tick);
  }

  measureFps(now) {
    this.fpsCounter.frames += 1;
    const elapsed = now - this.fpsCounter.lastFlush;
    if (elapsed >= 1000) {
      this.fpsCounter.value = Math.round((this.fpsCounter.frames * 1000) / elapsed);
      this.fpsCounter.frames = 0;
      this.fpsCounter.lastFlush = now;
    }
  }
}
