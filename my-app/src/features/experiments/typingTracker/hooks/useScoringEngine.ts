import { useCallback, useEffect, useRef, useState } from "react";

export type TestMode = "time" | "words" | "quote";

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

    // When user types first character → start timer
    const feed = useCallback(
        (text: string) => {
            if (isFinished) return;

            if (startTime === null) {
                const now = performance.now();
                setStartTime(now);
            }

            setTyped(text);
        },
        [isFinished, startTime]
    );

    // Checking finish conditions and updating timers
    useEffect(() => {
        if (isFinished || startTime === null) return;

        timerRef.current = setInterval(() => {
            const now = performance.now();
            const elapsed = now - startTime;

            // time mode → COUNTDOWN
            if (mode === "time") {
                const remaining = durationMs - elapsed;
                setTimeLeftMs(Math.max(remaining, 0));

                if (remaining <= 0) {
                    setIsFinished(true);
                    setEndTime(now);
                }
            }

            // words mode → COUNT UP
            if (mode === "words") {
                setTimeElapsedMs(elapsed);
            }

            // quote mode → no timer, finish by text length
            if (mode === "quote") {
                if (typed.length >= target.length) {
                    setIsFinished(true);
                    setEndTime(now);
                }
            }

        }, 50);

        return () => clearInterval(timerRef.current as NodeJS.Timeout);
    }, [mode, startTime, isFinished, typed.length, target.length, durationMs]);

    // Summary calculation
    const summary = isFinished
        ? {
            elapsedTimeMs: endTime! - startTime!,
            ...calculateScoring(mode, typed, target),
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
