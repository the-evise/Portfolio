"use client";
import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { animate } from "motion";
import { motion, useMotionValue } from "motion/react";
import type { MotionValue, ValueAnimationTransition } from "motion";
import { usePrecomputedGrid } from "@/features/experiments/reactiveGrid/hooks/usePrecomputedGrid";

const MODES = ["ripple", "swirl", "stream", "burst"] as const;

const MAGNET_TILES = new Set([5, 6]);
const DEFAULT_COLUMNS = 3;
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
    theme: {
        base: string;
        border: string;
        text: string;
        glow: string;
        className: string;
    };
    variation: {
        scaleJitter: number;
        rotateJitter: number;
        liftJitter: number;
        svgOpacity: number;
        brightness: number;
    };
}

interface TrailSegment {
    id: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    color: string;
}

interface PulseWave {
    id: string;
    cx: number;
    cy: number;
    color: string;
    delay: number;
}

interface Position {
    row: number;
    col: number;
}

interface Particle {
    id: number;
    dx: number;
    dy: number;
    size: number;
    duration: number;
    delay: number;
}

export default function ReactiveGrid() {
    const gridRef = useRef<HTMLDivElement | null>(null);
    const lastActivateRef = useRef(0);
    const trailCentersRef = useRef<{ x: number; y: number }[]>([]);
    const pendingIndexRef = useRef<number | null>(null);
    const fpsLogRef = useRef({ lastTime: performance.now(), frames: 0, lastLog: performance.now() });

    const [reducedMotion, setReducedMotion] = useState(false);
    const [isPhoneLayout, setIsPhoneLayout] = useState(false);
    const [columnCount, setColumnCount] = useState(DEFAULT_COLUMNS);
    const [state, setState] = useState<GridState>({
        mode: "ripple",
        originIndex: 0,
        timestamp: Date.now(),
    });

    const handleActivate = useCallback((index: number, overrideMode?: AnimationMode) => {
        const now = performance.now();
        if (now - lastActivateRef.current < 120) return;

        lastActivateRef.current = now;

        const mode: AnimationMode =
            overrideMode ??
            (MAGNET_TILES.has(index + 1) ? "magnet" : MODES[index % MODES.length]);

        setState({ mode, originIndex: index, timestamp: Date.now() });
    }, []);

    const activateSmooth = useCallback(
        (index: number, overrideMode?: AnimationMode) => {
            pendingIndexRef.current = index;
            setTimeout(() => {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        const i = pendingIndexRef.current;
                        if (i != null) {
                            handleActivate(i, overrideMode);
                            pendingIndexRef.current = null;
                        }
                    });
                });
            }, 0);
        },
        [handleActivate]
    );

    const seed = useMemo(() => Math.floor(Math.random() * 1_000_000), []);
    const precomputed = usePrecomputedGrid(seed, columnCount);
    const positions = precomputed.layout;

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
                // invalidate cached trail centers on layout change
                trailCentersRef.current = [];

                ticking = false;
            });
        };

        computeColumns();
        const observer = new ResizeObserver(computeColumns);
        observer.observe(node);

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        precomputed.tiles.forEach((num) => {
            const img = new Image();
            img.src = `/nums/${num}.svg`;
        });
    }, [precomputed.tiles]);

    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        const update = () => setReducedMotion(mq.matches);
        update();
        mq.addEventListener("change", update);
        return () => mq.removeEventListener("change", update);
    }, []);

    useEffect(() => {
        const update = () => {
            const phone = window.matchMedia("(max-width: 640px)").matches;
            setIsPhoneLayout(phone);
        };
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    useEffect(() => {
        if (!reducedMotion) return;

        const stop = throttledRAF((now) => {
            // FPS logging only
            fpsLogRef.current.frames += 1;
            if (now - fpsLogRef.current.lastLog >= 1000) {
                const fps =
                    (fpsLogRef.current.frames * 1000) /
                    (now - fpsLogRef.current.lastLog);
                console.log(`[ReactiveGrid] FPS: ${fps.toFixed(1)}`);
                fpsLogRef.current.frames = 0;
                fpsLogRef.current.lastLog = now;
            }
        }, 30);

        return () => stop();
    }, [reducedMotion]);

    const originPosition = positions[state.originIndex] ?? { row: 0, col: 0 };

    const metrics = useMemo<TileMetrics[]>(
        () =>
            positions.map((position, idx) => {
                const delay =
                    precomputed.delayMap[idx] ??
                    calculateDelay(position, originPosition, state.mode);
                const distanceFromOrigin = precomputed.distanceMap[idx] ?? Math.hypot(
                    position.row - originPosition.row,
                    position.col - originPosition.col
                );
                return {
                    position,
                    originPosition,
                    distanceFromOrigin,
                    delay,
                    theme: precomputed.themes[idx % precomputed.themes.length],
                    variation: precomputed.variations[idx],
                };
            }),
        [
            positions,
            originPosition,
            state.mode,
            precomputed.delayMap,
            precomputed.distanceMap,
            precomputed.themes,
            precomputed.variations,
        ]
    );

    const [trails, setTrails] = useState<TrailSegment[]>([]);
    const [pulses, setPulses] = useState<PulseWave[]>([]);

    const addTrails = useCallback((activation: GridState) => {
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
        const waves = centers.slice(0, precomputed.distanceMap.length).map((center, idx) => ({
            id: `${activation.timestamp}-pulse-${idx}`,
            cx: center.x,
            cy: center.y,
            color: modeColor,
            delay: (precomputed.distanceMap[idx] ?? 0) * 0.08,
        }));
        setPulses(waves);
        setTimeout(() => setPulses([]), 700);
    }, [precomputed.distanceMap]);

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
          sm:grid-cols-[repeat(3,95px)]
          sm:auto-rows-[95px]
          md:grid-cols-[repeat(3,110px)]
          md:auto-rows-[110px]
          md:gap-[28px]
          mx-auto
        "
                style={{ position: "relative" }}
            >
                {precomputed.tiles.map((num, index) => (
                    <ReactiveTile
                        key={num}
                        index={index}
                        metrics={metrics[index]}
                        label={num}
                        activation={state}
                        onActivate={activateSmooth}
                        onTrail={addTrails}
                        reducedMotion={reducedMotion}
                        isPhoneLayout={isPhoneLayout}
                    />
                ))}
                <svg className="pointer-events-none absolute inset-0 h-full w-full">
                    {!reducedMotion &&
                        trails.map((line) => (
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
                    {!reducedMotion &&
                        pulses.map((pulse) => (
                            <motion.circle
                                key={pulse.id}
                                cx={pulse.cx}
                                cy={pulse.cy}
                                r={0}
                                fill="none"
                                stroke={pulse.color}
                                strokeWidth={1.2}
                                initial={{ opacity: 0.45, r: 0 }}
                                animate={{ opacity: 0, r: 26 }}
                                transition={{ duration: 0.65, ease: "easeOut", delay: pulse.delay }}
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
    activation: GridState;
    onActivate: (index: number, overrideMode?: AnimationMode) => void;
    onTrail: (activation: GridState) => void;
    reducedMotion: boolean;
    isPhoneLayout: boolean;
}

function ReactiveTile({
                          index,
                          label,
                          metrics,
                          activation,
                          onActivate,
                          onTrail,
                          reducedMotion,
                          isPhoneLayout,
                      }: ReactiveTileProps) {
    const { theme, delay, distanceFromOrigin, variation, position, originPosition } = metrics;

    const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const holdTriggeredRef = useRef(false);
    const clickHandledRef = useRef(false);

    const tileX: MotionValue<number> = useMotionValue(0);
    const tileY: MotionValue<number> = useMotionValue(0);
    const svgScale: MotionValue<number> = useMotionValue(1);
    const svgRotate: MotionValue<number> = useMotionValue(0);
    const svgOpacity: MotionValue<number> = useMotionValue(1);

    const particles = useMemo(
        () =>
            activation.originIndex === index && !reducedMotion
                ? generateParticles(activation.timestamp)
                : [],
        [activation.originIndex, activation.timestamp, index, reducedMotion]
    );

    useEffect(() => {
        if (reducedMotion) {
            tileX.set(0);
            tileY.set(0);
            svgScale.set(1);
            svgRotate.set(0);
            svgOpacity.set(1);
            return;
        }

        const isOrigin = activation.originIndex === index;
        const isMagnet = activation.mode === "magnet";
        const distanceFactor = Math.max(0.2, 1 - distanceFromOrigin * 0.2);
        const magnetBoost = isMagnet ? 1.1 : 1;
        const liftTarget =
            ((isOrigin ? -16 : -10 * distanceFactor) * magnetBoost) + variation.liftJitter;
        const rotateTarget =
            ((isOrigin ? 14 : 9 * distanceFactor) + variation.rotateJitter) *
            (isMagnet ? 0.8 : 1) *
            (index % 2 === 0 ? 1 : -1);
        const scaleTarget =
            ((isOrigin ? 1.35 : 1.1 + 0.2 * distanceFactor) * magnetBoost) *
            variation.scaleJitter;
        const opacityTarget = Math.min(1, variation.svgOpacity);

        const deltaRow = originPosition.row - position.row;
        const deltaCol = originPosition.col - position.col;
        const norm = Math.max(Math.hypot(deltaRow, deltaCol), 0.0001);
        const pullStrength = isMagnet ? 10 : 0;
        const targetX = (deltaCol / norm) * pullStrength;
        const targetYOffset = (deltaRow / norm) * pullStrength * 0.5;

        const tileSpring: ValueAnimationTransition<number> = {
            type: "spring",
            stiffness: 460,
            damping: 36,
            mass: 0.85,
        };
        const svgSpring: ValueAnimationTransition<number> = {
            type: "spring",
            stiffness: 620,
            damping: 40,
            mass: 0.8,
        };

        if (isPhoneLayout) {
            const animatePhase = (toBase: boolean) =>
                Promise.all([
                    animate(tileX, toBase ? 0 : targetX, { ...tileSpring, delay }).finished,
                    animate(tileY, toBase ? 0 : liftTarget + targetYOffset, { ...tileSpring, delay }).finished,
                    animate(svgScale, toBase ? 1 : scaleTarget, { ...svgSpring, delay }).finished,
                    animate(svgRotate, toBase ? 0 : rotateTarget, { ...svgSpring, delay: delay + 0.04 }).finished,
                    animate(
                        svgOpacity,
                        toBase ? 1 : opacityTarget,
                        {
                            ...svgSpring,
                            stiffness: 540,
                            delay: delay + 0.02,
                        }
                    ).finished,
                ]);

            void (async () => {
                await animatePhase(false);
                await animatePhase(true);
            })();
        } else {
            void continueSpring(tileX, [tileX.get(), targetX, 0], tileSpring, delay);
            void continueSpring(tileY, [tileY.get(), liftTarget, 0], tileSpring, delay);
            void continueSpring(tileY, [tileY.get(), liftTarget + targetYOffset, 0], tileSpring, delay);
            void continueSpring(svgScale, [svgScale.get(), scaleTarget, 1], svgSpring, delay);
            void continueSpring(svgRotate, [svgRotate.get(), rotateTarget, 0], svgSpring, delay + 0.04);
            void continueSpring(
                svgOpacity,
                [svgOpacity.get(), opacityTarget, 1],
                { ...svgSpring, stiffness: 540 },
                delay + 0.02
            );
        }
    }, [
        activation.originIndex,
        activation.timestamp,
        activation.mode,
        index,
        delay,
        distanceFromOrigin,
        reducedMotion,
        position.col,
        position.row,
        originPosition.col,
        originPosition.row,
        tileX,
        tileY,
        svgScale,
        svgRotate,
        svgOpacity,
        variation.liftJitter,
        variation.rotateJitter,
        variation.scaleJitter,
        variation.svgOpacity,
        isPhoneLayout,
    ]);

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

    return (
        <motion.button
            type="button"
            onClick={handleClick}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={clearHold}
            onContextMenu={(event) => event.preventDefault()}
            style={{ y: tileY, x: tileX }}
            className={`
                relative overflow-hidden flex size-[75px] sm:size-[100px] items-center justify-center rounded-xl border text-2xl font-semibold transition
                md:size-[115px]
                focus-visible:outline focus-visible:outline-tropical-indigo cursor-pointer
                ${theme.className}
            `}
            whileHover={!reducedMotion ? { scale: 1.02 } : undefined}
            whileTap={{ scale: 0.96 }}
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
                        animate={{
                            opacity: 0,
                            scale: 0.8,
                            x: particle.dx,
                            y: particle.dy,
                        }}
                        transition={{
                            duration: particle.duration,
                            delay: particle.delay,
                            ease: "easeOut",
                        }}
                    />
                ))}
            </div>
            <motion.div
                className="relative h-7 w-8 overflow-hidden sm:h-8 sm:w-9 md:h-10 md:w-12"
                style={{
                    scale: svgScale,
                    rotate: svgRotate,
                    opacity: svgOpacity,
                    filter: reducedMotion ? undefined : `brightness(${variation.brightness})`,
                }}
            >
                <img
                    className="object-contain h-full w-full"
                    src={`/nums/${label}.svg`}
                    alt={String(label)}
                />
            </motion.div>
        </motion.button>
    );
}

function calculateDelay(position: Position, origin: Position, mode: AnimationMode) {
    const distance = Math.hypot(position.row - origin.row, position.col - origin.col);
    switch (mode) {
        case "ripple":
            return distance * 0.08;
        case "swirl":
            return (
                (Math.atan2(position.row - origin.row, position.col - origin.col) + Math.PI) *
                0.03
            );
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

function generateParticles(seedSource: number, count = 10): Particle[] {
    const rng = mulberry32(seedSource | 0);
    const particles: Particle[] = [];

    for (let i = 0; i < count; i++) {
        const angle = rng() * Math.PI * 2;
        const radius = 10 + rng() * 26;

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
    value: MotionValue<number>,
    frames: number[],
    springConfig: ValueAnimationTransition<number>,
    delay = 0
) {
    for (let i = 0; i < frames.length - 1; i++) {
        const target = frames[i + 1];
        const velocity = value.getVelocity();

        await animate(value, target, {
            ...springConfig,
            velocity,
            delay: i === 0 ? delay : 0,
            restSpeed: 0.003,
        }).finished;
    }
}

function throttledRAF(callback: FrameRequestCallback, fps = 30) {
    const frameDuration = 1000 / fps;
    let last = 0;
    let rafId = 0;

    const loop = (now: number) => {
        if (now - last >= frameDuration) {
            last = now;
            callback(now);
        }
        rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
}
