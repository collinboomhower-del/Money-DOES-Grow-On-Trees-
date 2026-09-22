export class UI {
  constructor(GAME, UPGRADES, ACHIEVEMENTS) {
    this.GAME = GAME;
    this.UPGRADES = UPGRADES;
    this.ACHIEVEMENTS = ACHIEVEMENTS;
    this.callbacks = {};
  }

  setCallbacks(callbacks) { this.callbacks = callbacks; }

  bindButtons() {
    document.getElementById('btn-upgrades').onclick = () => {
      this.renderUpgradesList();
      document.getElementById('modal-upgrades').style.display = 'flex';
    };
    document.getElementById('btn-achievements').onclick = () => {
      this.renderAchievementsList();
      document.getElementById('modal-achievements').style.display = 'flex';
    };
    document.getElementById('btn-relics').onclick = () => {
      this.renderRelicsList();
      document.getElementById('modal-relics').style.display = 'flex';
    };
    document.getElementById('btn-pets').onclick = () => {
      this.renderPetsList();
      document.getElementById('modal-pets').style.display = 'flex';
    };

    document.querySelectorAll('.modal-overlay').forEach(m => {
      m.addEventListener('click', e => {
        if (e.target === m) this.closeModals();
      });
    });

    document.querySelectorAll('.btn-close').forEach(b => {
      b.setAttribute('aria-label', 'Close modal');
    });
  }

  closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
  }

  flashCantAfford() {
    const flash = document.createElement('div');
    flash.className = 'cant-afford-flash';
    flash.innerText = '💸 Can\'t afford that!';
    document.body.appendChild(flash);
    setTimeout(() => { flash.style.opacity = '0'; setTimeout(() => flash.remove(), 400); }, 800);
  }

  showToast(text) {
    const toast = document.getElementById('achievement-toast');
    document.getElementById('toast-text').innerText = text;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3200);
  }

  updateStockTicker(MARKET) {
    const track = document.getElementById('ticker-track');
    if (!track) return;

    const items = [
      { name: '💵 DOLLAR TREE', key: 'dollar' },
      { name: '🪙 GOLD OAK', key: 'gold' },
      { name: '💎 EMERALD PALM', key: 'emerald' },
      { name: '🔴 RUBY WILLOW', key: 'ruby' },
      { name: '✨ DIAMOND HYBRID', key: 'diamond' }
    ];

    let html = '';
    for (let loop = 0; loop < 2; loop++) {
      items.forEach(item => {
        const m = MARKET[item.key];
        const isUp = m.change >= 0;
        const trendClass = isUp ? 'trend-up' : 'trend-down';
        const arrow = isUp ? '▲' : '▼';
        html += `
          <div class="ticker-item">
            <span>${item.name}:</span>
            <span class="ticker-badge ${trendClass}">${m.val.toFixed(1)}x (${arrow} ${Math.abs(m.change)}%)</span>
          </div>
        `;
      });
    }
    track.innerHTML = html;
  }

  effectText(key) {
    const u = this.UPGRADES[key];
    switch (key) {
      case 'speed': return `Speed +${(15 * (u.level - 1))}% → +${(15 * u.level)}%`;
      case 'capacity': return `Capacity ${8 + (u.level - 1) * 2} → ${8 + u.level * 2}`;
      case 'growth': return `Growth +${(20 * (u.level - 1))}% → +${(20 * u.level)}%`;
      case 'unloadSpeed': return `Deposit interval ${(0.09 - (u.level - 1) * 0.015).toFixed(3)}s`;
      case 'valueBoost': return `Sell value +${(25 * (u.level - 1))}% → +${(25 * u.level)}%`;
      default: return '';
    }
  }

  renderUpgradesList() {
    const list = document.getElementById('upgrades-list');
    list.innerHTML = Object.keys(this.UPGRADES).map(key => {
      const u = this.UPGRADES[key];
      const cost = Math.floor(u.baseCost * Math.pow(u.costMult, u.level - 1));
      const isMax = u.level >= u.max;
      const canAfford = this.GAME.money >= cost;
      return `
        <div class="card-item ${isMax ? 'unlocked' : ''}">
          <div class="card-title">${u.name} <span style="font-size:0.78rem; color:#16a34a;">(Lvl ${u.level}/${u.max})</span></div>
          <div class="card-desc">${u.desc}</div>
          <div class="card-desc" style="color:#9333ea;font-weight:800;">${this.effectText(key)}</div>
          <button class="btn-ui ${!canAfford && !isMax ? 'disabled' : ''}" style="margin-top:8px;" onclick="buyUpgrade('${key}')" ${isMax ? 'disabled' : ''} aria-label="Upgrade ${u.name}">
            ${isMax ? 'MAXED OUT' : `Upgrade ($${cost.toLocaleString()})`}
          </button>
        </div>
      `;
    }).join('');
  }

  renderAchievementsList() {
    const list = document.getElementById('achievements-list');
    list.innerHTML = this.ACHIEVEMENTS.map(a => `
      <div class="card-item ${a.unlocked ? 'unlocked' : ''}">
        <div class="card-title">${a.unlocked ? '🏆' : '🔒'} ${a.name}</div>
        <div class="card-desc">${a.desc}</div>
        <div class="card-desc" style="color: #16a34a; font-weight:800;">Progress: ${this.GAME.stats[a.stat]}/${a.goal}</div>
      </div>
    `).join('');
  }

  renderRelicsList() {
    const list = document.getElementById('relics-list');
    const relics = [
      { id: 'sickle', name: 'Golden Sickle', desc: '+25% Harvest Yield', cost: 2 },
      { id: 'tome', name: 'Fertilizer Tome', desc: '+35% Growth Speed', cost: 4 },
      { id: 'boots', name: 'Hermes Boots', desc: '+30% Player Speed', cost: 5 }
    ];
    list.innerHTML = relics.map(r => {
      const canAfford = this.GAME.keys >= r.cost;
      return `
        <div class="card-item ${this.GAME.activeRelic === r.id ? 'unlocked' : ''}">
          <div class="card-title">👑 ${r.name}</div>
          <div class="card-desc">${r.desc}</div>
          <button class="btn-ui ${this.GAME.activeRelic === r.id ? '' : (canAfford ? '' : 'disabled')}" style="margin-top:8px" onclick="equipRelic('${r.id}', ${r.cost})" ${this.GAME.activeRelic === r.id ? 'disabled' : ''} aria-label="Equip ${r.name}">
            ${this.GAME.activeRelic === r.id ? 'EQUIPPED' : `Equip (🔑 ${r.cost})`}
          </button>
        </div>
      `;
    }).join('');
  }

  renderPetsList() {
    const list = document.getElementById('pets-list');
    const pets = [
      { id: 'bee', name: 'Golden Bee', desc: 'Auto-harvests nearby fallen cash', cost: 400 },
      { id: 'dog', name: 'Lumber Dog', desc: 'Picks up nearby fallen cash automatically', cost: 800 },
      { id: 'cart', name: 'Hover Cart', desc: '+8 Carrying Stack Capacity', cost: 1500 }
    ];
    list.innerHTML = pets.map(p => {
      const canAfford = this.GAME.money >= p.cost;
      return `
        <div class="card-item ${this.GAME.activePet === p.id ? 'unlocked' : ''}">
          <div class="card-title">🐶 ${p.name}</div>
          <div class="card-desc">${p.desc}</div>
          <button class="btn-ui ${this.GAME.activePet === p.id ? '' : (canAfford ? '' : 'disabled')}" style="margin-top:8px" onclick="adoptPet('${p.id}', ${p.cost})" ${this.GAME.activePet === p.id ? 'disabled' : ''} aria-label="Adopt ${p.name}">
            ${this.GAME.activePet === p.id ? 'ACTIVE' : `Adopt ($${p.cost})`}
          </button>
        </div>
      `;
    }).join('');
  }
}
