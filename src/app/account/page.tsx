import { updatePassword } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AccountPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string; success?: string }>
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const params = await searchParams
    const error = params.error
    const success = params.success

    return (
        <div className="container max-w-2xl py-10">
            <h1 className="text-3xl font-cinzel font-bold mb-8">Hesap Ayarları</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Şifre Değiştir</CardTitle>
                    <CardDescription>
                        Hesabınızın güvenliği için güçlü bir şifre kullanın.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-500/15 text-green-600 text-sm p-3 rounded-md mb-4">
                            {success}
                        </div>
                    )}
                    <form action={updatePassword} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="password">Yeni Şifre</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
                            <Input id="confirmPassword" name="confirmPassword" type="password" required />
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit">
                                Şifreyi Güncelle
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
