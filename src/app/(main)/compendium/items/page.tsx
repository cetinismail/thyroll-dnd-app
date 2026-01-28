
import { createClient } from "@/lib/supabase/server";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Sword } from "lucide-react";
import Link from 'next/link';

export default async function ItemsPage({
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
        .from("items")
        .select("*", { count: "exact" })
        .order("name", { ascending: true })
        .range((page - 1) * pageSize, page * pageSize - 1);

    if (query) {
        dbQuery = dbQuery.ilike("name", `%${query}%`);
    }

    const { data: items, error, count } = await dbQuery;

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
                        <Sword className="w-8 h-8 text-amber-500" />
                        Eşyalar
                    </h1>
                    <p className="text-muted-foreground text-sm">Toplam {count} eşya listeleniyor.</p>
                </div>

                <form className="w-full md:w-1/3">
                    <Input
                        name="q"
                        placeholder="Eşya ara (örn: Healing Potion)..."
                        defaultValue={query}
                        className="w-full"
                    />
                </form>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items?.map((item) => (
                    <Card key={item.id} className="hover:border-amber-500/50 transition-colors">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">{item.name}</CardTitle>
                                <Badge variant={item.rarity === 'Common' ? 'secondary' : 'default'} className="uppercase text-[10px]">
                                    {item.rarity}
                                </Badge>
                            </div>
                            <CardDescription className="text-xs">{item.equipment_category} </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground line-clamp-3">
                                {item.translation?.description || item.description}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex justify-center gap-2 mt-8">
                {page > 1 && (
                    <Link href={`/compendium/items?page=${page - 1}${query ? `&q=${query}` : ''}`} className="px-4 py-2 border rounded hover:bg-muted">
                        Önceki
                    </Link>
                )}
                {(count || 0) > page * pageSize && (
                    <Link href={`/compendium/items?page=${page + 1}${query ? `&q=${query}` : ''}`} className="px-4 py-2 border rounded hover:bg-muted">
                        Sonraki
                    </Link>
                )}
            </div>
        </div>
    );
}
