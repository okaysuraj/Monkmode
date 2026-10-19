-- Monkmode Initial Seed Data

-- 1. Seed Chapters
INSERT INTO chapters (id, order_index, title, japanese_title, subtitle, duration_minutes, description)
VALUES
  (
    'the-sanmon',
    1,
    'The Hidden Gate',
    '山門',
    'Charred cypress, worn stone, one gate left open.',
    14,
    'Why a gate is a sentence, and what you agree to when you walk under one. Entering the threshold of stillness.'
  ),
  (
    'borrowed-scenery',
    2,
    'Borrowed Scenery',
    '借景',
    'Shakkei: composing with a mountain you will never own.',
    18,
    'How limitation shapes focus and clarity. Integrating the boundless horizon into quiet daily practice.'
  ),
  (
    'charred-cypress',
    3,
    'Charred Cypress',
    '焼杉',
    'Yakisugi: burning a board black so the weather will let it live.',
    21,
    'Durable discipline forged through heat and deliberate restraint. Surviving seasons of distraction.'
  ),
  (
    'lantern-light',
    4,
    'Lantern Light',
    '灯籠',
    'How a single ember decides the scale of everything around it.',
    17,
    'A single point of concentration in complete darkness. Calibrating deep work amidst noise.'
  ),
  (
    'vermilion-moon',
    5,
    'The Vermilion Moon',
    '朱月',
    'Why the moon burns red over the valley, and what the garden does with it.',
    22,
    'Afterlight and completion. Returning with one thing worth keeping into the world.'
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  japanese_title = EXCLUDED.japanese_title,
  subtitle = EXCLUDED.subtitle,
  duration_minutes = EXCLUDED.duration_minutes,
  description = EXCLUDED.description;

-- 2. Seed Default Rituals / Disciplines
INSERT INTO rituals (title, japanese_title, description, category, target_daily_minutes, is_active)
VALUES
  (
    'Zazen Meditation',
    '座禅',
    'Silent seated awareness before sunrise. Breath counting and mental stabilization.',
    'meditation',
    20,
    true
  ),
  (
    'Deep Work Sprint',
    '集中',
    'Uninterrupted single-task flow state without notifications or browsing.',
    'discipline',
    90,
    true
  ),
  (
    'Digital Fasting',
    '断捨離',
    'Complete detachment from feeds, messages, and screens after nightfall.',
    'discipline',
    60,
    true
  ),
  (
    'Kinsho Walking',
    '経行',
    'Slow, rhythmic walking meditation in nature between focused work intervals.',
    'physical',
    15,
    true
  )
ON CONFLICT DO NOTHING;
