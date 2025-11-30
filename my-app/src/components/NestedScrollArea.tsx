"use client";

import { Children, ReactNode, useEffect, useMemo, useRef } from "react";
import { useFullScreenScroller, useSectionId } from "@/components/FullScreenScroller";
import { useNestedScrollController } from "@/hooks/useNestedScrollController";
import { cn } from "@/utils/utils";

interface NestedScrollAreaProps {
  children: ReactNode;
  heightClassName?: string;
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
}

export function NestedScrollArea({
  children,
  heightClassName,
  activeIndex,
  onActiveIndexChange,
}: NestedScrollAreaProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const controller = useNestedScrollController(scrollRef);
  const childRefs = useRef<Array<HTMLDivElement | null>>([]);
  const suppressNotificationsRef = useRef(false);
  const lastAnnouncedIndexRef = useRef<number | null>(null);

  const scroller = useFullScreenScroller();
  const sectionId = useSectionId();

  useEffect(() => {
    if (!scroller || !sectionId) return;

    return scroller.registerNestedScroll(sectionId, controller);
  }, [scroller, sectionId, controller]);

  const normalizedChildren = useMemo(() => Children.toArray(children), [children]);
  const childCount = normalizedChildren.length;

  if (childRefs.current.length !== childCount) {
    childRefs.current = childRefs.current.slice(0, childCount);
  }

  useEffect(() => {
    if (typeof activeIndex !== "number" || !scrollRef.current) {
      return;
    }

    const container = scrollRef.current;
    const target = childRefs.current[activeIndex];
    if (!target) return;

    const targetLeft = target.offsetLeft;
    if (Math.abs(container.scrollLeft - targetLeft) < 1) {
      return;
    }

    suppressNotificationsRef.current = true;
    container.scrollTo({
      left: targetLeft,
      behavior: "smooth",
    });

    const timeout = window.setTimeout(() => {
      suppressNotificationsRef.current = false;
    }, 500);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [activeIndex, childCount]);

  useEffect(() => {
    if (!scrollRef.current || !onActiveIndexChange) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (suppressNotificationsRef.current) {
          return;
        }

        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const index = Number(entry.target.getAttribute("data-nested-index"));
            if (!Number.isNaN(index) && index !== lastAnnouncedIndexRef.current) {
              lastAnnouncedIndexRef.current = index;
              onActiveIndexChange(index);
            }
          }
        });
      },
      {
        root: scrollRef.current,
        threshold: 0.6,
      }
    );

    childRefs.current.forEach((node) => {
      if (node) {
        observer.observe(node);
      }
    });

    return () => observer.disconnect();
  }, [childCount, onActiveIndexChange]);

  return (
    <div
      ref={scrollRef}
      className={cn(
        "w-full overflow-x-auto overflow-y-hidden flex snap-x snap-mandatory scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        heightClassName ?? "h-[60vh] md:h-[65vh]"
      )}
    >
      {normalizedChildren.map((child, index) => (
        <div
          key={index}
          data-nested-index={index}
          ref={(node) => {
            childRefs.current[index] = node;
          }}
          className="snap-start min-w-full h-full flex-shrink-0 flex items-center justify-center"
        >
          {child}
        </div>
      ))}
    </div>
  );
}
