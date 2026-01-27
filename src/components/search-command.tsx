"use client";

import * as React from "react";
import { Calculator, Calendar, CreditCard, Settings, Smile, User, Sword, Book, ScrollText, Ghost } from "lucide-react";
import { useRouter } from "next/navigation";

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command";
import { searchContent, SearchResult } from "@/app/actions/search";
import { Button } from "@/components/ui/button";

export function SearchCommand() {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [results, setResults] = React.useState<SearchResult[]>([]);
    const router = useRouter();

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    React.useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.length >= 2) {
                const data = await searchContent(query);
                setResults(data);
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false);
        command();
    }, []);

    return (
        <>
            <Button
                variant="outline"
                className="relative h-8 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
                onClick={() => setOpen(true)}
            >
                <span className="inline-flex">Bilgi ara...</span>
                <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </Button>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput
                    placeholder="Bir karakter, büyü veya kural ara..."
                    value={query}
                    onValueChange={setQuery}
                />
                <CommandList>
                    <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>

                    {query.length < 2 && (
                        <CommandGroup heading="Hızlı Erişim">
                            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
                                <Sword className="mr-2 h-4 w-4" />
                                <span>Panel</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => router.push("/compendium"))}>
                                <Book className="mr-2 h-4 w-4" />
                                <span>Kütüphane</span>
                            </CommandItem>
                        </CommandGroup>
                    )}

                    {results.length > 0 && (
                        <CommandGroup heading="Sonuçlar">
                            {results.map((result) => (
                                <CommandItem
                                    key={`${result.type}-${result.id}`}
                                    value={`${result.title} ${result.subtitle}`}
                                    onSelect={() => runCommand(() => router.push(result.url))}
                                >
                                    {result.type === "character" && <User className="mr-2 h-4 w-4" />}
                                    {result.type === "spell" && <ScrollText className="mr-2 h-4 w-4" />}
                                    {result.type === "class" && <Sword className="mr-2 h-4 w-4" />}
                                    {result.type === "race" && <Ghost className="mr-2 h-4 w-4" />}

                                    <div className="flex flex-col">
                                        <span>{result.title}</span>
                                        <span className="text-[10px] text-muted-foreground">{result.subtitle}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                </CommandList>
            </CommandDialog>
        </>
    );
}
