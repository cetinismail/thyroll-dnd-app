'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createCharacter(formData: any) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Kullanıcı oturumu bulunamadı")
    }

    // Get Profile ID (assuming user ID is profile ID)
    const profileId = user.id

    // Check if profile exists, if not create it (sync with auth user)
    const { data: profile } = await supabase.from('profiles').select('id').eq('id', profileId).single()

    if (!profile) {
        // Create profile if missing
        await supabase.from('profiles').insert({
            id: profileId,
            username: user.email?.split('@')[0] || `User_${profileId.slice(0, 5)}`,
            avatar_url: user.user_metadata?.avatar_url
        })
    }

    // Insert Character
    const { data: characterData, error } = await supabase.from('characters').insert({
        user_id: profileId,
        name: formData.name,
        race_id: formData.race,
        class_id: formData.class,
        strength: formData.stats.str,
        dexterity: formData.stats.dex,
        constitution: formData.stats.con,
        intelligence: formData.stats.int,
        wisdom: formData.stats.wis,
        charisma: formData.stats.cha,
        level: 1,
        current_hp: 10,
        max_hp: 10,
        background: formData.background,
        appearance: formData.appearance,
        image_url: formData.image_url,
        // initialize currency
        currency: formData.startingGold ? { gp: formData.startingGold, sp: 0, cp: 0 } : { gp: 0, sp: 0, cp: 0 }
    }).select().single()

    if (error || !characterData) {
        console.error('Character Creation Error:', error)
        throw new Error("Karakter oluşturulurken bir hata oluştu: " + error?.message)
    }

    // Handle Starting Equipment
    if (formData.equipmentMethod === 'class' && formData.class) {
        // Need to fetch class details to get Mandatory items, if we don't rely only on client side.
        // But for simplicity, we can rely on what we put in DB or trust client logic for "selectedEquipment".
        // HOWEVER, the client form currently only holds "selectedEquipment" which is user choices.
        // Mandatory items are not passed back in simple form? 
        // Let's re-fetch class equipment here to hold mandatory items securely or check logic.
        // ACTUALLY: Let's assume the user client component logic is valid for now, 
        // BUT the client 'selectedEquipment' currently only stores the CHOICES.
        // We need to fetch mandatory items too. 

        const { data: classData } = await supabase.from('classes').select('starting_equipment').eq('id', formData.class).single();
        const equipmentData = classData?.starting_equipment as any;

        let itemsToAdd: string[] = [];

        // 1. Add Mandatory Items
        if (equipmentData?.mandatory) {
            for (const m of equipmentData.mandatory as any[]) {
                const qty = m.quantity || 1;
                const name = m.equipment ? m.equipment.name : m.name; // adjust based on data shape
                if (name) {
                    for (let i = 0; i < qty; i++) itemsToAdd.push(name);
                }
            }
        }

        // 2. Add Selected Choices
        // formData.selectedEquipment is array of strings (item names)
        if (formData.selectedEquipment && Array.isArray(formData.selectedEquipment)) {
            itemsToAdd.push(...formData.selectedEquipment);
        }


        // Define Pack Contents for Unpacking (Updated with exact DB names)
        const PACK_CONTENTS: Record<string, { name: string, qty: number }[]> = {
            "Explorer's Pack": [
                { name: "Backpack", qty: 1 },
                { name: "Bedroll", qty: 1 },
                { name: "Mess Kit", qty: 1 },
                { name: "Tinderbox", qty: 1 },
                { name: "Torch", qty: 10 },
                { name: "Rations (1 day)", qty: 10 },
                { name: "Waterskin", qty: 1 },
                { name: "Rope, hempen (50 feet)", qty: 1 }
            ],
            "Dungeoneer's Pack": [
                { name: "Backpack", qty: 1 },
                { name: "Crowbar", qty: 1 },
                { name: "Hammer", qty: 1 },
                { name: "Piton", qty: 10 },
                { name: "Torch", qty: 10 },
                { name: "Tinderbox", qty: 1 },
                { name: "Rations (1 day)", qty: 10 },
                { name: "Waterskin", qty: 1 },
                { name: "Rope, hempen (50 feet)", qty: 1 }
            ],
            "Burglar's Pack": [
                { name: "Backpack", qty: 1 },
                { name: "Ball bearings (bag of 1,000)", qty: 1 },
                { name: "String (10 feet)", qty: 1 },
                { name: "Bell", qty: 1 },
                { name: "Candle", qty: 5 },
                { name: "Crowbar", qty: 1 },
                { name: "Hammer", qty: 1 },
                { name: "Piton", qty: 10 },
                { name: "Lantern, Hooded", qty: 1 },
                { name: "Oil (flask)", qty: 2 },
                { name: "Rations (1 day)", qty: 5 },
                { name: "Tinderbox", qty: 1 },
                { name: "Waterskin", qty: 1 }
            ],
            "Priest's Pack": [
                { name: "Backpack", qty: 1 },
                { name: "Blanket", qty: 1 },
                { name: "Candle", qty: 10 },
                { name: "Tinderbox", qty: 1 },
                { name: "Alms Box", qty: 1 },
                { name: "Incense (block)", qty: 2 },
                { name: "Censer", qty: 1 },
                { name: "Vestments", qty: 1 },
                { name: "Rations (1 day)", qty: 2 },
                { name: "Waterskin", qty: 1 }
            ],
            "Scholar's Pack": [
                { name: "Backpack", qty: 1 },
                { name: "Book", qty: 1 },
                { name: "Ink (1 ounce bottle)", qty: 1 },
                { name: "Ink Pen", qty: 1 },
                { name: "Parchment (one sheet)", qty: 10 },
                { name: "Sand", qty: 1 },
                { name: "Knife", qty: 1 }
            ],
            "Diplomat's Pack": [
                { name: "Chest", qty: 1 },
                { name: "Case, Map or Scroll", qty: 2 },
                { name: "Clothes, Fine", qty: 1 },
                { name: "Ink (1 ounce bottle)", qty: 1 },
                { name: "Ink Pen", qty: 1 },
                { name: "Lamp", qty: 1 },
                { name: "Oil (flask)", qty: 2 },
                { name: "Paper (one sheet)", qty: 5 },
                { name: "Perfume (vial)", qty: 1 },
                { name: "Sealing Wax", qty: 1 },
                { name: "Soap", qty: 1 }
            ],
            "Entertainer's Pack": [
                { name: "Backpack", qty: 1 },
                { name: "Bedroll", qty: 1 },
                { name: "Clothes, Costume", qty: 2 },
                { name: "Candle", qty: 5 },
                { name: "Rations (1 day)", qty: 5 },
                { name: "Waterskin", qty: 1 },
                { name: "Disguise Kit", qty: 1 }
            ]
        };

        // 3. Unpack and Resolve Items
        let finalItemsToInsert: { name: string, qty: number }[] = [];

        for (const itemName of itemsToAdd) {
            if (PACK_CONTENTS[itemName]) {
                // It's a pack, add its contents
                finalItemsToInsert.push(...PACK_CONTENTS[itemName]);
            } else {
                // It's a regular item
                finalItemsToInsert.push({ name: itemName, qty: 1 });
            }
        }

        if (finalItemsToInsert.length > 0) {
            // We need to find IDs for these names.
            for (const itemObj of finalItemsToInsert) {
                // Try exact match or ilike
                // We use ilike with wildcards to be more forgiving: %name%
                const { data: foundItems } = await supabase.from('items')
                    .select('id')
                    .ilike('name', itemObj.name)
                    .limit(1);

                if (foundItems && foundItems.length > 0) {
                    await supabase.from('character_inventory').insert({
                        character_id: characterData.id,
                        item_id: foundItems[0].id,
                        quantity: itemObj.qty,
                        is_equipped: false
                    });
                } else {
                    // Try a looser search if exact/simple ilike failed
                    const { data: looseItems } = await supabase.from('items')
                        .select('id')
                        .ilike('name', `%${itemObj.name}%`)
                        .limit(1);

                    if (looseItems && looseItems.length > 0) {
                        await supabase.from('character_inventory').insert({
                            character_id: characterData.id,
                            item_id: looseItems[0].id,
                            quantity: itemObj.qty,
                            is_equipped: false
                        });
                    } else {
                        console.warn(`Item not found in Compendium: ${itemObj.name}`);
                    }
                }
            }
        }

    }

    revalidatePath('/dashboard')
}

export async function getOptions() {
    const supabase = await createClient()

    const { data: races } = await supabase.from('races').select('*')
    const { data: classes } = await supabase.from('classes').select('*')

    return {
        races: races || [],
        classes: classes || []
    }
}
