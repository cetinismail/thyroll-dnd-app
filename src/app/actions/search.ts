"use server";

import { createClient } from "@/lib/supabase/server";

export type SearchResult = {
    id: string;
    type: "character" | "race" | "class" | "spell" | "feature";
    title: string;
    subtitle?: string;
    url: string;
};

export async function searchContent(query: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) return [];

    const supabase = await createClient();
    const results: SearchResult[] = [];
    const searchTerm = `%${query}%`;

    // 1. Search Characters (User's own)
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { data: chars } = await supabase
            .from("characters")
            .select("id, name, classes(name), level")
            .eq("user_id", user.id)
            .ilike("name", searchTerm)
            .limit(3);

        chars?.forEach((c: any) => {
            results.push({
                id: c.id,
                type: "character",
                title: c.name,
                subtitle: `Seviye ${c.level} ${c.classes?.name || ""}`,
                url: `/characters/${c.id}`
            });
        });
    }

    // 2. Search Classes
    const { data: classes } = await supabase
        .from("classes")
        .select("id, name")
        .ilike("name", searchTerm)
        .limit(3);

    classes?.forEach(c => {
        results.push({
            id: c.id,
            type: "class",
            title: c.name,
            subtitle: "Sınıf",
            url: `/compendium/classes/${c.id}` // Placeholder route
        });
    });

    // 3. Search Races
    const { data: races } = await supabase
        .from("races")
        .select("id, name")
        .ilike("name", searchTerm)
        .limit(3);

    races?.forEach(r => {
        results.push({
            id: r.id,
            type: "race",
            title: r.name,
            subtitle: "Irk",
            url: `/compendium/races/${r.id}` // Placeholder route
        });
    });

    // 4. Search Spells
    const { data: spells } = await supabase
        .from("spells")
        .select("id, name, level, school")
        .ilike("name", searchTerm)
        .limit(5);

    spells?.forEach(s => {
        results.push({
            id: s.id,
            type: "spell",
            title: s.name,
            subtitle: `${s.level === 0 ? "Cantrip" : s.level + ". Seviye"} - ${s.school}`,
            url: `/compendium/spells?id=${s.id}` // Placeholder route
        });
    });

    return results;
}
