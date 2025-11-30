import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {cn} from "@/utils/utils";
import {HiPresentationChartLine, HiTerminal, HiViewGrid} from "react-icons/hi";
import {LayoutGroup, motion, useAnimationControls, useInView, useReducedMotion} from "motion/react";
import {animate} from "motion";


const iconMap: Record<string, JSX.Element> = {
    "Type Tracker": <HiTerminal/>,
    "Motion Visualizer": <HiPresentationChartLine/>,
    "Reactive Grid": <HiViewGrid/>,
};

export interface ExperimentTabProps {
    label: "Type Tracker" | "Motion Visualizer" | "Reactive Grid";
    index: number;
    isActive: boolean;
    onSelect: (index: number) => void;
    total: number;
    buttonRef: (node: HTMLButtonElement | null) => void;
}

function ExperimentTab({label, index, isActive, onSelect, total, buttonRef}: ExperimentTabProps) {
    const state = isActive ? "active" : "inactive";
    const handleClick = useCallback(() => {
        if (!isActive) {
            onSelect(index);
        }
    }, [index, isActive, onSelect]);

    const handleKeyDown = useCallback(
        (event: KeyboardEvent<HTMLButtonElement>) => {
            switch (event.key) {
                case "ArrowRight": {
                    event.preventDefault();
                    const next = (index + 1) % total;
                    onSelect(next);
                    break;
                }
                case "ArrowLeft": {
                    event.preventDefault();
                    const prev = (index - 1 + total) % total;
                    onSelect(prev);
                    break;
                }
                default:
                    break;
            }
        },
        [index, onSelect, total],
    );

    return (
        <motion.button
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-pressed={isActive}
            tabIndex={isActive ? 0 : -1}
            className={cn(
                isActive ?
                    "cursor-default text-mint-cream/70 bg-night border-tropical-indigo [&>*:last-child]:text-mint-cream"
                    : "cursor-pointer text-night/35 bg-mint-cream border-tropical-indigo/25 [&>*:last-child]:text-tropical-indigo/80",
                    "border-2 font-bold font-sans text-sm md:text-base tracking-tighter flex flex-col-reverse md:gap-8 justify-center items-center px-2 py-2 md:px-3 md:pt-8 md:pb-3 rounded-xl md:aspect-square w-fit md:w-[150px] [&>*:last-child]:text-5xl [&>*:last-child]:hidden [&>*:last-child]:md:block")}
            ref={buttonRef}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            whileHover={
                {
                    scale: 0.98,
                    transition: {type: "spring", stiffness: 280, damping: 24},
                }
            }
            whileTap={
                {
                    scale: 1.03,
                    transition: {type: "spring", stiffness: 280, damping: 24},
                }
            }
            layout
        >
            <motion.span className={"break-words whitespace-normal text-center w-full max-w-[60px] md:max-w-none"} transition={{type: "spring", stiffness: 420, damping: 32}}>{label}</motion.span>
            <motion.div transition={{type: "spring", stiffness: 420, damping: 32}}>{iconMap[label]}</motion.div>
        </motion.button>
    )
}

export interface ExperimentIndicatorProps {
    experiments: string[];
    activeExperimentIndex: number;
    onExperimentSelect?: (index: number) => void;
}

function ExperimentIndicator({experiments, activeExperimentIndex, onExperimentSelect}: ExperimentIndicatorProps) {
    const [activeIndex, setActiveIndex] = useState(activeExperimentIndex);
    const controls = useAnimationControls();

    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const inView = useInView(wrapperRef, {amount: 0.6});

    const hasAnimatedRef = useRef(false);

    const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

    useEffect(() => {
        setActiveIndex(activeExperimentIndex);
    }, [activeExperimentIndex]);

    // TODO: motion
    useEffect(() => {
        hasAnimatedRef.current = true;
        controls.start("visible");
    }, [controls, inView]);

    useEffect(() => {
        const sequence = animate([
            [
                {
                    scale: [1, 1.2, 1],
                },
                {duration: 0.6, ease: [0.33, 1, 0.68, 1]},
            ],
        ]);
        return () => sequence.stop();
    }, []);

    const handleSelect = useCallback(
        (index: number) => {
            setActiveIndex(index);
            onExperimentSelect?.(index);
            requestAnimationFrame(() => {
                tabRefs.current[index]?.focus();
            });
        }, [onExperimentSelect],
    );

    const renderedExperiments = useMemo(() =>
        experiments.map((label, index) => (
            <ExperimentTab
                key={label}
                label={label}
                index={index}
                isActive={activeIndex === index}
                onSelect={handleSelect}
                total={experiments.length}
                buttonRef={(node) => {
                    tabRefs.current[index] = node;
                }}
            />
        )),
        [activeIndex, handleSelect, experiments]);

    return (
        <LayoutGroup>
            <motion.div
                ref={wrapperRef}
                role="tabpanel"
                className={cn("mx-auto flex w-fit p-1 md:p-2 items-center justify-center rounded-2xl border border-night/10 bg-tropical-indigo/10 backdrop-blur-sm gap-1 md:gap-3 drop-shadow-[0_0_64px_rgba(0,0,0,0.05)] hide-below-h-768 mb-4", "")}
                initial={"hidden"}
                animate={controls}
            >
                {experiments.map((label, index) => (
                    <ExperimentTab
                        key={label}
                        label={label}
                        index={index}
                        isActive={activeIndex === index}
                        onSelect={handleSelect}
                        total={experiments.length}
                        buttonRef={(node) => {
                            tabRefs.current[index] = node;
                        }}
                    />
                ))}
            </motion.div>
        </LayoutGroup>
    )
}

export default ExperimentIndicator;


























