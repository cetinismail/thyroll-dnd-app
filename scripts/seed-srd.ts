
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedSpells() {
    console.log('Fetching Spells...')
    try {
        const response = await fetch('https://api.open5e.com/spells/?format=json&limit=500')
        const data = await response.json()
        const spells = data.results

        console.log(`Found ${spells.length} spells. upserting...`)

        const batchSize = 50
        for (let i = 0; i < spells.length; i += batchSize) {
            const batch = spells.slice(i, i + batchSize).map((s: any) => ({
                name: s.name,
                description: s.desc,
                level: s.level_int,
                school: s.school,
                casting_time: s.time,
                range: s.range,
                components: s.components,
                duration: s.duration,
            }))

            const { error } = await supabase.from('spells').upsert(batch, { onConflict: 'name', ignoreDuplicates: true })
            if (error) console.error('Error inserting spells batch:', error)
        }
        console.log('Spells seeded.')
    } catch (err) {
        console.error('Failed to seed spells:', err)
    }
}

async function seedMonsters() {
    console.log('Fetching Monsters...')
    try {
        let allMonsters: any[] = []
        // Correct slug for SRD 5.1 in Open5e is often wotc-srd
        let nextUrl = 'https://api.open5e.com/monsters/?format=json&limit=100&document__slug=wotc-srd'

        while (nextUrl) {
            console.log('Fetching URL:', nextUrl)
            const res = await fetch(nextUrl)
            if (!res.ok) throw new Error(`Fetch failed: ${res.statusText}`)
            const data = await res.json()
            allMonsters = allMonsters.concat(data.results)
            nextUrl = data.next
        }

        if (allMonsters.length === 0) {
            // Fallback to 'srd' if wotc-srd returns empty (though unlikely for 5e content)
            console.log('No monsters found with wotc-srd, trying generic srd...')
            nextUrl = 'https://api.open5e.com/monsters/?format=json&limit=100&document__slug=srd'
            while (nextUrl) {
                const res = await fetch(nextUrl)
                const data = await res.json()
                allMonsters = allMonsters.concat(data.results)
                nextUrl = data.next
            }
        }

        console.log(`Found ${allMonsters.length} SRD monsters. Upserting...`)

        const batchSize = 20
        const parseCR = (cr: string) => {
            if (!cr) return 0
            if (cr === '0') return 0
            if (cr.includes('/')) {
                const [num, den] = cr.split('/')
                return parseInt(num) / parseInt(den)
            }
            return parseFloat(cr)
        }

        for (let i = 0; i < allMonsters.length; i += batchSize) {
            const batch = allMonsters.slice(i, i + batchSize).map((m: any) => ({
                name: m.name,
                size: m.size,
                type: m.type,
                subtype: m.subtype,
                alignment: m.alignment,
                armor_class: m.armor_class,
                armor_class_desc: m.armor_desc,
                hit_points: m.hit_points,
                hit_dice: m.hit_dice,
                speed_json: m.speed,
                strength: m.strength,
                dexterity: m.dexterity,
                constitution: m.constitution,
                intelligence: m.intelligence,
                wisdom: m.wisdom,
                charisma: m.charisma,
                challenge_rating: parseCR(m.challenge_rating),
                special_abilities_json: m.special_abilities,
                actions_json: m.actions,
                legendary_actions_json: m.legendary_actions,
                image_url: m.img_main
            }))

            const { error } = await supabase.from('monsters').upsert(batch, { onConflict: 'name', ignoreDuplicates: true })
            if (error) console.error('Error inserting monsters batch:', error)
        }
        console.log('Monsters seeded.')

    } catch (err) {
        console.error('Failed to seed monsters:', err)
    }
}

async function seedItems() {
    console.log('Fetching Items (Magic Items & Weapons)...')
    try {
        let allItems: any[] = []

        // 1. Magic Items
        let nextUrl = 'https://api.open5e.com/magicitems/?format=json&limit=100&document__slug=wotc-srd'
        while (nextUrl) {
            console.log('Fetching Magic Items:', nextUrl)
            const res = await fetch(nextUrl)
            const data = await res.json()
            allItems = allItems.concat(data.results)
            nextUrl = data.next
        }

        // 2. Weapons
        console.log('Fetching Weapons...')
        const wepRes = await fetch('https://api.open5e.com/weapons/?format=json&limit=200&document__slug=wotc-srd')
        if (wepRes.ok) {
            const wepData = await wepRes.json()
            console.log(`Found ${wepData.results.length} weapons.`)
            allItems = allItems.concat(wepData.results)
        }

        console.log(`Total Found ${allItems.length} SRD Items. Upserting...`)

        const batchSize = 50
        for (let i = 0; i < allItems.length; i += batchSize) {
            const batch = allItems.slice(i, i + batchSize).map((item: any) => ({
                name: item.name,
                equipment_category: item.category || item.equipment_category || 'Magic Item',
                rarity: item.rarity || 'Common',
                description: item.desc,
                properties_json: {
                    type: item.type,
                    requires_attunement: item.requires_attunement,
                    damage_dice: item.damage_dice,
                    damage_type: item.damage_type,
                    properties: item.properties
                }
            }))

            const { error } = await supabase.from('items').upsert(batch, { onConflict: 'name', ignoreDuplicates: true })
            if (error) console.error('Error inserting items batch:', error)
        }
        console.log('Items seeded.')

    } catch (err) {
        console.error('Failed to seed items:', err)
    }
}


async function main() {
    await seedSpells()
    await seedMonsters()
    await seedItems()
}

main()
