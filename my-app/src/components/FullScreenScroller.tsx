"use client";

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/utils/utils";

export interface NestedScrollController {
  consumeScroll: (deltaY: number) => boolean;
}

export interface FullScreenScrollSection {
  id: string;
  label: string;
  content: ReactNode;
  className?: string;
  locksParent?: boolean;
}

interface FullScreenScrollerProps {
  sections?: FullScreenScrollSection[];
  className?: string;
  sectionClassName?: string;
  children?: ReactNode;
}

interface FullScreenScrollerContextValue {
  sections: FullScreenScrollSection[];
  activeSectionId?: string;
  scrollToSection: (id: string) => void;
  registerNestedScroll: (sectionId: string, controller: NestedScrollController) => () => void;
  isSectionLocked: (id: string) => boolean;
}

const FullScreenScrollerContext = createContext<FullScreenScrollerContextValue | null>(null);
const SectionIdContext = createContext<string | null>(null);

export function useFullScreenScroller() {
  return useContext(FullScreenScrollerContext);
}

export function useSectionId() {
  return useContext(SectionIdContext);
}

const SAMPLE_SECTIONS: FullScreenScrollSection[] = [
  {
    id: "sample-hero",
    label: "Hero",
    content: <h1 className="text-4xl font-bold text-night">Section One</h1>,
    className: "bg-red-300",
  },
  {
    id: "sample-about",
    label: "About",
    content: <h1 className="text-4xl font-bold text-night">Section Two</h1>,
    className: "bg-blue-300",
  },
  {
    id: "sample-work",
    label: "Work",
    content: <h1 className="text-4xl font-bold text-night">Section Three</h1>,
    className: "bg-green-300",
  },
];

export default function FullScreenScroller({
  sections = SAMPLE_SECTIONS,
  className,
  sectionClassName,
  children,
}: FullScreenScrollerProps) {
  const normalizedSections = sections.length ? sections : SAMPLE_SECTIONS;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const nestedControllers = useRef<Map<string, NestedScrollController>>(new Map());
  const [activeSectionId, setActiveSectionId] = useState<string | undefined>(normalizedSections[0]?.id);
  const lockedSectionIds = useMemo(
    () => normalizedSections.filter((section) => section.locksParent).map((section) => section.id),
    [normalizedSections]
  );
  const touchLastYRef = useRef<number | null>(null);

  const isSectionLocked = useCallback(
    (id: string) => lockedSectionIds.includes(id),
    [lockedSectionIds]
  );

  const registerSection = useCallback((id: string) => {
    return (node: HTMLElement | null) => {
      sectionRefs.current[id] = node;
    };
  }, []);

  const scrollToSection = useCallback((id: string) => {
    const container = containerRef.current;
    const target = sectionRefs.current[id];
    if (!container || !target) return;

    container.scrollTo({
      top: target.offsetTop,
      behavior: "smooth",
    });
  }, []);

  const registerNestedScroll = useCallback((sectionId: string, controller: NestedScrollController) => {
    nestedControllers.current.set(sectionId, controller);
    return () => {
      nestedControllers.current.delete(sectionId);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-section-id");
            if (id) {
              setActiveSectionId(id);
            }
          }
        });
      },
      { root: container, threshold: 0.6 }
    );

    normalizedSections.forEach(({ id }) => {
      const node = sectionRefs.current[id];
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [normalizedSections]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

      const handleWheel = (event: WheelEvent) => {
          const controller = activeSectionId
              ? nestedControllers.current.get(activeSectionId)
              : null;

          if (!controller) return; // no nested scroll for this section → parent scrolls normally

          // Ask nested scroll controller if it wants to consume the scroll
          const consumed = controller.consumeScroll(event.deltaY);

          if (consumed) {
              event.preventDefault();   // block fullscreen scroll
              event.stopPropagation();
          }
      };

      const handleTouchStart = (event: TouchEvent) => {
      touchLastYRef.current = event.touches[0]?.clientY ?? null;
    };

      const handleTouchMove = (event: TouchEvent) => {
          const currentY = event.touches[0]?.clientY;
          if (touchLastYRef.current == null || currentY == null) return;

          const delta = touchLastYRef.current - currentY;
          touchLastYRef.current = currentY;

          const controller = activeSectionId
              ? nestedControllers.current.get(activeSectionId)
              : null;

          if (!controller) return;

          const consumed = controller.consumeScroll(delta);

          if (consumed) {
              event.preventDefault();
              event.stopPropagation();
          }
      };

      const handleTouchEnd = () => {
      touchLastYRef.current = null;
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });
    container.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [activeSectionId, lockedSectionIds]);

  const contextValue = useMemo<FullScreenScrollerContextValue>(
    () => ({
      sections: normalizedSections,
      activeSectionId,
      scrollToSection,
      registerNestedScroll,
      isSectionLocked,
    }),
    [normalizedSections, activeSectionId, scrollToSection, registerNestedScroll, isSectionLocked]
  );

  return (
    <FullScreenScrollerContext.Provider value={contextValue}>
      {children}
      <div ref={containerRef} className={cn("h-screen w-screen py-20 overflow-y-scroll snap-y snap-mandatory", className)}>
        {normalizedSections.map(({ id, content, className: sectionOverrides }) => (
          <section
            key={id}
            data-section-id={id}
            ref={registerSection(id)}
            className={cn(
              "snap-start flex h-screen w-full items-center justify-center",
              sectionClassName,
              sectionOverrides
            )}
          >
            <SectionIdContext.Provider value={id}>{content}</SectionIdContext.Provider>
          </section>
        ))}
      </div>
    </FullScreenScrollerContext.Provider>
  );
}
