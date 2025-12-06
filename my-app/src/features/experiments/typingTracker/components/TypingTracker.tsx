'use client';

import {useEffect, useRef, useState} from "react";
import {AnimatePresence, motion} from "motion/react";
import {ControllerUI} from "./ControllerUI";
import {Words} from "./Words";
import {Buttons} from "./Buttons";
import {SummaryUI} from "./SummaryUI";
import {useScoringEngine} from "@/features/experiments/typingTracker/hooks/useScoringEngine";
import {generateTextAction} from "@/app/generateText"; // server action

export function TypingTracker() {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const loadPromiseRef = useRef<Promise<void> | null>(null);

    // CONTROLLER STATE
    const [testType, setTestType] = useState<"time" | "words" | "quote">("time");
    const [activeOption, setActiveOption] = useState(30);
    const [punctuation, setPunctuation] = useState(false);
    const [numbers, setNumbers] = useState(false);

    // UI STATE MACHINE
    const [uiState, setUiState] = useState<"idle" | "typing" | "summary">("idle");

    // GENERATED TARGET TEXT
    const [targetText, setTargetText] = useState("");
    const [textVersion, setTextVersion] = useState(0);
    const [isFetchingText, setIsFetchingText] = useState(true);

    // ====== FETCH NEW TEXT ======
    async function loadNewText() {
        if (loadPromiseRef.current) return loadPromiseRef.current;

        const promise = (async () => {
            setIsFetchingText(true);

            await new Promise(res => setTimeout(res, Math.random() * 1500 + 400));
            // between 400ms and 1900ms
            // 1.2 seconds

            const text = await generateTextAction({
                mode: testType,
                count: testType === "quote" ? 25 : activeOption,
                punctuation,
                numbers,
            });

            setTargetText(text);
            setTextVersion((prev) => prev + 1);
            setIsFetchingText(false);
        })();

        loadPromiseRef.current = promise;

        try {
            await promise;
        } finally {
            loadPromiseRef.current = null;
        }
    }

    // ====== GENERATE TEXT WHEN CONTROLLER CHANGES ======
    useEffect(() => {
        const run = async () => {
            setUiState("idle");         // Reset UI before loading
            await loadNewText();        // Fetch new text
            start();                    // Start scoring AFTER text is ready
        };
        run();
    }, [testType, activeOption, punctuation, numbers]);

    // ====== SCORING ENGINE ======
    const scoring = useScoringEngine({
        mode: testType,
        target: targetText,
        durationMs: activeOption * 1000,
        wordTargetCount: activeOption,
    });

    const {typed, feed, start, isFinished, summary, timeLeftMs, timeElapsedMs} = scoring;

    // ====== HANDLERS ======
    const handleMain = async () => {
        setUiState("idle");            // immediately reflect state
        await loadNewText();           // load new text
        start();                       // begin scoring
        setUiState("typing");
        inputRef.current?.focus();
    };

    const handleSkip = async () => {
        setUiState("idle");
        await loadNewText();
        start();
        setUiState("typing");
        inputRef.current?.focus();
    };

    const handleType = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (uiState !== "typing") return;

        feed(e.target.value);

        if (isFinished) {
            setUiState("summary");
        }
    };

    const focusInput = () => inputRef.current?.focus();

    // ====== RENDER ======
    return (
        <motion.section
            className="w-full h-full flex flex-col gap-4 max-w-[800px] items-center py-6 px-1 bg-ruddy-blue rounded-4xl shadow-lg mx-auto justify-between"
            initial={{opacity: 0, scale: 0.95, y: 24}}
            whileInView={{opacity: 1, scale: 1, y: 0}}
            viewport={{once: true, amount: 0.35}}
            animate={{opacity: 1, scale: uiState === "summary" ? 1.02 : 1}}
            transition={{type: "spring", stiffness: 220, damping: 28}}
        >
            <ControllerUI
                testType={testType}
                activeOption={activeOption}
                punctuation={punctuation}
                numbers={numbers}
                onTogglePunctuation={() => setPunctuation((p) => !p)}
                onToggleNumbers={() => setNumbers((n) => !n)}
                disabledQuote={true}
                onChangeTestType={(t) => {
                    setTestType(t);
                    setActiveOption(t === "time" ? 30 : t === "words" ? 40 : 0);
                }}
                onChangeActiveOption={setActiveOption}
            />

            <motion.div className="relative w-full">
                <input
                    ref={inputRef}
                    value={typed}
                    onChange={handleType}
                    onClick={focusInput}
                    className="absolute -top-10 left-0 opacity-0 pointer-events-none"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                />

                <motion.div className="w-[95%] mx-auto" layout>
                    <AnimatePresence mode="wait">

                        {/* PRIORITY: 1 — LOADING */}
                        {isFetchingText ? (
                                <motion.div
                                    key="loading"
                                    className="flex h-[180px] items-center justify-center bg-transparent"
                                    initial={{opacity: 0, scale: 0.98}}
                                    animate={{opacity: 1, scale: 1}}
                                    exit={{opacity: 0, scale: 0.98}}
                                    transition={{duration: 0.2}}
                                >
                                    <div className="flex items-center gap-3 text-mint-cream/40">
                                    <span className="relative inline-flex h-5 w-5">
                                        <span
                                            className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint-cream/20"/>
                                        <span className="relative inline-flex h-5 w-5 rounded-full bg-mint-cream/80"/>
                                    </span>
                                        <span className="text-sm font-medium text-mint-cream/60">
                                        Loading a new prompt...
                                    </span>
                                    </div>
                                </motion.div>
                            ) :

                            /* PRIORITY: 2 — SUMMARY */
                            uiState === "summary" ? (
                                    <motion.div
                                        key="summary"
                                        initial={{opacity: 0, y: 12}}
                                        animate={{opacity: 1, y: 0}}
                                        exit={{opacity: 0, y: -12}}
                                        transition={{duration: 0.3}}
                                    >
                                        <SummaryUI summary={summary}/>
                                    </motion.div>
                                ) :

                                /* PRIORITY: 3 — WORDS */
                                (
                                    <motion.div
                                        key={`words-${textVersion}`}
                                        initial={{opacity: 0, y: 8}}
                                        animate={{opacity: 1, y: 0}}
                                        exit={{opacity: 0, y: -8}}
                                        transition={{duration: 0.25}}
                                    >
                                        <Words typed={typed} target={targetText}/>
                                    </motion.div>
                                )}

                    </AnimatePresence>
                </motion.div>
            </motion.div>

            <motion.div>
                <Buttons
                    onMain={handleMain}
                    onSkip={handleSkip}
                    onFocusInput={focusInput}
                    state={uiState}
                    mode={testType}
                    timeLeftMs={timeLeftMs}
                    timeElapsedMs={timeElapsedMs}
                />
            </motion.div>
        </motion.section>
    );
}
