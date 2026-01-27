import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-background z-[-2]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background z-[-1]" />

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
        <h1 className="font-cinzel text-4xl sm:text-6xl md:text-8xl font-black tracking-tight text-foreground mb-6 drop-shadow-lg">
          <span className="bg-gradient-to-r from-primary via-amber-500 to-primary bg-clip-text text-transparent">
            THYROLL
          </span>
        </h1>
        <p className="max-w-[42rem] mx-auto text-xl text-muted-foreground mb-8 sm:mb-12">
          Thyroll D&D Kulübü için geliştirildi.
          Karakterlerinizi yönetin, büyüleri keşfedin ve ateşte dövülmüş bir arayüz ile kurallara hükmedin.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Link href={user ? "/dashboard" : "/login"}>
            <Button size="lg" className="h-12 px-8 text-lg font-cinzel rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_-5px_var(--color-primary)]">
              {user ? "Panele Git" : "Macera Başlasın"} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/compendium">
            <Button variant="outline" size="lg" className="h-12 px-8 text-lg rounded-full border-primary/30 text-primary hover:bg-primary/10">
              Kütüphaneye Bak
            </Button>
          </Link>
        </div>
      </main>

      <footer className="py-6 w-full text-center text-sm text-muted-foreground border-t border-border/20">
        <p>© 2026 Thyroll D&D App. Kulüp üyeleri için sevgiyle yapıldı.</p>
      </footer>
    </div>
  );
}
