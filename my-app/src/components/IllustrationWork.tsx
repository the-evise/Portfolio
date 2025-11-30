"use client";

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
    // Safety: prevent out-of-bounds
    // const safeIndex = Math.max(0, Math.min(activeIndex, illustrations.length - 1));

    return (
        <div className={cn("relative size-full place-self-center rounded-3xl", className)}>
            <Image
                src={illustrations[activeIndex-1]}
                alt={`Work process step ${activeIndex}`}
                fill
                className="object-cover"
            />
        </div>
    );
}
