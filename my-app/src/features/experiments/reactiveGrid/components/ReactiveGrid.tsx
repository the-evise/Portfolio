"use client";
import {useCallback, useMemo, useRef, useState, useEffect} from "react";
import {motion, useMotionValue, animate, useTransform} from "motion/react";
import type { ValueAnimationTransition } from "motion";

const GRID_ITEMS = Array.from({length: 12}, (_, i) => i + 1);
const MODES = ["ripple", "swirl", "stream", "burst"] as const;
const TILE_THEMES = [
    {
        base: "linear-gradient(135deg,#F7FFF6,#E6F0FF)",
        glow: "128,156,255",
        border: "rgba(255,255,255,0.4)",
        text: "#0F172A"
    },
    {
        base: "linear-gradient(135deg,#FFF3F3,#FFD7EF)",
        glow: "219,105,135",
        border: "rgba(255,255,255,0.35)",
        text: "#3F0F23"
    },
    {
        base: "linear-gradient(135deg,#EEF4FF,#D2F5FF)",
        glow: "104,180,255",
        border: "rgba(255,255,255,0.3)",
        text: "#0B1120"
    },
] as const;
const MAGNET_TILES = new Set([5, 6]);
const DEFAULT_COLUMNS = 4;
const LONG_PRESS_MS = 520;
type AnimationMode = (typeof MODES)[number] | "magnet";

interface GridState {
    mode: AnimationMode;
    originIndex: number;
    timestamp: number;
}

interface TileMetrics {
    position: Position;
    originPosition: Position;
    distanceFromOrigin: number;
    delay: number;
}

interface TrailSegment {
    id: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    color: string;
}

