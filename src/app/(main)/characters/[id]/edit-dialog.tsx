"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { updateCharacter } from "./actions";

import { CounterInput } from "@/components/ui/counter-input";

export function EditCharacterDialog({ character }: { character: any }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: character.name,
        level: character.level,
        current_hp: character.current_hp,
        max_hp: character.max_hp,
        armor_class: character.armor_class || 10,
        background: character.background || "",
        appearance: character.appearance || "",
        stats: {
            str: character.strength,
            dex: character.dexterity,
            con: character.constitution,
            int: character.intelligence,
            wis: character.wisdom,
            cha: character.charisma,
        }
    });

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleStatChange = (stat: string, value: number) => {
        setFormData(prev => ({
            ...prev,
            stats: { ...prev.stats, [stat]: value }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateCharacter(character.id, formData);
            toast.success("Karakter güncellendi!");
            setOpen(false);
        } catch (error) {
            toast.error("Karakter güncellenirken hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Edit className="h-4 w-4" />
                    Düzenle
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Karakteri Düzenle</DialogTitle>
                    <DialogDescription>
                        Karakterinin bilgilerini buradan güncelleyebilirsin.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">İsim</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            className="bg-card/50 border-primary/30"
                        />
                    </div>

                    {/* ... inside the component */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="level">Seviye</Label>
                            <CounterInput
                                value={formData.level}
                                onChange={(val) => handleChange("level", val)}
                                min={1}
                                max={20}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="armor_class">Zırh Sınıfı (AC)</Label>
                            <CounterInput
                                value={formData.armor_class}
                                onChange={(val) => handleChange("armor_class", val)}
                                min={1}
                                max={30}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="current_hp">Mevcut HP</Label>
                            <CounterInput
                                value={formData.current_hp}
                                onChange={(val) => handleChange("current_hp", val)}
                                min={0}
                                max={formData.max_hp}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="max_hp">Maksimum HP</Label>
                            <CounterInput
                                value={formData.max_hp}
                                onChange={(val) => handleChange("max_hp", val)}
                                min={1}
                                max={500}
                            />
                        </div>
                    </div>

                    <div className="border-t pt-4 mt-2">
                        <Label className="mb-4 block text-center font-bold text-muted-foreground">Yetenek Puanları (Stats)</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                            {Object.entries(formData.stats).map(([key, val]) => (
                                <div key={key} className="flex items-center justify-between border-b pb-2 border-border/30">
                                    <Label htmlFor={key} className="uppercase font-bold text-sm w-12">{key}</Label>
                                    <CounterInput
                                        value={val as number}
                                        onChange={(newVal) => handleStatChange(key, newVal)}
                                        min={1}
                                        max={30}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="background">Hikaye (Geçmiş)</Label>
                        <Textarea
                            id="background"
                            value={formData.background}
                            onChange={(e) => handleChange("background", e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="appearance">Görünüm</Label>
                        <Textarea
                            id="appearance"
                            value={formData.appearance}
                            onChange={(e) => handleChange("appearance", e.target.value)}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
