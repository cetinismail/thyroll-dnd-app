
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

async function seedGear() {
    console.log('Fetching All Equipment from dnd5eapi.co...')

    // 1. Get the list of all equipment
    const res = await fetch('https://www.dnd5eapi.co/api/2014/equipment')
    const listData = await res.json()
    const equipmentList = listData.results // [{ index, name, url }, ...]

    console.log(`Found ${equipmentList.length} equipment items. Fetching details...`)

    const batchSize = 25
    for (let i = 0; i < equipmentList.length; i += batchSize) {
        const batchRefs = equipmentList.slice(i, i + batchSize)

        const batchDetails = await Promise.all(
            batchRefs.map(async (ref: any) => {
                const detailRes = await fetch(`https://www.dnd5eapi.co${ref.url}`)
                return detailRes.json()
            })
        )

        const itemsToInsert = batchDetails.map((item: any) => ({
            name: item.name,
            equipment_category: item.equipment_category?.name || 'Adventuring Gear',
            rarity: 'Common', // Most basic gear is common
            cost_desc: item.cost ? `${item.cost.quantity} ${item.cost.unit}` : null,
            weight: item.weight,
            description: item.desc ? item.desc.join('\n') : null,
            image_url: null, // API doesn't provide images usually
            properties_json: {
                armor_category: item.armor_category,
                armor_class: item.armor_class,
                str_minimum: item.str_minimum,
                stealth_disadvantage: item.stealth_disadvantage,
                weapon_category: item.weapon_category,
                weapon_range: item.weapon_range,
                category_range: item.category_range,
                damage: item.damage,
                range: item.range,
                properties: item.properties,
                gear_category: item.gear_category
            }
        }))

        const { error } = await supabase.from('items').upsert(itemsToInsert, { onConflict: 'name', ignoreDuplicates: true })

        if (error) {
            console.error('Error inserting batch:', error)
        } else {
            console.log(`Seeded batch ${i / batchSize + 1}`)
        }
    }
    console.log('Done.')
}

seedGear()
