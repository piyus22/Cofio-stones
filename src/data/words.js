// Word bank for the Word Recall game, grouped by familiarity tier.
// Tier 1: short, highly frequent concrete words. Tier 3: longer / less common.
export const WORD_TIERS = [
  [
    'apple', 'chair', 'house', 'river', 'bread', 'cloud', 'grass', 'shoes',
    'table', 'water', 'smile', 'horse', 'clock', 'stone', 'plate', 'door',
    'tree', 'milk', 'bird', 'rain', 'book', 'lamp', 'rose', 'ship',
    'cake', 'moon', 'star', 'fish', 'hand', 'garden',
  ],
  [
    'window', 'basket', 'candle', 'valley', 'button', 'ladder', 'pencil',
    'orange', 'market', 'bridge', 'pillow', 'kettle', 'jacket', 'meadow',
    'mirror', 'saddle', 'carpet', 'harbor', 'temple', 'summer',
    'farmer', 'singer', 'butter', 'wallet', 'napkin', 'engine',
    'circle', 'forest', 'island', 'pocket',
  ],
  [
    'lantern', 'compass', 'harvest', 'journey', 'blanket', 'whistle',
    'orchard', 'thimble', 'cottage', 'railway', 'library', 'weather',
    'evening', 'antique', 'balcony', 'caravan', 'dolphin', 'emerald',
    'festival', 'giraffe', 'horizon', 'illusion', 'jasmine', 'kingdom',
    'lavender', 'medicine', 'nightfall', 'ointment', 'porridge', 'quarry',
  ],
]

export function wordTierForLevel(level) {
  if (level <= 3) return 0
  if (level <= 6) return 1
  return 2
}
