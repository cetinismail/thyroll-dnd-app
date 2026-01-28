
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

async function inspect() {
    const { data, error } = await supabase
        .from('classes')
        .select('name, starting_equipment')
        .eq('name', 'Barbarian')
        .single()

    if (data) {
        console.log(JSON.stringify(data.starting_equipment, null, 2))
    } else {
        console.log('No data found')
    }
}

inspect()
