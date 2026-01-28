
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Skull, Sword } from "lucide-react";
import Link from "next/link";

const categories = [
    {
        title: "Büyüler",
        description: "Arcane ve Divine büyülerin tam listesi.",
        icon: BookOpen,
        href: "/compendium/spells",
        color: "text-blue-500",
        bg: "bg-blue-500/10",
    },
    {
        title: "Canavarlar",
        description: "D&D evrenindeki yaratıklar ve özellikleri.",
        icon: Skull,
        href: "/compendium/monsters",
        color: "text-red-500",
        bg: "bg-red-500/10",
    },
    {
        title: "Eşyalar",
        description: "Silahlar, zırhlar ve büyülü eşyalar.",
        icon: Sword,
        href: "/compendium/items",
        color: "text-amber-500",
        bg: "bg-amber-500/10",
    },
];

export default function CompendiumPage() {
    return (
        <div className="container mx-auto py-8 space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Kütüphane</h1>
                <p className="text-muted-foreground">
                    Dungeons & Dragons 5e referans kaynaklarına buradan ulaşabilirsiniz.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                    <Link key={category.title} href={category.href} className="block group">
                        <Card className="h-full transition-all duration-300 hover:border-primary hover:shadow-lg hover:-translate-y-1">
                            <CardHeader>
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${category.bg} ${category.color}`}>
                                    <category.icon className="w-6 h-6" />
                                </div>
                                <CardTitle className="group-hover:text-primary transition-colors">
                                    {category.title}
                                </CardTitle>
                                <CardDescription>
                                    {category.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                                    İncele &rarr;
                                </span>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
