"use client";

import { ReactNode, useCallback, useMemo, useState } from "react";
import ExperimentIndicator from "@/components/ExperimentsIndicator";

const DEFAULT_EXPERIMENTS = ["Type Tracker", "Motion Visualizer", "Reactive Grid"];

interface ExperimentPanelProps {
  experiments?: string[];
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  renderExperiment?: (index: number) => ReactNode;
}

export default function ExperimentPanel({
  experiments = DEFAULT_EXPERIMENTS,
  activeIndex,
  onActiveIndexChange,
  renderExperiment,
}: ExperimentPanelProps) {
  const [internalActive, setInternalActive] = useState(0);
  const isControlled = typeof activeIndex === "number";
  const currentActive = isControlled ? (activeIndex as number) : internalActive;

  const handleSelect = useCallback(
    (index: number) => {
      if (!isControlled) {
        setInternalActive(index);
      }
      onActiveIndexChange?.(index);
    },
    [isControlled, onActiveIndexChange]
  );

  const renderedContent = useMemo(() => {
    if (renderExperiment) {
      return renderExperiment(currentActive);
    }
  }, [currentActive, renderExperiment]);

  return (
    <div className="p-1 sm:p-4 md:p-10 flex flex-col-reverse items-center justify-start gap-20 md:gap-0 md:justify-between h-[95%] min-h-[70%] w-full">
        <ExperimentIndicator
            experiments={experiments}
            activeExperimentIndex={currentActive}
            onExperimentSelect={handleSelect}
        />
        {renderedContent ? <div className="w-full text-center text-night h-fit mt-2 md:mt-10">{renderedContent}</div> : null}
    </div>
  );
}
