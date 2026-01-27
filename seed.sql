-- Clean existing data to avoid duplicates if re-running
TRUNCATE TABLE public.characters CASCADE;
TRUNCATE TABLE public.classes CASCADE;
TRUNCATE TABLE public.races CASCADE;

-- Insert SRD Classes (12 Standard Classes)
INSERT INTO public.classes (name, description, hit_die, primary_ability, saves) VALUES
('Barbarian', 'Öfkesini güce dönüştüren vahşi bir savaşçı.', 'd12', 'Strength', ARRAY['Strength', 'Constitution']),
('Bard', 'Müziğin ve sözlerin büyüsünü kullanan ilham verici bir sanatçı.', 'd8', 'Charisma', ARRAY['Dexterity', 'Charisma']),
('Cleric', 'Tanrısal gücü kullanarak büyü yapan kutsal bir savaşçı.', 'd8', 'Wisdom', ARRAY['Wisdom', 'Charisma']),
('Druid', 'Doğanın güçlerini ve elementleri yöneten bir rahip.', 'd8', 'Wisdom', ARRAY['Intelligence', 'Wisdom']),
('Fighter', 'Çeşitli silahlar ve zırhlar kullanma konusunda yetenekli, usta bir dövüşçü.', 'd10', 'Strength', ARRAY['Strength', 'Constitution']),
('Monk', 'Dövüş sanatlarında ustalaşmış, bedensel ve ruhsal mükemmelliği arayan bir savaşçı.', 'd8', 'Dexterity', ARRAY['Strength', 'Dexterity']),
('Paladin', 'Kutsal bir yemine bağlı, adaletin ve iyiliğin koruyucusu.', 'd10', 'Strength', ARRAY['Wisdom', 'Charisma']),
('Ranger', 'Doğada hayatta kalma ve avlanma konusunda uzmanlaşmış bir savaşçı.', 'd10', 'Dexterity', ARRAY['Strength', 'Dexterity']),
('Rogue', 'Gizlilik, hile ve hassas saldırılar konusunda uzmanlaşmış becerikli bir karakter.', 'd8', 'Dexterity', ARRAY['Dexterity', 'Intelligence']),
('Sorcerer', 'Damarlarında doğuştan gelen büyüsel bir güç taşıyan kişi.', 'd6', 'Charisma', ARRAY['Constitution', 'Charisma']),
('Warlock', 'Doğaüstü bir varlıkla anlaşma yaparak güç kazanan büyücü.', 'd8', 'Charisma', ARRAY['Wisdom', 'Charisma']),
('Wizard', 'Evrenin dokusunu değiştirebilen, büyü üzerine uzmanlaşmış bir alim.', 'd6', 'Intelligence', ARRAY['Intelligence', 'Wisdom']);

-- Insert SRD Races (9 Standard Races)
INSERT INTO public.races (name, description, speed, size, traits) VALUES
('Dragonborn', 'Ejderha soyundan gelen, onurlu ve güçlü bir halk.', 30, 'Medium', '{"vision": "normal", "bonus": "str_plus_2_cha_plus_1", "resistance": "elemental"}'::jsonb),
('Dwarf', 'Dağların derinliklerinde yaşayan, dayanıklı ve zanaatkar bir halk.', 25, 'Medium', '{"vision": "darkvision", "bonus": "con_plus_2", "resistance": "poison"}'::jsonb),
('Elf', 'Diğer alemlerden gelen büyüsel bir zarafete sahip, uzun ömürlü bir halk.', 30, 'Medium', '{"vision": "darkvision", "bonus": "dex_plus_2", "immune": "sleep"}'::jsonb),
('Gnome', 'Yaratıcı, enerjik ve büyüye meraklı küçük bir halk.', 25, 'Small', '{"vision": "darkvision", "bonus": "int_plus_2", "advantage": "magic_saves"}'::jsonb),
('Half-Elf', 'İnsan merakı ve elf zarafetini birleştiren melezler.', 30, 'Medium', '{"vision": "darkvision", "bonus": "cha_plus_2_others_plus_1", "immune": "sleep"}'::jsonb),
('Halfling', 'Dünyanın konforlu köşelerinde yaşayan, iyimser ve cesur bir halk.', 25, 'Small', '{"vision": "normal", "bonus": "dex_plus_2", "advantage": "brave"}'::jsonb),
('Half-Orc', 'İnsan ve ork soyundan gelen, vahşi ve dayanıklı savaşçılar.', 30, 'Medium', '{"vision": "darkvision", "bonus": "str_plus_2_con_plus_1", "feature": "relentless_endurance"}'::jsonb),
('Human', 'Bilinen dünyanın her yerinde bulunan, hırslı ve çok yönlü bir halk.', 30, 'Medium', '{"vision": "normal", "bonus": "all_stats_plus_1", "feat": "optional"}'::jsonb),
('Tiefling', 'Damarlarında şeytani bir miras taşıyan, boynuzlu ve kuyruklu halk.', 30, 'Medium', '{"vision": "darkvision", "bonus": "int_plus_1_cha_plus_2", "resistance": "fire"}'::jsonb);

-- Insert Sample Characters (Now with armor_class)
INSERT INTO public.characters (user_id, name, level, class_id, race_id, strength, dexterity, constitution, intelligence, wisdom, charisma, current_hp, max_hp, armor_class)
VALUES
  ((SELECT id FROM public.profiles LIMIT 1), 'Grommash', 1, (SELECT id FROM public.classes WHERE name = 'Barbarian'), (SELECT id FROM public.races WHERE name = 'Half-Orc'), 16, 14, 16, 8, 10, 12, 15, 15, 14),
  ((SELECT id FROM public.profiles LIMIT 1), 'Elara', 3, (SELECT id FROM public.classes WHERE name = 'Wizard'), (SELECT id FROM public.races WHERE name = 'Elf'), 8, 14, 12, 18, 14, 10, 18, 18, 12);

-- Insert Basic Features (Barbarian)
INSERT INTO public.features (name, description, source_type, level_required) VALUES
('Rage', 'In battle, you fight with primal ferocity. On your turn, you can enter a rage as a bonus action.', 'Class', 1),
('Unarmored Defense', 'While you are not wearing any armor, your Armor Class equals 10 + your Dexterity modifier + your Constitution modifier.', 'Class', 1),
('Reckless Attack', 'Starting at 2nd level, you can throw aside all concern for defense to attack with fierce desperation.', 'Class', 2);

-- Insert class_features handling (Mock setup for seed, real app would use strict ID lookups)
-- Skipped complex linking for this initial seed to avoid SQL complexity errors in simple execution
-- Ideally user will run a more complex script or we build an admin tool.

-- Insert Basic Spells (Wizard/Cleric)
INSERT INTO public.spells (name, description, level, school, casting_time, range, components, duration) VALUES
('Fireball', 'A bright streak flashes from your pointing finger to a point you choose... 8d6 fire damage.', 3, 'Evocation', '1 Action', '150 feet', 'V, S, M', 'Instantaneous'),
('Magic Missile', 'You create three glowing darts of magical force.', 1, 'Evocation', '1 Action', '120 feet', 'V, S', 'Instantaneous'),
('Cure Wounds', 'A creature you touch regains a number of hit points equal to 1d8 + your spellcasting ability modifier.', 1, 'Evocation', '1 Action', 'Touch', 'V, S', 'Instantaneous');

