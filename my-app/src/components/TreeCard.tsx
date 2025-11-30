"use client";

import { cn } from "@/utils/utils";
import RadarSkillChart, { type RadarSkillVariant } from "./RadarSkillChart";

const DESCRIPTIONS: Record<RadarSkillVariant, string> = {
    hard: "Mapping both technical rigor and human-centered instincts to ensure every experience feels intentional, expressive, and alive.",
    soft: "Nurturing people-first collaboration and narrative craft so teams build expressive, high-trust experiences together.",
};

interface TreeCardProps {
    variant?: RadarSkillVariant;
    textPosition?: "left" | "right"; // controls placement
    textSlot?: React.ReactNode; // custom text component
    className?: string;
}

export default function TreeCard({
                                     variant = "hard",
                                     textPosition = "right",
                                     textSlot,
                                     className,
                                 }: TreeCardProps) {
    const description = DESCRIPTIONS[variant];
    const isTextLeft = textPosition === "left";

    return (
        <section
            className={cn(
                // responsive layout
                "flex flex-col-reverse sm:grid items-center justify-center gap-6 rounded-2xl bg-ruddy-blue/10 text-mint-cream mb-28",
                isTextLeft
                    ? "sm:grid-cols-[1fr_minmax(0,320px)]" // text left
                    : "sm:grid-cols-[minmax(0,320px)_1fr]", // text right
                "p-[20px] sm:p-[12px] md:w-full md:justify-between lg:p-[60px] max-w-[1496px] w-fit",
                className
            )}
        >
            {isTextLeft ? (
                <>
                    {textSlot}
                    <RadarSkillChart variant={variant} description={description} className={"place-self-end"} />
                </>
            ) : (
                <>
                    <RadarSkillChart variant={variant} description={description} className={"place-self-start"} />
                    {textSlot}
                </>
            )}
        </section>
    );
}
