
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function findRations() {
    const { data } = await supabase.from('items').select('name').ilike('name', 'Ration%')
    console.log('Ration matches:', data)
}

findRations()
