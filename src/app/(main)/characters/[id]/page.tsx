
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

import { CharacterTabs } from "@/app/(main)/characters/[id]/tabs-client";
import { SkillsList } from "@/components/character/SkillsList";

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
        .select(`
            *,
            races(*),
            classes (
                *,
                class_features (
                    features (*)
                ),
                class_spells (
                    spells (*)
                )
            )
        `)
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single();

    if (error || !character) {
        console.error("Fetch error:", error);
        notFound();
    }

    // Extract features and spells correctly
    // The nested structure will be: character.classes.class_features[].features
    // Extract features and spells correctly
    // The nested structure will be: character.classes.class_features[].features
    const allFeatures = character.classes?.class_features?.map((cf: any) => cf.features) || [];
    const allSpells = character.classes?.class_spells?.map((cs: any) => cs.spells) || [];

    // --- FILTER CONFIGURATION ---

    // 1. Filter Features by Level
    const features = allFeatures.filter((f: any) => f.level_required <= character.level);

    // 2. Filter Spells by Max Spell Level
    const getCasterType = (className: string) => {
        const fullCasters = ["Bard", "Cleric", "Druid", "Sorcerer", "Wizard"];
        const halfCasters = ["Paladin", "Ranger"];
        const warlock = ["Warlock"];

        if (fullCasters.includes(className)) return "full";
        if (halfCasters.includes(className)) return "half";
        if (warlock.includes(className)) return "warlock";
        return "none";
    };

    const getMaxSpellLevel = (className: string, level: number) => {
        const type = getCasterType(className);

        if (type === "none") return 0; // No spells
        if (type === "full") return Math.ceil(level / 2);

        if (type === "half") {
            if (level < 2) return 0;
            return Math.ceil(level / 2); // Roughly approximates up to 5th level spells
        }

        if (type === "warlock") {
            // Warlock Progression
            if (level >= 9) return 5;
            return Math.ceil(level / 2);
        }

        return 0;
    };

    const maxSpellLevel = getMaxSpellLevel(character.classes.name, character.level);

    // Special Case: Allow Cantrips (Level 0) for Casters, but pure martials usually don't have them unless subclass (which we don't distinguish yet).
    // If MaxSpellLevel is 0, we can assume no spells at all for simplicity, OR allow Cantrips if present.
    // For Paladin/Ranger at Level 1 (Max 0), they shouldn't see spells.
    // For Wizard 1 (Max 1), they see 0 and 1.

    let spells = allSpells.filter((s: any) => s.level <= maxSpellLevel);

    // If "none" caster, empty completely (ignore database defaults if any)
    if (getCasterType(character.classes.name) === "none") {
        spells = [];
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
                            <div className="mx-auto w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mb-4 border-2 border-primary/20 overflow-hidden relative shadow-lg">
                                {character.image_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={character.image_url}
                                        alt={character.name}
                                        className="w-full h-full object-cover transition-transform hover:scale-105"
                                    />
                                ) : (
                                    <span className="font-cinzel text-5xl text-primary font-bold">
                                        {character.name.charAt(0)}
                                    </span>
                                )}
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
                                    <div className="text-xl font-bold font-mono text-primary">
                                        {character.armor_class || 10}
                                    </div>
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

                    {/* Skills List */}
                    <div className="mt-8">
                        <SkillsList stats={{
                            str: character.strength,
                            dex: character.dexterity,
                            con: character.constitution,
                            int: character.intelligence,
                            wis: character.wisdom,
                            cha: character.charisma
                        }} />
                    </div>
                </div>

                {/* Right Column: Tabbed Content */}
                <div className="md:col-span-2">
                    <CharacterTabs
                        character={character}
                        features={features}
                        spells={spells}
                    />
                </div>
            </div>
        </div>
    );
}


