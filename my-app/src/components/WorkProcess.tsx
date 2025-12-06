"use client";

import { useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useAnimate } from "motion/react";
import { cn } from "@/utils/utils";
import IllustrationWork from "@/components/IllustrationWork";
import {HiOutlineChevronLeft, HiOutlineChevronRight} from "react-icons/hi";

const WORK_PROCESS_STEPS = [
    {
        title: "Focus & Observe",
        lines: ["Analyze structure, patterns, and intent before acting.", "Enter stillness to define what matters."],
    },
    {
        title: "Flow & Construct",
        lines: ["Code, motion, and design align seamlessly.", "Execution feels automatic."],
    },
    {
        title: "Debug & Refine",
        lines: ["Step back, test, adjust, and simplify.", "The system stabilizes into elegance."],
    },
] as const;

export default function WorkProcess() {
    const steps = useMemo(() => WORK_PROCESS_STEPS, []);
    const [activeIndex, setActiveIndex] = useState(0);
    const lastScrollTimeRef = useRef(0);
    const [illustrationScope, animateIllustration] = useAnimate();

    const goTo = (next: number | "prev" | "next") => {
        setActiveIndex((current) => {
            if (next === "prev") return (current - 1 + steps.length) % steps.length;
            if (next === "next") return (current + 1) % steps.length;
            return next;
        });
    };

    const handleWheel = useCallback(
        (event: React.WheelEvent<HTMLDivElement>) => {
            if (event.deltaY <= 0) {
                return;
            }
            const now = performance.now();
            if (now - lastScrollTimeRef.current < 800) {
                return;
            }
            lastScrollTimeRef.current = now;
            event.preventDefault();
            goTo("next");
        },
        [goTo]
    );

    return (
        <motion.div
            className="flex w-full max-w-4xl flex-col items-center gap-6 text-center md:gap-6 lg:gap-8"
            onWheel={handleWheel}
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ type: "spring", stiffness: 220, damping: 28 }}
        >
            <div className="relative flex w-full items-center justify-center gap-4">
                <button
                    type="button"
                    aria-label="Previous step"
                    className="hidden rounded-full border border-tropical-indigo/40 p-3 text-tropical-indigo transition hover:border-tropical-indigo hover:bg-tropical-indigo/10 md:inline-flex cursor-pointer"
                    onClick={() => goTo("prev")}
                >
                    <HiOutlineChevronLeft />
                </button>

                <motion.div
                    ref={illustrationScope}
                    className="relative mx-auto aspect-square size-[275px] md:size-[300px] lg:size-[325px] overflow-hidden rounded-3xl border-2 border-tropical-indigo/10 bg-[#0C0C0C]"
                    drag="x"
                    dragConstraints={{ left: -60, right: 60 }}
                    dragElastic={0.2}
                    dragMomentum={false}
                    onDragEnd={(_, info) => {
                        if (info.offset.x > 40) {
                            goTo("prev");
                        } else if (info.offset.x < -40) {
                            goTo("next");
                        }
                        void animateIllustration(
                            illustrationScope.current,
                            { x: 0 },
                            { type: "spring", stiffness: 260, damping: 26 }
                        );
                    }}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeIndex}
                            className="absolute inset-0 size-full"
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.03 }}
                            transition={{ type: "spring", stiffness: 320, damping: 32 }}
                        >
                            <IllustrationWork activeIndex={activeIndex + 1} className="absolute inset-0" />
                        </motion.div>
                    </AnimatePresence>
                </motion.div>

                <button
                    type="button"
                    aria-label="Next step"
                    className="hidden rounded-full border border-tropical-indigo/40 p-3 text-tropical-indigo transition hover:border-tropical-indigo hover:bg-tropical-indigo/10 md:inline-flex cursor-pointer"
                    onClick={() => goTo("next")}
                >
                    <HiOutlineChevronRight />
                </button>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={`content-${activeIndex}`}
                    className="flex max-w-3xl flex-col items-center gap-4"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ type: "spring", stiffness: 240, damping: 28 }}
                >
                    <h3 className="mb-2 text-4xl font-display tracking-wide text-ruddy-blue md:text-[56px] lg:text-[64px]">
                        {steps[activeIndex].title}
                    </h3>
                    <p className="text-sm leading-relaxed text-mint-cream/60 md:text-lg lg:text-2xl">
                        {steps[activeIndex].lines.map((line) => (
                            <span key={line} className="block">
                {line}
              </span>
                        ))}
                    </p>
                </motion.div>
            </AnimatePresence>

            <div className="flex gap-2">
                {steps.map((_, index) => (
                    <button
                        key={index}
                        type="button"
                        aria-label={`Go to step ${index + 1}`}
                        className={cn(
                            "h-2 w-8 rounded-full transition",
                            index === activeIndex ? "bg-tropical-indigo" : "bg-tropical-indigo/30 hover:bg-tropical-indigo/60"
                        )}
                        onClick={() => goTo(index)}
                    />
                ))}
            </div>
        </motion.div>
    );
}
