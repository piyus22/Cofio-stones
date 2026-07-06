// Word bank for the Word Recall game, grouped by familiarity tier.
// Tier 1: short, highly frequent concrete words. Tier 3: longer / less common.
// Drawn via deck rotation (see generators.js) so words don't repeat until a
// whole tier has been used.
export const WORD_TIERS = [
  [
    'apple', 'chair', 'house', 'river', 'bread', 'cloud', 'grass', 'shoes',
    'table', 'water', 'smile', 'horse', 'clock', 'stone', 'plate', 'door',
    'tree', 'milk', 'bird', 'rain', 'book', 'lamp', 'rose', 'ship',
    'cake', 'moon', 'star', 'fish', 'hand', 'garden',
    'dog', 'cat', 'sun', 'hat', 'cup', 'spoon', 'fork', 'bed',
    'wall', 'roof', 'road', 'farm', 'barn', 'cow', 'sheep', 'duck',
    'egg', 'tea', 'soup', 'salt', 'shirt', 'sock', 'coat', 'ring',
    'bell', 'drum', 'kite', 'ball', 'rope', 'nail', 'box', 'bag',
    'key', 'coin', 'comb', 'soap', 'towel', 'brush', 'glass', 'chain',
    'leaf', 'seed', 'corn', 'pear', 'plum', 'grape', 'nut', 'jar',
    'boat', 'train', 'wheel', 'gate', 'pond', 'hill', 'sand', 'shell',
  ],
  [
    'window', 'basket', 'candle', 'valley', 'button', 'ladder', 'pencil',
    'orange', 'market', 'bridge', 'pillow', 'kettle', 'jacket', 'meadow',
    'mirror', 'saddle', 'carpet', 'harbor', 'temple', 'summer',
    'farmer', 'singer', 'butter', 'wallet', 'napkin', 'engine',
    'circle', 'forest', 'island', 'pocket',
    'teacher', 'doctor', 'letter', 'garden', 'dinner', 'supper', 'winter',
    'monkey', 'rabbit', 'spider', 'turtle', 'donkey', 'pigeon', 'parrot',
    'carrot', 'onion', 'pepper', 'cherry', 'lemon', 'melon', 'banana',
    'bottle', 'hammer', 'shovel', 'bucket', 'blanket', 'curtain', 'drawer',
    'sweater', 'slipper', 'ribbon', 'needle', 'thread', 'scissors', 'anchor',
    'castle', 'tunnel', 'station', 'village', 'cottage', 'stable', 'church',
    'trumpet', 'violin', 'guitar', 'whistle', 'teapot', 'saucer', 'tractor',
    'shoulder', 'finger', 'morning', 'evening', 'autumn', 'spring',
  ],
  [
    'lantern', 'compass', 'harvest', 'journey', 'blanket', 'whistle',
    'orchard', 'thimble', 'cottage', 'railway', 'library', 'weather',
    'evening', 'antique', 'balcony', 'caravan', 'dolphin', 'emerald',
    'festival', 'giraffe', 'horizon', 'illusion', 'jasmine', 'kingdom',
    'lavender', 'medicine', 'nightfall', 'ointment', 'porridge', 'quarry',
    'telescope', 'umbrella', 'volcano', 'waterfall', 'satchel', 'parchment',
    'chandelier', 'monastery', 'lighthouse', 'windmill', 'carriage', 'gondola',
    'sapphire', 'mahogany', 'tapestry', 'cathedral', 'aqueduct', 'labyrinth',
    'marmalade', 'chamomile', 'cinnamon', 'rosemary', 'juniper', 'magnolia',
    'nightingale', 'kingfisher', 'porcupine', 'chameleon', 'armadillo', 'albatross',
    'observatory', 'apothecary', 'periscope', 'metronome', 'hourglass', 'inkwell',
    'moccasin', 'bandana', 'pendulum', 'gazebo', 'trellis', 'veranda',
    'archipelago', 'meridian', 'silhouette', 'kaleidoscope', 'harmonica', 'accordion',
  ],
]
