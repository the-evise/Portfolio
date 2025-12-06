"use client";

import { motion } from "motion/react";

type SummaryUIProps = {
  summary: any;
};

export function SummaryUI({ summary }: SummaryUIProps) {
  if (!summary) return null;

  const metrics: SummaryMetricProps[] = [];

  if ("wpm" in summary) {
    metrics.push({ label: "WPM", value: summary.wpm.toFixed(1), delay: 0.05 });
  }

  if ("rawWpm" in summary) {
    metrics.push({ label: "Raw WPM", value: summary.rawWpm.toFixed(1), delay: 0.1 });
  }

  metrics.push({ label: "Accuracy", value: `${(summary.accuracy * 100).toFixed(1)}%`, delay: 0.15 });

  if (summary.mode === "time") {
    metrics.push(
      { label: "Correct Chars", value: summary.correctChars, delay: 0.2 },
      { label: "Incorrect Chars", value: summary.incorrectChars, delay: 0.25 }
    );
  }

  if (summary.mode === "words") {
    metrics.push(
      { label: "Correct Words", value: summary.correctWords, delay: 0.2 },
      { label: "Incorrect Words", value: summary.incorrectWords, delay: 0.25 }
    );
  }

  if (summary.mode === "quote") {
    metrics.push({ label: "Total Errors", value: summary.totalErrors, delay: 0.2 });
  }

  metrics.push({
    label: "Time",
    value: `${(summary.elapsedTimeMs / 1000).toFixed(1)}s`,
    delay: 0.3,
  });

  return (
    <motion.div
      className="dm-mono text-mint-cream flex flex-col items-center gap-3 p-6 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
    >
      <div className="text-2xl sm:text-[26px] md:text-[28px] text-mint-cream/60">Test Summary ({summary.mode})</div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {metrics.map((metric) => (
          <SummaryMetric
            key={metric.label}
            label={metric.label}
            value={metric.value}
            delay={metric.delay}
          />
        ))}
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
      className="flex flex-col gap-1 rounded-lg bg-mint-cream/70 px-2 py-1 text-center sm:text-center text-[#07021A]/60"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 24, delay }}
    >
      <span className="text-[11px] sm:text-xs uppercase tracking-[0.3em] text-ruddy-blue">{label}</span>
      <span className="text-sm sm:text-xl md:text-2xl">{value}</span>
    </motion.div>
  );
}
