"use client";

import { useState } from "react";
import { FeaturesTab } from "./features-tab";
import { SpellsTab } from "./spells-tab";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, Shield, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";

export function CharacterTabs({ character, features, spells }: { character: any, features: any[], spells: any[] }) {
    const [activeTab, setActiveTab] = useState<"features" | "spells" | "bio">("features");

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex p-1 bg-muted/50 rounded-lg">
                <Button
                    variant="ghost"
                    onClick={() => setActiveTab("features")}
                    className={cn(
                        "flex-1 gap-2 rounded-md font-cinzel text-base transition-all",
                        activeTab === "features" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Shield className="h-4 w-4" />
                    Özellikler
                </Button>
                <Button
                    variant="ghost"
                    onClick={() => setActiveTab("spells")}
                    className={cn(
                        "flex-1 gap-2 rounded-md font-cinzel text-base transition-all",
                        activeTab === "spells" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Book className="h-4 w-4" />
                    Büyüler
                </Button>
                <Button
                    variant="ghost"
                    onClick={() => setActiveTab("bio")}
                    className={cn(
                        "flex-1 gap-2 rounded-md font-cinzel text-base transition-all",
                        activeTab === "bio" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <ScrollText className="h-4 w-4" />
                    Hikaye
                </Button>
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {activeTab === "features" && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-cinzel">Sınıf ve Irk Özellikleri</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FeaturesTab features={features} className={character.classes.name} />
                        </CardContent>
                    </Card>
                )}

                {activeTab === "spells" && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-cinzel">Büyü Kitabı</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <SpellsTab spells={spells} />
                        </CardContent>
                    </Card>
                )}

                {activeTab === "bio" && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-cinzel text-lg">Karakter Hikayesi</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="text-sm font-semibold mb-1 text-primary">Geçmiş</h4>
                                <p className="text-sm text-foreground/80 leading-relaxed">
                                    {character.background || "Bu karakterin hikayesi henüz yazılmamış."}
                                </p>
                            </div>
                            <div className="pt-4 border-t">
                                <h4 className="text-sm font-semibold mb-1 text-primary">Görünüm</h4>
                                <p className="text-sm text-foreground/80 leading-relaxed">
                                    {character.appearance || "Görünüm tasviri yok."}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
