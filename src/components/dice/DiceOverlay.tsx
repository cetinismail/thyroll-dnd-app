"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Dna, RefreshCw } from "lucide-react";
import { ThreeMultiDice } from "./ThreeMultiDice";

interface DiceOverlayProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    numDice?: number; // Default 1 (d20)
    bonus?: number;
    type?: "d20" | "d6" | "d8" | "d10" | "d12" | "d4";
    onComplete?: (result: number, rolls?: number[]) => void; // Updated callback
    rollType?: "standard" | "4d6dl"; // 4d6 drop lowest
}

export function DiceOverlay({ open, onOpenChange, title, numDice = 1, bonus = 0, type = "d20", onComplete, rollType = "standard" }: DiceOverlayProps) {
    const [rolling, setRolling] = useState(false);
    const [total, setTotal] = useState<number | null>(null);
    const [finalResult, setFinalResult] = useState<number | null>(null);
    const [diceResults, setDiceResults] = useState<number[]>([]);

    // Reset state when opened
    useEffect(() => {
        if (open) {
            roll();
        }
    }, [open]);

    const roll = () => {
        setRolling(true);
        setTotal(null);
        setFinalResult(null);
        // Initial setup for visual spinning
        if (rollType === "4d6dl") setDiceResults([1, 1, 1, 1]);
        else setDiceResults([1]);

        // Simulate rolling time sync with Three.js spin
        setTimeout(() => {
            let result = 0;
            let currentRolls: number[] = [];

            if (rollType === "4d6dl") {
                // 4d6 Drop Lowest
                currentRolls = [
                    Math.floor(Math.random() * 6) + 1,
                    Math.floor(Math.random() * 6) + 1,
                    Math.floor(Math.random() * 6) + 1,
                    Math.floor(Math.random() * 6) + 1
                ];
                // Copy for sorting logic for Drop Lowest
                const r = [...currentRolls];
                r.sort((a, b) => b - a);
                result = r[0] + r[1] + r[2];
            } else {
                // Standard single die
                const max = parseInt(type.substring(1)) || 20;
                const r = Math.floor(Math.random() * max) + 1;
                result = r;
                currentRolls = [r];
            }

            setRolling(false);
            setDiceResults(currentRolls);
            setTotal(result);
            setFinalResult(result + bonus);

            setFinalResult(result + bonus);

            // Trigger callback visually complete, but wait for user interaction
            // if (onComplete) {
            //    setTimeout(() => onComplete(result + bonus), 1000); 
            // }
        }, 1500);
    };

    const handleAccept = () => {
        if (onComplete && total !== null) {
            onComplete(finalResult || 0, diceResults);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-slate-900/95 border-slate-700 text-white backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="text-center font-cinzel text-2xl text-yellow-500">
                        {title}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center min-h-[300px] gap-6 py-6 border border-slate-800 rounded-xl bg-black/20">

                    {/* 3D DICE RENDERER */}
                    <div className="w-full h-[300px] flex items-center justify-center relative p-4">
                        <ThreeMultiDice rolling={rolling} results={diceResults} type={type} />
                    </div>

                    {/* RESULT TEXT AREA */}
                    <div className="flex flex-col items-center min-h-[40px] relative z-10 -mt-2">
                        {!rolling && total !== null ? (
                            <div className="text-center space-y-1 animate-in slide-in-from-bottom-5 fade-in duration-500">
                                <div className="text-lg font-cinzel text-yellow-500 font-bold border px-4 py-1 rounded bg-black/40 border-yellow-500/30">
                                    Toplam: {finalResult} {bonus !== 0 && <span className="text-muted-foreground text-sm font-normal">({total} + {bonus})</span>}
                                </div>
                            </div>
                        ) : (
                            <div className="h-4" />
                        )}
                    </div>

                    {/* ACTIONS */}
                    {!rolling && total !== null && (
                        <div className="flex gap-2 mt-2">
                            <Button variant="outline" onClick={roll} className="gap-2 border-white/20 hover:bg-white/10 text-white">
                                <RefreshCw className="w-4 h-4" /> Tekrar At
                            </Button>
                            <Button onClick={handleAccept} className="gap-2 bg-yellow-600 hover:bg-yellow-700 text-white">
                                <Dna className="w-4 h-4" /> Sonucu Kullan
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
