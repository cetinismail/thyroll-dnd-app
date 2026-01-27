
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter
} from "@/components/ui/card";
import { PlusCircle, Search, Sword, Users, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Input } from "@/components/ui/input";

export default async function CharactersPage() {
    const supabase = await createClient();

    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect("/login");
    }

    // 2. Fetch All Characters
    const { data: characters, error } = await supabase
        .from('characters')
        .select('*, races(name), classes(name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching characters:", error);
    }

    return (
        <div className="space-y-8 container py-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight font-cinzel text-primary">Karakterlerim</h2>
                    <p className="text-muted-foreground mt-1">
                        Tüm kahramanların burada. Onları yönet, düzenle veya yeni maceralara hazırla.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/builder">
                        <Button className="font-cinzel">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Yeni Karakter
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filter/Search (Placeholder for now) */}
            <div className="flex items-center gap-2 max-w-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Karakter ara..." className="pl-8 bg-card/90 border-border/50" />
                </div>
            </div>

            {/* Character Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {characters && characters.length > 0 ? (
                    characters.map((char: any) => (
                        <Card key={char.id} className="border-border/40 bg-card/90 backdrop-blur-sm hover:border-primary/50 transition-colors flex flex-col justify-between shadow-md">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="font-cinzel text-xl">{char.name}</CardTitle>
                                        <CardDescription className="mt-1 flex items-center gap-2">
                                            {char.races?.name} — {char.classes?.name}
                                        </CardDescription>
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Sword className="h-5 w-5 text-primary" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pb-2">
                                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                                    <div className="flex flex-col">
                                        <span className="text-xs uppercase opacity-70">Seviye</span>
                                        <span className="font-medium text-foreground">{char.level}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs uppercase opacity-70">Can (HP)</span>
                                        <span className="font-medium text-foreground">{char.current_hp} / {char.max_hp}</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-4 border-t border-border/20 flex gap-2">
                                <Link href={`/characters/${char.id}`} className="flex-1">
                                    <Button variant="outline" className="w-full">Detaylar</Button>
                                </Link>
                                {/* Edit and Delete buttons will be hooked up later */}
                                {/* 
                                <Button variant="ghost" size="icon" title="Düzenle">
                                    <Edit className="h-4 w-4" />
                                </Button> 
                                */}
                            </CardFooter>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-lg border-border/50 bg-background/20">
                        <div className="rounded-full bg-muted p-4 mb-4">
                            <Users className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground">Henüz kimse yok</h3>
                        <p className="text-muted-foreground mb-6 max-w-sm">
                            Görünüşe göre bu diyarda henüz hiçbir kahraman doğmadı. İlk efsaneyi sen yarat.
                        </p>
                        <Link href="/builder">
                            <Button className="font-cinzel">Karakter Oluştur</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
