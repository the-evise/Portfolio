'use client';

import { HiCalculator, HiChatAlt, HiClock } from "react-icons/hi";
import { motion } from "motion/react";
import { cn } from "@/utils/utils";
import {useRef, useState} from "react";

interface ControllerUIProps {
    testType: "time" | "words" | "quote";
    activeOption: number;
    punctuation: boolean;
    numbers: boolean;

    disabledQuote: boolean;

    onTogglePunctuation: () => void;
    onToggleNumbers: () => void;
    onChangeTestType: (type: "time" | "words" | "quote") => void;
    onChangeActiveOption: (value: number) => void;
}

export function ControllerUI({
                                 testType,
                                 activeOption,
                                 punctuation,
                                 numbers,
                                 disabledQuote,
                                 onTogglePunctuation,
                                 onToggleNumbers,
                                 onChangeTestType,
                                 onChangeActiveOption,
                             }: ControllerUIProps) {

    const timeOptions = [15, 30, 45, 60];
    const wordOptions = [20, 40, 60, 120];

    const isDisabled = disabledQuote;

    const [tooltipOpen, setTooltipOpen] = useState(false);
    // const isSmallScreen = typeof window !== "undefined" && window.innerWidth < 768;

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Auto-close on mobile after 1.5s
    const showTooltip = () => {
        setTooltipOpen(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setTooltipOpen(false), 1500);
    };

    const isTouch = typeof window !== "undefined" &&
        !window.matchMedia("(hover: hover)").matches;

    const sectionVariants = {
        hidden: {opacity: 0, y: -8},
        visible: {
            opacity: 1,
            y: 0,
            transition: {type: "spring" as const, stiffness: 240, damping: 26, staggerChildren: 0.08},
        },
    };

    const groupVariants = {
        hidden: {opacity: 0, y: -4},
        visible: {opacity: 1, y: 0},
    };

    const buttonVariants = {
        hidden: {opacity: 0, y: 6},
        visible: {opacity: 1, y: 0},
    };

    return (
        <motion.section
            className="flex flex-col lg:flex-row justify-center items-center gap-[10px] px-4 py-2 rounded-lg lg:rounded-full bg-mint-cream/80 border border-night/40 font-mono transition-colors duration-200 !font-medium"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
        >

            {/* LEFT GROUP */}
            <motion.div className="flex items-center justify-center gap-[10px]" variants={groupVariants}>
                <motion.button
                    onClick={onTogglePunctuation}
                    className={punctuation ? "text-cardinal-dark" : "text-night/60 "}
                    variants={buttonVariants}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                >
                    @punctuation
                </motion.button>

                <motion.button
                    onClick={onToggleNumbers}
                    className={numbers ? "text-cardinal-dark" : "text-night/60"}
                    variants={buttonVariants}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                >
                    #numbers
                </motion.button>
            </motion.div>

            <div className="w-full h-[1px] lg:w-[3px] lg:h-6 bg-ruddy-blue/20" />

            {/* TEST TYPE SWITCH */}
            <motion.div className="flex justify-center items-center gap-[10px] text-night/60" variants={groupVariants}>
                <motion.button
                    onClick={() => onChangeTestType("time")}
                    className={cn(testType === "time" ? "text-cardinal-dark" : "", "flex flex-row items-center gap-1")}
                    variants={buttonVariants}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                >
                    <HiClock />
                    time
                </motion.button>

                <motion.button
                    onClick={() => onChangeTestType("words")}
                    className={cn(testType === "words" ? "text-cardinal-dark" : "", "flex flex-row items-center gap-1")}
                    variants={buttonVariants}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                >
                    <HiCalculator />
                    words
                </motion.button>

                <div className={"relative group"}>
                    <motion.button
                        aria-disabled={isDisabled}

                        onClick={() => {
                            if (disabledQuote) {
                                if (isTouch) showTooltip();
                                return;
                            }

                            onChangeTestType("quote");
                        }}
                        className={cn(
                            "flex flex-row items-center gap-1",
                            testType === "quote" ? "text-cardinal-dark" : "",
                            disabledQuote ? "opacity-50 cursor-not-allowed" : "hover:"
                        )}

                        variants={buttonVariants}
                        whileHover={{scale: 1.04}}
                        whileTap={{scale: 0.96}}
                    >
                        <HiChatAlt/>
                        quote
                    </motion.button>

                    {/* Tooltip */}
                    {disabledQuote && (
                        <div
                            className={cn(
                                "absolute -bottom-9 left-1/2 -translate-x-1/2 px-2 py-1 whitespace-nowrap text-xs font-mono rounded-md bg-night text-mint-cream/80 transition-opacity duration-200",
                                "opacity-0 group-hover:opacity-100", // desktop hover
                                tooltipOpen && "opacity-100"         // mobile tap
                            )}
                        >
                            coming soon!
                        </div>
                    )}
                </div>
            </motion.div>

            <div className={cn("w-full h-[1px] lg:w-[3px] lg:h-6 bg-ruddy-blue/20", testType === "quote" ? "hidden" : "")} />

            {/* RIGHT GROUP */}
            <motion.div className="flex items-center gap-[10px] text-night/60" variants={groupVariants}>

                {testType === "time" &&
                    timeOptions.map((sec) => (
                        <motion.button
                            key={sec}
                            onClick={() => onChangeActiveOption(sec)}
                            className={activeOption === sec ? "text-cardinal-dark" : ""}
                            variants={buttonVariants}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.96 }}
                        >
                            {sec}
                        </motion.button>
                    ))
                }

                {testType === "words" &&
                    wordOptions.map((w) => (
                        <motion.button
                            key={w}
                            onClick={() => onChangeActiveOption(w)}
                            className={activeOption === w ? "text-cardinal-dark" : ""}
                            variants={buttonVariants}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.96 }}
                        >
                            {w}
                        </motion.button>
                    ))
                }
            </motion.div>
        </motion.section>
    );
}
