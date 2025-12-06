"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import * as motion from "motion/react-client";
import {AnimatePresence, motion as Motion, useAnimate} from "motion/react";
import MotionChart from "./MotionChart";
import MotionSlider from "./MotionSlider";
import {cn} from "@/utils/utils";
import {HiCheck, HiClipboard} from "react-icons/hi";

const DROP_DISTANCE = 480;

interface MotionVisualizerProps {
    className?: string;
}

export default function MotionVisualizer({className}: MotionVisualizerProps) {
    const INITIAL = {
        smoothness: 100,
        snap: 10,
        weight: 1,
    };


    const [smoothness, setSmoothness] = useState(100);
    const [snap, setSnap] = useState(10);
    const [weight, setWeight] = useState(1);
    const [isAdjusting, setIsAdjusting] = useState(false);
    const shouldReplayRef = useRef(true);
    const [scope, animate] = useAnimate();


    const playDrop = useCallback(() => {
        if (!scope.current) return Promise.resolve();

        const isMd = window.matchMedia("(min-width: 768px)").matches;

        // MOBILE → vertical drop
        if (!isMd) {
            return animate(
                scope.current,
                {y: [20, DROP_DISTANCE]},
                {
                    type: "spring",
                    stiffness: smoothness,
                    damping: snap,
                    mass: weight,
                }
            );
        }

        // DESKTOP (md↑) → horizontal slide
        return animate(
            scope.current,
            {x: [20, 540]},
            {
                type: "spring",
                stiffness: smoothness,
                damping: snap,
                mass: weight,
            }
        );
    }, [smoothness, snap, weight]);

    const resetAll = useCallback(() => {
        setSmoothness(INITIAL.smoothness);
        setSnap(INITIAL.snap);
        setWeight(INITIAL.weight);

        // Also trigger the animation replay if needed
        shouldReplayRef.current = false;
        void playDrop();
    }, [playDrop]);


    useEffect(() => {
        if (isAdjusting || !shouldReplayRef.current) {
            return;
        }
        shouldReplayRef.current = false;
        void playDrop();
    }, [isAdjusting, playDrop]);

    const handleSliderStart = useCallback(() => setIsAdjusting(true), []);
    const handleSliderEnd = useCallback((committed: boolean) => {
        setIsAdjusting(false);
        if (committed) {
            shouldReplayRef.current = true;
        }
    }, []);

    const handleReplay = useCallback(() => {
        shouldReplayRef.current = false;
        void playDrop();
    }, [playDrop]);

    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(() => {
        const text = `transition={{
          type: "spring",
          stiffness: ${smoothness},
          damping: ${snap},
          mass: ${weight}}}`;

        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        });
    }, [smoothness, snap, weight]);



    return (
        <Motion.section
            className={cn("flex flex-col gap-1 !w-fit place-self-center mx-auto", className)}
            initial={{opacity: 0, scale: 0.95, y: 24}}
            whileInView={{opacity: 1, scale: 1, y: 0}}
            viewport={{once: true, amount: 0.35}}
            transition={{type: "spring", stiffness: 220, damping: 28}}
        >
            <section
                className="
                    grid
                    grid-cols-[275px_1fr]
                    grid-rows-[275px_275px]
                    md:grid-cols-[379px_253px]
                    md:grid-rows-[379px_1fr]
                    gap-2 md:gap-1
                    rounded-[20px]
                    bg-ruddy-blue
                    p-2 sm:p-1
                    w-fit
                    text-mint-cream
                    ring-3 ring-night/10
                "
            >
                {/* ──────────────────────────────── */}
                {/* 1) Motion Chart */}
                {/* ──────────────────────────────── */}
                <div className="rounded-2xl bg-ruddy-blue/20 flex items-center justify-center overflow-hidden">
                    <MotionChart stiffness={smoothness} damping={snap} mass={weight}/>
                </div>

                {/* ──────────────────────────────── */}
                {/* 3) Motion Ball Track */}
                {/* ──────────────────────────────── */}
                <div
                    className="row-span-2 md:row-span-1 md:order-3 md:col-span-2 relative rounded-2xl bg-ruddy-blue/20 overflow-hidden flex items-start md:items-center justify-start px-2 sm:px-4 md:px-0 pt-3 md:py-6 h-[calc(100%-24px)] md:h-auto md:w-[calc(100%-24px)] place-self-center">
                    {/* Vertical track */}
                    <div
                        className="
                            absolute top-0 left-1/2 -translate-x-1/2
                            md:top-1/2 md:left-auto md:translate-x-0
                            h-full md:h-[2px]
                            w-[1px] md:w-full
                            bg-mint-cream/20
                            md:mx-auto
                        "/>

                    {/* Motion ball */}
                    <motion.div
                        ref={scope}
                        className="w-5 h-5 md:translate-x-[20px] sm:w-6 sm:h-6 md:w-9 md:h-9 rounded-full bg-cardinal-light z-30"
                        initial={{y: 0, x: 0, opacity: 1}}
                    />
                </div>

                {/* ──────────────────────────────── */}
                {/* 2) Sliders */}
                {/* ──────────────────────────────── */}

                <div className="flex flex-col gap-4 md:gap-10 bg-white/10 p-2 rounded-2xl">
                    <MotionSlider
                        label="Smoothness"
                        value={smoothness}
                        onChange={setSmoothness}
                        min={20}
                        max={400}
                        onDragStart={handleSliderStart}
                        onDragEnd={handleSliderEnd}
                    />
                    <MotionSlider
                        label="Snap"
                        value={snap}
                        onChange={setSnap}
                        min={1}
                        max={50}
                        onDragStart={handleSliderStart}
                        onDragEnd={handleSliderEnd}
                    />
                    <MotionSlider
                        label="Weight"
                        value={weight}
                        onChange={setWeight}
                        step={0.1}
                        min={0.2}
                        max={5}
                        onDragStart={handleSliderStart}
                        onDragEnd={handleSliderEnd}
                    />

                    <div className="flex items-center gap-2 justify-center mt-auto">
                        {/* RESET button */}
                        <button
                            onClick={resetAll}
                            className="
                          px-6 py-2 rounded-xl
                          bg-mint-cream/30
                          ring-2 ring-night/60 hover:ring-night
                          text-night
                          font-medium dm-mono
                          text-2xl
                          hover:bg-mint-cream
                          transition flex-grow
                        cursor-pointer
    "
                        >
                            RESET
                        </button>

                        {/* Icon button */}
                        <button
                            onClick={handleCopy}
                            className={cn("w-12 h-12 flex items-center justify-center rounded-xl bg-white/10 ring-1 ring-night/20 transition relative hover:bg-mint-cream", copied ? "cursor-default" : "cursor-pointer")}
                        >
                            <AnimatePresence mode="wait">
                                {copied ? (
                                    <motion.span
                                        key="check"
                                        initial={{ opacity: 0, scale: 0.7 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.7 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        <HiCheck className="text-[32px] text-night" />
                                    </motion.span>
                                ) : (
                                    <motion.span
                                        key="copy"
                                        initial={{ opacity: 0, scale: 0.7 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.7 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        <HiClipboard className="text-[32px] text-night" />
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </button>

                    </div>
                </div>
            </section>
        </Motion.section>
    );

}
