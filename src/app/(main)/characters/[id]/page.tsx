
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { DeleteCharacterButton } from "./delete-button";
import { EditCharacterDialog } from "./edit-dialog";

export default async function CharacterDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const supabase = await createClient();

    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect("/login");
    }

    // 2. Fetch Character Details with relations
    const { data: character, error } = await supabase
        .from('characters')
        .select('*, races(*), classes(*)')
        .eq('id', params.id)
        .eq('user_id', user.id) // Security check: must belong to user
        .single();

    if (error || !character) {
        console.error("Fetch error:", error);
        notFound();
    }

    // Helper to calculate modifier: (Score - 10) / 2, rounded down
    const getModifier = (score: number) => Math.floor((score - 10) / 2);
    const formatMod = (mod: number) => (mod >= 0 ? `+${mod}` : `${mod}`);

    const stats = [
        { label: "STR", score: character.strength, name: "Strength" },
        { label: "DEX", score: character.dexterity, name: "Dexterity" },
        { label: "CON", score: character.constitution, name: "Constitution" },
        { label: "INT", score: character.intelligence, name: "Intelligence" },
        { label: "WIS", score: character.wisdom, name: "Wisdom" },
        { label: "CHA", score: character.charisma, name: "Charisma" },
    ];

    return (
        <div className="container py-8 space-y-8 max-w-5xl">
            {/* Header / Nav */}
            <div className="flex items-center justify-between">
                <Link href="/characters">
                    <Button variant="ghost" className="gap-2 pl-0">
                        <ChevronLeft className="h-4 w-4" />
                        Listeye Dön
                    </Button>
                </Link>
                <div className="flex items-center gap-2">
                    <EditCharacterDialog character={character} />
                    <DeleteCharacterButton characterId={character.id} characterName={character.name} />
                </div>
            </div>

            {/* Main Character Sheet */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Left Column: Core Identity & Stats */}
                <div className="md:col-span-1 space-y-6">
                    <Card className="border-primary/20 bg-card/60">
                        <CardHeader className="text-center pb-4">
                            <div className="mx-auto w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4 border-2 border-primary/20">
                                <span className="font-cinzel text-3xl text-primary font-bold">
                                    {character.name.charAt(0)}
                                </span>
                            </div>
                            <CardTitle className="font-cinzel text-2xl">{character.name}</CardTitle>
                            <CardDescription className="text-base font-medium text-foreground/80">
                                {character.races.name} {character.classes.name}
                            </CardDescription>
                            <Badge variant="outline" className="mt-2 text-xs w-fit mx-auto">
                                Seviye {character.level}
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="p-3 bg-muted/50 rounded-lg">
                                    <div className="text-sm text-muted-foreground uppercase text-[10px] tracking-wider">AC</div>
                                    <div className="text-xl font-bold font-mono">10</div>
                                    {/* AC calculation logic to be added later */}
                                </div>
                                <div className="p-3 bg-muted/50 rounded-lg">
                                    <div className="text-sm text-muted-foreground uppercase text-[10px] tracking-wider">HP</div>
                                    <div className="text-xl font-bold font-mono text-green-600">
                                        {character.current_hp} <span className="text-muted-foreground text-sm">/ {character.max_hp}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Ability Scores */}
                    <div className="grid grid-cols-1 gap-3">
                        {stats.map((stat) => {
                            const mod = getModifier(stat.score);
                            return (
                                <div key={stat.label} className="flex items-center justify-between p-3 border rounded-lg bg-card shadow-sm cursor-help hover:border-primary/40 transition-colors" title={stat.name}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
                                            {stat.label}
                                        </div>
                                        <span className="font-medium text-sm">{stat.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg font-bold">{stat.score}</span>
                                        <Badge variant={mod >= 0 ? "default" : "destructive"} className="font-mono w-10 justify-center">
                                            {formatMod(mod)}
                                        </Badge>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Right Column: Details, Bio, Spells etc */}
                <div className="md:col-span-2 space-y-6">

                    {/* Story / Bio */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-cinzel text-lg">Karakter Hikayesi</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="text-sm font-semibold mb-1">Geçmiş</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {character.background || "Bu karakterin hikayesi henüz yazılmamış."}
                                </p>
                            </div>
                            <div className="pt-4 border-t">
                                <h4 className="text-sm font-semibold mb-1">Görünüm</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {character.appearance || "Görünüm tasviri yok."}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Class Features (Placeholder) */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-cinzel text-lg">Sınıf Özellikleri</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground italic">
                                Sınıf özellikleri şimdilik veritabanından çekilmiyor. Buraya ileride {character.classes.name} yetenekleri gelecek.
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}
