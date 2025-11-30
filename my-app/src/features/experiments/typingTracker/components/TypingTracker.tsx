'use client';

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ControllerUI } from "./ControllerUI";
import { Words } from "./Words";
import { Buttons } from "./Buttons";
import { SummaryUI } from "./SummaryUI";
import {useScoringEngine} from "@/features/experiments/typingTracker/hooks/useScoringEngine";
import {generateTextAction} from "@/app/generateText"; // <<— SERVER ACTION

export function TypingTracker() {
    const inputRef = useRef<HTMLInputElement | null>(null);

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

    // ====== FETCH NEW TEXT (SERVER ACTION) ======
    async function loadNewText() {
        setIsFetchingText(true);
        const text = await generateTextAction({
            mode: testType,
            count: testType === "quote" ? 25 : activeOption,
            punctuation,
            numbers,
        });

        setTargetText(text);
        setTextVersion((prev) => prev + 1);
        setIsFetchingText(false);
    }

    // Generate text WHEN user changes controller options
    useEffect(() => {
        // Generate fresh text always when controller changes
        loadNewText();

        // Reset scoring engine when controller changes
        start();

        // If the user was typing, stop and return to idle
        if (uiState === "typing") {
            setUiState("idle");
        }
    }, [testType, activeOption, punctuation, numbers]);

    // ===== SCORING ENGINE =====
    const scoring = useScoringEngine({
        mode: testType,
        target: targetText,
        durationMs: activeOption * 1000,
        wordTargetCount: activeOption,
    });

    const { typed, feed, start, isFinished, summary, timeLeftMs, timeElapsedMs } =
        scoring;

    // ===== LIFE CYCLE HANDLERS =====
    const handleMain = async () => {
        if (uiState === "idle") {
            await loadNewText();
            start();
            setUiState("typing");
            inputRef.current?.focus();
        }

        else if (uiState === "typing") {
            await loadNewText();
            start(); // reset
            inputRef.current?.focus();
        }

        else if (uiState === "summary") {
            await loadNewText();
            start();
            setUiState("typing");
            inputRef.current?.focus();
        }
    };

    const handleSkip = async () => {
        await loadNewText();
        start();
        setUiState("typing");
        inputRef.current?.focus();
    };

    const handleType = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (uiState !== "typing") return;

        feed(e.target.value);

        if (scoring.isFinished) {
            setUiState("summary");
        }
    };

    const focusInput = () => inputRef.current?.focus();
    const tryFocus = () => focusInput();

    // ===== UI RETURN =====
    return (
        <motion.section
            className="flex flex-col gap-8 max-w-[800px] items-center py-6 px-1 bg-ruddy-blue rounded-4xl shadow-lg"
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            animate={
                uiState === "typing"
                    ? { opacity: 1, scale: 1 }
                    : uiState === "summary"
                        ? { opacity: 1, scale: 1.02 }
                        : { opacity: 0.94, scale: 0.99 }
            }
            exit={{ opacity: 0, scale: 0.95, y: 24 }}
            transition={{ type: "spring", stiffness: 220, damping: 28 }}
        >
            <ControllerUI
                testType={testType}
                activeOption={activeOption}
                punctuation={punctuation}
                numbers={numbers}
                onTogglePunctuation={() => setPunctuation(p => !p)}
                onToggleNumbers={() => setNumbers(n => !n)}

                disabledQuote={true}
                onChangeTestType={(t) => {
                    setTestType(t);
                    setActiveOption(t === "time" ? 30 : t === "words" ? 40 : 0);
                }}
                onChangeActiveOption={setActiveOption}
            />

            <motion.div className="relative w-full" initial={{opacity: 0, y: 16}} animate={{opacity: 1, y: 0}} transition={{delay: 0.15, duration: 0.3, ease: "easeOut"}}>
                <input
                    ref={inputRef}
                    value={typed}
                    onChange={handleType}
                    onClick={tryFocus}
                    className="absolute -top-10 left-0 opacity-0 pointer-events-none"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                />

                <motion.div className="min-h-[200px]" layout>
                    <AnimatePresence mode="wait">
                        {uiState === "summary" ? (
                            <motion.div
                                key="summary"
                                initial={{opacity: 0, y: 12}}
                                animate={{opacity: 1, y: 0}}
                                exit={{opacity: 0, y: -12}}
                                transition={{duration: 0.3}}
                            >
                                <SummaryUI summary={summary} />
                            </motion.div>
                        ) : isFetchingText ? (
                            <motion.div
                                key="loading"
                                className="h-[180px] rounded-xl border border-white/10 bg-white/5 animate-pulse"
                                initial={{opacity: 0}}
                                animate={{opacity: 1}}
                                exit={{opacity: 0}}
                            />
                        ) : (
                            <motion.div
                                key={`words-${textVersion}`}
                                initial={{opacity: 0, y: 8}}
                                animate={{opacity: 1, y: 0}}
                                exit={{opacity: 0, y: -8}}
                                transition={{duration: 0.25}}
                            >
                                <Words typed={typed} target={targetText} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.div>

            <motion.div initial={{opacity: 0, y: 12}} animate={{opacity: 1, y: 0}} transition={{delay: 0.25, duration: 0.3, ease: "easeOut"}}>
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
