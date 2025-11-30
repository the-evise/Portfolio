"use client";

import { ReactNode, useCallback, useEffect, useRef } from "react";
import { cn } from "@/utils/utils";
import { useFullScreenScroller, useSectionId } from "@/components/FullScreenScroller";
import { useNestedScrollController } from "@/hooks/useNestedScrollController";

interface NestedScrollSectionProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

/**
 * Captures scroll events until its internal content reaches either end,
 * ensuring the parent full-screen section cannot advance prematurely.
 */
export default function NestedScrollSection({ children, className, contentClassName }: NestedScrollSectionProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const touchStartRef = useRef<number | null>(null);
  const scroller = useFullScreenScroller();
  const sectionId = useSectionId();

  const controller = useNestedScrollController(containerRef);
  const consumeScroll = controller.consumeScroll;

  useEffect(() => {
    if (!scroller || !sectionId) {
      return;
    }

    return scroller.registerNestedScroll(sectionId, controller);
  }, [controller, scroller, sectionId]);

  const handleWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      if (consumeScroll(event.deltaY)) {
        event.stopPropagation();
        event.preventDefault();
      }
    },
    [consumeScroll]
  );

  const handleTouchStart = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    touchStartRef.current = event.touches[0]?.clientY ?? null;
  }, []);

  const handleTouchMove = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      const startY = touchStartRef.current;
      const currentY = event.touches[0]?.clientY ?? null;
      if (startY == null || currentY == null) {
        return;
      }

      const delta = startY - currentY;
      touchStartRef.current = currentY;

      if (consumeScroll(delta)) {
        event.stopPropagation();
        event.preventDefault();
      }
    },
    [consumeScroll]
  );

  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null;
  }, []);

  return (
    <div
      className={cn("h-full w-full overflow-hidden", className)}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div ref={containerRef} className={cn("h-full w-full overflow-y-auto", contentClassName)}>
        {children}
      </div>
    </div>
  );
}
