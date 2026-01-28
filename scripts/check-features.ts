
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function checkFeatures() {
    const { count: featuresCount } = await supabase.from('features').select('*', { count: 'exact', head: true })
    const { count: linksCount } = await supabase.from('class_features').select('*', { count: 'exact', head: true })

    console.log(`Features Count: ${featuresCount}`)
    console.log(`Class-Feature Links Count: ${linksCount}`)
}

checkFeatures()
