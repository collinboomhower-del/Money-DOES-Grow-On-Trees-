/**
 * Money DOES Grow on Trees! - Modular Save Edition
 */

import { createMatrixSprite, SPRITE_CONFIGS } from './modules/sprites.js';
import { SoundEngine } from './modules/sound.js';
import { UI } from './modules/ui.js';
import { HighResTree } from './modules/tree.js';
import { PestBug } from './modules/pest.js';
import { Config } from './modules/config.js';

const SPRITES = {
  player: createMatrixSprite(SPRITE_CONFIGS.player, 2.8),
  bee: createMatrixSprite(SPRITE_CONFIGS.bee, 2.5),
  dog: createMatrixSprite(SPRITE_CONFIGS.dog, 2.5),
  cart: createMatrixSprite(SPRITE_CONFIGS.cart, 2.8),
  bug: createMatrixSprite(SPRITE_CONFIGS.bug, 2.2),
  cashBundle: createMatrixSprite(SPRITE_CONFIGS.cashBundle, 2.8),
  tree_dollar: createMatrixSprite(SPRITE_CONFIGS.tree_dollar, 4.2),
  tree_gold: createMatrixSprite(SPRITE_CONFIGS.tree_gold, 4.2),
  tree_emerald: createMatrixSprite(SPRITE_CONFIGS.tree_emerald, 4.2),
  tree_ruby: createMatrixSprite(SPRITE_CONFIGS.tree_ruby, 4.2)
};

const sounds = new SoundEngine();

const GAME = {
  money: Config.STARTER_MONEY,
  keys: 0,
  stats: {
    harvestCount: 0,
    totalEarned: 0,
    pestsSquished: 0,
    contractsCompleted: 0,
    fusionsDone: 0,
    treesUnlocked: 4
  },
  activePet: null,
  activeRelic: null,
  viewport: { x: 0, y: 0, w: window.innerWidth, h: window.innerHeight }
};

const UPGRADES = JSON.parse(JSON.stringify(Config.UPGRADES));
const ACHIEVEMENTS = JSON.parse(JSON.stringify(Config.ACHIEVEMENTS));
const MARKET = JSON.parse(JSON.stringify(Config.MARKET));

const DAY_NIGHT = { time: 0, duration: 60, isNight: false };
const particles = [];
const floatingTexts = [];
const flyingItems = [];
const groundMoney = [];
let pests = [];
let trees;

const ui = new UI(GAME, UPGRADES, ACHIEVEMENTS);

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const keys = {};

const player = { x: Config.WORLD.width / 2, y: Config.WORLD.height / 2, baseSpeed: 240, baseCap: 8, stack: [], walkCycle: 0, moving: false };
GAME.player = player;

const petEntity = { x: player.x, y: player.y };

const dropBank = { ...Config.ZONES.dropBank };
const cargoDock = { ...Config.ZONES.cargoDock };
const geneLab = { ...Config.ZONES.geneLab };
let dropTimer = 0;
let comboPitch = 1.0;

let CONTRACT = { ...Config.DEFAULT_CONTRACT };

function loadGame() {
  try {
    const save = localStorage.getItem(Config.SAVE_KEY);
    if (!save) return;
    const data = JSON.parse(save);
    if (data.money !== undefined) GAME.money = data.money;
    if (data.keys !== undefined) GAME.keys = data.keys;
    if (data.stats) Object.assign(GAME.stats, data.stats);
    if (data.activePet) GAME.activePet = data.activePet;
    if (data.activeRelic) GAME.activeRelic = data.activeRelic;
    if (data.upgrades) {
      Object.keys(data.upgrades).forEach(k => { if (UPGRADES[k]) UPGRADES[k].level = data.upgrades[k]; });
    }
    if (data.trees && trees) {
      trees.forEach((t, i) => {
        if (data.trees[i]) {
          t.unlocked = data.trees[i].unlocked;
          t.progress = data.trees[i].progress || 0;
        }
      });
    }
    if (data.contract) CONTRACT = { ...data.contract };
  } catch (e) {
    console.warn('Save load failed', e);
  }
}

