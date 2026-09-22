export class PestBug {
  constructor(x, y, player, GAME, sounds, spawnParticle, addFloatingText, checkAchievements) {
    this.x = x;
    this.y = y;
    this.active = true;
    this.player = player;
    this.GAME = GAME;
    this.sounds = sounds;
    this.spawnParticle = spawnParticle;
    this.addFloatingText = addFloatingText;
    this.checkAchievements = checkAchievements;
  }

  update() {
    const dist = Math.hypot(this.player.x - this.x, this.player.y - this.y);
    if (dist < 35 && this.active) {
      this.active = false;
      this.GAME.stats.pestsSquished++;
      this.GAME.money += 75;
      this.spawnParticle(this.x, this.y, '#f43f5e');
      this.addFloatingText(this.x, this.y, '+$75', '#f43f5e');
      this.sounds.playSquish();
      this.checkAchievements();
    }
  }

  draw(ctx, viewport) {
    if (!this.active) return;
    const sx = this.x - viewport.x;
    const sy = this.y - viewport.y;
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(sx - 6, sy - 6, 12, 12);
  }
}
