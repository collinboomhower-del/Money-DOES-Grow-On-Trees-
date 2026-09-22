export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.sfxMuted = false;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } else if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, type, gainVal, dur) {
    if (!this.ctx || this.sfxMuted) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + dur);
    } catch (e) {}
  }

  playPop(multiplier = 1.0) { this.playTone(380 * multiplier, 'sine', 0.12, 0.06); }
  playPickup() { this.playTone(580, 'triangle', 0.1, 0.08); }
  playCash() {
    this.playTone(880, 'sine', 0.1, 0.08);
    setTimeout(() => this.playTone(1320, 'sine', 0.1, 0.12), 60);
  }
  playSquish() { this.playTone(130, 'sawtooth', 0.15, 0.1); }
  playUpgrade() {
    this.playTone(523, 'triangle', 0.12, 0.1);
    setTimeout(() => this.playTone(659, 'triangle', 0.12, 0.1), 80);
    setTimeout(() => this.playTone(783, 'triangle', 0.12, 0.15), 160);
  }
  playAchievement() {
    if (!this.ctx) return;
    [523, 659, 783, 1046].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'square', 0.1, 0.15), i * 80);
    });
  }
}
