import { useMemo } from "react";

type SeededRng = () => number;

export interface PrecomputedGrid {
    tiles: number[];
    themes: {
        base: string;
        border: string;
        text: string;
        glow: string;
        className: string;
    }[];
    layout: Position[];
    distanceMap: number[];
    delayMap: number[];
    variations: AnimationVariation[];
}

export interface Position {
    row: number;
    col: number;
}

export interface AnimationVariation {
    scaleJitter: number;
    rotateJitter: number;
    liftJitter: number;
    svgOpacity: number;
    brightness: number;
}

const DEFAULT_TILES = Array.from({ length: 9 }, (_, i) => i + 1);
const DEFAULT_COLUMNS = 3;
const TILE_THEMES = [
    {
        base: "linear-gradient(135deg,#F7FFF6,#E6F0FF)",
        glow: "128,156,255",
        border: "rgba(255,255,255,0.4)",
        text: "#0F172A",
    },
    {
        base: "linear-gradient(135deg,#FFF3F3,#FFD7EF)",
        glow: "219,105,135",
        border: "rgba(255,255,255,0.35)",
        text: "#3F0F23",
    },
    {
        base: "linear-gradient(135deg,#EEF4FF,#D2F5FF)",
        glow: "104,180,255",
        border: "rgba(255,255,255,0.3)",
        text: "#0B1120",
    },
] as const;

const THEME_CLASSES = [
    "bg-[linear-gradient(135deg,#F7FFF6,#E6F0FF)] border-[rgba(255,255,255,0.4)] text-[#0F172A]",
    "bg-[linear-gradient(135deg,#FFF3F3,#FFD7EF)] border-[rgba(255,255,255,0.35)] text-[#3F0F23]",
    "bg-[linear-gradient(135deg,#EEF4FF,#D2F5FF)] border-[rgba(255,255,255,0.3)] text-[#0B1120]",
] as const;

export function usePrecomputedGrid(seed: number, columns: number = DEFAULT_COLUMNS): PrecomputedGrid {
    return useMemo(() => {
        const rng = mulberry32(seed);
        const tiles = [...DEFAULT_TILES];
        const layout = tiles.map((_, index) => indexToPosition(index, columns));
        const distanceMap: number[] = [];
        const delayMap: number[] = [];
        const variations: AnimationVariation[] = [];

        const origin = layout[0] ?? { row: 0, col: 0 };
        for (const pos of layout) {
            const distance = Math.hypot(pos.row - origin.row, pos.col - origin.col);
            distanceMap.push(distance);
            delayMap.push(distance * 0.08);
            variations.push({
                scaleJitter: 0.9 + rng() * 0.3, // 0.9 - 1.2
                rotateJitter: (rng() * 10 - 5), // -5 to 5 deg
                liftJitter: rng() * 6 - 3, // -3 to 3 px
                svgOpacity: 0.8 + rng() * 0.25, // 0.8 - 1.05
                brightness: 0.9 + rng() * 0.25, // 0.9 - 1.15
            });
        }

        // Shuffle themes deterministically
        const themes = shuffle([...TILE_THEMES], rng);

        return {
            tiles,
            themes: themes.map((theme, idx) => ({
                ...theme,
                className: THEME_CLASSES[idx % THEME_CLASSES.length],
            })),
            layout,
            distanceMap,
            delayMap,
            variations,
        };
    }, [seed, columns]);
}

function indexToPosition(index: number, columns: number): Position {
    return {
        row: Math.floor(index / columns),
        col: index % columns,
    };
}

function shuffle<T>(arr: T[], rng: SeededRng): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function mulberry32(a: number): SeededRng {
    return function () {
        let t = (a += 0x6D2B79F5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
