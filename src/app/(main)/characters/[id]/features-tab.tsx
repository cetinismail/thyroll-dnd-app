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
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-muted rounded-lg bg-card/50 min-h-[200px]">
                <Shield className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground text-center max-w-[300px]">
                    Bu seviyede veya bu sınıf/ırk için henüz görüntülenecek bir özellik bulunmuyor.
                </p>
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
