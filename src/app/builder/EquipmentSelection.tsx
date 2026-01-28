
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, Package } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EquipmentOption {
    choose: number;
    type: string;
    from: any; // Complex nested structure
    desc?: string; // Added for description
}

interface ClassEquipmentData {
    mandatory: any[];
    options: EquipmentOption[];
}

interface EquipmentSelectionProps {
    selectedClass: any;
    onSelectionChange: (selection: { type: 'gold' | 'class', gold?: number, choices?: any[] }) => void;
}

// Static Pack Contents Definition
const PACK_CONTENTS: Record<string, string[]> = {
    "Explorer's Pack": ["Backpack", "Bedroll", "Mess kit", "Tinderbox", "Torches (10)", "Rations (10 days)", "Waterskin", "Hempen rope (50 feet)"],
    "Dungeoneer's Pack": ["Backpack", "Crowbar", "Hammer", "Pitons (10)", "Torches (10)", "Tinderbox", "Rations (10 days)", "Waterskin", "Hempen rope (50 feet)"],
    "Burglar's Pack": ["Backpack", "Ball bearings (1000)", "String (10 feet)", "Bell", "Candles (5)", "Crowbar", "Hammer", "Pitons (10)", "Hooded lantern", "Oil (2 flasks)", "Rations (5 days)", "Tinderbox", "Waterskin"],
    "Priest's Pack": ["Backpack", "Blanket", "Candles (10)", "Tinderbox", "Alms box", "Incense (2 blocks)", "Censer", "Vestments", "Rations (2 days)", "Waterskin"],
    "Scholar's Pack": ["Backpack", "Book of Lore", "Ink (1 ounce bottle)", "Ink pen", "Parchment (10 sheets)", "Little bag of sand", "Small knife"],
    "Diplomat's Pack": ["Chest", "Map/Scroll case (2)", "Fine clothes", "Bottle of ink", "Ink pen", "Lamp", "Oil (2 flasks)", "Paper (5 sheets)", "Perfume", "Sealing wax", "Soap"],
    "Entertainer's Pack": ["Backpack", "Bedroll", "Costumes (2)", "Candles (5)", "Rations (5 days)", "Waterskin", "Disguise kit"]
};

