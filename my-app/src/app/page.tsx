"use client";

import { useState } from "react";
import FullScreenScroller, { FullScreenScrollSection } from "@/components/FullScreenScroller";
import Navigation from "@/components/Navigation";
import AboutMeCard from "@/components/AboutMeCard";
import MotionVisualizer from "@/features/experiments/motionVisualizer/components/MotionVisualizer";
import ReactiveGrid from "@/features/experiments/reactiveGrid/components/ReactiveGrid";
import { TypingTracker } from "@/features/experiments/typingTracker/components/TypingTracker";
import ExperimentPanel from "@/components/ExperimentPanel";
import Headline from "@/components/Headline";
import WorkProcess from "@/components/WorkProcess";

const EXPERIMENTS = [
    { label: "Type Tracker", Component: TypingTracker },
    { label: "Motion Visualizer", Component: MotionVisualizer },
    { label: "Reactive Grid", Component: ReactiveGrid },
] as const;

const experimentLabels = EXPERIMENTS.map((exp) => exp.label);

export default function Home() {
  const [activeExperimentIndex, setActiveExperimentIndex] = useState(0);

  const sections: FullScreenScrollSection[] = [
    {
      id: "about",
      label: "About Me",
      className: "bg-night text-mint-cream",
      content: (
        <div className="grid text-center justify-center items-center space-y-4 px-4 w-full">
            <div className={"place-self-center"}><AboutMeCard/></div>
        </div>
      ),
    },
    {
      id: "components",
      label: "Components",
      className: "bg-mint-cream text-mint-cream",
      locksParent: true,
      content: (
        <div className="flex flex-col gap-1 px-2 md:px-12 h-full w-full justify-center items-center">
          <Headline text="Components" />
            <ExperimentPanel
                experiments={experimentLabels}
                activeIndex={activeExperimentIndex}
                onActiveIndexChange={setActiveExperimentIndex}
                renderExperiment={() => {
                    const ActiveComponent = EXPERIMENTS[activeExperimentIndex].Component;
                    return <ActiveComponent />;
                }}
            />

        </div>
      ),
    },
    {
      id: "work",
      label: "Work Process",
      className: "bg-night text-mint-cream",
      content: (
        <div className="flex flex-col gap-4 px-2 md:px-6 w-full max-w-4xl items-center h-full py-30 text-center justify-center">
          <Headline color={"mint"} text={"My Work Process"} className={"mb-8"}/>
            <WorkProcess />
        </div>
      ),
    },
  ];

  return (
    <FullScreenScroller sections={sections}>
      <Navigation />
    </FullScreenScroller>
  );
}
