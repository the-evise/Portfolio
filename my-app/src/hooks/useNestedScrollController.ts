"use client";

import { RefObject, useCallback, useMemo } from "react";
import { NestedScrollController } from "@/components/FullScreenScroller";

export function useNestedScrollController(
    ref: RefObject<HTMLElement | null>
): NestedScrollController {
    const consumeScroll = useCallback(
        (deltaY: number) => {
            const el = ref.current;
            if (!el) return false;

            const dirDown = deltaY > 0;
            const dirUp = deltaY < 0;

            const scrollTop = el.scrollTop;
            const maxScroll = el.scrollHeight - el.clientHeight;

            const atTop = scrollTop <= 0;
            const atBottom = scrollTop >= maxScroll - 1;

            // 1. CHILD CANNOT SCROLL → allow parent scroll
            if ((dirDown && atBottom) || (dirUp && atTop)) {
                return false;
            }

            // 2. CHILD CAN SCROLL → consume the scroll
            // Use +=, not assignment with clamping inside, for smoother behavior
            el.scrollTop = Math.min(maxScroll, Math.max(0, scrollTop + deltaY));

            return true; // parent must be locked
        },
        [ref]
    );

    return useMemo(
        () => ({
            consumeScroll,
        }),
        [consumeScroll]
    );
}
