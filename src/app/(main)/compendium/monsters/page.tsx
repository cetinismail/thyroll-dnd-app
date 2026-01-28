
import { createClient } from "@/lib/supabase/server";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skull } from "lucide-react";
import Link from 'next/link';

export default async function MonstersPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; page?: string }>;
}) {
    const params = await searchParams;
    const query = params.q || "";
    const page = Number(params.page) || 1;
    const pageSize = 20;

    const supabase = await createClient();

    let dbQuery = supabase
        .from("monsters")
        .select("*", { count: "exact" })
        .order("name", { ascending: true })
        .range((page - 1) * pageSize, page * pageSize - 1);

    if (query) {
        dbQuery = dbQuery.ilike("name", `%${query}%`);
    }

    const { data: monsters, error, count } = await dbQuery;

    if (error) {
        console.error(error);
        return <div>Bir hata oluştu.</div>;
    }

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <Link href="/compendium" className="text-sm text-muted-foreground hover:text-primary mb-2 inline-block">&larr; Kütüphane</Link>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Skull className="w-8 h-8 text-red-500" />
                        Canavarlar
                    </h1>
                    <p className="text-muted-foreground text-sm">Toplam {count} canavar listeleniyor.</p>
                </div>

                <form className="w-full md:w-1/3">
                    <Input
                        name="q"
                        placeholder="Canavar ara (örn: Goblin)..."
                        defaultValue={query}
                        className="w-full"
                    />
                </form>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {monsters?.map((monster) => (
                    <Card key={monster.id} className="hover:border-red-500/50 transition-colors">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">{monster.name}</CardTitle>
                                <Badge variant="outline">CR {monster.challenge_rating}</Badge>
                            </div>
                            <CardDescription className="text-xs capitalize">{monster.size} {monster.type} &bull; {monster.alignment}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between text-sm mb-2">
                                <span>AC: <span className="font-medium">{monster.armor_class}</span></span>
                                <span>HP: <span className="font-medium">{monster.hit_points}</span></span>
                            </div>
                            <div className="text-sm text-muted-foreground line-clamp-3">
                                {/* 
                    Monsters often don't have a single 'description' field in SRD like spells do.
                    They have complex stats. We might show special abilities or the translated bio here if available.
                 */}
                                {monster.translation?.description || "Detaylar için karta tıklayın (Yakında)."}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex justify-center gap-2 mt-8">
                {page > 1 && (
                    <Link href={`/compendium/monsters?page=${page - 1}${query ? `&q=${query}` : ''}`} className="px-4 py-2 border rounded hover:bg-muted">
                        Önceki
                    </Link>
                )}
                {(count || 0) > page * pageSize && (
                    <Link href={`/compendium/monsters?page=${page + 1}${query ? `&q=${query}` : ''}`} className="px-4 py-2 border rounded hover:bg-muted">
                        Sonraki
                    </Link>
                )}
            </div>
        </div>
    );
}
