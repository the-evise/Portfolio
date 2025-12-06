"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/utils/utils";

type WordsProps = {
    typed: string;
    target: string;
};

const letterVariants = {
    idle: { scale: 1, opacity: 0.55 },
    correct: { scale: 1.05, opacity: 1 },
    incorrect: { scale: 0.95, opacity: 1 },
    active: { scale: 1, opacity: 1 },
};

const containerVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const } },
};

export function Words({ typed, target }: WordsProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const charRefs = useRef<Array<HTMLSpanElement | null>>([]);
    const [caretRect, setCaretRect] = useState({ x: 0, y: 0, height: 24 });
    const [showCaret, setShowCaret] = useState(false);

    /**
     * GROUP WORDS — do NOT let them split mid-line
     * But keep trailing space OUTSIDE nowrap so the entire line centers correctly
     */
    const wordGroups = useMemo(() => {
        const groups: { word: { char: string; index: number }[], spaceIndex: number }[] = [];
        let idx = 0;

        const words = target.split(" ").filter(Boolean);

        for (let i = 0; i < words.length; i++) {
            const w = words[i];
            const wordChars: { char: string; index: number }[] = [];

            for (const ch of w) {
                wordChars.push({ char: ch, index: idx++ });
            }

            // store the space index separately, so it's OUTSIDE the nowrap block
            const spaceIndex = idx++;
            groups.push({ word: wordChars, spaceIndex });
        }

        return groups;
    }, [target]);

    const activeIndex = typed.length;

    // Reset refs to correct length
    const totalChars = wordGroups.reduce((acc, g) => acc + g.word.length + 1, 0);
    charRefs.current = Array(totalChars + 1).fill(null);

    const updateCaret = useCallback(() => {
        const container = containerRef.current;
        const fallback = Math.min(activeIndex, charRefs.current.length - 1);
        const node = charRefs.current[fallback];

        if (!container || !node) {
            setShowCaret(false);
            return;
        }

        const containerRect = container.getBoundingClientRect();
        const nodeRect = node.getBoundingClientRect();

        setCaretRect({
            x: nodeRect.left - containerRect.left,
            y: nodeRect.top - containerRect.top,
            height: nodeRect.height,
        });

        setShowCaret(true);
    }, [activeIndex]);

    useLayoutEffect(() => updateCaret(), [typed, target, updateCaret]);
    useEffect(() => {
        const handler = () => updateCaret();
        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    }, [updateCaret]);

    return (
        <motion.div
            ref={containerRef}
            className="
                relative font-mono text-lg md:text-xl
                leading-[20px] lg:leading-[40px]
                flex flex-wrap gap-y-2 md:gap-y-3 lg:gap-y-0.5
                justify-center select-none mx-auto
                w-full min-w-[300px] max-w-[590px] lg:w-[750px]
            "
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/*/!* CARET *!/*/}
            {/*{showCaret && (*/}
            {/*    <motion.span*/}
            {/*        className="pointer-events-none absolute w-[2px] rounded-full bg-tropical-indigo shadow-[0_0_12px_rgba(99,102,241,0.6)]"*/}
            {/*        animate={{ x: caretRect.x, y: caretRect.y, height: caretRect.height }}*/}
            {/*        transition={{ type: "spring", stiffness: 600, damping: 40 }}*/}
            {/*    />*/}
            {/*)}*/}

            {/* WORDS + SPACES */}
            {wordGroups.map((group, wi) => (
                <span key={wi} className="inline-flex whitespace-nowrap">
        {/* render word characters */}
                    {group.word.map(({ char, index }) => {
                        const typedChar = typed[index];

                        let color = "text-mint-cream/80";
                        let state: keyof typeof letterVariants = "idle";

                        if (typedChar !== undefined) {
                            if (typedChar === char) {
                                color = "text-night";
                                state = "correct";
                            } else {
                                color = "text-cardinal-light";
                                state = "incorrect";
                            }
                        }

                        if (index === activeIndex) {
                            color = "text-mint-cream";
                            state = "active";
                        }

                        return (
                            <motion.span
                                key={index}
                                ref={(node) => {
                                    charRefs.current[index] = node;
                                }}
                                className={cn("inline-block", color)}
                                variants={letterVariants}
                                animate={state}
                                transition={{ type: "spring", stiffness: 450, damping: 30, mass: 0.2 }}
                            >
                                {char}
                            </motion.span>
                        );
                    })}

                    {/* render the space AFTER the word */}
                    <motion.span
                        key={`s-${group.spaceIndex}`}
                        ref={(node) => {
                            charRefs.current[group.spaceIndex] = node;
                        }}
                        className="inline-block text-mint-cream/30"
                        variants={letterVariants}
                        animate={
                            typed[group.spaceIndex] === " "
                                ? "correct"
                                : typed[group.spaceIndex] !== undefined
                                    ? "incorrect"
                                    : "idle"
                        }
                        transition={{ type: "spring", stiffness: 450, damping: 30, mass: 0.2 }}
                    >
            {"\u00A0"}
        </motion.span>
    </span>
            ))}


            {/* final caret node fallback */}

        </motion.div>
    );
}
