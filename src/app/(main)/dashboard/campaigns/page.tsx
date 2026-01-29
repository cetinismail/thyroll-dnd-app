import { getUserCampaigns, createCampaign, joinCampaign } from "@/lib/actions/campaign";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Users, Sword, Crown } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function CampaignsPage() {
    const { dmCampaigns, playerCampaigns } = await getUserCampaigns();

    // Fetch user's characters for the "Join" dropdown
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: myCharacters } = await supabase.from("characters").select("id, name, class").eq("user_id", user?.id || "");

    return (
        <div className="container py-8 max-w-5xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-cinzel">Sefer Günlükleri (Campaigns)</h1>
                    <p className="text-muted-foreground mt-1">
                        Yönettiğin veya katıldığın tüm maceralar burada.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="all" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="all">Tüm Seferler</TabsTrigger>
                    <TabsTrigger value="dm">Yönettiklerim (DM)</TabsTrigger>
                    <TabsTrigger value="player">Oynadıklarım</TabsTrigger>
                </TabsList>

                {/* --- SECTIONS --- */}
                <TabsContent value="all" className="space-y-8">

                    {/* ACTION CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* CREATE CAMPAIGN CARD */}
                        <Card className="border-dashed border-2 bg-muted/20 hover:bg-muted/40 transition-colors">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Crown className="w-5 h-5 text-yellow-500" />
                                    Yeni Sefer Başlat
                                </CardTitle>
                                <CardDescription>Oyun yöneticisi olarak yeni bir dünya yarat.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form action={createCampaign} className="space-y-4">
                                    <div>
                                        <Label>Sefer Adı</Label>
                                        <Input name="title" placeholder="Örn: Curse of Strahd" required />
                                    </div>
                                    <div>
                                        <Label>Kısa Açıklama</Label>
                                        <Input name="description" placeholder="Vampirlerin gölgesinde bir macera..." />
                                    </div>
                                    <Button type="submit" className="w-full">
                                        <Plus className="w-4 h-4 mr-2" /> Oluştur
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* JOIN CAMPAIGN CARD */}
                        <Card className="border-dashed border-2 bg-muted/20 hover:bg-muted/40 transition-colors">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Sword className="w-5 h-5 text-blue-500" />
                                    Sefere Katıl
                                </CardTitle>
                                <CardDescription>Bir DM'in davet koduyla maceraya atıl.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form action={joinCampaign} className="space-y-4">
                                    <div>
                                        <Label>Davet Kodu</Label>
                                        <Input name="code" placeholder="Örn: ABC-123" required className="uppercase font-mono" />
                                    </div>
                                    <div>
                                        <Label>Karakter Seç</Label>
                                        <select name="character_id" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" required>
                                            <option value="">-- Karakterin --</option>
                                            {myCharacters?.map(c => (
                                                <option key={c.id} value={c.id}>{c.name} ({c.class})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <Button type="submit" variant="secondary" className="w-full">
                                        <Users className="w-4 h-4 mr-2" /> Katıl
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* LISTS */}
                    <div className="space-y-6">
                        {dmCampaigns.length > 0 && (
                            <div>
                                <h3 className="font-cinzel text-xl font-bold mb-4 flex items-center gap-2">
                                    <Crown className="w-5 h-5 text-yellow-500" /> Yönettiklerim
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {dmCampaigns.map((c: any) => (
                                        <Link href={`/dashboard/campaigns/${c.id}`} key={c.id}>
                                            <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                                                <CardHeader>
                                                    <CardTitle>{c.title}</CardTitle>
                                                    <CardDescription className="line-clamp-2">{c.description}</CardDescription>
                                                </CardHeader>
                                                <CardFooter className="text-xs text-muted-foreground font-mono">
                                                    Kod: {c.join_code}
                                                </CardFooter>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {playerCampaigns.length > 0 && (
                            <div>
                                <h3 className="font-cinzel text-xl font-bold mb-4 flex items-center gap-2">
                                    <Sword className="w-5 h-5 text-blue-500" /> Maceralarım
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {playerCampaigns.map((c: any) => (
                                        <Link href={`/dashboard/campaigns/${c.id}`} key={c.id}>
                                            <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                                                <CardHeader>
                                                    <CardTitle>{c.title}</CardTitle>
                                                    <CardDescription className="line-clamp-2">{c.description}</CardDescription>
                                                </CardHeader>
                                                <CardFooter>
                                                    <span className="text-xs bg-secondary px-2 py-1 rounded text-secondary-foreground">Oyuncu</span>
                                                </CardFooter>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                </TabsContent>
                {/* Simplified TabsContent for 'dm' and 'player' can be duplicates or refined views. For MVP 'all' covers it. */}
            </Tabs>
        </div>
    );
}
