"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { MoodName } from "@/features/experiments/moodBoard/components/MoodBoardIndicator";
import { useMoodBoardLayout } from "@/features/experiments/moodBoard/hooks/useMoodBoardLayout";

interface MoodBoardProps {
    mood: MoodName;
    version: number;
}

//TODO: use tag/theme based image and generation

const MOOD_IMAGE_SEEDS: Record<MoodName, string[]> = {
    whale: [
        "/moodBoard/whale/image_600.jpg",
        "/moodBoard/whale/image_601.jpg",
        "/moodBoard/whale/image_602.jpg",
        "/moodBoard/whale/image_603.jpg",
        "/moodBoard/whale/image_604.jpg",
        "/moodBoard/whale/image_605.jpg",
    ],
    palette: [
        "/moodBoard/palette/image_400.jpg",
        "/moodBoard/palette/image_401.jpg",
        "/moodBoard/palette/image_402.jpg",
        "/moodBoard/palette/image_403.jpg",
        "/moodBoard/palette/image_404.jpg",
        "/moodBoard/palette/image_405.jpg",
    ],
    alien: [
        "/moodBoard/alien/image_200.jpg",
        "/moodBoard/alien/image_201.jpg",
        "/moodBoard/alien/image_202.jpg",
        "/moodBoard/alien/image_203.jpg",
        "/moodBoard/alien/image_204.jpg",
        "/moodBoard/alien/image_205.jpg",
    ],
    crystal: [
        "/moodBoard/crystal/image_300.jpg",
        "/moodBoard/crystal/image_301.jpg",
        "/moodBoard/crystal/image_302.jpg",
        "/moodBoard/crystal/image_303.jpg",
        "/moodBoard/crystal/image_304.jpg",
        "/moodBoard/crystal/image_305.jpg",
    ],
    pumpkin: [
        "/moodBoard/pumpkin/image_500.jpg",
        "/moodBoard/pumpkin/image_501.jpg",
        "/moodBoard/pumpkin/image_502.jpg",
        "/moodBoard/pumpkin/image_503.jpg",
        "/moodBoard/pumpkin/image_504.jpg",
        "/moodBoard/pumpkin/image_505.jpg",
    ],
};

const PUBLIC_IMAGES = [
    "/moodBoard/_public/image_100.jpg",
    "/moodBoard/_public/image_101.jpg",
    "/moodBoard/_public/image_102.jpg",
    "/moodBoard/_public/image_103.jpg",
    "/moodBoard/_public/image_104.jpg",
    "/moodBoard/_public/image_105.jpg",
];

export default function MoodBoard({ mood, version }: MoodBoardProps) {
    const images = useMemo(
        () => pickImages(MOOD_IMAGE_SEEDS[mood] ?? [], PUBLIC_IMAGES, 9),
        [mood, version]
    );
    const layout = useMoodBoardLayout(images);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);

        const delayMs = 800 + Math.random() * 1200;
        const delayPromise = new Promise((resolve) => setTimeout(resolve, delayMs));
        const preloadPromise = Promise.all(images.map(preloadImage));

        Promise.all([delayPromise, preloadPromise]).then(() => {
            if (!cancelled) {
                setIsLoading(false);
            }
        });

        return () => {
            cancelled = true;
        };
    }, [images]);

    return (
        <div className="relative w-full aspect-square sm:aspect-[4/3] md:aspect-[3/2] rounded-2xl bg-blue-300/40 p-2 sm:p-4 overflow-hidden">
            <AnimatePresence mode="wait">
                {isLoading && (
                    <motion.div
                        key="moodboard-loader"
                        className="absolute inset-0 z-10 flex items-center justify-center bg-mint-cream/10 backdrop-blur-sm rounded-2xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex flex-col items-center gap-3 text-blue-50/80">
                            <span className="h-12 w-12 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                            <span className="text-sm uppercase tracking-[0.3em]">Loading mood</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {!isLoading && (
                    <motion.div
                        key={`${mood}-${version}`}
                        className="grid h-full w-full grid-cols-3 grid-rows-3 gap-2 sm:gap-4"
                        initial={{ opacity: 0, scale: 0.96, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: -6 }}
                        transition={{ type: "spring", stiffness: 220, damping: 26 }}
                    >
                        {layout.map((tile) => (
                            <div
                                key={tile.id}
                                className="
            relative 
            h-full w-full
            rounded-xl 
            overflow-hidden 
            bg-blue-200/40
          "
                                style={{
                                    gridColumn: `${tile.colStart} / span ${tile.colSpan}`,
                                    gridRow: `${tile.rowStart} / span ${tile.rowSpan}`,
                                }}
                            >
                                <Image
                                    src={tile.src}
                                    alt=""
                                    fill
                                    sizes="(min-width: 1024px) 26vw, (min-width: 768px) 40vw, 90vw"
                                    className="object-cover h-full w-full"
                                />
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function pickImages(moodSeed: string[], publicSeed: string[], max: number) {
    const moodPool = shuffle(unique(moodSeed));
    const publicPool = shuffle(unique(publicSeed));

    const targetPublic = 1 + Math.floor(Math.random() * 3); // between 1 and 3
    const moodCount = Math.min(max - targetPublic, moodPool.length);
    let publicCount = Math.max(1, Math.min(3, max - moodCount));
    publicCount = Math.min(publicCount, publicPool.length);

    const chosenMood = takeUnique(moodPool, new Set<string>(), moodCount);
    const used = new Set(chosenMood);
    const chosenPublic = takeUnique(publicPool, used, publicCount);

    let combined = [...chosenMood, ...chosenPublic];

    if (combined.length < max) {
        combined = combined.concat(
            takeUnique(moodPool, new Set(combined), max - combined.length)
        );
    }
    if (combined.length < max) {
        combined = combined.concat(
            takeUnique(publicPool, new Set(combined), max - combined.length)
        );
    }

    return combined.slice(0, max);
}

function preloadImage(src: string) {
    return new Promise<void>((resolve) => {
        const img = new window.Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = src;
    });
}

function unique(arr: string[]) {
    return [...new Set(arr)];
}

function shuffle(arr: string[]) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function takeUnique(pool: string[], used: Set<string>, count: number) {
    const result: string[] = [];
    for (const item of pool) {
        if (!used.has(item)) {
            result.push(item);
            used.add(item);
            if (result.length === count) break;
        }
    }
    return result;
}
