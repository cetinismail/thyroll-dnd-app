"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createCharacter, getOptions } from "./actions";
import { toast } from "sonner";
import { Minus, Plus } from "lucide-react";
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { StatBuilder } from "./stat-builder";
import { EquipmentSelection } from "./EquipmentSelection";

export default function CharacterWizard() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [races, setRaces] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        name: "",
        race: "",
        class: "",
        stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
        background: "",
        appearance: "",
        // Equipment Data
        equipmentMethod: "class" as "class" | "gold",
        startingGold: 0,
        selectedEquipment: [] as any[] // Can hold names or objects
    });

    useEffect(() => {
        let isActive = true;
        console.log("Wizard: Component mounted. Starting data fetch...");

        const fetchData = async () => {
            const timeoutId = setTimeout(() => {
                if (isActive) {
                    console.warn("Wizard: Timeout reached (5s). Forcing UI unlock.");
                    if (loading) {
                        setLoading(false);
                        toast.warning("Sunucu yanıt vermedi, varsayılan veya boş veri ile devam ediliyor.");
                    }
                }
            }, 5000);

            try {
                const response = await getOptions();

                if (isActive) {
                    setRaces(response.races || []);
                    setClasses(response.classes || []);
                }
            } catch (error: any) {
                console.error("Wizard: Fetch error:", error);
                if (isActive) {
                    toast.error("Veri çekilemedi: " + (error.message || "Bilinmeyen hata"));
                }
            } finally {
                clearTimeout(timeoutId);
                if (isActive) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isActive = false;
        };
    }, []);

    const handleSubmit = async () => {
        if (!formData.name || !formData.race || !formData.class) {
            toast.warning("Lütfen boş alanları doldurunuz (İsim, Irk ve Sınıf).");
            return;
        }

        setLoading(true);
        try {
            await createCharacter(formData);
            toast.success("Karakter başarıyla oluşturuldu! Yönlendiriliyorsunuz...");
            router.push('/dashboard?success=Karakter başarıyla oluşturuldu');
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Karakter oluşturulurken bir hata oluştu.");
            setLoading(false);
        }
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const updateStat = (stat: string, value: number) => {
        setFormData(prev => ({
            ...prev,
            stats: { ...prev.stats, [stat]: Math.max(1, Math.min(20, value)) }
        }));
    };

    const currentClass = classes.find(c => c.id === formData.class);

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Yükleniyor...</div>
    }

    return (
        <div className="container max-w-3xl py-10">
            <div className="mb-8 relative flex flex-col md:block items-center">
                <Link href="/dashboard" className="self-start md:absolute md:left-0 md:top-1 mb-4 md:mb-0">
                    <Button variant="ghost" size="sm" className="pl-0 md:pl-4">
                        ← Panel'e Dön
                    </Button>
                </Link>
                <h1 className="text-3xl font-cinzel font-bold text-center w-full">Karakter Oluşturucu</h1>
                <div className="flex justify-center mt-2 space-x-2">
                    {/* Progress Indicator */}
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className={`h-2 w-16 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />
                    ))}
                </div>
            </div>

            {/* Navigation Buttons (Top) */}
            <div className="flex justify-between mb-4 px-1">
                <Button variant="outline" onClick={prevStep} disabled={step === 1}>Geri</Button>

                {step < 6 ? (
                    <Button onClick={nextStep}>İleri</Button>
                ) : (
                    <Button className="bg-primary text-primary-foreground" onClick={handleSubmit}>Karakteri Oluştur</Button>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">
                        {step === 1 && "Adım 1: Irk Seçimi"}
                        {step === 2 && "Adım 2: Sınıf Seçimi"}
                        {step === 3 && "Adım 3: İstatistikler"}
                        {step === 4 && "Adım 4: Başlangıç Ekipmanı"}
                        {step === 5 && "Adım 5: Karakter Hikayesi"}
                        {step === 6 && "Adım 6: Özet & Onay"}
                    </CardTitle>
                    <CardDescription>
                        {step === 1 && "Doğuştan gelen yeteneklerini belirle."}
                        {step === 2 && "Hayattaki yolunu ve savaş tarzını seç."}
                        {step === 3 && "Güçlerini ve zayıflıklarını dağıt."}
                        {step === 4 && "Maceraya nasıl hazırlanacaksın?"}
                        {step === 5 && "Karakterinin geçmişini ve görünümünü anlat."}
                        {step === 6 && "Karakterine son bir bakış at ve maceraya başla."}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {step === 1 && (
                        <RadioGroup onValueChange={(val) => setFormData({ ...formData, race: val })} value={formData.race}>
                            <div className="grid gap-4">
                                {races.map((race) => (
                                    <div key={race.id} className="flex items-center space-x-2 border-2 border-primary/20 bg-card/40 p-4 rounded-lg cursor-pointer hover:bg-primary/10 hover:border-primary/50 transition-all [&:has([aria-checked=true])]:border-primary [&:has([aria-checked=true])]:bg-primary/5">
                                        <RadioGroupItem value={race.id} id={race.id} />
                                        <Label htmlFor={race.id} className="flex-1 cursor-pointer">
                                            <span className="font-bold">{race.name}</span>
                                            <p className="text-sm text-muted-foreground">{race.description}</p>
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </RadioGroup>
                    )}

                    {step === 2 && (
                        <RadioGroup onValueChange={(val) => setFormData({ ...formData, class: val })} value={formData.class}>
                            <div className="grid gap-4">
                                {classes.map((cls) => (
                                    <div key={cls.id} className="flex items-center space-x-2 border-2 border-primary/20 bg-card/40 p-4 rounded-lg cursor-pointer hover:bg-primary/10 hover:border-primary/50 transition-all [&:has([aria-checked=true])]:border-primary [&:has([aria-checked=true])]:bg-primary/5">
                                        <RadioGroupItem value={cls.id} id={cls.id} />
                                        <Label htmlFor={cls.id} className="flex-1 cursor-pointer">
                                            <span className="font-bold">{cls.name}</span>
                                            <p className="text-sm text-muted-foreground">{cls.description}</p>
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </RadioGroup>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <StatBuilder
                                stats={formData.stats}
                                setStats={(newStats) => setFormData({ ...formData, stats: newStats })}
                            />
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-6">
                            {currentClass ? (
                                <EquipmentSelection
                                    selectedClass={currentClass}
                                    onSelectionChange={(sel) => setFormData({
                                        ...formData,
                                        equipmentMethod: sel.type,
                                        startingGold: sel.gold || 0,
                                        selectedEquipment: sel.choices || []
                                    })}
                                />
                            ) : (
                                <div className="text-center text-red-500">Önce bir sınıf seçmelisin.</div>
                            )}
                        </div>
                    )}

                    {step === 5 && (
                        <div className="space-y-4">
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="appearance">Görünüm Tasviri</Label>
                                <textarea
                                    id="appearance"
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Uzun boylu, yara izi olan..."
                                    value={formData.appearance}
                                    onChange={(e) => setFormData({ ...formData, appearance: e.target.value })}
                                />
                            </div>
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="background">Karakter Hikayesi</Label>
                                <textarea
                                    id="background"
                                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Küçük bir köyde doğdu..."
                                    value={formData.background}
                                    onChange={(e) => setFormData({ ...formData, background: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    {step === 6 && (
                        <div className="space-y-4">
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="name">Karakter Adı</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Efsanevi bir isim gir..."
                                />
                            </div>
                            <div className="bg-muted p-4 rounded-md text-sm space-y-2">
                                <p><strong>Irk:</strong> {races.find(r => r.id === formData.race)?.name || "Seçilmedi"}</p>
                                <p><strong>Sınıf:</strong> {classes.find(c => c.id === formData.class)?.name || "Seçilmedi"}</p>
                                <p><strong>Ekipman:</strong> {formData.equipmentMethod === 'gold' ? `${formData.startingGold} GP` : "Sınıf Paketi"}</p>
                                <p><strong>Hikaye Özeti:</strong> {formData.background ? formData.background.slice(0, 50) + "..." : "Girilmedi"}</p>
                            </div>
                        </div>
                    )}
                </CardContent>

                {/* CardFooter removed as buttons are moved to top */}
            </Card>
        </div>
    );
}
