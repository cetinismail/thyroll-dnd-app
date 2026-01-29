"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Sword, Book, Zap } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { useState } from "react";

interface NavItem {
    title: string;
    href: string;
    icon: LucideIcon;
    disabled?: boolean;
    badge?: string;
}

const navItems: NavItem[] = [
    {
        title: "Panel", // Dashboard
        href: "/dashboard",
        icon: Sword,
    },
    {
        title: "Kütüphane", // Compendium
        href: "/compendium",
        icon: Book,
    },
    {
        title: "Seferler",
        href: "/dashboard/campaigns",
        icon: Sword,
        badge: "Yeni",
    },
];

import { User } from "@supabase/supabase-js";
import { signout } from "@/app/login/actions";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SearchCommand } from "@/components/search-command";

export function Navbar({ user }: { user?: User | null }) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center px-4">
                {/* Mobile Menu */}
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button
                            variant="ghost"
                            className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
                        >
                            <Menu className="h-6 w-6" />
                            <span className="sr-only">Menüyü Aç</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="pr-0">
                        <Link
                            href="/"
                            className="flex items-center"
                            onClick={() => setIsOpen(false)}
                        >
                            <span className="font-cinzel text-xl font-bold text-primary">
                                Thyroll
                            </span>
                        </Link>
                        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
                            <div className="flex flex-col space-y-3">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.disabled ? "#" : item.href}
                                        onClick={() => setIsOpen(false)}
                                        className={cn(
                                            "flex items-center py-2 text-sm font-medium transition-colors hover:text-primary",
                                            pathname === item.href
                                                ? "text-primary"
                                                : "text-muted-foreground",
                                            item.disabled && "pointer-events-none opacity-50"
                                        )}
                                    >
                                        <item.icon className="mr-2 h-4 w-4" />
                                        {item.title}
                                        {item.badge && (
                                            <span className="ml-2 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </ScrollArea>
                    </SheetContent>
                </Sheet>

                {/* Desktop Logo */}
                <div className="mr-4 hidden md:flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <span className="font-cinzel text-2xl font-bold bg-gradient-to-br from-primary via-yellow-500 to-amber-600 bg-clip-text text-transparent drop-shadow-sm">
                            Thyroll
                        </span>
                    </Link>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        {navItems
                            .filter(item => user || item.href !== "/dashboard")
                            .map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.disabled ? "#" : item.href}
                                    className={cn(
                                        "transition-colors hover:text-foreground/80 flex items-center",
                                        pathname === item.href
                                            ? "text-primary"
                                            : "text-foreground/60",
                                        item.disabled && "cursor-not-allowed opacity-50"
                                    )}
                                >
                                    {item.title}
                                    {item.badge && (
                                        <span className="ml-1.5 border border-primary/20 bg-primary/5 rounded-[4px] px-1 text-[10px] leading-none text-primary uppercase tracking-wide">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            ))}
                    </nav>
                </div>

                {/* Right Interactions */}
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        <SearchCommand />
                    </div>
                    <div className="flex items-center gap-2">
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                        <Avatar className="h-8 w-8 border border-border">
                                            <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || ""} />
                                            <AvatarFallback>{user.email?.slice(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">Maceracı</p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {user.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuItem asChild>
                                        <Link href="/account" className="cursor-pointer w-full">
                                            Hesap Ayarları
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => signout()} className="cursor-pointer">
                                        Çıkış Yap
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button size="sm" variant="default" className="hidden sm:inline-flex bg-primary text-primary-foreground hover:bg-primary/90 font-cinzel" asChild>
                                <Link href="/login">Giriş Yap</Link>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
