export const CONFIG = {
  canvasWidth: Number(import.meta.env.VITE_GAME_CANVAS_WIDTH ?? 1280),
  canvasHeight: Number(import.meta.env.VITE_GAME_CANVAS_HEIGHT ?? 720),
  fps: Number(import.meta.env.VITE_GAME_FPS ?? 60),
};
