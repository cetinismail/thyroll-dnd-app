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

    const { error } = await supabase.from('characters').insert({
        user_id: profileId,
        name: formData.name,
        race_id: formData.race, // Assuming race is ID
        class_id: formData.class, // Assuming class is ID
        strength: formData.stats.str,
        dexterity: formData.stats.dex,
        constitution: formData.stats.con,
        intelligence: formData.stats.int,
        wisdom: formData.stats.wis,
        charisma: formData.stats.cha,
        // Mock data for now as these are not in wizard yet
        level: 1,
        current_hp: 10, // Should be calculated based on class + con
        max_hp: 10,
        background: formData.background,
        appearance: formData.appearance,
        image_url: formData.image_url
    })

    if (error) {
        console.error('Character Creation Error:', error)
        throw new Error("Karakter oluşturulurken bir hata oluştu: " + error.message)
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
