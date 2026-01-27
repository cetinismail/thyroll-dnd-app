
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CounterInputProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    className?: string;
}

export function CounterInput({ value, onChange, min = 0, max = 100, className }: CounterInputProps) {
    const increment = () => {
        if (value < max) onChange(value + 1);
    };

    const decrement = () => {
        if (value > min) onChange(value - 1);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseInt(e.target.value);
        if (!isNaN(newValue)) {
            onChange(Math.max(min, Math.min(max, newValue)));
        }
    };

    return (
        <div className={cn("flex items-center space-x-2", className)}>
            <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0 bg-card hover:bg-primary/20 hover:border-primary/50"
                onClick={decrement}
                disabled={value <= min}
            >
                <Minus className="h-3 w-3" />
            </Button>
            <Input
                type="number"
                value={value}
                onChange={handleChange}
                className="h-8 w-16 text-center text-lg font-mono bg-card/50 border-primary/30 focus-visible:ring-primary/50 focus-visible:border-primary"
            />
            <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0 bg-card hover:bg-primary/20 hover:border-primary/50"
                onClick={increment}
                disabled={value >= max}
            >
                <Plus className="h-3 w-3" />
            </Button>
        </div>
    );
}
