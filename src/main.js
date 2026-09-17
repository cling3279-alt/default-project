import { FishingGame, STATE } from './game/fishing.js';
import { FISH_SPECIES, RARITIES } from './game/fishData.js';
import { WaterScene } from './game/waterScene.js';

const canvas = document.getElementById('gameCanvas');
const game = new FishingGame();
const scene = new WaterScene(canvas, game);

const els = {
  totalScore: document.getElementById('totalScore'),
  catchCount: document.getElementById('catchCount'),
  escapeCount: document.getElementById('escapeCount'),
  hint: document.getElementById('hint'),
  biteBanner: document.getElementById('biteBanner'),
  reelWrap: document.getElementById('reelWrap'),
  reelBar: document.getElementById('reelBar'),
  reelLabel: document.getElementById('reelLabel'),
  catchModal: document.getElementById('catchModal'),
  collectionModal: document.getElementById('collectionModal'),
  collectionList: document.getElementById('collectionList'),
  collectionEmpty: document.getElementById('collectionEmpty'),
  catchRarityTag: document.getElementById('catchRarityTag'),
  catchName: document.getElementById('catchName'),
  catchIcon: document.getElementById('catchIcon'),
  catchSize: document.getElementById('catchSize'),
  catchWeight: document.getElementById('catchWeight'),
  catchScore: document.getElementById('catchScore'),
  catchContinue: document.getElementById('catchContinue'),
  collectionBtn: document.getElementById('collectionBtn'),
  collectionClose: document.getElementById('collectionClose'),
};

const SAVE_KEY = 'fishing-paradise-save-v1';

function saveGame() {
  try {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        totalScore: game.totalScore,
        catchCount: game.catchCount,
        escapes: game.escapes,
        history: game.history.slice(0, 50),
        discovered: Array.from(game.discovered.entries()),
      })
    );
  } catch {
    /* storage unavailable */
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    game.totalScore = data.totalScore || 0;
    game.catchCount = data.catchCount || 0;
    game.escapes = data.escapes || 0;
    game.history = data.history || [];
    game.discovered = new Map(data.discovered || []);
  } catch {
    /* corrupted save ignored */
  }
}

loadGame();

function hintText() {
  const hints = {
    [STATE.IDLE]: '點擊水面拋竿開始釣魚',
    [STATE.CASTING]: '拋竿中…（點擊水面或按 R 可收桿）',
    [STATE.WAITING]: '靜靜等待魚兒上鉤…（按 R 可收桿）',
    [STATE.BITING]: '咬餌了！快點擊收竿！',
    [STATE.MISSED]: '哎呀，拉得太快，魚兒跑了',
    [STATE.HOOKED]: '中鉤！自動收線中…點擊加速！',
    [STATE.ESCAPED]: '魚兒逃跑了…點擊水面收桿',
    [STATE.CAUGHT]: '釣到了！',
  };
  return hints[game.state];
}

function updateHud() {
  els.totalScore.textContent = game.totalScore;
  els.catchCount.textContent = game.catchCount;
  els.escapeCount.textContent = game.escapes;
  els.hint.textContent = hintText();
  els.biteBanner.classList.toggle('hidden', game.state !== STATE.BITING);
  els.reelWrap.classList.toggle('hidden', game.state !== STATE.HOOKED);
  if (game.state === STATE.HOOKED) {
    els.reelBar.style.width = `${Math.round(game.reelMeter * 100)}%`;
    els.reelBar.style.background = game.pendingCatch
      ? RARITIES[game.pendingCatch.species.rarity].color
      : '#ffd166';
    els.reelLabel.textContent = '收線中…點擊可加速！';
  }
}

function showCatchModal(result) {
  const rarity = RARITIES[result.species.rarity];
  els.catchRarityTag.textContent = rarity.name;
  els.catchRarityTag.style.background = rarity.color;
  els.catchName.textContent = result.species.name;
  els.catchName.style.color = rarity.color;
  els.catchSize.textContent = `${result.sizeCm} cm`;
  els.catchWeight.textContent = `${result.weightKg} kg`;
  els.catchScore.textContent = result.score;
  drawCatchIcon(result.species, rarity);
  els.catchModal.classList.remove('hidden');
}

