import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { PlusCircle, Search, Scroll, Users, Sword, Shield } from "lucide-react"; // Shield/Sword added for stats
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ success?: string }>
}) {
    const params = await searchParams;
    const supabase = await createClient();

    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect("/login");
    }

    // 2. Fetch Stats, Characters & News parallely
    const [
        { count: characterCount, error: countError },
        { data: recentCharacters, error: listError },
        { data: newsItems, error: newsError }
    ] = await Promise.all([
        supabase.from('characters').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('characters').select('*, races(name), classes(name)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('news').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(5)
    ]);

    // Handle errors silently or log them
    if (countError) console.error("Dashboard Stats Error:", countError);
    if (listError) console.error("Dashboard List Error:", listError);
    if (newsError && newsError.code !== '42P01') console.error("Dashboard News Error:", newsError); // Ignore table missing error locally if migration not run

    return (
        <div className="space-y-8">
            {params.success && (
                <div className="bg-green-500/15 text-green-600 text-sm p-3 rounded-md border border-green-500/20">
                    {params.success}
                </div>
            )}
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight font-cinzel text-primary">Panel</h2>
                    <p className="text-muted-foreground mt-1">
                        Tekrar hoş geldin, maceracı. Karakterlerini buradan yönet.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Campaigns removed for beta */}
                    <Link href="/builder">
                        <Button className="font-cinzel">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Karakter Oluştur
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats / Quick Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="border-border/40 bg-card/90 backdrop-blur-sm hover:border-primary/50 transition-colors shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium font-cinzel">Aktif Karakterler</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{characterCount || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Toplam oluşturulan karakter
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Characters */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 border-border/40 bg-card/90 shadow-lg">
                    <CardHeader>
                        <CardTitle className="font-cinzel">Son Karakterler</CardTitle>
                        <CardDescription>
                            {recentCharacters && recentCharacters.length > 0
                                ? "En son oluşturduğun veya düzenlediğin karakterler."
                                : "Henüz bir karakter oluşturmadın."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentCharacters && recentCharacters.length > 0 ? (
                            <div className="space-y-4">
                                {recentCharacters.map((char: any) => (
                                    <div key={char.id} className="flex items-center justify-between p-4 border rounded-lg border-border/40 bg-background/40 hover:bg-background/60 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Sword className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium font-cinzel">{char.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {char.races?.name} - {char.classes?.name} (Lvl {char.level})
                                                </p>
                                            </div>
                                        </div>
                                        {/* Actions could go here, e.g. Edit/Play */}
                                    </div>
                                ))}
                                <div className="pt-2">
                                    <Link href="/characters" className="text-sm text-primary hover:underline">
                                        Tüm karakterleri gör →
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-lg border-border/50 bg-background/20">
                                <div className="rounded-full bg-muted p-4 mb-4">
                                    <Users className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <p className="text-sm font-medium text-foreground">Karakter bulunamadı</p>
                                <p className="text-sm text-muted-foreground mb-4">Yeni bir karakter oluşturarak maceraya başla.</p>
                                <Link href="/builder">
                                    <Button variant="outline" size="sm">Karakter Oluştur</Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card className="col-span-3 border-border/40 bg-card/90 shadow-lg">
                    <CardHeader>
                        <CardTitle className="font-cinzel">Son Haberler</CardTitle>
                        <CardDescription>Sistem güncellemeleri ve notlar</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {newsItems && newsItems.length > 0 ? (
                                newsItems.map((news: any) => (
                                    <div key={news.id} className="border-l-2 border-primary pl-4">
                                        <h4 className="text-sm font-bold text-foreground">{news.title}</h4>
                                        <p className="text-xs text-muted-foreground mt-1">{news.content}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">Henüz güncelleme notu yok.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
