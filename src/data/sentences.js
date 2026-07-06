// Sentence bank for the Sentence Fill game.
// Each entry: text with ___ blank, the correct word, and plausible-but-wrong options.
// Tier 1 = everyday and concrete → Tier 3 = richer vocabulary.
export const SENTENCE_TIERS = [
  [
    { text: 'She poured a glass of ___ with her breakfast.', answer: 'milk', wrong: ['shoes', 'grass', 'music'] },
    { text: 'He put on his ___ before going out in the rain.', answer: 'coat', wrong: ['spoon', 'ladder', 'pillow'] },
    { text: 'The cat slept on the warm ___ by the window.', answer: 'chair', wrong: ['river', 'cloud', 'letter'] },
    { text: 'We baked a ___ for her birthday.', answer: 'cake', wrong: ['stone', 'ticket', 'garden'] },
    { text: 'The ___ was shining brightly in the sky.', answer: 'sun', wrong: ['shoe', 'door', 'fork'] },
    { text: 'He watered the ___ every morning.', answer: 'plants', wrong: ['stairs', 'clouds', 'dishes'] },
    { text: 'She wrote a ___ to her old friend.', answer: 'letter', wrong: ['carrot', 'window', 'bucket'] },
    { text: 'The children played in the ___ after school.', answer: 'park', wrong: ['soup', 'lamp', 'wallet'] },
    { text: 'He sliced the ___ for sandwiches.', answer: 'bread', wrong: ['piano', 'curtain', 'meadow'] },
    { text: 'They sat by the ___ to keep warm.', answer: 'fire', wrong: ['fridge', 'puddle', 'shelf'] },
    { text: 'She hung the wet clothes on the ___.', answer: 'line', wrong: ['plate', 'stove', 'pillow'] },
    { text: 'The dog wagged its ___ happily.', answer: 'tail', wrong: ['hat', 'bell', 'boot'] },
    { text: 'He read the morning ___ with his tea.', answer: 'paper', wrong: ['ladder', 'blanket', 'garden'] },
    { text: 'She planted ___ along the front path.', answer: 'flowers', wrong: ['candles', 'spoons', 'mirrors'] },
    { text: 'The kettle began to ___ on the stove.', answer: 'whistle', wrong: ['sleep', 'gallop', 'bloom'] },
  ],
  [
    { text: 'The train arrived at the ___ exactly on time.', answer: 'station', wrong: ['orchard', 'ceiling', 'harvest'] },
    { text: 'She looked at her ___ in the hallway mirror.', answer: 'reflection', wrong: ['medicine', 'furniture', 'appetite'] },
    { text: 'The farmer gathered the ___ before the storm.', answer: 'harvest', wrong: ['balcony', 'whisper', 'lantern'] },
    { text: 'He checked the ___ to find their way north.', answer: 'compass', wrong: ['cushion', 'teapot', 'sweater'] },
    { text: 'The choir sang a beautiful ___ at the concert.', answer: 'melody', wrong: ['ladder', 'pursuit', 'harbor'] },
    { text: 'They crossed the old wooden ___ over the stream.', answer: 'bridge', wrong: ['pillow', 'jacket', 'engine'] },
    { text: 'She kept her coins in a small leather ___.', answer: 'purse', wrong: ['valley', 'temple', 'meadow'] },
    { text: 'The lighthouse guided the ships into the ___.', answer: 'harbor', wrong: ['kitchen', 'pocket', 'garden'] },
    { text: 'He lit a ___ when the power went out.', answer: 'candle', wrong: ['carpet', 'button', 'basket'] },
    { text: 'The bees buzzed around the ___ all afternoon.', answer: 'hive', wrong: ['stove', 'wallet', 'mirror'] },
    { text: 'Grandmother knitted a warm ___ for winter.', answer: 'scarf', wrong: ['saddle', 'kettle', 'napkin'] },
    { text: 'The ___ rang loudly from the church tower.', answer: 'bells', wrong: ['apples', 'rivers', 'pencils'] },
    { text: 'They watched the sun set over the ___.', answer: 'horizon', wrong: ['cupboard', 'necklace', 'porridge'] },
    { text: 'She sealed the envelope and added a ___.', answer: 'stamp', wrong: ['carrot', 'ribbon', 'shovel'] },
    { text: 'The orchestra tuned their ___ before the show.', answer: 'instruments', wrong: ['umbrellas', 'sandwiches', 'blankets'] },
  ],
  [
    { text: 'The scent of ___ drifted from the garden at dusk.', answer: 'lavender', wrong: ['gravel', 'timber', 'copper'] },
    { text: 'His explanation was so clear it removed every ___.', answer: 'doubt', wrong: ['muscle', 'furnace', 'saddle'] },
    { text: 'The travelers followed the winding road through the ___.', answer: 'valley', wrong: ['whistle', 'thimble', 'ointment'] },
    { text: 'The museum displayed pottery from an ancient ___.', answer: 'civilization', wrong: ['refrigerator', 'trampoline', 'binoculars'] },
    { text: 'Her speech received warm ___ from the audience.', answer: 'applause', wrong: ['porridge', 'scaffolding', 'luggage'] },
    { text: 'The detective searched for a single piece of ___.', answer: 'evidence', wrong: ['marmalade', 'furniture', 'gardening'] },
    { text: 'The old clock in the hall needed winding to keep ___.', answer: 'time', wrong: ['soup', 'wool', 'paint'] },
    { text: 'The mountain peak was hidden by a thick ___.', answer: 'mist', wrong: ['spoon', 'harp', 'boot'] },
    { text: 'He spoke with great ___ about his years at sea.', answer: 'fondness', wrong: ['plumbing', 'stitching', 'freckles'] },
    { text: 'The library kept rare books in a locked ___.', answer: 'cabinet', wrong: ['orchard', 'pasture', 'chimney'] },
    { text: 'The recipe called for a ___ of cinnamon.', answer: 'pinch', wrong: ['flock', 'pane', 'brim'] },
    { text: 'A gentle ___ stirred the curtains at the open window.', answer: 'breeze', wrong: ['ladder', 'jigsaw', 'trumpet'] },
    { text: 'The judges praised the ___ of her embroidery.', answer: 'craftsmanship', wrong: ['temperature', 'longitude', 'appetite'] },
    { text: 'They admired the ___ colors of the autumn leaves.', answer: 'vivid', wrong: ['salted', 'hollow', 'woolen'] },
    { text: 'The captain kept a detailed ___ of the voyage.', answer: 'journal', wrong: ['pudding', 'doorbell', 'haystack'] },
  ],
]

export function sentenceTierForLevel(level) {
  if (level <= 3) return 0
  if (level <= 6) return 1
  return 2
}