export default function ReactiveGrid() {
    const gridRef = useRef<HTMLDivElement | null>(null);
    const lastActivateRef = useRef(0);
    const trailCentersRef = useRef<{ x: number; y: number }[]>([]);
    const [isTouchLayout, setIsTouchLayout] = useState(false);
    const [columnCount, setColumnCount] = useState(DEFAULT_COLUMNS);
    const [state, setState] = useState<GridState>({
        mode: "ripple",
        originIndex: 0,
        timestamp: Date.now(),
    });

    const handleActivate = useCallback((index: number, overrideMode?: AnimationMode) => {
        const now = performance.now();
        if (now - lastActivateRef.current < 120) return; // throttle rapid spam
        lastActivateRef.current = now;

        const mode: AnimationMode = overrideMode
            ? overrideMode
            : MAGNET_TILES.has(index + 1)
                ? "magnet"
                : MODES[index % MODES.length];
        setState({mode, originIndex: index, timestamp: Date.now()});
    }, []);

    const positions = useMemo(
        () => GRID_ITEMS.map((_, index) => indexToPosition(index, columnCount)),
        [columnCount]
    );

    useEffect(() => {
        const node = gridRef.current;
        if (!node) return;

        let ticking = false;
        const computeColumns = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
            const styles = window.getComputedStyle(node);
            const template = styles.getPropertyValue("grid-template-columns");
                const count = template.split(" ").filter(Boolean).length;
                const nextCount = count > 0 ? count : DEFAULT_COLUMNS;
                setColumnCount((prev) => (prev === nextCount ? prev : nextCount));
                ticking = false;
            });
        };

        computeColumns();
        const observer = new ResizeObserver(computeColumns);
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        // Preload number assets to avoid first-click jank
        GRID_ITEMS.forEach((num) => {
            const img = new Image();
            img.src = `/nums/${num}.svg`;
        });
    }, []);

    useEffect(() => {
        const update = () => setIsTouchLayout(window.innerWidth < 640);
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    const originPosition = positions[state.originIndex] ?? {row: 0, col: 0};

    const metrics = useMemo<TileMetrics[]>(
        () =>
            positions.map((position) => {
                const distanceFromOrigin = Math.hypot(
                    position.row - originPosition.row,
                    position.col - originPosition.col
                );
            return {
                position,
                originPosition,
                distanceFromOrigin,
                delay: calculateDelay(position, originPosition, state.mode),
            };
        }),
        [positions, originPosition, state.mode]
    );

    const [trails, setTrails] = useState<TrailSegment[]>([]);

    const addTrails = useCallback(
        (activation: GridState) => {
            if (!gridRef.current) return;
            const buttons = Array.from(gridRef.current.querySelectorAll("button"));
            if (!buttons.length) return;

            if (!trailCentersRef.current.length) {
                const parentRect = gridRef.current.getBoundingClientRect();
                trailCentersRef.current = buttons.map((btn) => {
                    const rect = btn.getBoundingClientRect();
                    return {
                        x: rect.left - parentRect.left + rect.width / 2,
                        y: rect.top - parentRect.top + rect.height / 2,
                    };
                });
            }

            const centers = trailCentersRef.current;

            const originCenter = centers[activation.originIndex];
            if (!originCenter) return;

            const modeColor = trailColorForMode(activation.mode);
            const newSegments = centers.slice(0, 10).map((center, idx) => ({
                id: `${activation.timestamp}-${idx}`,
                x1: originCenter.x,
                y1: originCenter.y,
                x2: center.x,
                y2: center.y,
                color: modeColor,
            }));

            setTrails(newSegments);
            setTimeout(() => setTrails([]), 700);
        },
        []
    );

    return (
        <motion.div
            className="w-fit mx-auto rounded-3xl border border-white/5 bg-ruddy-blue p-4 md:p-8"
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ type: "spring", stiffness: 220, damping: 28 }}
        >
            <div
                ref={gridRef}
                className="
          grid w-full justify-center
          grid-cols-[repeat(3,75px)]
          auto-rows-[75px]
          gap-4
          sm:grid-cols-[repeat(4,100px)]
          sm:auto-rows-[100px]
          md:grid-cols-[repeat(4,115px)]
          md:auto-rows-[115px]
          md:gap-[30px]
          mx-auto
        "
                style={{ position: "relative" }}
            >
                {GRID_ITEMS.map((num, index) => (
                    <ReactiveTile
                        key={num}
                        index={index}
                        metrics={metrics[index]}
                        theme={TILE_THEMES[index % TILE_THEMES.length]}
                        label={num}
                activation={state}
                onActivate={handleActivate}
                isTouchLayout={isTouchLayout}
                onTrail={addTrails}
            />
        ))}
            <svg className="pointer-events-none absolute inset-0 h-full w-full">
                {trails.map((line) => (
                    <motion.line
                        key={line.id}
                        x1={line.x1}
                        y1={line.y1}
                        x2={line.x2}
                        y2={line.y2}
                        stroke={line.color}
                        strokeWidth={1.8}
                        strokeLinecap="round"
                        initial={{ opacity: 0.7, pathLength: 0 }}
                        animate={{ opacity: 0, pathLength: 1 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                ))}
            </svg>
            </div>
        </motion.div>
    );
}

interface ReactiveTileProps {
    index: number;
    label: number;
    metrics: TileMetrics;
    theme: (typeof TILE_THEMES)[number];
    activation: GridState;
    onActivate: (index: number, overrideMode?: AnimationMode) => void;
    isTouchLayout: boolean;
    onTrail: (activation: GridState) => void;
}

function ReactiveTile({index, label, metrics, theme, activation, onActivate, isTouchLayout, onTrail}: ReactiveTileProps) {
    const {position, originPosition, delay, distanceFromOrigin} = metrics;

    const scale = useMotionValue<number>(1);
    const rotate = useMotionValue<number>(0);
    const background = theme.base;

    const pullX = useMotionValue<number>(0);
    const y = useMotionValue<number>(0);
    const contentScale = useTransform(scale, (s) => 1 / s);
    const contentRotate = useTransform(rotate, (r) => -r);
    const svgOpacity = useMotionValue<number>(1);
    const [particles, setParticles] = useState<Particle[]>([]);
    const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const holdTriggeredRef = useRef(false);
    const clickHandledRef = useRef(false);

    const playAnimation = useCallback(() => {
        const isMagnet = activation.mode === "magnet";

        // Vercel-style motion profiles
        const SPRING_SCALE = {
            type: "spring" as const,
            stiffness: 800,
            damping: 40,
            mass: 0.8,
        };

        const SPRING_ROTATE = {
            type: "spring" as const,
            stiffness: 520,
            damping: 36,
            mass: 0.7,
        };

        const SPRING_PULL = {
            type: "spring" as const,
            stiffness: 620,
            damping: 40,
            mass: 0.75,
        };

        const SPRING_LIFT = {
            type: "spring" as const,
            stiffness: 820,
            damping: 40,
            mass: 0.75,
        };

        // Target values (same logic you already have)
        const targetScale = modeScale(activation.mode);
        const targetRotation = modeRotation(activation.mode, position, originPosition);

        const deltaRow = originPosition.row - position.row;
        const deltaCol = originPosition.col - position.col;
        const norm = Math.max(Math.hypot(deltaRow, deltaCol), 0.0001);
        const pullStrength = isMagnet ? (isTouchLayout ? 12 : 18) : 0;

        const targetX = (deltaCol / norm) * pullStrength;
        const targetY = (deltaRow / norm) * pullStrength;

        // --- Vercel-style animations ---

        // Clean scale and return to rest (velocity-aware)
        void continueSpring(scale, [scale.get(), targetScale, 1], SPRING_SCALE, delay);

        // Sharp rotational micro-tilt and return
        void continueSpring(rotate, [rotate.get(), targetRotation, 0], SPRING_ROTATE, delay);

        // Subtle magnet pull
        void continueSpring(pullX, [pullX.get(), targetX, 0], SPRING_PULL, delay);

        // Clean vertical lift with slightly softer return
        void continueSpring(y, [y.get(), -16 + targetY, 0], SPRING_LIFT, delay);

        // Subtle SVG pulse only on your special index
        if (activation.originIndex === 3) {
            const pulseDelay = distanceFromOrigin * 0.05;
            void continueSpring(svgOpacity, [svgOpacity.get(), 0.35, 1], {
                delay: pulseDelay,
                type: "spring",
                stiffness: 700,
                damping: 48,
                mass: 0.7,
            });
        } else {
            svgOpacity.set(1);
        }
    }, [
        activation.mode,
        activation.originIndex,
        position,
        originPosition,
        scale,
        rotate,
        pullX,
        y,
        svgOpacity,
        delay,
        distanceFromOrigin,
        isTouchLayout
    ]);

    useEffect(() => {
        if (activation.originIndex === index) {
            setParticles(generateParticles(activation.timestamp));
        } else if (particles.length) {
            setParticles([]);
        }
    }, [activation.originIndex, activation.timestamp, index, particles.length]);

    const clearHold = useCallback(() => {
        if (holdTimeoutRef.current) {
            clearTimeout(holdTimeoutRef.current);
            holdTimeoutRef.current = null;
        }
    }, []);

    const handlePointerDown = useCallback(() => {
        holdTriggeredRef.current = false;
        clearHold();
        holdTimeoutRef.current = setTimeout(() => {
            holdTriggeredRef.current = true;
            onActivate(index, "magnet");
            onTrail({
                mode: "magnet",
                originIndex: index,
                timestamp: Date.now(),
            });
            clickHandledRef.current = true;
        }, LONG_PRESS_MS);
    }, [clearHold, index, onActivate, onTrail]);

    const handlePointerUp = useCallback(() => {
        clearHold();
        if (!holdTriggeredRef.current) {
            onActivate(index);
            onTrail({
                mode: activation.mode,
                originIndex: index,
                timestamp: Date.now(),
            });
            clickHandledRef.current = true;
        }
    }, [clearHold, index, onActivate, onTrail, activation.mode]);

    const handleClick = useCallback(() => {
        if (clickHandledRef.current) {
            clickHandledRef.current = false;
            return;
        }
        onActivate(index);
        onTrail({
            mode: activation.mode,
            originIndex: index,
            timestamp: Date.now(),
        });
    }, [activation.mode, index, onActivate, onTrail]);

    useEffect(() => () => clearHold(), [clearHold]);

    useAnimatedTrigger(activation.timestamp, playAnimation);

    return (
        <motion.button
            type="button"
            onClick={handleClick}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={clearHold}
            onContextMenu={(event) => event.preventDefault()}
            style={{
                rotate,
                scale,
                x: pullX,
                y,
                backgroundImage: background,
                color: theme.text,
                borderColor: theme.border,
            }}
            className="
                    relative overflow-hidden flex size-[75px] sm:size-[100px] items-center justify-center rounded-xl border text-2xl font-semibold transition
                    md:size-[115px]
                    focus-visible:outline focus-visible:outline-tropical-indigo cursor-pointer
                  "
            whileTap={{scale: 0.95}}
        >
            <div className="pointer-events-none absolute inset-0">
                {particles.map((particle) => (
                    <motion.span
                        key={particle.id}
                        className="absolute rounded-full"
                        style={{
                            width: particle.size,
                            height: particle.size,
                            left: "50%",
                            top: "50%",
                            marginLeft: -particle.size / 2,
                            marginTop: -particle.size / 2,
                            backgroundColor: `rgba(${theme.glow}, 0.38)`,
                        }}
                        initial={{ opacity: 0.9, scale: 1, x: 0, y: 0 }}
                        animate={{ opacity: 0, scale: 0.6, x: particle.dx, y: particle.dy }}
                        transition={{ duration: particle.duration, delay: particle.delay, ease: "easeOut" }}
                    />
                ))}
            </div>
            <motion.div
                className="relative h-7 w-8 overflow-hidden sm:h-8 sm:w-9 md:h-10 md:w-12"
                style={{scale: contentScale, rotate: contentRotate, opacity: svgOpacity}}
            >
                <img className="object-contain h-full w-full" src={`/nums/${label}.svg`} alt={String(label)} />
            </motion.div>
        </motion.button>
    );
}

function useAnimatedTrigger(timestamp: number, callback: () => void) {
    const prevTimestamp = useRef(timestamp);
    useEffect(() => {
        if (timestamp === prevTimestamp.current) return;
        prevTimestamp.current = timestamp;
        callback();
    }, [timestamp, callback]);
}

interface Position {
    row: number;
    col: number;
}

function indexToPosition(index: number, columns: number): Position {
    return {
        row: Math.floor(index / columns),
        col: index % columns,
    };
}

function calculateDelay(position: Position, origin: Position, mode: AnimationMode) {
    const distance = Math.hypot(position.row - origin.row, position.col - origin.col);
    switch (mode) {
        case "ripple":
            return distance * 0.08;
        case "swirl":
            return (Math.atan2(position.row - origin.row, position.col - origin.col) + Math.PI) * 0.03;
        case "stream":
            return position.col * 0.05;
        case "burst":
            return distance * 0.04;
        case "magnet":
            return distance * 0.06;
        default:
            return 0;
    }
}

function modeScale(mode: AnimationMode) {
    switch (mode) {
        case "ripple":
            return 1.3;
        case "swirl":
            return 1.4;
        case "stream":
            return 1.08;
        case "burst":
            return 1.1;
        case "magnet":
            return 1.1;
        default:
            return 1.12;
    }
}

function modeRotation(mode: AnimationMode, position: Position, origin: Position) {
    switch (mode) {
        case "ripple":
            return 0;
        case "swirl":
            return 6 * Math.sign(position.col - origin.col || 1);
        case "stream":
            return (position.row - origin.row) * 2;
        case "burst":
            return 8 * Math.sign(position.col - origin.col || 1);
        case "magnet":
            return 0;
        default:
            return 0;
    }
}

function trailColorForMode(mode: AnimationMode) {
    switch (mode) {
        case "ripple":
            return "rgba(128,156,255,0.6)";
        case "swirl":
            return "rgba(219,105,135,0.6)";
        case "stream":
            return "rgba(104,180,255,0.6)";
        case "burst":
            return "rgba(255,214,102,0.6)";
        case "magnet":
            return "rgba(255,255,255,0.5)";
        default:
            return "rgba(255,255,255,0.4)";
    }
}

interface Particle {
    id: number;
    dx: number;
    dy: number;
    size: number;
    duration: number;
    delay: number;
}

function generateParticles(seedSource: number, count = 10): Particle[] {
    const rng = mulberry32(seedSource | 0);
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
        const angle = rng() * Math.PI * 2;
        const radius = 10 + rng() * 26; // spread
        particles.push({
            id: seedSource + i,
            dx: Math.cos(angle) * radius,
            dy: Math.sin(angle) * radius,
            size: 6 + rng() * 8,
            duration: 0.45 + rng() * 0.3,
            delay: rng() * 0.08,
        });
    }
    return particles;
}

function mulberry32(a: number) {
    let t = a + 0x6D2B79F5;
    return function () {
        t |= 0;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

async function continueSpring(
    value: ReturnType<typeof useMotionValue<number>>,
    frames: number[],
    springConfig: ValueAnimationTransition<number>,
    delay = 0
) {
    for (let i = 0; i < frames.length - 1; i++) {
        const target = frames[i + 1];
        const velocity = value.getVelocity();

        await animate<number>(value, target, {
            ...springConfig,
            delay: i === 0 ? delay : 0,
            velocity,
            restSpeed: 0.001,
        }).finished;
    }
}
