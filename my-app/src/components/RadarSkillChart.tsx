"use client";

import { useEffect, useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";
import type { PolarAngleAxisProps } from "recharts";
import { HiOutlineInformationCircle } from "react-icons/hi";
import { cn } from "@/utils/utils";

type SkillPoint = { skill: string; value: number };

export type RadarSkillVariant = "hard" | "soft";

const SKILL_DATA: Record<
  RadarSkillVariant,
  {
    label: string;
    color: string;
    gridColor: string;
    infoBorder: string;
    popoverBorder: string;
    containerBg: string;
    data: SkillPoint[];
  }
> = {
  hard: {
    label: "Hard Skill Tree",
    color: "#5794E4",
    gridColor: "rgba(87,148,228,0.3)",
    infoBorder: "border-ruddy-blue/50",
    popoverBorder: "border-ruddy-blue/40",
    containerBg: "bg-ruddy-blue/10",
    data: [
      { skill: "UI", value: 82 },
      { skill: "UX", value: 90 },
      { skill: "Motion", value: 74 },
      { skill: "Systems", value: 86 },
      { skill: "Code", value: 77 },
    ],
  },
  soft: {
    label: "Soft Skill Tree",
    color: "#9D81E7",
    gridColor: "rgba(157,129,231,0.35)",
    infoBorder: "border-tropical-indigo/50",
    popoverBorder: "border-tropical-indigo/40",
    containerBg: "bg-tropical-indigo/10",
    data: [
      { skill: "Leadership", value: 88 },
      { skill: "Strategy", value: 84 },
      { skill: "Mentorship", value: 92 },
      { skill: "Storytelling", value: 79 },
      { skill: "Collab", value: 95 },
    ],
  },
};

type PolarTickProps = {
  x?: number | string;
  y?: number | string;
  payload?: { value: string };
  activeSkill?: string | null;
};

const PolarTick = ({
  x = 0,
  y = 0,
  payload,
  activeSkill,
}: PolarTickProps) => {
  if (!payload) return null;
  const isActive = payload.value === activeSkill;
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fill={isActive ? "#F7FFF6" : "rgba(247,255,246,0.55)"}
      fontSize={11}
      fontWeight={isActive ? 600 : 400}
      style={{ fontFamily: "var(--font-dm-sans)" }}
    >
      {payload.value}
    </text>
  );
};

type RadarTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload: SkillPoint; value?: number }>;
  label?: string | number;
  onActiveChange?: (skill: string | null) => void;
};

const RadarTooltip = ({
  active,
  payload,
  label,
  onActiveChange,
}: RadarTooltipProps) => {
  useEffect(() => {
    if (!onActiveChange) return;
    if (active && typeof label === "string") onActiveChange(label);
    else onActiveChange(null);
  }, [active, label, onActiveChange]);

  if (!active || !payload?.[0]) return null;
  const dataPoint = payload[0];
  return (
    <div className="rounded-xl border border-mint-cream/20 bg-night/90 px-3 py-2 text-xs font-medium text-mint-cream shadow-lg">
      <p className="text-mint-cream/70">{dataPoint.payload.skill}</p>
      <p className="text-base font-semibold text-mint-cream">
        {dataPoint.value} / 100
      </p>
    </div>
  );
};

type RadarDotProps = {
  cx?: number;
  cy?: number;
  payload?: SkillPoint;
};

interface RadarSkillChartProps {
  variant: RadarSkillVariant;
  description: string;
  className?: string;
}

export default function RadarSkillChart({
  variant,
  description,
  className,
}: RadarSkillChartProps) {
  const dataset = SKILL_DATA[variant];
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [chartHeight, setChartHeight] = useState(337);

  useEffect(() => {
    const calcHeight = () => {
      const w = window.innerWidth;
      if (w < 640) return 337;
      if (w < 768) return 250;
      if (w < 1024) return 300;
      return 345;
    };
    const updateHeight = () => setChartHeight(calcHeight());
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const renderDot = ({ cx, cy, payload }: RadarDotProps) => {
    if (cx == null || cy == null || !payload) return null;
    const isActive = payload.skill === activeSkill;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={isActive ? 5 : 3}
        fill="#F7FFF6"
        fillOpacity={isActive ? 1 : 0.5}
        stroke="#F7FFF6"
        strokeWidth={isActive ? 1.5 : 0}
      />
    );
  };

  return (
    <div
      className={cn(
        "flex w-[337px] max-w-full flex-col items-center justify-center gap-[6px] sm:w-[250px] sm:gap-[10px] md:w-[300px] lg:w-[345px]",
        "mx-auto sm:mx-0 md:mx-auto",
        className,
      )}
    >
      <div
        className={cn(
          "relative mx-auto w-full rounded-xl p-2",
          dataset.containerBg,
        )}
      >
        <button
          type="button"
          aria-label="Toggle skill map description"
          aria-expanded={infoOpen}
          onClick={() => setInfoOpen((prev) => !prev)}
          className={cn(
            "absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-night/70 text-mint-cream/80 transition hover:bg-night/90",
            dataset.infoBorder,
          )}
        >
          <HiOutlineInformationCircle className="h-4 w-4" />
        </button>

        {infoOpen && (
          <div
            className={cn(
              "absolute left-3 top-14 z-10 w-64 rounded-2xl bg-night/95 p-3 text-xs leading-relaxed text-mint-cream/80 shadow-2xl",
              dataset.popoverBorder,
            )}
          >
            {description}
          </div>
        )}

        <ResponsiveContainer width="100%" height={chartHeight}>
          <RadarChart
            data={dataset.data}
            margin={{ top: 10, bottom: 10, left: 0, right: 0 }}
            onMouseLeave={() => setActiveSkill(null)}
          >
            <PolarGrid stroke={dataset.gridColor} />
            <PolarAngleAxis
              dataKey="skill"
              tick={(props) => (
                <PolarTick {...props} activeSkill={activeSkill} />
              )}
            />
            <Tooltip
              cursor={false}
              content={<RadarTooltip onActiveChange={setActiveSkill} />}
            />
            <Radar
              dataKey="value"
              stroke={dataset.color}
              fill={dataset.color}
              strokeWidth={activeSkill ? 2.4 : 2}
              fillOpacity={activeSkill ? 0.45 : 0.32}
              isAnimationActive={false}
              dot={renderDot}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="inline-flex w-full items-center justify-center rounded-xl bg-night/50 px-4 py-[2px] text-xl font-medium tracking-tighter text-mint-cream/80 sm:rounded-2xl sm:py-3 sm:text-2xl">
        {dataset.label}
      </div>
    </div>
  );
}