export function EquipmentSelection({ selectedClass, onSelectionChange }: EquipmentSelectionProps) {
    const [method, setMethod] = useState<"class" | "gold">("class");
    const [choices, setChoices] = useState<Record<number, any>>({});

    const equipmentData: ClassEquipmentData = selectedClass?.starting_equipment || { mandatory: [], options: [] };

    useEffect(() => {
        // Notify parent of initial state
        notifyParent(method, choices);
    }, [method, choices]);

    // Handle choice selection
    const handleChoice = (optionIndex: number, selectedValue: string) => {
        setChoices(prev => ({ ...prev, [optionIndex]: selectedValue }));
    };

    const notifyParent = (currentMethod: "class" | "gold", currentChoices: any) => {
        onSelectionChange({
            type: currentMethod,
            gold: currentMethod === 'gold' ? 100 : 0,
            choices: currentMethod === 'class' ? Object.values(currentChoices) : []
        });
    }

    // Robust Helper to extract usable options list
    const getOptionsList = (opt: EquipmentOption): any[] => {
        if (!opt.from) return [];

        // Case A: Direct Array (Simple options)
        if (Array.isArray(opt.from)) return opt.from;

        // Case B: Nested Options Object (common in Barbarian, Bard, Monk)
        // Structure: { option_set_type: "options_array", options: [...] }
        if (typeof opt.from === 'object' && 'options' in opt.from && Array.isArray((opt.from as any).options)) {
            return (opt.from as any).options;
        }

        // Case C: Equipment Category (e.g., "Druidic Foci")
        // Structure: { option_set_type: "equipment_category", equipment_category: {...} }
        if (typeof opt.from === 'object' && 'equipment_category' in opt.from) {
            // We synthesize this as a single "option" for the dropdown, 
            // representing that the user CAN choose anything from that category.
            // In a full app, we might fetch the category items, but here we simplify.
            return [{
                manual_name: `Herhangi bir ${(opt.from as any).equipment_category.name}`
            }];
        }

        return [];
    };

    const renderOption = (opt: EquipmentOption, index: number) => {
        const optionsList = getOptionsList(opt);

        if (optionsList.length === 0) {
            // Determine if it was a data error or just empty
            if (opt.from) console.warn("Could not parse options for:", opt);
            return <div key={index} className="text-sm text-red-400 mb-2 p-2 border border-red-200 rounded">Bu seçenek için veri yüklenemedi.</div>;
        }

        // If choosing more than 1, we show a simplified message for now
        if (opt.choose !== 1) {
            return (
                <div key={index} className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                    <p className="text-sm font-medium text-yellow-600 mb-1">Çoklu Seçim (Seç: {opt.choose})</p>
                    <p className="text-xs text-muted-foreground">{opt.desc}</p>
                </div>
            )
        }

        return (
            <div key={index} className="mb-4">
                <Label className="mb-2 block text-sm font-medium">Seçenek {index + 1}:</Label>
                <div className="text-xs text-muted-foreground mb-1.5">{opt.desc}</div>
                <Select onValueChange={(val) => handleChoice(index, val)}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seçim yapınız..." />
                    </SelectTrigger>
                    <SelectContent>
                        {optionsList.map((item: any, i: number) => {
                            let name = "Bilinmeyen Eşya";

                            // Parsing logic for different item structures from D&D API
                            if (item.manual_name) {
                                name = item.manual_name;
                            } else if (item.option_type === 'counted_reference' && item.of) {
                                name = item.of.name;
                            } else if (item.option_type === 'choice' && item.choice) {
                                // "choice.desc" usually holds "any simple weapon" etc.
                                name = item.choice.desc;
                                // Capitalize first letter
                                name = name.charAt(0).toUpperCase() + name.slice(1);
                            } else if (item.equipment) {
                                name = item.equipment.name;
                            } else if (item.equipment_option) {
                                name = `Herhangi bir ${item.equipment_option.choose} ${item.equipment_option.type}`;
                            } else if (item.item) {
                                name = item.item.name;
                            } else if (typeof item === 'object' && item.name) {
                                name = item.name;
                            }

                            // Append count if > 1
                            if (item.count && item.count > 1) name += ` (x${item.count})`;
                            if (item.quantity && item.quantity > 1) name += ` (x${item.quantity})`;

                            // Prevent duplicates in key
                            return (
                                <SelectItem key={`${index}-${i}`} value={name}>{name}</SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>
            </div>
        )
    };

    return (
        <div className="space-y-6">
            <Tabs defaultValue="class" value={method} onValueChange={(v) => setMethod(v as any)} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="class">
                        <Package className="w-4 h-4 mr-2" />
                        Sınıf Ekipmanı
                    </TabsTrigger>
                    <TabsTrigger value="gold">
                        <Coins className="w-4 h-4 mr-2" />
                        Altın Başlangıcı
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="class">
                    <Card>
                        <CardHeader>
                            <CardTitle>Sınıf Başlangıç Paketi</CardTitle>
                            <CardDescription>{selectedClass?.name} sınıfı için standart ekipmanlar.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Mandatory Items */}
                            {equipmentData.mandatory && equipmentData.mandatory.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold mb-3 text-primary">Standart Verilenler:</h4>
                                    <ul className="grid gap-3">
                                        {equipmentData.mandatory.map((m: any, i: number) => {
                                            const itemName = m.equipment ? m.equipment.name : (m.name || "Eşya");
                                            const packContents = PACK_CONTENTS[itemName];

                                            return (
                                                <li key={i} className="bg-muted/30 p-3 rounded-md border text-sm">
                                                    <div className="flex items-center justify-between font-medium">
                                                        <span>{itemName}</span>
                                                        {m.quantity > 1 && <Badge variant="secondary">x{m.quantity}</Badge>}
                                                    </div>

                                                    {/* Show Pack Contents if available */}
                                                    {packContents && (
                                                        <div className="mt-2 pl-2 text-xs text-muted-foreground border-l-2 border-primary/20">
                                                            <span className="font-semibold block mb-1">Paket İçeriği:</span>
                                                            {packContents.join(", ")}
                                                        </div>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}

                            {/* Optional Choices */}
                            {equipmentData.options && equipmentData.options.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold mb-3 text-primary mt-6">Seçimler:</h4>
                                    <div className="space-y-4 border p-4 rounded-md bg-muted/20">
                                        {equipmentData.options.map((opt, i) => renderOption(opt, i))}
                                    </div>
                                </div>
                            )}

                            {(!equipmentData.mandatory?.length && !equipmentData.options?.length) && (
                                <p className="text-sm text-muted-foreground">Bu sınıf için tanımlı başlangıç ekipmanı verisi bulunamadı.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="gold">
                    <Card>
                        <CardHeader>
                            <CardTitle>Altın ile Başla</CardTitle>
                            <CardDescription>Ekipman yerine nakit altın al, kendi alışverişini yap.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                                <div className="w-20 h-20 rounded-full bg-yellow-100/50 flex items-center justify-center text-yellow-600 shadow-inner">
                                    <Coins className="w-10 h-10" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-bold font-cinzel text-primary">100 GP</h3>
                                    <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">Başlangıç Altını</p>
                                </div>
                                <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                                    Sınıf paketini reddedip serbest piyasaya atıl. Şehre indiğinde dilediğin silahı, zırhı veya iksiri satın alabilirsin.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
