import { useCallback, useEffect, useRef, useState } from "react";

export type TestMode = "time" | "words" | "quote";

export interface UseScoringConfig {
    mode: TestMode;
    target: string;
    durationMs: number;
    wordTargetCount: number;
}

interface ScoringResult {
    wpm: number;
    rawWpm: number;
    accuracy: number;
    correctChars?: number;
    incorrectChars?: number;
    correctWords?: number;
    incorrectWords?: number;
    totalErrors?: number;
}

export function useScoringEngine(config: UseScoringConfig) {
    const { mode, target, wordTargetCount, durationMs } = config;

    const [typed, setTyped] = useState("");
    const [isFinished, setIsFinished] = useState(false);

    const [startTime, setStartTime] = useState<number | null>(null);
    const [endTime, setEndTime] = useState<number | null>(null);

    const [timeLeftMs, setTimeLeftMs] = useState(durationMs); // time mode
    const [timeElapsedMs, setTimeElapsedMs] = useState(0);    // words mode count-up

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const start = useCallback(() => {
        setTyped("");
        setIsFinished(false);

        // Reset timers
        setStartTime(null);
        setEndTime(null);
        setTimeLeftMs(durationMs);
        setTimeElapsedMs(0);
    }, [durationMs]);

    // When user types first character – start timer
    const feed = useCallback(
        (text: string) => {
            if (isFinished) return;

            const now = performance.now();
            if (startTime === null) {
                setStartTime(now);
            }

            setTyped(text);

            if (mode === "words" && startTime !== null) {
                const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
                if (wordCount >= wordTargetCount) {
                    setIsFinished(true);
                    setEndTime(now);
                    setTimeElapsedMs(now - startTime);
                }
            }
        },
        [isFinished, mode, startTime, wordTargetCount]
    );

    // Checking finish conditions and updating timers
    useEffect(() => {
        if (isFinished || startTime === null) return;

        timerRef.current = setInterval(() => {
            const now = performance.now();
            const elapsed = now - startTime;

            // time mode – COUNTDOWN
            if (mode === "time") {
                const remaining = durationMs - elapsed;
                setTimeLeftMs(Math.max(remaining, 0));

                if (remaining <= 0) {
                    setIsFinished(true);
                    setEndTime(now);
                }
            }

            // words mode – COUNT UP
            if (mode === "words") {
                setTimeElapsedMs(elapsed);
            }

            // quote mode – finish by text length
            if (mode === "quote") {
                if (typed.length >= target.length) {
                    setIsFinished(true);
                    setEndTime(now);
                }
            }

        }, 50);

        return () => clearInterval(timerRef.current as NodeJS.Timeout);
    }, [mode, startTime, isFinished, typed.length, target.length, durationMs]);

    const elapsedTimeMs = isFinished && startTime !== null && endTime !== null ? endTime - startTime : null;

    const summary = isFinished && elapsedTimeMs !== null
        ? {
            elapsedTimeMs,
            ...calculateScoring(mode, typed, target, elapsedTimeMs, wordTargetCount),
            mode,
        }
        : null;

    return {
        typed,
        feed,
        start,
        isFinished,
        summary,
        timeLeftMs,
        timeElapsedMs
    };
}

function calculateScoring(mode: TestMode, typed: string, target: string, elapsedTimeMs: number, wordTargetCount: number): ScoringResult {
    const typedWords = typed.trim().split(/\s+/).filter(Boolean);
    const targetWords = target.trim().split(/\s+/).filter(Boolean);
    const matchedWords = typedWords.filter((word, idx) => word === targetWords[idx]).length;

    const correctChars = [...typed].filter((char, idx) => char === target[idx]).length;
    const incorrectChars = Math.max(typed.length - correctChars, 0);
    const totalErrors = Math.max(target.length - correctChars, incorrectChars);
    const accuracy = target.length > 0 ? correctChars / target.length : 1;

    const minutes = Math.max(elapsedTimeMs / 60000, 1 / 60); // avoid divide by zero
    const rawWpm = typedWords.length / minutes;
    const wpm = matchedWords / minutes;

    if (mode === "time") {
        return { wpm, rawWpm, accuracy, correctChars, incorrectChars };
    }

    if (mode === "words") {
        const incorrectWords = Math.max(typedWords.length - matchedWords, 0);
        return { wpm, rawWpm, accuracy, correctWords: matchedWords, incorrectWords };
    }

    return { wpm, rawWpm, accuracy, totalErrors };
}
