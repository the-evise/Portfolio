"use client";

import { motion } from "motion/react";

type SummaryUIProps = {
  summary: any;
};

export function SummaryUI({ summary }: SummaryUIProps) {
  if (!summary) return null;

  return (
    <motion.div
      className="dm-mono text-mint-cream flex flex-col items-center gap-4 p-6 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
    >
      <div className="text-[28px]">Test Summary ({summary.mode})</div>

      <div className="text-[20px] flex flex-col gap-2">
        {"wpm" in summary && (
          <SummaryMetric label="WPM" value={summary.wpm.toFixed(1)} delay={0.05} />
        )}
        {"rawWpm" in summary && (
          <SummaryMetric label="Raw WPM" value={summary.rawWpm.toFixed(1)} delay={0.1} />
        )}
        <SummaryMetric label="Accuracy" value={`${(summary.accuracy * 100).toFixed(1)}%`} delay={0.15} />

        {summary.mode === "time" && (
          <>
            <SummaryMetric label="Correct Chars" value={summary.correctChars} delay={0.2} />
            <SummaryMetric label="Incorrect Chars" value={summary.incorrectChars} delay={0.25} />
          </>
        )}

        {summary.mode === "words" && (
          <>
            <SummaryMetric label="Correct Words" value={summary.correctWords} delay={0.2} />
            <SummaryMetric label="Incorrect Words" value={summary.incorrectWords} delay={0.25} />
          </>
        )}

        {summary.mode === "quote" && (
          <SummaryMetric label="Total Errors" value={summary.totalErrors} delay={0.2} />
        )}

        <SummaryMetric label="Time" value={`${(summary.elapsedTimeMs / 1000).toFixed(1)}s`} delay={0.3} />
      </div>
    </motion.div>
  );
}

interface SummaryMetricProps {
  label: string;
  value: string | number;
  delay?: number;
}

function SummaryMetric({ label, value, delay = 0 }: SummaryMetricProps) {
  return (
    <motion.div
      className="flex flex-col gap-1"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 24, delay }}
    >
      <span className="text-sm uppercase tracking-[0.3em] text-mint-cream/60">{label}</span>
      <span>{value}</span>
    </motion.div>
  );
}
