"use client";
import {useCallback, useMemo, useRef, useState, useEffect} from "react";
import {motion, useMotionValue, animate, useTransform} from "motion/react";
import Image from "next/image";

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
type AnimationMode = (typeof MODES)[number] | "magnet";

interface GridState {
    mode: AnimationMode;
    originIndex: number;
    timestamp: number;
}

export default function ReactiveGrid() {
    const gridRef = useRef<HTMLDivElement | null>(null);
    const [columnCount, setColumnCount] = useState(DEFAULT_COLUMNS);
    const [state, setState] = useState<GridState>({
        mode: "ripple",
        originIndex: 0,
        timestamp: Date.now(),
    });

    const handleActivate = useCallback((index: number) => {
        const mode: AnimationMode = MAGNET_TILES.has(index + 1)
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

        const computeColumns = () => {
            const styles = window.getComputedStyle(node);
            const template = styles.getPropertyValue("grid-template-columns");
            const count = template.split(" ").filter(Boolean).length;
            if (count > 0) {
                setColumnCount(count);
            } else {
                setColumnCount(DEFAULT_COLUMNS);
            }
        };

        computeColumns();
        const observer = new ResizeObserver(computeColumns);
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

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
            >
                {GRID_ITEMS.map((num, index) => (
                    <ReactiveTile
                        key={num}
                        index={index}
                        position={positions[index]}
                        originPosition={positions[state.originIndex]}
                        theme={TILE_THEMES[index % TILE_THEMES.length]}
                        label={num}
                        activation={state}
                        onActivate={handleActivate}
                    />
                ))}
            </div>
        </motion.div>
    );
}

interface ReactiveTileProps {
    index: number;
    label: number;
    position: Position;
    originPosition: Position;
    theme: (typeof TILE_THEMES)[number];
    activation: GridState;
    onActivate: (index: number) => void;
}

function ReactiveTile({index, label, position, originPosition, theme, activation, onActivate}: ReactiveTileProps) {

    const distanceFromOrigin = useMemo(
        () => Math.hypot(position.row - originPosition.row, position.col - originPosition.col),
        [position, originPosition]
    );

    const delay = useMemo(
        () => calculateDelay(position, originPosition, activation.mode),
        [position, originPosition, activation.mode]
    );

    const scale = useMotionValue<number>(1);
    const rotate = useMotionValue<number>(0);
    const glow = useMotionValue<number>(0);
    const lift = useMotionValue<number>(0);
    const boxShadow = useTransform(glow, (g) => {
        const accent = g <= 0.01 ? "" : `, 0 15px 30px rgba(${theme.glow}, ${g * 0.2})`;
        return `0 6px 12px rgba(6,6,14,0.08)${accent}`;
    });


    const background = useTransform(glow, (g) =>
        g <= 0.01
            ? theme.base
            : `radial-gradient(circle at 50% 50%, rgba(${theme.glow}, ${0 * g}), transparent), ${theme.base}`
    );

    const pullX = useMotionValue<number>(0);
    const pullY = useMotionValue<number>(0);
    const contentScale = useTransform(scale, (s) => 1 / s);
    const contentRotate = useTransform(rotate, (r) => -r);
    const combinedY = useMotionValue<number>(0);
    const svgOpacity = useMotionValue<number>(1);

    const playAnimation = useCallback(() => {
        const targetScale = modeScale(activation.mode);
        const targetRotation = modeRotation(activation.mode, position, originPosition);

        (async () => {
            await animate(scale, targetScale, {
                delay,
                duration: 0.45,
                ease: activation.mode === "burst" ? [0.34, 1.56, 0.64, 1] : "easeOut",
            });
            await animate(scale, 0.95, {
                duration: 0.2,
                ease: "easeInOut",
            });
            await animate(scale, 1, {
                duration: 0.25,
                ease: "easeOut",
            });
        })();

        (async () => {
            await animate(rotate, targetRotation, {
                delay,
                type: "spring",
                stiffness: 280,
                damping: 22,
                mass: 0.7,
            });
            await animate(rotate, 0, {
                duration: 0.4,
                ease: "easeOut",
            });
        })();

        (async () => {
            await animate(glow, 0.55, {
                delay,
                type: "spring",
                stiffness: 220,
                damping: 16,
            });
            await animate(glow, 0.2, {
                duration: 0.25,
                ease: "easeOut",
            });
            await animate(glow, 0, {
                duration: 0.25,
                ease: "easeOut",
            });
        })();

        (async () => {
            await animate(lift, -24, {
                delay,
                type: "spring",
                stiffness: 260,
                damping: 20,
            });
            await animate(lift, 6, {
                duration: 0.3,
                ease: "easeOut",
            });
            await animate(lift, 0, {
                duration: 0.3,
                ease: "easeOut",
            });
        })();
        combinedY.set(lift.get() + pullY.get());

        if (activation.mode === "magnet") {
            const deltaRow = originPosition.row - position.row;
            const deltaCol = originPosition.col - position.col;
            const norm = Math.max(Math.hypot(deltaRow, deltaCol), 0.0001);
            const pullStrength = 18;
            const targetX = (deltaCol / norm) * pullStrength;
            const targetY = (deltaRow / norm) * pullStrength;

            (async () => {
                await animate(pullX, targetX, {
                    delay,
                    duration: 0.45,
                    ease: "easeOut",
                });
                await animate(pullX, 0, {
                    duration: 0.4,
                    ease: "easeOut",
                });
            })();
            (async () => {
                await animate(pullY, targetY, {
                    delay,
                    duration: 0.45,
                    ease: "easeOut",
                });
                await animate(pullY, 0, {
                    duration: 0.4,
                    ease: "easeOut",
                });
            })();
        } else {
            pullX.set(0);
            pullY.set(0);
        }
        combinedY.set(lift.get() + pullY.get());

        if (activation.originIndex === 3) {
            animate(svgOpacity, [1, 0.25, 1], {
                delay: distanceFromOrigin * 0.08,
                duration: 0.8,
                ease: "easeOut",
            });
        } else {
            svgOpacity.set(1);
        }
    }, [activation.mode, delay, rotate, scale, glow, lift, position, originPosition, distanceFromOrigin, pullX, pullY]);

    useAnimatedTrigger(activation.timestamp, playAnimation);

    useEffect(() => {
        const update = () => combinedY.set(lift.get() + pullY.get());
        const unsubLift = lift.on("change", update);
        const unsubPull = pullY.on("change", update);
        update();
        return () => {
            unsubLift();
            unsubPull();
        };
    }, [combinedY, lift, pullY]);

    return (
        <motion.button
            type="button"
            onClick={() => onActivate(index)}
            style={{
                rotate,
                scale,
                x: pullX,
                y: combinedY,
                boxShadow,
                backgroundImage: background,
                color: theme.text,
                borderColor: theme.border,
            }}
            className="
        flex size-[75px] sm:size-[100px] items-center justify-center rounded-xl border text-2xl font-semibold transition
        md:size-[115px]
        focus-visible:outline focus-visible:outline-tropical-indigo
      "
            whileTap={{scale: 0.95}}
        >
            <motion.div
                className="relative h-7 w-8 overflow-hidden sm:h-8 sm:w-9 md:h-10 md:w-12"
                style={{scale: contentScale, rotate: contentRotate, opacity: svgOpacity}}
            >
                <Image className="object-contain" src={`/nums/${label}.svg`} alt={String(label)} fill/>
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
            return 1.2;
        case "stream":
            return 1.08;
        case "burst":
            return 1.4;
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
            return 8 * Math.sign(position.col - origin.col || 1);
        case "stream":
            return (position.row - origin.row) * 4;
        case "burst":
            return (Math.random() - 0.5) * 14;
        case "magnet":
            return (origin.col - position.col) * 2;
        default:
            return 0;
    }
}
