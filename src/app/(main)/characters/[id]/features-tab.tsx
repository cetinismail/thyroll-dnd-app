"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Zap, Shield } from "lucide-react";

interface Feature {
    id: string;
    name: string;
    description: string;
    level_required: number;
    source_type: string;
}

interface FeaturesTabProps {
    features: Feature[];
    className?: string; // Character Class Name
}

export function FeaturesTab({ features, className }: FeaturesTabProps) {
    if (features.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                <Shield className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p>Bu seviyede henüz aktif bir özellik yok veya veritabanı bağlantısı yapılmadı.</p>
            </div>
        );
    }

    return (
        <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
                {features.map((feature) => (
                    <Card key={feature.id} className="border-l-4 border-l-primary/50 bg-card/50 hover:bg-card hover:shadow-md transition-all">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-cinzel flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-amber-500" />
                                    {feature.name}
                                </CardTitle>
                                <Badge variant="secondary" className="text-xs">
                                    Seviye {feature.level_required}
                                </Badge>
                            </div>
                            <CardDescription className="text-xs text-primary/80 font-medium">
                                {className} Özelliği
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-foreground/80 leading-relaxed">
                                {feature.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </ScrollArea>
    );
}
