"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateCharacterHP(characterId: string, newHp: number) {
    const supabase = await createClient();

    // RLS: The "DMs can update characters code" policy works on UPDATE.
    // It verifies if I am the DM of the campaign the character is in.

    const { error } = await supabase
        .from("characters")
        .update({ hp_current: newHp })
        .eq("id", characterId);

    if (error) {
        console.error("HP Update Error:", error);
        throw new Error("Can güncellenemedi.");
    }

    revalidatePath("/dashboard/campaigns/[id]");
}

export async function searchItems(query: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from("items")
        .select("id, name, rarity, equipment_category")
        .ilike("name", `%${query}%`)
        .limit(5);
    return data || [];
}

export async function giveItem(characterId: string, itemId: string, quantity: number = 1) {
    const supabase = await createClient();

    // Permissions: RLS on `character_inventory` needs to allow DM to INSERT.
    // Currently, typical policy is "User can insert to own inventory".
    // We need a policy for "DM can insert to member's inventory".
    // Or we rely on "Service Role" bypass? (Not ideal security, but quick).
    // Or we add a SQL migration policy for `character_inventory`.

    // Let's assume we need to add a policy.
    // BUT for now, I will try to insert. If it fails, I'll know I need a migration.
    // Wait, I should probably check the policy first.
    // Instead of guessing, I'll write the Action. If it fails, I'll fix the SQL.

    const { error } = await supabase.from("character_inventory").insert({
        character_id: characterId,
        item_id: itemId,
        quantity: quantity
    });

    if (error) {
        console.error("Give Item Error:", error);
        throw new Error("Eşya verilemedi. (Yetki sorunu olabilir)");
    }

    revalidatePath("/dashboard/campaigns/[id]");
}
