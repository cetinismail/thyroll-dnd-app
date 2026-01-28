
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

const PACK_ITEMS = [
    "Backpack", "Bedroll", "Mess Kit", "Tinderbox", "Torch", "Ration",
    "Waterskin", "Rope, Hempen (50 feet)", "Hempen rope (50 feet)"
];

async function checkItems() {
    console.log("Checking items in DB...");
    for (const name of PACK_ITEMS) {
        // Check exact match
        let { data, error } = await supabase.from('items').select('name').ilike('name', name);

        if (data && data.length > 0) {
            console.log(`[FOUND] "${name}" -> DB Name: "${data[0].name}"`);
        } else {
            // Check loose match
            let { data: loose } = await supabase.from('items').select('name').ilike('name', `%${name}%`).limit(1);
            if (loose && loose.length > 0) {
                console.log(`[LOOSE MATCH] "${name}" -> DB Name: "${loose[0].name}"`);
            } else {
                console.log(`[MISSING] "${name}"`);
            }
        }
    }
}

checkItems()