function saveGame(force = false) {
  try {
    const data = {
      money: GAME.money,
      keys: GAME.keys,
      stats: GAME.stats,
      activePet: GAME.activePet,
      activeRelic: GAME.activeRelic,
      upgrades: Object.fromEntries(Object.keys(UPGRADES).map(k => [k, UPGRADES[k].level])),
      trees: trees ? trees.map(t => ({ unlocked: t.unlocked, progress: t.progress })) : [],
      contract: CONTRACT
    };
    localStorage.setItem(Config.SAVE_KEY, JSON.stringify(data));
    if (force) {
      const toast = document.createElement('div');
      toast.className = 'cant-afford-flash';
      toast.style.background = '#16a34a';
      toast.innerText = '💾 Game saved';
      document.body.appendChild(toast);
      setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 400); }, 1000);
    }
  } catch (e) {
    console.warn('Save failed', e);
  }
}

function spawnParticle(x, y, color) {
  for (let i = 0; i < 8; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 160,
      vy: (Math.random() - 0.5) * 160,
      life: 0.4 + Math.random() * 0.4,
      color
    });
  }
}

function addFloatingText(x, y, text, color = '#15803d') {
  floatingTexts.push({ x, y, text, color, alpha: 1.0, vy: -40, life: 1.0 });
}

function updateParticlesAndText(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    if (p.life <= 0) particles.splice(i, 1);
  }

  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i];
    ft.y += ft.vy * dt;
    ft.alpha -= dt * 0.9;
    ft.life -= dt;
    if (ft.life <= 0) floatingTexts.splice(i, 1);
  }
}

function drawParticlesAndText(ctx) {
  particles.forEach(p => {
    const sx = p.x - GAME.viewport.x;
    const sy = p.y - GAME.viewport.y;
    ctx.fillStyle = p.color;
    ctx.fillRect(sx, sy, 5, 5);
  });

  floatingTexts.forEach(ft => {
    const sx = ft.x - GAME.viewport.x;
    const sy = ft.y - GAME.viewport.y;
    ctx.save();
    ctx.globalAlpha = Math.max(0, ft.alpha);
    ctx.fillStyle = ft.color;
    ctx.font = 'bold 16px Inter, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(ft.text, sx, sy);
    ctx.restore();
  });
}

function updateDayNight(dt) {
  DAY_NIGHT.time = (DAY_NIGHT.time + dt) % DAY_NIGHT.duration;
  const progress = DAY_NIGHT.time / DAY_NIGHT.duration;
  DAY_NIGHT.isNight = progress > 0.6;
  document.getElementById('day-display').innerText = DAY_NIGHT.isNight ? '🌙 TWILIGHT (2x)' : '☀️ SUNNY DAY';
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  GAME.viewport.w = window.innerWidth;
  GAME.viewport.h = window.innerHeight;
}

function randomizeContract() {
  const types = ['dollar', 'gold', 'emerald', 'ruby'];
  const type = types[Math.floor(Math.random() * types.length)];
  const needed = 4 + Math.floor(Math.random() * 9);
  const rewardCash = needed * (60 + Math.floor(Math.random() * 100));
  const rewardKeys = 1 + Math.floor(Math.random() * 3);
  CONTRACT = { active: true, type, needed, delivered: 0, rewardCash, rewardKeys };
}

function spawnFlyingItem(startX, startY, targetX, targetY, item, onArrive) {
  flyingItems.push({ startX, startY, targetX, targetY, x: startX, y: startY, progress: 0, item, onArrive });
}

function updateFlyingItems(dt) {
  for (let i = flyingItems.length - 1; i >= 0; i--) {
    const f = flyingItems[i];
    f.progress += dt * 3.8;

    if (f.progress >= 1.0) {
      if (f.onArrive) f.onArrive();
      flyingItems.splice(i, 1);
    } else {
      const t = f.progress;
      const height = Math.sin(t * Math.PI) * 90;
      f.x = f.startX + (f.targetX - f.startX) * t;
      f.y = f.startY + (f.targetY - f.startY) * t - height;
    }
  }
}

