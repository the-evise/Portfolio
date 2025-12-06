"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/utils/utils";

interface IllustrationWorkProps {
    activeIndex: number;
    className?: string;
}

/**
 * Map each work process step to its SVG/PNG asset.
 * Add/replace paths according to your actual files.
 */
const illustrations = [
    "/focus-observe2.jpg",
    "/break-down4.jpg",
    "/refine-form3.jpg",
] as const;

export default function IllustrationWork({ activeIndex, className }: IllustrationWorkProps) {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(false);
    }, [activeIndex]);

    return (
        <div className={cn("relative size-full place-self-center overflow-hidden rounded-3xl", className)}>
            {!isLoaded && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0C0C0C]">
                    <span className="h-10 w-10 animate-spin rounded-full border-2 border-t-transparent border-tropical-indigo/80" />
                </div>
            )}
            <Image
                src={illustrations[activeIndex - 1]}
                alt={`Work process step ${activeIndex}`}
                fill
                className={cn(
                    "object-cover transition-opacity duration-300",
                    isLoaded ? "opacity-100" : "opacity-0"
                )}
                onLoadingComplete={() => setIsLoaded(true)}
            />
        </div>
    );
}
