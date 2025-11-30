"use client";

import { motion } from "motion/react";

interface TimerProps {
  mode: "time" | "words" | "quote";
  timeLeftMs: number;
  timeElapsedMs: number;
  isActive: boolean;
}

export function Timer({ mode, timeLeftMs, timeElapsedMs, isActive }: TimerProps) {
  if (mode === "quote") return null;

  const seconds = mode === "time" ? Math.ceil(timeLeftMs / 1000) : Math.floor(timeElapsedMs / 1000);

  return (
    <motion.div
      className="
        flex items-center justify-center
        bg-night/10 border border-night/80
        text-night
        h-10 sm:h-12 lg:h-16
        px-3 lg:px-6
        rounded-sm
        font-mono
        text-lg sm:text-xl lg:text-[24px]
        font-medium
      "
      animate={{ opacity: isActive ? 1 : 0.6 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
    >
      <motion.span
        key={isActive ? seconds : "inactive"}
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -8, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
      >
        {isActive ? `${seconds}s` : "--"}
      </motion.span>
    </motion.div>
  );
}
