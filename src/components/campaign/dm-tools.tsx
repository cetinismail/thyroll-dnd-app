"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Heart, Gift, Search, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import { updateCharacterHP, searchItems, giveItem } from "@/lib/actions/dm-tools";

interface DMToolsProps {
    characterId: string;
    characterName: string;
    currentHp: number;
    maxHp: number;
}

export function DMTools({ characterId, characterName, currentHp, maxHp }: DMToolsProps) {
    const [open, setOpen] = useState(false);

    // HP State
    const [hp, setHp] = useState(currentHp);

    // Item State
    const [itemSearch, setItemSearch] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [loadingSearch, setLoadingSearch] = useState(false);

    const handleHpUpdate = async (newVal: number) => {
        const val = Math.max(0, Math.min(maxHp, newVal)); // Clamp
        setHp(val);
        try {
            await updateCharacterHP(characterId, val);
            toast.success(`${characterName} canı güncellendi: ${val}`);
        } catch (e) {
            toast.error("Hata oluştu");
        }
    };

    const handleSearch = async (q: string) => {
        setItemSearch(q);
        if (q.length < 3) return;
        setLoadingSearch(true);
        const res = await searchItems(q);
        setSearchResults(res);
        setLoadingSearch(false);
    };

    const handleGiveItem = async (itemId: string, itemName: string) => {
        try {
            await giveItem(characterId, itemId);
            toast.success(`${itemName} envantere eklendi!`);
        } catch (e) {
            toast.error("Eşya verilemedi.");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full gap-2 border-primary/20 hover:bg-primary/10 hover:text-primary">
                    <Zap className="w-3 h-3" /> Müdahale Et
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-500" /> DM Konsolu: <span className="text-primary">{characterName}</span>
                    </DialogTitle>
                    <DialogDescription>
                        Oyuncunun durumuna doğrudan müdahale et.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="hp" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="hp">Can (HP)</TabsTrigger>
                        <TabsTrigger value="loot">Eşya Ver</TabsTrigger>
                    </TabsList>

                    {/* HP TAB */}
                    <TabsContent value="hp" className="space-y-4 py-4">
                        <div className="flex flex-col items-center gap-4">
                            <div className="text-4xl font-mono font-bold flex items-baseline gap-1">
                                <span className={hp < maxHp / 2 ? "text-red-500" : "text-green-500"}>{hp}</span>
                                <span className="text-sm text-muted-foreground">/{maxHp}</span>
                            </div>

                            <div className="flex items-center gap-2 w-full justify-center">
                                <Button size="icon" variant="outline" onClick={() => handleHpUpdate(hp - 1)}>
                                    <Minus className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="outline" onClick={() => handleHpUpdate(hp + 1)}>
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-2 w-full">
                                <Button variant="destructive" onClick={() => handleHpUpdate(hp - 5)}>
                                    <Heart className="w-4 h-4 mr-2" /> -5 Hasar
                                </Button>
                                <Button variant="secondary" className="bg-green-600/20 hover:bg-green-600/40 text-green-400" onClick={() => handleHpUpdate(hp + 5)}>
                                    <Heart className="w-4 h-4 mr-2" /> +5 İyileştir
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    {/* LOOT TAB */}
                    <TabsContent value="loot" className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Eşya Ara</Label>
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Kılıç, Kalkan, İksir..."
                                    className="pl-8"
                                    value={itemSearch}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                            {loadingSearch && <div className="text-xs text-center text-muted-foreground">Aranıyor...</div>}

                            {searchResults.map(item => (
                                <div key={item.id} className="flex items-center justify-between p-2 border rounded bg-card/50 hover:bg-card transition-colors">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm">{item.name}</span>
                                        <span className="text-[10px] text-muted-foreground uppercase">{item.rarity}</span>
                                    </div>
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleGiveItem(item.id, item.name)}>
                                        <Gift className="w-4 h-4 text-primary" />
                                    </Button>
                                </div>
                            ))}

                            {itemSearch.length > 2 && searchResults.length === 0 && !loadingSearch && (
                                <div className="text-xs text-center text-muted-foreground">Sonuç bulunamadı.</div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
