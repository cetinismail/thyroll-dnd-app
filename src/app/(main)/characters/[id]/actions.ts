'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function deleteCharacter(characterId: string) {
    const supabase = await createClient()

    // 1. Manually cleanup inventory first to avoid RLS restrictions blocking the cascade
    // (Sometimes deleting the parent makes the child's RLS check fail if it relies on the parent)
    const { error: invError } = await supabase
        .from('character_inventory')
        .delete()
        .eq('character_id', characterId)

    if (invError) {
        console.error('Error deleting inventory:', invError)
        // We continue trying to delete the character even if this "fails" 
        // (maybe it failed because empty, or maybe real error)
        // But usually we want to ensure character is deleted.
    }

    // 2. Delete the Character
    const { error } = await supabase
        .from('characters')
        .delete()
        .eq('id', characterId)

    if (error) {
        console.error('Error deleting character:', error)
        throw new Error('Karakter silinemedi.')
    }

    revalidatePath('/dashboard')
    revalidatePath('/characters')
    redirect('/characters')
}

export async function updateCharacter(characterId: string, formData: any) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('characters')
        .update({
            name: formData.name,
            level: formData.level,
            current_hp: formData.current_hp,
            max_hp: formData.max_hp,
            armor_class: formData.armor_class,
            strength: formData.stats.str,
            dexterity: formData.stats.dex,
            constitution: formData.stats.con,
            intelligence: formData.stats.int,
            wisdom: formData.stats.wis,
            charisma: formData.stats.cha,
            background: formData.background,
            appearance: formData.appearance
        })
        .eq('id', characterId)

    if (error) {
        console.error('Error updating character:', error)
        throw new Error('Karakter güncellenemedi.')
    }

    revalidatePath(`/characters/${characterId}`)
    revalidatePath('/characters')
    revalidatePath('/dashboard')
}
