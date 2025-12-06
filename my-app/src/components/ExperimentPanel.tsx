"use client";

import { memo, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import ExperimentIndicator from "@/components/ExperimentsIndicator";
import { useFullScreenScroller } from "@/components/FullScreenScroller";
import DragGuideModal from "@/components/DragGuideModal";

const DEFAULT_EXPERIMENTS = ["Type Tracker", "Motion Visualizer", "Reactive Grid"];
const SWIPE_THRESHOLD = 30;
const MAX_DRAG_PULL = 48;
const DRAG_INFLUENCE = 0.35;

interface ExperimentPanelProps {
  experiments?: string[];
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  renderExperiment?: (index: number) => ReactNode;
}

function ExperimentPanel({
  experiments = DEFAULT_EXPERIMENTS,
  activeIndex,
  onActiveIndexChange,
  renderExperiment,
}: ExperimentPanelProps) {
  const scroller = useFullScreenScroller();
  const [internalActive, setInternalActive] = useState(0);
  const isControlled = typeof activeIndex === "number";
  const currentActive = isControlled ? (activeIndex as number) : internalActive;
  const [showGuide, setShowGuide] = useState(false);
  const hasShownGuideRef = useRef(false);

  const handleSelect = useCallback(
    (index: number) => {
      const nextIndex = Math.max(0, Math.min(experiments.length - 1, index));
      if (!isControlled) {
        setInternalActive(nextIndex);
      }
      onActiveIndexChange?.(nextIndex);
    },
    [experiments.length, isControlled, onActiveIndexChange]
  );

  const slides = useMemo(
    () =>
      experiments.map((label, index) => {
        const shouldRender = Math.abs(index - currentActive) <= 1;
        return {
          label,
          content: shouldRender && renderExperiment ? renderExperiment(index) : null,
        };
      }),
    [currentActive, experiments, renderExperiment]
  );

  const baseX = useMotionValue<number>(0);
  const dragX = useMotionValue<number>(0);
  const dragInfluenceX = useTransform(dragX, (v) => v * DRAG_INFLUENCE);
  const trackX = useMotionValue<number>(0);

  useEffect(() => {
    const update = () => trackX.set(baseX.get() + dragInfluenceX.get());
    const unsubBase = baseX.on("change", update);
    const unsubDrag = dragInfluenceX.on("change", update);
    update();
    return () => {
      unsubBase();
      unsubDrag();
    };
  }, [baseX, dragInfluenceX, trackX]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const panBlockedRef = useRef(false);
  const [slideWidth, setSlideWidth] = useState(0);

  const shouldBlockPan = useCallback((target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    if (target.closest("input, textarea, select, option, button")) return true;
    if (target.closest('[role="slider"]')) return true;
    if (target.closest("[data-no-pan]")) return true;
    return false;
  }, []);

  // Keep track sized to the container width for consistent snapping.
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new ResizeObserver((entries) => {
      const [entry] = entries;
      if (entry?.contentRect?.width) {
        setSlideWidth(entry.contentRect.width);
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Snap track when the active index changes (keyboard/indicator/tap).
  useEffect(() => {
    if (!slideWidth) return;
    void animate(baseX, -currentActive * slideWidth, {
      type: "spring",
      stiffness: 260,
      damping: 32,
    });
  }, [baseX, currentActive, slideWidth]);

  const handlePanStart = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent) => {
      panBlockedRef.current = shouldBlockPan(event.target);
    },
    [shouldBlockPan]
  );

  const handlePan = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number } }) => {
      if (panBlockedRef.current) return;
      const clamped = Math.max(-MAX_DRAG_PULL, Math.min(MAX_DRAG_PULL, info.offset.x));
      dragX.set(clamped);
    },
    [dragX]
  );

  const handlePanEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number }; velocity: { x: number } }) => {
      if (panBlockedRef.current) {
        panBlockedRef.current = false;
        return;
      }
      if (!slideWidth) {
        void animate(dragX, 0, { type: "spring", stiffness: 280, damping: 26 });
        return;
      }

      const swipe = info.offset.x + info.velocity.x * 0.2;
      let targetIndex = currentActive;

      if (swipe < -SWIPE_THRESHOLD && currentActive < experiments.length - 1) {
        targetIndex = currentActive + 1;
      } else if (swipe > SWIPE_THRESHOLD && currentActive > 0) {
        targetIndex = currentActive - 1;
      }

      handleSelect(targetIndex);
      void animate(dragX, 0, { type: "spring", stiffness: 320, damping: 28 });
    },
    [currentActive, dragX, experiments.length, handleSelect, slideWidth]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        handleSelect(currentActive - 1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        handleSelect(currentActive + 1);
      }
    },
    [currentActive, handleSelect]
  );

  useEffect(() => {
    const isComponentsActive = scroller?.activeSectionId === "components";
    if (isComponentsActive && !hasShownGuideRef.current) {
      setShowGuide(true);
      hasShownGuideRef.current = true;
    }
    if (!isComponentsActive) {
      setShowGuide(false);
    }
  }, [scroller?.activeSectionId]);

  const handleDismissGuide = useCallback(() => {
    setShowGuide(false);
  }, []);

  return (
    <div className="p-1 sm:p-4 md:p-6 flex flex-col-reverse items-center justify-center gap-10 md:gap-4 md:justify-between h-[95%] min-h-[70%] w-full">
      <ExperimentIndicator
        experiments={experiments}
        activeExperimentIndex={currentActive}
        onExperimentSelect={handleSelect}
      />

      <div className="w-full" ref={containerRef}>
        <div
          className="relative w-full overflow-hidden rounded-2xl bg-white/5"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          aria-label="Experiment carousel"
        >
          <motion.div
            className="flex w-full"
            onPanStart={handlePanStart}
            onPan={handlePan}
            onPanEnd={handlePanEnd}
            role="presentation"
            style={{ x: trackX, touchAction: "pan-y" }}
          >
            {slides.map(({ label, content }, index) => (
              <div
                key={label}
                className="min-w-full flex items-start px-2 py-1 md:p-6 focus:outline-none"
                aria-hidden={currentActive !== index}
                role="group"
                aria-label={`Experiment ${index + 1}: ${label}`}
              >
                {content ?? (
                  <div className="flex min-h-[300px] items-center justify-center rounded-xl bg-night text-mint-cream">
                    {label}
                  </div>
                )}
              </div>
            ))}
          </motion.div>
          <span className="sr-only" aria-live="polite">
            {`Active experiment: ${experiments[currentActive]}`}
          </span>
        </div>
      </div>
      <DragGuideModal open={showGuide} onClose={handleDismissGuide} />
    </div>
  );
}

export default memo(ExperimentPanel);
