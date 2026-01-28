
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function seedFeatures() {
    console.log('Fetching Class Features from dnd5eapi.co...')

    // 1. Get Classes
    const { data: dbClasses } = await supabase.from('classes').select('id, name');
    if (!dbClasses) { console.error('No classes in DB'); return; }

    for (const cls of dbClasses) {
        console.log(`Processing ${cls.name}...`);
        const classNameLower = cls.name.toLowerCase();

        // Fetch all features for this class
        let nextUrl = `https://www.dnd5eapi.co/api/2014/classes/${classNameLower}/features`;

        try {
            const res = await fetch(nextUrl);
            const data = await res.json();
            const featureRefs = data.results; // [{ index, name, url }, ...]

            if (!featureRefs || featureRefs.length === 0) {
                console.log(`No features for ${cls.name}`);
                continue;
            }

            console.log(`Found ${featureRefs.length} features for ${cls.name}. Fetching details...`);

            // Fetch details for each feature to get description and level
            const batchSize = 25;
            for (let i = 0; i < featureRefs.length; i += batchSize) {
                const batch = featureRefs.slice(i, i + batchSize);

                const featureDetails = await Promise.all(
                    batch.map(async (ref: any) => {
                        const dRes = await fetch(`https://www.dnd5eapi.co${ref.url}`);
                        return dRes.json();
                    })
                );

                // Manual check for existence to avoid unique constraint error
                const featuresToInsert = [];
                for (const f of featureDetails) {
                    // Check if feature with this name already exists
                    const { data: existing } = await supabase.from('features').select('id').eq('name', f.name).maybeSingle();
                    if (!existing) {
                        featuresToInsert.push({
                            name: f.name,
                            description: f.desc ? f.desc.join('\n') : 'No description.',
                            source_type: 'Class',
                            level_required: f.level || 1
                        });
                    }
                }

                if (featuresToInsert.length > 0) {
                    const { error } = await supabase
                        .from('features')
                        .insert(featuresToInsert);

                    if (error) {
                        console.error('Error inserting features:', error);
                    }
                }

                // Get IDs for linking (fetch all in batch again)
                const names = featureDetails.map((f: any) => f.name);
                const { data: allFeatures } = await supabase.from('features').select('id, name, level_required').in('name', names);

                if (allFeatures) {
                    // Link to Class
                    const links = allFeatures.map((f: any) => ({
                        class_id: cls.id,
                        feature_id: f.id,
                        level_custom: f.level_required
                    }));

                    const { error: linkError } = await supabase
                        .from('class_features')
                        .upsert(links, { onConflict: 'class_id,feature_id', ignoreDuplicates: true });

                    if (linkError) console.error('Error linking features:', linkError);
                }
            }
            console.log(`Finished ${cls.name}`);

        } catch (e) {
            console.error(`Failed to process ${cls.name}:`, e);
        }
    }
    console.log('Seeding complete.');
}

seedFeatures()
