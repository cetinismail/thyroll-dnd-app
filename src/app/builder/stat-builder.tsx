"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, RefreshCw, Dna } from "lucide-react";
import { cn } from "@/lib/utils";
import { DiceOverlay } from "@/components/dice/DiceOverlay";

interface Stats {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
}

interface StatBuilderProps {
    stats: Stats;
    setStats: (stats: Stats) => void;
}

export function StatBuilder({ stats, setStats }: StatBuilderProps) {
    const [method, setMethod] = useState<"manual" | "pointbuy" | "standard">("pointbuy");

    // Point Buy Calculation
    const getPointCost = (score: number) => {
        if (score < 8) return 0;
        if (score === 8) return 0;
        if (score === 9) return 1;
        if (score === 10) return 2;
        if (score === 11) return 3;
        if (score === 12) return 4;
        if (score === 13) return 5;
        if (score === 14) return 7;
        if (score === 15) return 9;
        return 99; // Invalid for point buy
    };

    const calculateUsedPoints = () => {
        let total = 0;
        Object.values(stats).forEach(val => total += getPointCost(val));
        return total;
    };

    // Standard Array Logic
    const standardArray = [15, 14, 13, 12, 10, 8];

    // Dice Rolling Logic
    type RollGroup = {
        id: number;
        rolls: number[]; // e.g. [5, 4, 3, 1]
        total: number;   // e.g. 12 (5+4+3)
        assignedTo: keyof Stats | null;
        rolled: boolean;
    };




    // ... existing code ...

    const [activeRollId, setActiveRollId] = useState<number | null>(null);

    const handleRollComplete = (result: number, individualRolls?: number[]) => {
        if (activeRollId === null) return;

        // If we have individual rolls (from 4d6), use them.
        // Otherwise wrap result.
        let rolls = individualRolls || [result, 0, 0, 0];

        // Ensure we have 4 items for UI consistency if it's 4d6
        if (rolls.length === 1 && method === "manual") {
            // Fallback if accidental single die
            rolls = [result, 0, 0, 0];
        }

        // Fix: Sort visually so the lowest is last (dropped)
        rolls.sort((a, b) => b - a);

        setRollGroups(prev => prev.map(g =>
            g.id === activeRollId ? { ...g, rolls, total: result, rolled: true } : g
        ));

        setActiveRollId(null);
    };

    const [rollGroups, setRollGroups] = useState<RollGroup[]>([
        { id: 1, rolls: [], total: 0, assignedTo: null, rolled: false },
        { id: 2, rolls: [], total: 0, assignedTo: null, rolled: false },
        { id: 3, rolls: [], total: 0, assignedTo: null, rolled: false },
        { id: 4, rolls: [], total: 0, assignedTo: null, rolled: false },
        { id: 5, rolls: [], total: 0, assignedTo: null, rolled: false },
        { id: 6, rolls: [], total: 0, assignedTo: null, rolled: false },
    ]);

    // State and handler already defined above, removing duplicates


    useEffect(() => {
        if (method === "pointbuy") {
            // Ensure stats are within range for point buy logic on switch
            const cleanStats = { ...stats };
            let changed = false;
            Object.keys(cleanStats).forEach(key => {
                const k = key as keyof Stats;
                if (cleanStats[k] < 8) { cleanStats[k] = 8; changed = true; }
                if (cleanStats[k] > 15) { cleanStats[k] = 15; changed = true; }
            });
            if (changed) setStats(cleanStats);
        }
    }, [method]); // Removed 'stats' dependency to avoid infinite loop

    const handlePointBuy = (stat: keyof Stats, delta: number) => {
        const currentVal = stats[stat];
        const newVal = currentVal + delta;
        if (newVal < 8 || newVal > 15) return;

        const currentCost = calculateUsedPoints();
        const costDiff = getPointCost(newVal) - getPointCost(currentVal);

        if (currentCost + costDiff > 27) return; // Not enough points

        setStats({ ...stats, [stat]: newVal });
    };

    const resetToBase = () => {
        setStats({ str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 });
    };

    const applyStandardArray = () => {
        setStats({ str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 });
    };

    // Dice Functions
    const rollDie = () => Math.floor(Math.random() * 6) + 1;

    const rollGroup = (id: number) => {
        const rolls = [rollDie(), rollDie(), rollDie(), rollDie()];
        // Sort descending
        rolls.sort((a, b) => b - a);
        // Take top 3
        const total = rolls[0] + rolls[1] + rolls[2];

        setRollGroups(prev => prev.map(g =>
            g.id === id ? { ...g, rolls, total, rolled: true } : g
        ));
    };

    const assignRoll = (id: number, ability: keyof Stats | "unassigned") => {
        // Unassign previous if any
        if (ability === "unassigned") {
            setRollGroups(prev => prev.map(g => g.id === id ? { ...g, assignedTo: null } : g));
            return;
        }

        // Check if ability is already assigned to another group, if so, unassign that one
        setRollGroups(prev => prev.map(g => {
            if (g.id === id) return { ...g, assignedTo: ability };
            if (g.assignedTo === ability) return { ...g, assignedTo: null };
            return g;
        }));

        // Update actual stats
        const group = rollGroups.find(g => g.id === id);
        if (group) {
            setStats({ ...stats, [ability]: group.total });
        }
    };

    // Sync roll assignments to stats whenever they change
    useEffect(() => {
        if (method === "manual") {
            const newStats = { ...stats };
            let updated = false;
            rollGroups.forEach(g => {
                if (g.assignedTo && g.rolled) {
                    newStats[g.assignedTo] = g.total;
                    updated = true;
                }
            });
            // Only update if something changed to avoid loop, though setStats usually handles stable identity
            // Actually, we should probably stick to the user clicking "Apply" or manual inputs updating stats.
            // But the user requested "Apply Ability Scores" button in screenshot. 
            // However, for better UX, let's sync instantly if assigned.
            if (updated) setStats(newStats);
        }
    }, [rollGroups]);


    return (
        <div className="space-y-6">
            <Tabs defaultValue="pointbuy" onValueChange={(v) => { setMethod(v as any); if (v === "pointbuy") resetToBase(); }}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="pointbuy">Puan Satın Alma</TabsTrigger>
                    <TabsTrigger value="standard">Standart Dizi</TabsTrigger>
                    <TabsTrigger value="manual">Manuel / Zar</TabsTrigger>
                </TabsList>

                {/* --- POINT BUY --- */}
                <TabsContent value="pointbuy" className="space-y-4">
                    <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg border border-primary/20">
                        <div className="flex items-center gap-2">
                            <Dna className="h-5 w-5 text-primary" />
                            <div className="flex flex-col">
                                <span className="font-bold text-sm">Kalan Puan</span>
                                <span className="text-xs text-muted-foreground">Toplam 27 puanınız var.</span>
                            </div>
                        </div>
                        <div className="text-2xl font-mono font-bold text-primary">
                            {27 - calculateUsedPoints()}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(stats).map(([key, val]) => (
                            <div key={key} className="flex items-center justify-between border p-3 rounded-md bg-card">
                                <Label htmlFor={key} className="uppercase font-bold text-lg w-12">{key}</Label>
                                <div className="flex items-center space-x-3">
                                    <Button
                                        variant="outline" size="icon"
                                        onClick={() => handlePointBuy(key as keyof Stats, -1)}
                                        disabled={val <= 8}
                                        className="h-8 w-8"
                                    >
                                        <Minus className="h-3 w-3" />
                                    </Button>
                                    <div className="flex flex-col items-center w-12">
                                        <span className="font-mono text-xl font-bold">{val}</span>
                                        <span className="text-[10px] text-muted-foreground">Maliyet: {getPointCost(val)}</span>
                                    </div>
                                    <Button
                                        variant="outline" size="icon"
                                        onClick={() => handlePointBuy(key as keyof Stats, 1)}
                                        disabled={val >= 15 || (27 - calculateUsedPoints() < (getPointCost(val + 1) - getPointCost(val)))}
                                        className="h-8 w-8"
                                    >
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>

                {/* --- STANDARD ARRAY --- */}
                <TabsContent value="standard" className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg border border-primary/20 text-center">
                        <p className="text-sm text-muted-foreground mb-3">
                            Aşağıdaki skorları yeteneklerinize dağıtın:
                        </p>
                        <div className="flex justify-center gap-2 mb-4">
                            {standardArray.map(n => (
                                <Badge key={n} variant="outline" className="text-sm font-mono px-2 py-1 bg-background">
                                    {n}
                                </Badge>
                            ))}
                        </div>
                        <Button size="sm" variant="secondary" onClick={applyStandardArray}>
                            <RefreshCw className="mr-2 h-3 w-3" /> Varsayılan Dağılımı Uygula
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {Object.entries(stats).map(([key, val]) => (
                            <div key={key} className="flex items-center justify-between border p-3 rounded-md bg-card">
                                <Label className="uppercase font-bold text-lg w-16">{key}</Label>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost" size="sm" disabled={val <= 1}
                                        onClick={() => setStats({ ...stats, [key]: Math.max(1, val - 1) })}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="font-mono text-xl font-bold w-8 text-center">{val}</span>
                                    <Button
                                        variant="ghost" size="sm" disabled={val >= 20}
                                        onClick={() => setStats({ ...stats, [key]: Math.min(20, val + 1) })}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-center text-muted-foreground">
                        * Bu modda değerleri manuel ayarlayabilirsiniz. Yukarıdaki diziye uymaya çalışın.
                    </p>
                </TabsContent>

                {/* --- MANUAL / ROLLED --- */}
                <TabsContent value="manual" className="space-y-8">
                    {/* Top Section: Inputs */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {Object.entries(stats).map(([key, val]) => (
                            <div key={key} className="flex flex-col items-center p-2 border rounded-md bg-card/50">
                                <Label className="uppercase font-bold text-xs mb-2 text-muted-foreground">{key}</Label>
                                <input
                                    type="number"
                                    className="w-full text-center font-mono text-lg font-bold bg-transparent border-none focus:outline-none"
                                    value={val}
                                    onChange={(e) => setStats({ ...stats, [key]: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Dice Rolling Section */}
                    <div className="bg-muted/30 border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-cinzel text-lg font-bold">Zar Grubu (4d6 drop lowest)</h3>
                            <Button size="sm" variant="ghost" onClick={() => {
                                setRollGroups(rollGroups.map(g => ({ ...g, rolled: false, rolls: [], total: 0, assignedTo: null })));
                                setStats({ str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 });
                            }}>
                                <RefreshCw className="mr-2 h-3 w-3" /> Sıfırla
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                            {rollGroups.map((group) => (
                                <div key={group.id} className="flex flex-col items-center gap-2 p-2 border bg-card rounded-md shadow-sm">
                                    {!group.rolled ? (
                                        <Button
                                            variant="secondary"
                                            className="w-full h-24 font-cinzel animate-pulse"
                                            onClick={() => setActiveRollId(group.id)}
                                        >
                                            ZAR AT (3D)
                                        </Button>
                                    ) : (
                                        <>
                                            <div className="text-3xl font-bold font-mono text-primary my-1">
                                                {group.total}
                                            </div>
                                            <div className="flex gap-1 mb-2">
                                                {/* Mini Dice Display */}
                                                {group.rolls.map((r, idx) => (
                                                    <span key={idx} className={cn(
                                                        "text-[10px] w-5 h-5 flex items-center justify-center rounded border",
                                                        idx === 3 ? "bg-muted text-muted-foreground opacity-50 decoration-slate-500 line-through" : "bg-primary/10 font-bold"
                                                    )}>
                                                        {r}
                                                    </span>
                                                ))}
                                            </div>
                                            <select
                                                className="w-full text-xs p-1 rounded bg-background border"
                                                value={group.assignedTo || "unassigned"}
                                                onChange={(e) => assignRoll(group.id, e.target.value as any)}
                                            >
                                                <option value="unassigned">- Seç -</option>
                                                <option value="str" disabled={rollGroups.some(g => g.assignedTo === 'str' && g.id !== group.id)}>STR</option>
                                                <option value="dex" disabled={rollGroups.some(g => g.assignedTo === 'dex' && g.id !== group.id)}>DEX</option>
                                                <option value="con" disabled={rollGroups.some(g => g.assignedTo === 'con' && g.id !== group.id)}>CON</option>
                                                <option value="int" disabled={rollGroups.some(g => g.assignedTo === 'int' && g.id !== group.id)}>INT</option>
                                                <option value="wis" disabled={rollGroups.some(g => g.assignedTo === 'wis' && g.id !== group.id)}>WIS</option>
                                                <option value="cha" disabled={rollGroups.some(g => g.assignedTo === 'cha' && g.id !== group.id)}>CHA</option>
                                            </select>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
            {/* 3D Dice Overlay */}
            <DiceOverlay
                open={activeRollId !== null}
                onOpenChange={(open) => !open && setActiveRollId(null)}
                title={`Stat #${activeRollId} İçin Zar Atılıyor`}
                type="d6"
                rollType="4d6dl"
                onComplete={handleRollComplete}
            />
        </div>
    );
}