function drawFlyingItems(ctx) {
  flyingItems.forEach(f => {
    const sx = f.x - GAME.viewport.x;
    const sy = f.y - GAME.viewport.y;
    ctx.drawImage(SPRITES.cashBundle, sx - 12, sy - 8);
  });
}

function drawDropPad(zone, iconStr, pulse) {
  const sx = zone.x - GAME.viewport.x;
  const sy = zone.y - GAME.viewport.y;

  ctx.save();
  ctx.strokeStyle = zone.color;
  ctx.lineWidth = 4;
  ctx.setLineDash([10, 8]);
  ctx.lineDashOffset = -pulse * 20;
  ctx.beginPath();
  ctx.arc(sx, sy, zone.radius + Math.sin(pulse * 3) * 4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = zone.color + '22';
  ctx.beginPath();
  ctx.arc(sx, sy, zone.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = zone.color;
  ctx.font = '900 13px Inter, system-ui';
  ctx.textAlign = 'center';
  ctx.fillText(`${iconStr} ${zone.name}`, sx, sy - 10);
  ctx.font = '800 10px Inter, system-ui';
  ctx.fillText('▼ STAND HERE TO DEPOSIT ▼', sx, sy + 14);
}

function drawMinimap() {
  const mapW = 200;
  const aspect = Config.WORLD.height / Config.WORLD.width;
  const mapH = mapW * aspect;
  const padding = 16;
  const isMobile = window.innerWidth < 768;
  const mapX = canvas.width - mapW - padding;
  const mapY = isMobile ? 100 : canvas.height - mapH - padding;

  ctx.save();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
  ctx.strokeStyle = '#4ade80';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(mapX - 6, mapY - 22, mapW + 12, mapH + 28, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#15803d';
  ctx.font = '900 11px Inter, system-ui';
  ctx.textAlign = 'left';
  ctx.fillText('🗺️ GPS RADAR MAP', mapX, mapY - 7);

  ctx.fillStyle = '#dcfce7';
  ctx.fillRect(mapX, mapY, mapW, mapH);
  ctx.strokeStyle = '#86efac';
  ctx.lineWidth = 1;
  ctx.strokeRect(mapX, mapY, mapW, mapH);

  const scaleX = mapW / Config.WORLD.width;
  const scaleY = mapH / Config.WORLD.height;

  [dropBank, cargoDock, geneLab].forEach(zone => {
    ctx.fillStyle = zone.color + '44';
    ctx.beginPath();
    ctx.arc(mapX + zone.x * scaleX, mapY + zone.y * scaleY, zone.radius * scaleX, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = zone.color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });

  trees.forEach(t => {
    const tx = mapX + t.x * scaleX;
    const ty = mapY + t.y * scaleY;

    if (t.unlocked) {
      const colors = { dollar: '#16a34a', gold: '#eab308', emerald: '#10b981', ruby: '#f43f5e' };
      ctx.fillStyle = colors[t.type] || '#16a34a';
      ctx.beginPath();
      ctx.arc(tx, ty, 3.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(tx, ty, 5.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '8px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔒', tx, ty);
    }
  });

  groundMoney.forEach(m => {
    ctx.fillStyle = '#eab308';
    ctx.fillRect(mapX + m.x * scaleX - 1, mapY + m.y * scaleY - 1, 2.5, 2.5);
  });

  pests.forEach(p => {
    if (p.active) {
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(mapX + p.x * scaleX - 1.5, mapY + p.y * scaleY - 1.5, 3, 3);
    }
  });

  const vpX = mapX + GAME.viewport.x * scaleX;
  const vpY = mapY + GAME.viewport.y * scaleY;
  const vpW = canvas.width * scaleX;
  const vpH = canvas.height * scaleY;

  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 1.5;
  ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
  ctx.fillRect(vpX, vpY, vpW, vpH);
  ctx.strokeRect(vpX, vpY, vpW, vpH);

  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(mapX + player.x * scaleX, mapY + player.y * scaleY, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(mapX + player.x * scaleX, mapY + player.y * scaleY, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function createEntities() {
  trees = Config.TREES.map(t => new HighResTree(t.x, t.y, t.type, t.unlocked, t.unlockCost, SPRITES, GAME, UPGRADES, sounds, spawnParticle, addFloatingText, groundMoney, updateHUD, checkAchievements));
  pests = [];
  Config.PESTS.forEach(p => pests.push(new PestBug(p.x, p.y, player, GAME, sounds, spawnParticle, addFloatingText, checkAchievements)));
}

createEntities();

function checkAchievements() {
  ACHIEVEMENTS.forEach(ach => {
    if (!ach.unlocked && GAME.stats[ach.stat] >= ach.goal) {
      ach.unlocked = true;
      sounds.playAchievement();
      ui.showToast(ach.name);
      ui.renderAchievementsList();
    }
  });
}

function updateFallingMoney(dt) {
  for (let i = groundMoney.length - 1; i >= 0; i--) {
    const m = groundMoney[i];

    if (!m.isGrounded) {
      m.vy += 380 * dt;
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      m.rotation += m.rotSpeed * dt;

      if (m.y >= m.groundY) {
        m.y = m.groundY;
        if (m.bounceCount < 1) {
          m.vy = -m.vy * 0.4;
          m.vx *= 0.5;
          m.bounceCount++;
        } else {
          m.isGrounded = true;
          m.vy = 0;
          m.vx = 0;
        }
      }
    }

    const dist = Math.hypot(player.x - m.x, player.y - m.y);
    const maxCap = player.baseCap + (UPGRADES.capacity.level - 1) * 2 + (GAME.activePet === 'cart' ? 8 : 0);

    if (dist < 42 && player.stack.length < maxCap) {
      player.stack.push({ type: m.type, value: m.value });
      GAME.stats.harvestCount++;
      spawnParticle(m.x, m.y, '#86efac');
      addFloatingText(m.x, m.y - 20, `+$${m.value} 💵`, '#16a34a');
      sounds.playPickup();
      groundMoney.splice(i, 1);
      checkAchievements();
    }
  }
}

function drawGroundMoney(ctx) {
  groundMoney.forEach(m => {
    const sx = m.x - GAME.viewport.x;
    const sy = m.y - GAME.viewport.y;
    if (sx < -40 || sx > canvas.width + 40 || sy < -40 || sy > canvas.height + 40) return;

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(m.rotation);
    ctx.drawImage(SPRITES.cashBundle, -12, -8);
    ctx.restore();
  });
}

function tickMarketRates(dt) {
  MARKET.timer -= dt;
  if (MARKET.timer <= 0) {
    MARKET.timer = 12;
    Object.keys(MARKET).forEach(k => {
      if (k === 'timer') return;
      const oldVal = MARKET[k].val;
      const newVal = +(0.6 + Math.random() * 1.8).toFixed(1);
      const changePct = Math.round(((newVal - oldVal) / oldVal) * 100);
      MARKET[k].val = newVal;
      MARKET[k].change = changePct;
    });
    ui.updateStockTicker(MARKET);
  }
}

function updateHUD() {
  document.getElementById('money-display').innerText = `$${GAME.money.toLocaleString()}`;
  document.getElementById('keys-display').innerText = `🔑 ${GAME.keys}`;
}

function getMoveInput() {
  let moveX = 0, moveY = 0;
  if (keys['w'] || keys['arrowup']) moveY -= 1;
  if (keys['s'] || keys['arrowdown']) moveY += 1;
  if (keys['a'] || keys['arrowleft']) moveX -= 1;
  if (keys['d'] || keys['arrowright']) moveX += 1;

  if (touchInput.active) {
    const dx = touchInput.currentX - touchInput.startX;
    const dy = touchInput.currentY - touchInput.startY;
    const d = Math.hypot(dx, dy);
    if (d > 10) {
      moveX = dx / d;
      moveY = dy / d;
    }
  }
  return { moveX, moveY };
}

function update(dt, pulse) {
  tickMarketRates(dt);
  updateDayNight(dt);
  updateParticlesAndText(dt);
  updateFlyingItems(dt);
  updateFallingMoney(dt);

  let moveSpeed = player.baseSpeed * (1 + (UPGRADES.speed.level - 1) * 0.15);
  if (GAME.activeRelic === 'boots') moveSpeed *= 1.3;

  const { moveX, moveY } = getMoveInput();
  const len = Math.hypot(moveX, moveY);
  player.moving = len > 0;
  if (player.moving) {
    player.x += (moveX / len) * moveSpeed * dt;
    player.y += (moveY / len) * moveSpeed * dt;
    player.walkCycle += dt * 12;
  } else {
    player.walkCycle = 0;
  }

  player.x = Math.max(40, Math.min(Config.WORLD.width - 40, player.x));
  player.y = Math.max(40, Math.min(Config.WORLD.height - 40, player.y));

  GAME.viewport.x = Math.max(0, Math.min(Config.WORLD.width - canvas.width, player.x - canvas.width / 2));
  GAME.viewport.y = Math.max(0, Math.min(Config.WORLD.height - canvas.height, player.y - canvas.height / 2));

  petEntity.x += (player.x - 35 - petEntity.x) * 0.1;
  petEntity.y += (player.y - 25 - petEntity.y) * 0.1;

  trees.forEach(tree => tree.update(dt));

  // Bee auto-harvest + Tome growth already applied in tree.update
  if (GAME.activePet === 'bee') {
    for (let i = groundMoney.length - 1; i >= 0; i--) {
      const m = groundMoney[i];
      if (m.isGrounded && Math.hypot(petEntity.x - m.x, petEntity.y - m.y) < 80) {
        const maxCap = player.baseCap + (UPGRADES.capacity.level - 1) * 2 + (GAME.activePet === 'cart' ? 8 : 0);
        if (player.stack.length < maxCap) {
          player.stack.push({ type: m.type, value: m.value });
          GAME.stats.harvestCount++;
          spawnParticle(m.x, m.y, '#86efac');
          addFloatingText(m.x, m.y - 20, `+$${m.value} 💵`, '#16a34a');
          sounds.playPickup();
          groundMoney.splice(i, 1);
          checkAchievements();
        }
      }
    }
  }

  dropTimer -= dt;
  const unloadInterval = Math.max(0.03, 0.09 - (UPGRADES.unloadSpeed.level - 1) * 0.015);

  if (dropTimer <= 0) {
    if (Math.hypot(player.x - dropBank.x, player.y - dropBank.y) < dropBank.radius && player.stack.length > 0) {
      dropTimer = unloadInterval;
      const item = player.stack.pop();
      comboPitch = Math.min(2.0, comboPitch + 0.05);
      sounds.playPop(comboPitch);

      spawnFlyingItem(player.x, player.y - 20, dropBank.x, dropBank.y, item, () => {
        let multiplier = (MARKET[item.type] ? MARKET[item.type].val : 1.0);
        multiplier *= (1 + (UPGRADES.valueBoost.level - 1) * 0.25);
        if (DAY_NIGHT.isNight) multiplier *= 2.0;
        if (GAME.activeRelic === 'sickle') multiplier *= 1.25;

        const cashValue = Math.floor(item.value * multiplier);
        GAME.money += cashValue;
        GAME.stats.totalEarned += cashValue;
        spawnParticle(dropBank.x, dropBank.y, '#fde047');
        addFloatingText(dropBank.x, dropBank.y - 20, `+$${cashValue}`, '#ca8a04');
        sounds.playCash();
        updateHUD();
        checkAchievements();
      });
    }
    else if (Math.hypot(player.x - cargoDock.x, player.y - cargoDock.y) < cargoDock.radius && player.stack.length > 0 && CONTRACT.active) {
      const itemIdx = player.stack.findIndex(i => i.type === CONTRACT.type);
      if (itemIdx !== -1) {
        dropTimer = unloadInterval;
        const item = player.stack.splice(itemIdx, 1)[0];
        comboPitch = Math.min(2.0, comboPitch + 0.05);
        sounds.playPop(comboPitch);

        spawnFlyingItem(player.x, player.y - 20, cargoDock.x, cargoDock.y, item, () => {
          CONTRACT.delivered++;
          sounds.playCash();
          addFloatingText(cargoDock.x, cargoDock.y - 20, `EXPORT +1`, '#0284c7');
          if (CONTRACT.delivered >= CONTRACT.needed) {
            GAME.money += CONTRACT.rewardCash;
            GAME.keys += CONTRACT.rewardKeys;
            GAME.stats.contractsCompleted++;
            addFloatingText(cargoDock.x, cargoDock.y - 40, `COMPLETE! +$${CONTRACT.rewardCash} +${CONTRACT.rewardKeys}🔑`, '#0284c7');
            sounds.playAchievement();
            checkAchievements();
            updateHUD();
            randomizeContract();
          }
        });
      }
    }
    else if (Math.hypot(player.x - geneLab.x, player.y - geneLab.y) < geneLab.radius && player.stack.length >= 2) {
      dropTimer = 0.15;
      const item1 = player.stack.pop();
      const item2 = player.stack.pop();
      sounds.playPop(1.5);

      const canFuse = item1.type === item2.type;
      const fusedValue = canFuse ? Math.floor((item1.value + item2.value) * 1.5) : Math.floor((item1.value + item2.value) * 0.8);

      spawnFlyingItem(player.x, player.y - 20, geneLab.x, geneLab.y, item1, () => {
        player.stack.push({ type: 'diamond', value: fusedValue });
        GAME.stats.fusionsDone++;
        spawnParticle(geneLab.x, geneLab.y, '#c084fc');
        addFloatingText(geneLab.x, geneLab.y - 20, canFuse ? 'GENE FUSION! ✨' : 'MIXED FUSION', '#9333ea');
        sounds.playAchievement();
        checkAchievements();
      });
    } else {
      comboPitch = 1.0;
    }
  }

  pests.forEach(p => p.update());
}

function render(pulse) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#86efac';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const startTileX = Math.floor(GAME.viewport.x / 100) * 100;
  const startTileY = Math.floor(GAME.viewport.y / 100) * 100;

  for (let x = startTileX; x < GAME.viewport.x + canvas.width + 100; x += 100) {
    for (let y = startTileY; y < GAME.viewport.y + canvas.height + 100; y += 100) {
      const sx = x - GAME.viewport.x;
      const sy = y - GAME.viewport.y;

      ctx.fillStyle = '#4ade80';
      ctx.fillRect(sx, sy, 96, 96);

      if ((x + y) % 300 === 0) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(sx + 30, sy + 30, 6, 6);
        ctx.fillStyle = '#fde047';
        ctx.fillRect(sx + 32, sy + 32, 2, 2);
      }
    }
  }

  drawDropPad(dropBank, '🏛️', pulse);
  drawDropPad(cargoDock, '🚢', pulse);
  drawDropPad(geneLab, '🧬', pulse);

  trees.forEach(t => t.draw(ctx, GAME.viewport, canvas, player));
  drawGroundMoney(ctx);
  pests.forEach(p => p.draw(ctx, GAME.viewport));
  drawParticlesAndText(ctx);
  drawFlyingItems(ctx);

  if (GAME.activePet) {
    const px = petEntity.x - GAME.viewport.x;
    const py = petEntity.y - GAME.viewport.y;
    const sprite = SPRITES[GAME.activePet];
    if (sprite) ctx.drawImage(sprite, px - 12, py - 12);
  }

  const sx = player.x - GAME.viewport.x;
  const sy = player.y - GAME.viewport.y;
  const walkBob = Math.sin(player.walkCycle) * 3;

  ctx.drawImage(SPRITES.player, sx - SPRITES.player.width / 2, sy - SPRITES.player.height / 2 + walkBob);

  player.stack.forEach((st, idx) => {
    const stackWobble = player.moving ? Math.sin(player.walkCycle + idx * 0.5) * 4 : 0;
    const stackY = sy - 28 - (idx * 12) + walkBob;
    ctx.drawImage(SPRITES.cashBundle, sx - 14 + stackWobble, stackY);
  });

  if (DAY_NIGHT.isNight) {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  drawMinimap();
}

const touchInput = { active: false, startX: 0, startY: 0, currentX: 0, currentY: 0 };

function setupInput() {
  window.addEventListener('resize', () => {
    resizeCanvas();
    ui.renderUpgradesList();
    ui.renderPetsList();
    ui.renderRelicsList();
  });

  document.getElementById('btn-fullscreen').onclick = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  document.getElementById('music-toggle').onclick = () => {
    sounds.sfxMuted = !sounds.sfxMuted;
    document.getElementById('music-toggle').innerText = sounds.sfxMuted ? '🔇 Muted' : '🔊 Sound';
  };

  window.addEventListener('keydown', e => {
    sounds.init();
    keys[e.key.toLowerCase()] = true;
    if (e.key === 'Escape') ui.closeModals();
    if (e.ctrlKey && e.key.toLowerCase() === 's') {
      e.preventDefault();
      saveGame(true);
    }
  });
  window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    sounds.init();
    touchInput.active = true;
    touchInput.startX = e.touches[0].clientX;
    touchInput.startY = e.touches[0].clientY;
    touchInput.currentX = e.touches[0].clientX;
    touchInput.currentY = e.touches[0].clientY;
  }, { passive: false });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    touchInput.currentX = e.touches[0].clientX;
    touchInput.currentY = e.touches[0].clientY;
  }, { passive: false });

  canvas.addEventListener('touchend', e => {
    e.preventDefault();
    touchInput.active = false;
  }, { passive: false });

  window.addEventListener('beforeunload', () => saveGame());
}

window.buyUpgrade = function(key) {
  const u = UPGRADES[key];
  if (u.level >= u.max) return;
  const cost = Math.floor(u.baseCost * Math.pow(u.costMult, u.level - 1));
  if (GAME.money >= cost) {
    GAME.money -= cost;
    u.level++;
    sounds.playUpgrade();
    updateHUD();
    ui.renderUpgradesList();
    saveGame();
  } else {
    ui.flashCantAfford();
  }
};

window.equipRelic = function(id, cost) {
  if (GAME.activeRelic === id) return;
  if (GAME.keys >= cost) {
    GAME.keys -= cost;
    GAME.activeRelic = id;
    updateHUD();
    ui.renderRelicsList();
    saveGame();
  } else {
    ui.flashCantAfford();
  }
};

window.adoptPet = function(id, cost) {
  if (GAME.activePet === id) return;
  if (GAME.money >= cost) {
    GAME.money -= cost;
    GAME.activePet = id;
    updateHUD();
    ui.renderPetsList();
    saveGame();
  } else {
    ui.flashCantAfford();
  }
};

ui.bindButtons();
window.closeModals = () => ui.closeModals();

loadGame();
resizeCanvas();
setupInput();
ui.updateStockTicker(MARKET);
let last = performance.now();
let pulse = 0;

function loop(now) {
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now;
  pulse += dt;
  update(dt, pulse);
  render(pulse);
  if (Math.random() < 0.02) saveGame();
  requestAnimationFrame(loop);
}

updateHUD();
ui.renderUpgradesList();
ui.renderAchievementsList();
ui.renderRelicsList();
ui.renderPetsList();
requestAnimationFrame(loop);
