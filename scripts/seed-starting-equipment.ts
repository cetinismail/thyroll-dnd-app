
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedClassEquipment() {
    console.log('Fetching classes from dnd5eapi.co...')

    // We use dnd5eapi.co because it has structured starting equipment data
    const response = await fetch('https://www.dnd5eapi.co/api/2014/classes')
    const data = await response.json()

    const classesList = data.results

    for (const classRef of classesList) {
        console.log(`Processing ${classRef.name}...`)

        // Fetch individual class details for starting equipment
        const classDetailRes = await fetch(`https://www.dnd5eapi.co${classRef.url}/starting-equipment`)
        const equipmentData = await classDetailRes.json()

        // We want to store:
        // 1. starting_equipment (Mandatory items)
        // 2. starting_equipment_options (Choices)

        // Let's combine them into a single JSON object
        const equipmentPayload = {
            mandatory: equipmentData.starting_equipment,
            options: equipmentData.starting_equipment_options
        }

        // Update the class in our DB
        // Note: Our DB might have different names or casing, but standard SRD names usually match
        const { error } = await supabase
            .from('classes')
            .update({ starting_equipment: equipmentPayload })
            .eq('name', classRef.name)

        if (error) {
            console.error(`Error updating ${classRef.name}:`, error)
        } else {
            console.log(`Updated ${classRef.name} equipment.`)
        }
    }
}

seedClassEquipment().catch(console.error)
