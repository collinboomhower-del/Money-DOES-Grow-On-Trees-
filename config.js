export const Config = {
  SAVE_KEY: 'money_grows_on_trees_save_v1',
  WORLD: { width: 3200, height: 2200 },
  STARTER_MONEY: 300,

  ZONES: {
    dropBank: { x: 1600, y: 1100, radius: 90, name: 'CASH VAULT', color: '#eab308' },
    cargoDock: { x: 300, y: 1100, radius: 90, name: 'EXPORT CARGO DOCK', color: '#0284c7' },
    geneLab: { x: 2900, y: 1100, radius: 90, name: 'GENE FUSION LAB', color: '#a855f7' }
  },

  DEFAULT_CONTRACT: { active: true, type: 'gold', needed: 8, delivered: 0, rewardCash: 2000, rewardKeys: 2 },

  UPGRADES: {
    speed: { level: 1, max: 10, baseCost: 50, costMult: 1.8, name: '⚡ Running Shoes', desc: '+15% Move speed per tier' },
    capacity: { level: 1, max: 10, baseCost: 75, costMult: 2.0, name: '🎒 Extra Backpack', desc: '+2 Stack capacity per tier' },
    growth: { level: 1, max: 10, baseCost: 100, costMult: 1.9, name: '🌱 Super Fertilizer', desc: '+20% Tree growth speed per tier' },
    unloadSpeed: { level: 1, max: 5, baseCost: 150, costMult: 2.2, name: '🧲 Vacuum Magnet', desc: 'Fast deposit speed at drop spots' },
    valueBoost: { level: 1, max: 10, baseCost: 200, costMult: 2.5, name: '💎 Cash Polish', desc: '+25% Cash sell values per tier' }
  },

  ACHIEVEMENTS: [
    { id: 'harvest_1', name: 'First Cash Harvest', desc: 'Pick up 1 fallen bill from a tree', goal: 1, stat: 'harvestCount', unlocked: false },
    { id: 'earn_1000', name: 'Tycoon Student', desc: 'Earn a total of $1,000', goal: 1000, stat: 'totalEarned', unlocked: false },
    { id: 'unlock_trees', name: 'Orchard Expansion', desc: 'Unlock 8 cash trees on your farm', goal: 8, stat: 'treesUnlocked', unlocked: false },
    { id: 'pests_5', name: 'Exterminator', desc: 'Squish 5 tree pests', goal: 5, stat: 'pestsSquished', unlocked: false },
    { id: 'contract_1', name: 'Shipping Master', desc: 'Complete 1 Export Contract', goal: 1, stat: 'contractsCompleted', unlocked: false }
  ],

  MARKET: {
    dollar: { val: 1.0, change: 0 },
    gold: { val: 1.0, change: 0 },
    emerald: { val: 1.0, change: 0 },
    ruby: { val: 1.0, change: 0 },
    diamond: { val: 1.0, change: 0 },
    timer: 12
  },

  TREES: [
    { x: 500, y: 350, type: 'dollar', unlocked: true, unlockCost: 0 },
    { x: 680, y: 350, type: 'dollar', unlocked: true, unlockCost: 0 },
    { x: 500, y: 520, type: 'dollar', unlocked: true, unlockCost: 0 },
    { x: 680, y: 520, type: 'dollar', unlocked: true, unlockCost: 0 },

    { x: 2400, y: 350, type: 'gold', unlocked: false, unlockCost: 220 },
    { x: 2580, y: 350, type: 'gold', unlocked: false, unlockCost: 220 },
    { x: 2400, y: 520, type: 'gold', unlocked: false, unlockCost: 220 },
    { x: 2580, y: 520, type: 'gold', unlocked: false, unlockCost: 220 },

    { x: 500, y: 1600, type: 'emerald', unlocked: false, unlockCost: 800 },
    { x: 680, y: 1600, type: 'emerald', unlocked: false, unlockCost: 800 },

    { x: 2400, y: 1600, type: 'ruby', unlocked: false, unlockCost: 1800 },
    { x: 2580, y: 1600, type: 'ruby', unlocked: false, unlockCost: 1800 }
  ],

  PESTS: [
    { x: 500, y: 400 },
    { x: 600, y: 450 },
    { x: 2500, y: 400 },
    { x: 2600, y: 1600 }
  ]
};
