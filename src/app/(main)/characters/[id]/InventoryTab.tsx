
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, Shield, Sword } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface InventoryItem {
    id: string; // inventory record id
    item_id: string;
    quantity: number;
    is_equipped: boolean;
    items: {
        name: string;
        equipment_category: string;
        rarity: string;
        description: string;
    };
}

export default function InventoryTab({ characterId }: { characterId: string }) {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchOpen, setSearchOpen] = useState(false);

    const supabase = createClient();

    const fetchInventory = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("character_inventory")
            .select(`
        id,
        item_id,
        quantity,
        is_equipped,
        items (
          name,
          equipment_category,
          rarity,
          description
        )
      `)
            .eq("character_id", characterId);

        if (error) {
            toast.error("Envanter yüklenirken hata oluştu.");
            console.error(error);
        } else {
            setInventory(data as any || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchInventory();
    }, [characterId]);

    const toggleEquip = async (item: InventoryItem) => {
        const newStatus = !item.is_equipped;
        // Optimistic update
        setInventory(prev => prev.map(inv => inv.id === item.id ? { ...inv, is_equipped: newStatus } : inv));

        const { error } = await supabase.from("character_inventory").update({ is_equipped: newStatus }).eq("id", item.id);
        if (error) {
            toast.error("Durum güncellenemedi.");
            fetchInventory(); // revert
        } else {
            toast.success(newStatus ? "Eşya kuşanıladı." : "Eşya çıkarıldı.");
        }
    }

    const deleteItem = async (id: string) => {
        if (!confirm("Bu eşyayı silmek istediğine emin misin?")) return;

        setInventory(prev => prev.filter(inv => inv.id !== id));
        const { error } = await supabase.from("character_inventory").delete().eq("id", id);

        if (error) {
            toast.error("Silinemedi.");
            fetchInventory();
        } else {
            toast.success("Eşya silindi.");
        }
    }

    return (
        <div className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Envanter</h3>
                <AddItemDialog characterId={characterId} onAdd={fetchInventory} />
            </div>

            {loading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : inventory.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <p>Envanter boş.</p>
                        <p className="text-sm">"Eşya Ekle" butonunu kullanarak eşya ekleyebilirsin.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {inventory.map((inv) => (
                        <Card key={inv.id} className={`transition-colors ${inv.is_equipped ? 'border-primary/50 bg-primary/5' : ''}`}>
                            <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                                <div>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        {inv.items.name}
                                        {inv.quantity > 1 && <Badge variant="secondary">x{inv.quantity}</Badge>}
                                    </CardTitle>
                                    <CardDescription className="text-xs">{inv.items.equipment_category} &bull; {inv.items.rarity}</CardDescription>
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteItem(inv.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-2">
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{inv.items.description}</p>
                                <Button
                                    variant={inv.is_equipped ? "default" : "outline"}
                                    size="sm"
                                    className="w-full text-xs h-8"
                                    onClick={() => toggleEquip(inv)}
                                >
                                    {inv.is_equipped ? (
                                        <><Shield className="w-3 h-3 mr-2" /> Kuşanıldı</>
                                    ) : (
                                        <><Sword className="w-3 h-3 mr-2" /> Kuşan</>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

function AddItemDialog({ characterId, onAdd }: { characterId: string, onAdd: () => void }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const supabase = createClient();

    const handleSearch = async (val: string) => {
        setSearch(val);
        if (val.length < 3) {
            setResults([]);
            return;
        }

        setSearching(true);
        const { data } = await supabase
            .from('items')
            .select('id, name, equipment_category, rarity')
            .ilike('name', `%${val}%`)
            .limit(10);

        setResults(data || []);
        setSearching(false);
    }

    const addItem = async (itemId: string) => {
        const { error } = await supabase.from('character_inventory').insert({
            character_id: characterId,
            item_id: itemId,
            quantity: 1
        });

        if (error) {
            toast.error("Eşya eklenemedi.");
        } else {
            toast.success("Eşya eklendi!");
            setOpen(false);
            setSearch("");
            setResults([]);
            onAdd();
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Eşya Ekle</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Envantere Eşya Ekle</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <Input
                        placeholder="Eşya adı ara..."
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                    <div className="max-h-[300px] overflow-y-auto space-y-2">
                        {searching && <p className="text-sm text-center text-muted-foreground">Aranıyor...</p>}
                        {results.map(item => (
                            <div key={item.id} className="flex justify-between items-center p-2 border rounded hover:bg-muted/50 cursor-pointer" onClick={() => addItem(item.id)}>
                                <div>
                                    <p className="font-medium text-sm">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">{item.equipment_category} &bull; {item.rarity}</p>
                                </div>
                                <Plus className="w-4 h-4 text-muted-foreground" />
                            </div>
                        ))}
                        {search.length >= 3 && results.length === 0 && !searching && (
                            <p className="text-sm text-center text-muted-foreground">Eşya bulunamadı.</p>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
