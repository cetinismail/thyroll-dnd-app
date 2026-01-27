"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Flame, Move, Clock, Component } from "lucide-react";
import { useState } from "react";

interface Spell {
    id: string;
    name: string;
    description: string;
    level: number;
    school: string;
    casting_time: string;
    range: string;
    components: string;
    duration: string;
}

interface SpellsTabProps {
    spells: Spell[];
}

export function SpellsTab({ spells }: SpellsTabProps) {
    // Group spells by level
    const spellsByLevel: Record<number, Spell[]> = {};
    spells.forEach(spell => {
        if (!spellsByLevel[spell.level]) {
            spellsByLevel[spell.level] = [];
        }
        spellsByLevel[spell.level].push(spell);
    });

    // Sort levels
    const levels = Object.keys(spellsByLevel).map(Number).sort((a, b) => a - b);

    if (spells.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p>Bu karakterin bildiği büyü yok veya veritabanı bağlantısı yapılmadı.</p>
            </div>
        );
    }

    return (
        <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-8">
                {levels.map((level) => (
                    <div key={level} className="space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                            <h3 className="font-cinzel text-lg font-bold text-primary">
                                {level === 0 ? "Kısa Büyüler (Cantrips)" : `${level}. Seviye`}
                            </h3>
                            <Badge variant="outline" className="ml-auto text-[10px] uppercase">
                                {spellsByLevel[level].length} Büyü
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {spellsByLevel[level].map((spell) => (
                                <SpellCard key={spell.id} spell={spell} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
}

function SpellCard({ spell }: { spell: Spell }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="group relative flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 hover:border-primary/50 cursor-pointer transition-all">
                    <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Flame className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{spell.name}</h4>
                        <p className="text-xs text-muted-foreground truncate">{spell.school}</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px] h-5 opacity-60 group-hover:opacity-100">
                        Detay
                    </Badge>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-cinzel text-2xl text-primary flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        {spell.name}
                    </DialogTitle>
                    <DialogDescription className="text-base text-foreground/80 font-medium">
                        {spell.level === 0 ? "Cantrip" : `Level ${spell.level}`} — {spell.school}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 py-4 text-sm border-y bg-muted/30 px-4 -mx-6">
                    <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Casting Time
                        </span>
                        <span className="font-medium">{spell.casting_time}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-1">
                            <Move className="h-3 w-3" /> Range
                        </span>
                        <span className="font-medium">{spell.range}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-1">
                            <Component className="h-3 w-3" /> Components
                        </span>
                        <span className="font-medium">{spell.components}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Duration
                        </span>
                        <span className="font-medium">{spell.duration}</span>
                    </div>
                </div>

                <ScrollArea className="max-h-[200px] mt-2">
                    <p className="text-sm leading-relaxed text-muted-foreground/90">
                        {spell.description}
                    </p>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
