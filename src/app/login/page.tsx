import { login } from './actions'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const params = await searchParams
    const error = params.error

    return (
        <div className="flex h-screen w-full items-center justify-center px-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Giriş Yap</CardTitle>
                    <CardDescription>
                        Hesabına erişmek için e-posta adresini gir
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4">
                            {error}
                        </div>
                    )}
                    <form action={login} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">E-posta</Label>
                            <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Şifre</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>
                        <Button type="submit" className="w-full">
                            Giriş Yap
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        Hesabın yok mu?{" "}
                        <Link href="/signup" className="underline">
                            Kayıt Ol
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
