const categories = [
    { title: "Büyüler", key: "Spells" },
    { title: "Canavarlar", key: "Monsters" },
    { title: "Sınıflar", key: "Classes" },
    { title: "Irklar", key: "Races" },
    { title: "Eşyalar", key: "Items" },
    { title: "Yetenekler", key: "Feats" },
];

export default function CompendiumPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold font-cinzel text-primary">Kütüphane</h1>
                <p className="text-muted-foreground">
                    Diyarın kurallarını, büyülerini ve canavarlarını keşfet.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                    <div key={category.key} className="group relative overflow-hidden rounded-xl border border-border/40 bg-card/50 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                        <div className="p-6">
                            <h3 className="text-xl font-bold font-cinzel mb-2 group-hover:text-primary transition-colors">{category.title}</h3>
                            <p className="text-sm text-muted-foreground">Tüm resmi <span className="text-foreground/80 font-medium">{category.key}</span> kayıtlarını incele.</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
