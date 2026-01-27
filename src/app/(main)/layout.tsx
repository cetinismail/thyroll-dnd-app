import { Navbar } from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/server";

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <div className="min-h-screen relative flex flex-col">
            {/* Background Texture Overlay */}
            <div className="fixed inset-0 z-[-1] bg-[url('/bg-theme.png')] opacity-10 pointer-events-none mix-blend-soft-light"></div>
            <div className="fixed inset-0 z-[-2] bg-gradient-to-b from-background via-background/95 to-background/90"></div>

            <Navbar user={user} />
            <main className="flex-1 container py-6 md:py-10">
                {children}
            </main>
        </div>
    );
}
