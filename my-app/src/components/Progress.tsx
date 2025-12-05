"use client";

import { forwardRef, useMemo } from "react";
import { cn } from "@/utils/utils";

interface ProgressProps {
    value: number;
    max?: number;
    className?: string;
    orientation?: "horizontal" | "vertical";
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
    (
        {
            value,
            max = 100,
            className,
            orientation = "horizontal",
        },
        ref
    ) => {
        const resolvedMax = Number.isFinite(max) ? Number(max) : 100;
        const clampedMax = Math.max(resolvedMax, 0);

        const percentage = clampedMax === 0
            ? 0
            : Math.min(Math.max((value / clampedMax) * 100, 0), 100);

        const stepCount = Math.max(Math.floor(clampedMax), 0);
        const activeCount = Math.min(Math.max(Math.round(value), 0), stepCount);

        /* ----------------------- Dot indices ----------------------- */

        const dotIndices = useMemo(() => {
            if (stepCount < 1) return [];
            return Array.from({ length: stepCount }, (_, i) => i);
        }, [stepCount]);

        /* ----------------------- Render ----------------------- */

        return (
            <div
                ref={ref}
                role="progressbar"
                className={cn(
                    "relative overflow-hidden border transition-all duration-300 ease-in-out",
                    "rounded-full h-fit w-fit p-[3px] bg-ruddy-blue/10 border border-ruddy-blue/15",
                    orientation === "vertical"
                        ? "flex flex-col items-center justify-center gap-1"
                        : "flex flex-row items-center justify-center gap-1",
                    className
                )}
            >
                {dotIndices.map((index) => {
                    const isActive = index < activeCount;

                    return (
                        <div
                            key={index}
                            className={cn(
                                "h-4 w-4 rounded-full",
                                isActive
                                    ? "bg-cardinal-light"
                                    : "border-2 border-cardinal-light/25"
                            )}
                        />
                    );
                })}
            </div>
        );
    }
);

export default Progress;
