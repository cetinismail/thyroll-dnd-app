'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function updatePassword(formData: FormData) {
    const supabase = await createClient()

    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
        redirect('/account?error=Sifreler eslesmiyor')
    }

    const { error } = await supabase.auth.updateUser({
        password: password
    })

    if (error) {
        console.error('Password Update Error:', error)

        let errorMessage = 'Guncelleme basarisiz'
        if (error.code === 'same_password') {
            errorMessage = 'Yeni sifre eskisiyle ayni olamaz'
        } else if (error.code === 'weak_password') {
            errorMessage = 'Sifre cok zayif'
        }

        redirect(`/account?error=${errorMessage}`)
    }

    revalidatePath('/')
    redirect('/dashboard?success=Sifreniz basariyla guncellendi')
}
