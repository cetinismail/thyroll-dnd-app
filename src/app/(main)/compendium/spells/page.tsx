
import { createClient } from "@/lib/supabase/server";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import Link from 'next/link';

// Simple search component (client-side interactive would be better, but let's start with server fetch)
// Actually, for a good "browser", we usually need client-side filtering or URL params.
// Let's implement a basic server component that lists spells, and we can add search later or use query params.

export default async function SpellsPage({
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
        .from("spells")
        .select("*", { count: "exact" })
        .order("name", { ascending: true })
        .range((page - 1) * pageSize, page * pageSize - 1);

    if (query) {
        dbQuery = dbQuery.ilike("name", `%${query}%`);
    }

    const { data: spells, error, count } = await dbQuery;

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
                        <BookOpen className="w-8 h-8 text-blue-500" />
                        Büyüler
                    </h1>
                    <p className="text-muted-foreground text-sm">Toplam {count} büyü listeleniyor.</p>
                </div>

                <form className="w-full md:w-1/3">
                    <Input
                        name="q"
                        placeholder="Büyü ara (örn: Fireball)..."
                        defaultValue={query}
                        className="w-full"
                    />
                </form>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {spells?.map((spell) => (
                    <Card key={spell.id} className="hover:border-blue-500/50 transition-colors">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">{spell.name}</CardTitle>
                                <Badge variant="outline">{spell.level === 0 ? "Cantrip" : `Level ${spell.level}`}</Badge>
                            </div>
                            <CardDescription className="text-xs">{spell.school} &bull; {spell.components}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground line-clamp-3">
                                {/* Use translation description if available, else original */}
                                {spell.translation?.description || spell.description}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Simple Pagination */}
            <div className="flex justify-center gap-2 mt-8">
                {page > 1 && (
                    <Link href={`/compendium/spells?page=${page - 1}${query ? `&q=${query}` : ''}`} className="px-4 py-2 border rounded hover:bg-muted">
                        Önceki
                    </Link>
                )}
                {(count || 0) > page * pageSize && (
                    <Link href={`/compendium/spells?page=${page + 1}${query ? `&q=${query}` : ''}`} className="px-4 py-2 border rounded hover:bg-muted">
                        Sonraki
                    </Link>
                )}
            </div>
        </div>
    );
}
