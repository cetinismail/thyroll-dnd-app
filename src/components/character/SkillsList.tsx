"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DiceOverlay } from "@/components/dice/DiceOverlay";
import { cn } from "@/lib/utils";

const SKILLS = [
    { name: "Acrobatics", stat: "dex" },
    { name: "Animal Handling", stat: "wis" },
    { name: "Arcana", stat: "int" },
    { name: "Athletics", stat: "str" },
    { name: "Deception", stat: "cha" },
    { name: "History", stat: "int" },
    { name: "Insight", stat: "wis" },
    { name: "Intimidation", stat: "cha" },
    { name: "Investigation", stat: "int" },
    { name: "Medicine", stat: "wis" },
    { name: "Nature", stat: "int" },
    { name: "Perception", stat: "wis" },
    { name: "Performance", stat: "cha" },
    { name: "Persuasion", stat: "cha" },
    { name: "Religion", stat: "int" },
    { name: "Sleight of Hand", stat: "dex" },
    { name: "Stealth", stat: "dex" },
    { name: "Survival", stat: "wis" },
];

export function SkillsList({ stats }: { stats: any }) {
    const [diceOpen, setDiceOpen] = useState(false);
    const [selectedSkill, setSelectedSkill] = useState<{ name: string, mod: number } | null>(null);

    const getMod = (val: number) => Math.floor((val - 10) / 2);

    const handleRoll = (skillName: string, statKey: string) => {
        const statVal = stats[statKey] || 10;
        const mod = getMod(statVal);
        // Profiency logic would go here: + PROF if proficient
        setSelectedSkill({ name: skillName, mod });
        setDiceOpen(true);
    };

    return (
        <>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-cinzel flex items-center gap-2">
                        📜 Beceriler (Skills)
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-2">
                    {SKILLS.map((skill) => {
                        const statVal = stats[skill.stat] || 10;
                        const mod = getMod(statVal);
                        const sign = mod >= 0 ? "+" : "";

                        return (
                            <div
                                key={skill.name}
                                onClick={() => handleRoll(skill.name, skill.stat)}
                                className="flex items-center justify-between p-2 rounded border border-transparent bg-muted/30 hover:bg-muted hover:border-primary/20 cursor-pointer group transition-all"
                            >
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <span className="font-medium text-sm truncate group-hover:text-primary transition-colors">{skill.name}</span>
                                    <span className="text-[10px] text-muted-foreground uppercase shrink-0">({skill.stat})</span>
                                </div>
                                <Badge variant={mod >= 0 ? "secondary" : "destructive"} className="font-mono text-xs h-5 px-1.5 shrink-0">
                                    {sign}{mod}
                                </Badge>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>

            <DiceOverlay
                open={diceOpen}
                onOpenChange={setDiceOpen}
                title={selectedSkill ? `${selectedSkill.name} Check` : "Zar At"}
                bonus={selectedSkill?.mod || 0}
            />
        </>
    );
}
