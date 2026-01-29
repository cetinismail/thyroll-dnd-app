import { getCampaignDetails } from "@/lib/actions/campaign";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Copy, Shield, Users, Skull, Heart } from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DMTools } from "@/components/campaign/dm-tools";

export default async function CampaignLobby({ params }: { params: Promise<{ id: string }> }) {

    const { id } = await params;
    const { campaign, members, isDM } = await getCampaignDetails(id);

    return (
        <div className="container py-8 max-w-6xl">
            {/* HERO HEADER */}
            <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 shadow-2xl mb-8">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20" />
                <div className="relative p-8 md:p-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 px-3 py-1">
                                {isDM ? "Oyun Yöneticisi (DM)" : "Oyuncu"}
                            </Badge>
                            <Badge variant="secondary" className="text-muted-foreground">
                                {members.length} Maceracı
                            </Badge>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-cinzel font-bold text-white mb-4 drop-shadow-lg">
                            {campaign.title}
                        </h1>
                        <p className="text-slate-300 text-lg max-w-2xl leading-relaxed">
                            {campaign.description || "Bu seferin henüz bir açıklaması yok..."}
                        </p>
                    </div>

                    {/* JOIN CODE CARD */}
                    <Card className="bg-black/40 border-slate-600 backdrop-blur-sm shadow-xl min-w-[280px]">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">Davet Kodu</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center gap-3">
                            <code className="flex-1 bg-black/60 rounded px-4 py-2 text-2xl font-mono text-green-400 font-bold tracking-widest text-center border border-green-900/50">
                                {campaign.join_code}
                            </code>
                            {/* Client Component Button would be better here for Copy, but for now visual */}
                            <Button size="icon" variant="ghost" className="text-slate-400 hover:text-white">
                                <Copy className="w-5 h-5" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* MEMBERS GRID */}
            <div>
                <h2 className="text-2xl font-cinzel font-bold mb-6 flex items-center gap-3">
                    <Users className="w-6 h-6 text-primary" />
                    Ekip (Party)
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {members.map((member: any) => {
                        const char = member.characters;
                        if (!char) return null; // Should not happen based on schema logic but safe guard

                        return (
                            <Card key={member.id} className="group overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg bg-card/50">
                                <div className="h-2 bg-gradient-to-r from-primary/50 to-transparent" />
                                <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-12 w-12 border-2 border-primary/20">
                                            <AvatarFallback className="font-cinzel text-lg bg-primary/10 text-primary">
                                                {char.name.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle className="text-lg font-bold">{char.name}</CardTitle>
                                            <CardDescription>{char.race} {char.class}</CardDescription>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-2xl font-bold text-primary font-mono">{char.level}</span>
                                        <span className="text-[10px] uppercase text-muted-foreground">Level</span>
                                    </div>
                                </CardHeader>

                                <CardContent>
                                    <Separator className="my-3 opacity-50" />

                                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                                        <div className="bg-red-950/30 p-2 rounded border border-red-900/20">
                                            <div className="flex items-center justify-center gap-1 text-red-400 mb-1">
                                                <Heart className="w-3 h-3" /> HP
                                            </div>
                                            <span className="font-bold text-white">{char.hp_current}</span>
                                            <span className="text-muted-foreground text-xs">/{char.hp_max}</span>
                                        </div>
                                        <div className="bg-slate-800/50 p-2 rounded border border-slate-700">
                                            <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
                                                <Shield className="w-3 h-3" /> AC
                                            </div>
                                            <span className="font-bold text-white">
                                                {10 + Math.floor(((char.stats?.dex || 10) - 10) / 2)}
                                            </span>
                                        </div>
                                        <div className="bg-purple-900/20 p-2 rounded border border-purple-900/20">
                                            <div className="flex items-center justify-center gap-1 text-purple-400 mb-1">
                                                <Skull className="w-3 h-3" /> Init
                                            </div>
                                            <span className="font-bold text-white">
                                                {Math.floor(((char.stats?.dex || 10) - 10) / 2) >= 0 ? "+" : ""}
                                                {Math.floor(((char.stats?.dex || 10) - 10) / 2)}
                                            </span>
                                        </div>
                                    </div>

                                    {isDM && (
                                        <div className="mt-4 pt-4 border-t border-dashed border-border/50 space-y-2">
                                            <DMTools
                                                characterId={char.id}
                                                characterName={char.name}
                                                currentHp={char.hp_current}
                                                maxHp={char.hp_max}
                                            />
                                            <Button variant="destructive" size="sm" className="w-full opacity-50 hover:opacity-100 transition-opacity text-[10px] h-7">
                                                Gruptan Çıkar
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
