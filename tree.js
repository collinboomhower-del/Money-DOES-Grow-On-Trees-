export class HighResTree {
  constructor(x, y, type, unlocked, unlockCost, sprites, GAME, UPGRADES, sounds, spawnParticle, addFloatingText, groundMoney, updateHUD, checkAchievements) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.unlocked = unlocked;
    this.unlockCost = unlockCost;
    this.progress = Math.random() * 50;
    this.shakeTimer = 0;
    this.sprites = sprites;
    this.GAME = GAME;
    this.UPGRADES = UPGRADES;
    this.sounds = sounds;
    this.spawnParticle = spawnParticle;
    this.addFloatingText = addFloatingText;
    this.groundMoney = groundMoney;
    this.updateHUD = updateHUD;
    this.checkAchievements = checkAchievements;
  }

  update(dt) {
    if (!this.unlocked) {
      const dist = Math.hypot(this.GAME.player.x - this.x, this.GAME.player.y - this.y);
      if (dist < 60) {
        if (this.GAME.money >= this.unlockCost) {
          this.GAME.money -= this.unlockCost;
          this.unlocked = true;
          this.GAME.stats.treesUnlocked++;
          this.sounds.playUpgrade();
          this.spawnParticle(this.x, this.y, '#facc15');
          this.addFloatingText(this.x, this.y - 40, 'UNLOCKED! 🌳', '#16a34a');
          this.updateHUD();
          this.checkAchievements();
        }
      }
      return;
    }

    if (this.shakeTimer > 0) this.shakeTimer -= dt * 10;

    let speed = 25 * (1 + (this.UPGRADES.growth.level - 1) * 0.2);
    if (this.GAME.activeRelic === 'tome') speed *= 1.35;

    this.progress += dt * speed;
    if (this.progress >= 100) {
      this.progress = 0;
      this.spawnMoneyFall();
      this.shakeTimer = 1.0;
    }
  }

  spawnMoneyFall() {
    const vals = { dollar: 15, gold: 45, emerald: 85, ruby: 150 };
    const offsetX = (Math.random() - 0.5) * 40;
    const startX = this.x + offsetX;
    const startY = this.y - 70;
    const groundY = this.y + 20 + (Math.random() - 0.5) * 20;

    this.groundMoney.push({
      x: startX,
      y: startY,
      groundY: groundY,
      vy: -50 - Math.random() * 30,
      vx: (Math.random() - 0.5) * 35,
      type: this.type,
      value: vals[this.type] || 20,
      rotation: Math.random() * Math.PI,
      rotSpeed: (Math.random() - 0.5) * 6,
      isGrounded: false,
      bounceCount: 0
    });
  }

  draw(ctx, viewport, canvas, player) {
    const sx = this.x - viewport.x;
    const sy = this.y - viewport.y;
    if (sx < -100 || sx > canvas.width + 100 || sy < -100 || sy > canvas.height + 100) return;

    const dist = Math.hypot(player.x - this.x, player.y - this.y);
    const isNear = dist < 70;

    if (!this.unlocked) {
      ctx.save();

      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.beginPath();
      ctx.ellipse(sx, sy + 20, 32, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 0.4;
      const spriteKey = `tree_${this.type}`;
      const sprite = this.sprites[spriteKey] || this.sprites.tree_dollar;
      ctx.drawImage(sprite, sx - sprite.width / 2, sy - sprite.height + 20);
      ctx.globalAlpha = 1.0;

      ctx.strokeStyle = isNear ? '#facc15' : '#ef4444';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(sx, sy + 10, 48, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = isNear ? '#ca8a04' : '#991b1b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(sx - 55, sy - 75, 110, 32, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = this.GAME.money >= this.unlockCost ? '#15803d' : '#b91c1c';
      ctx.font = '900 12px Inter, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`🔒 $${this.unlockCost.toLocaleString()}`, sx, sy - 54);

      if (isNear && this.GAME.money < this.unlockCost) {
        ctx.fillStyle = '#ef4444';
        ctx.font = '800 10px Inter, system-ui';
        ctx.fillText('NEED MORE CASH', sx, sy - 84);
      } else if (isNear) {
        ctx.fillStyle = '#16a34a';
        ctx.font = '800 10px Inter, system-ui';
        ctx.fillText('STAND TO UNLOCK!', sx, sy - 84);
      }

      ctx.restore();
      return;
    }

    const shakeX = this.shakeTimer > 0 ? Math.sin(this.shakeTimer * 20) * 3 : 0;

    ctx.fillStyle = 'rgba(21, 128, 61, 0.25)';
    ctx.beginPath();
    ctx.ellipse(sx, sy + 30, 28, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    const spriteKey = `tree_${this.type}`;
    const sprite = this.sprites[spriteKey] || this.sprites.tree_dollar;
    ctx.drawImage(sprite, sx - sprite.width / 2 + shakeX, sy - sprite.height + 20);
  }
}
