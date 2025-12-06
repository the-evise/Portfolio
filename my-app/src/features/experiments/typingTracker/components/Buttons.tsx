import { HiLightningBolt, HiOutlineFastForward } from "react-icons/hi";
import { motion } from "motion/react";
import { Timer } from "./Timer";

interface ButtonsProps {
    onMain: () => void;
    onSkip: () => void;
    onFocusInput?: () => void;
    state: "idle" | "typing" | "summary";
    mode: "time" | "words" | "quote";
    timeLeftMs: number;
    timeElapsedMs: number;
}

export function Buttons({
                            onMain,
                            onSkip,
                            onFocusInput,
                            state,
                            mode,
                            timeLeftMs,
                            timeElapsedMs
                        }: ButtonsProps) {
    const label =
        state === "idle"
            ? "Start Typing"
            : state === "typing"
                ? "Reset"
                : "Next Test";

    return (
        <div className="flex items-center gap-1 md:gap-3 font-mono mt-2">
            <Timer
                mode={mode}
                timeLeftMs={timeLeftMs}
                timeElapsedMs={timeElapsedMs}
                isActive={state === "typing"}
            />

            <motion.button
                type="button"
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                    onSkip();
                }}
                className="
                  flex items-center gap-1
                  justify-between
                  bg-night
                  text-tropical-indigo hover:text-mint-cream/80
                  p-1 px-4
                  sm:p-2 sm:px-4
                  lg:p-4 lg:px-6
                  rounded-sm
                  text-md sm:text-xl lg:text-[24px]
                  font-medium
                  h-10 sm:h-12 lg:h-16
                "
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 320, damping: 20 }}
            >
                <span>{label}</span>
                <HiLightningBolt className="size-4 lg:size-6" />
            </motion.button>

            <motion.button
                type="button"
                onClick={onSkip}
                className="
                  sm:flex items-center justify-center
                  bg-night
                  text-tropical-indigo
                  hidden sm:p-2 lg:p-4
                  rounded-sm
                  h-10 sm:h-12 lg:h-16 aspect-square
        "
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 320, damping: 20 }}
            >
                <HiOutlineFastForward className="sm:size-6 lg:size-9" />
            </motion.button>
        </div>
    );
}