function drawCatchIcon(species, rarity) {
  const icon = els.catchIcon;
  icon.innerHTML = '';
  const size = 120;
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 200 100');
  svg.setAttribute('width', `${size}`);
  svg.setAttribute('height', '60');
  const w = 170;
  const h = 46;
  const body = document.createElementNS(svgNS, 'ellipse');
  body.setAttribute('cx', '100');
  body.setAttribute('cy', '50');
  body.setAttribute('rx', String(w / 2));
  body.setAttribute('ry', String(h / 2));
  body.setAttribute('fill', species.color);
  svg.appendChild(body);
  if (rarity.glow) {
    const glow = document.createElementNS(svgNS, 'ellipse');
    glow.setAttribute('cx', '100');
    glow.setAttribute('cy', '50');
    glow.setAttribute('rx', String(w / 2 + 8));
    glow.setAttribute('ry', String(h / 2 + 8));
    glow.setAttribute('fill', 'none');
    glow.setAttribute('stroke', rarity.color);
    glow.setAttribute('stroke-width', '4');
    svg.appendChild(glow);
  }
  const tail = document.createElementNS(svgNS, 'path');
  tail.setAttribute('d', 'M 20 50 L -2 26 L 4 50 L -2 74 Z');
  tail.setAttribute('fill', species.color);
  svg.appendChild(tail);
  const eye = document.createElementNS(svgNS, 'circle');
  eye.setAttribute('cx', '135');
  eye.setAttribute('cy', '38');
  eye.setAttribute('r', '5');
  eye.setAttribute('fill', '#111');
  svg.appendChild(eye);
  icon.appendChild(svg);
}

function renderCollection() {
  const species = [...FISH_SPECIES].sort((a, b) => {
    const ra = RARITIES[a.rarity].weight;
    const rb = RARITIES[b.rarity].weight;
    return ra - rb;
  });
  els.collectionList.innerHTML = '';
  const hasAny = Array.from(game.discovered.values()).some((d) => d.count > 0);
  els.collectionEmpty.classList.toggle('hidden', Boolean(hasAny));
  for (const s of species) {
    const entry = game.discovered.get(s.id);
    const rarity = RARITIES[s.rarity];
    const row = document.createElement('div');
    row.className = 'collection-row';
    const tag = document.createElement('span');
    tag.className = 'collection-rarity';
    tag.style.background = rarity.color;
    tag.textContent = rarity.name;
    const name = document.createElement('span');
    name.className = 'collection-name';
    name.textContent = s.name;
    const info = document.createElement('span');
    info.className = 'collection-info';
    info.textContent = entry
      ? `釣獲 ${entry.count} 次 · 最佳 ${entry.bestScore} 分`
      : '尚未釣到';
    row.appendChild(tag);
    row.appendChild(name);
    row.appendChild(info);
    els.collectionList.appendChild(row);
  }
}

canvas.addEventListener('click', (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  if (game.state === STATE.IDLE) {
    if (y >= scene.waterTop) {
      game.cast(x, y);
      scene.spawnDroplets(x, y, 10);
    }
  } else if (game.state === STATE.ESCAPED || game.state === STATE.MISSED) {
    if (game.reel()) {
      scene.spawnRipple(game.bobber.x, game.bobber.y, 14);
      scene.spawnDroplets(game.bobber.x, game.bobber.y, 8);
    }
  } else if (game.state === STATE.BITING) {
    scene.spawnDroplets(x, y, 2);
    if (game.tryHook()) {
      scene.spawnDroplets(game.bobber.x, game.bobber.y + 8, 14);
      scene.spawnRipple(game.bobber.x, game.bobber.y + 8, 8);
    }
  } else if (game.state === STATE.HOOKED) {
    if (game.tap()) {
      scene.spawnDroplets(game.bobber.x, game.bobber.y + 8, 4);
      scene.spawnRipple(game.bobber.x, game.bobber.y + 8, 5);
    }
  } else if (game.state === STATE.CASTING || game.state === STATE.WAITING) {
    if (game.reel()) {
      scene.spawnRipple(game.bobber.x, game.bobber.y, 12);
      scene.spawnDroplets(game.bobber.x, game.bobber.y, 8);
    }
  }
});

window.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    event.preventDefault();
    if (game.state === STATE.BITING) game.tryHook();
    if (game.state === STATE.HOOKED) game.tap();
  }
  if (event.key === 'Enter' && game.state === STATE.ESCAPED) game.continue();
  if (event.key === 'r' || event.key === 'R' || event.key === 'Escape') {
    if (game.reel()) {
      scene.spawnRipple(game.bobber.x, game.bobber.y, 12);
      event.preventDefault();
    }
  }
});

canvas.addEventListener('contextmenu', (event) => {
  event.preventDefault();
  if (game.reel()) {
    const rect = canvas.getBoundingClientRect();
    scene.spawnRipple(game.bobber.x, game.bobber.y, 12);
    void rect;
  }
});

window.addEventListener('resize', () => scene.resize());

els.catchContinue.addEventListener('click', () => {
  els.catchModal.classList.add('hidden');
  game.continue();
});

els.collectionBtn.addEventListener('click', () => {
  renderCollection();
  els.collectionModal.classList.remove('hidden');
});

els.collectionClose.addEventListener('click', () => {
  els.collectionModal.classList.add('hidden');
});

game.on('caught', (result) => {
  saveGame();
  updateHud();
  showCatchModal(result);
});

game.on('escape', () => {
  saveGame();
  updateHud();
});

game.on('statechange', updateHud);

let last = performance.now();

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  game.update(dt);
  scene.update(dt, now / 1000);
  scene.render();
  updateHud();
  requestAnimationFrame(frame);
}

scene.resize();
requestAnimationFrame(frame);