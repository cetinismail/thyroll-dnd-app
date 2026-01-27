"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, RefreshCw, Dna } from "lucide-react";
import { cn } from "@/lib/utils";

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
    const [availableArray, setAvailableArray] = useState<number[]>([]);

    useEffect(() => {
        if (method === "standard") {
            // Find which numbers from standard array are NOT used in current stats
            // This is complex because duplicates. Simplification: Reset stats when switching to Standard Array?
            // Better: Just reset to 8s when entering Standard Mode or Point Buy Mode for the first time?
            // For now, we'll just handle valid inputs purely via the UI.
        } else if (method === "pointbuy") {
            // Ensure stats are within range for point buy logic on switch
            const cleanStats = { ...stats };
            let changed = false;
            Object.keys(cleanStats).forEach(key => {
                const k = key as keyof Stats;
                if (cleanStats[k] < 8) { cleanStats[k] = 8; changed = true; }
                if (cleanStats[k] > 15) { cleanStats[k] = 15; changed = true; }
            });
            // We won't force update here to avoid infinite loops, but UI buttons will enforce limits.
        }
    }, [method, stats]);

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

    return (
        <div className="space-y-6">
            <Tabs defaultValue="pointbuy" onValueChange={(v) => { setMethod(v as any); resetToBase(); }}>
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
                                        variant="ghost"
                                        size="sm"
                                        disabled={val <= 8}
                                        onClick={() => {
                                            // Simple cycle logic for Standard Array could be complex UX.
                                            // For now simpler Manual-like adjustment but visual aid
                                            // Or just rely on the 'Manual' tab for fine tuning if they don't want the default set.
                                            // Let's implement a swap mechanism? Too complex for 1 file.
                                            // Fallback: Just standard +/- but warn if not matching array?
                                            // Better: Just let them edit freely here but with the visual guide above.
                                            setStats({ ...stats, [key]: Math.max(1, val - 1) })
                                        }}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="font-mono text-xl font-bold w-8 text-center">{val}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        disabled={val >= 20}
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

                {/* --- MANUAL --- */}
                <TabsContent value="manual">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {Object.entries(stats).map(([key, val]) => (
                            <div key={key} className="flex items-center justify-between border p-3 rounded-md">
                                <Label htmlFor={key} className="uppercase font-bold text-lg">{key}</Label>
                                <div className="flex items-center space-x-3">
                                    <Button variant="outline" size="icon" onClick={() => setStats({ ...stats, [key]: Math.max(1, val - 1) })} disabled={val <= 1}>
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="font-mono text-xl w-8 text-center">{val}</span>
                                    <Button variant="outline" size="icon" onClick={() => setStats({ ...stats, [key]: Math.min(20, val + 1) })} disabled={val >= 20}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
