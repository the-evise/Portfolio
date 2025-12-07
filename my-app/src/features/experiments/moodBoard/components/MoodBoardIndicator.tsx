"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/utils/utils";
import Emoji from "@/features/experiments/moodBoard/components/Emoji";

export const MOODS = [
    "whale",
    "palette",
    "alien",
    "crystal",
    "pumpkin",
] as const;

export type MoodName = (typeof MOODS)[number];

interface MoodBoardIndicatorProps {
    onChange?: (mood: MoodName) => void;
    initial?: MoodName;
}

export default function MoodBoardIndicator({ onChange, initial = "whale" }: MoodBoardIndicatorProps) {
    const [active, setActive] = useState<MoodName>(initial);

    const handleSelect = (mood: MoodName) => {
        setActive(mood);
        onChange?.(mood);
    };

    return (
        <div className="w-full h-fit flex justify-center items-center gap-2 bg-blue-300/40 p-2 rounded-2xl sm:gap-4 sm:p-4">
            {MOODS.map((mood) => (
                <motion.button
                    key={mood}
                    type="button"
                    onClick={() => handleSelect(mood)}
                    className={cn(
                        "flex items-center justify-center",
                        "rounded-xl transition border-2",
                        "h-11 w-11 sm:h-[56px] sm:w-[56px] md:h-[98px] md:w-[98px]",
                        "bg-blue-200/40",
                        active === mood
                            ? "border-blue-300 bg-blue-950/80"
                            : "border-blue-200/40 hover:border-blue-300 cursor-pointer"
                    )}
                    whileHover={{ scale: 0.97 }}
                    whileTap={{ scale: 1.1 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 800, damping: 10, mass: 0.1 }}
                >
                    <Emoji
                        name={mood}
                        className="text-2xl sm:text-3xl md:text-5xl"
                    />
                </motion.button>
            ))}
        </div>
    );
}
