
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedClassSpells() {
    console.log('Fetching Spells with Class info from Open5e...')

    // Open5e allows filtering, but we want all to check classes
    // The 'dnd_class' field in Open5e contains a specific string or we can use another endpoint.
    // Actually, dnd5eapi.co might be cleaner for class relationships: /api/2014/classes/{index}/spells

    // Let's use dnd5eapi.co for class-spell lists as it aligns with our class names (Wizard, etc.)

    // 1. Get our Classes from DB to match IDs
    const { data: dbClasses } = await supabase.from('classes').select('id, name');
    if (!dbClasses) {
        console.error('No classes found in DB.');
        return;
    }
    console.log(`Found ${dbClasses.length} classes in DB.`);

    // 2. Iterate each class and fetch its spells
    for (const cls of dbClasses) {
        const classNameLower = cls.name.toLowerCase();
        // Skip non-casters if we want, but API handles it (returns empty usually)

        const url = `https://www.dnd5eapi.co/api/2014/classes/${classNameLower}/spells`;
        console.log(`Fetching spells for ${cls.name}...`);

        const res = await fetch(url);
        if (!res.ok) {
            console.warn(`Could not fetch spells for ${cls.name} (might be non-caster or naming mismatch)`);
            continue;
        }

        const data = await res.json();
        const spellRefs = data.results; // [{ index, name, url }, ...]

        if (spellRefs.length === 0) {
            console.log(`No spells found for ${cls.name}.`);
            continue;
        }

        console.log(`Found ${spellRefs.length} spells for ${cls.name}. Linking...`);

        // 3. Link them in DB
        let linkedCount = 0;
        const batchSize = 50;

        for (let i = 0; i < spellRefs.length; i += batchSize) {
            const batch = spellRefs.slice(i, i + batchSize);

            // We need to resolve these spell names to spell_ids in our DB
            // We'll search by name.
            const spellNames = batch.map((r: any) => r.name);

            const { data: foundSpells } = await supabase
                .from('spells')
                .select('id, name')
                .in('name', spellNames); // 'in' is efficient

            if (foundSpells && foundSpells.length > 0) {
                const links = foundSpells.map((s: any) => ({
                    class_id: cls.id,
                    spell_id: s.id
                }));

                const { error } = await supabase.from('class_spells').upsert(links, { onConflict: 'class_id,spell_id', ignoreDuplicates: true });

                if (error) console.error('Error linking batch:', error);
                linkedCount += links.length;
            }
        }
        console.log(`Linked ${linkedCount} spells to ${cls.name}.`);
    }
}

seedClassSpells()
