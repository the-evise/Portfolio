import { cn } from "@/utils/utils";

interface HeadlineProps {
    text: string;
    className?: string;
    color?: "night" | "mint"; // ← variant
}

export default function Headline({ text, className, color = "night" }: HeadlineProps) {
    const colorMap = {
        night: "text-night",
        mint: "text-mint-cream",
    } as const;

    return (
        <h1
            className={cn(
                "font-display italic text-center leading-tight",
                "text-[40px] sm:text-[48px] hide-below-h-1024",
                colorMap[color], // ← applied here
                className
            )}
        >
            {text}
        </h1>
    );
}
