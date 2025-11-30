import {GiSwallow, GiSilverBullet, GiLobArrow} from "react-icons/gi";
import {HiChevronDown, HiChevronUp, HiOutlineSparkles} from "react-icons/hi";
import {ChangeEvent, JSX, KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState} from "react";
import SmoothSlider from "@/features/experiments/motionVisualizer/components/SmoothSlider";

interface MotionSliderProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    onDragStart?: () => void;
    onDragEnd?: (committed: boolean) => void;
}

const ICON_MAP: Record<string, JSX.Element> = {
    Smoothness: <GiSwallow className="text-mint-cream/80"/>,
    Snap: <GiSilverBullet className="text-mint-cream/80"/>,
    Weight: <GiLobArrow className="text-mint-cream/80"/>,
};

export default function MotionSlider({
                                         label,
                                         value,
                                         onChange,
                                         min = 0,
                                         max = 100,
                                         step = 1,
                                         onDragStart,
                                         onDragEnd,
                                     }: MotionSliderProps) {
    const Icon = ICON_MAP[label] ?? <HiOutlineSparkles className="text-mint-cream/80"/>;
    const [draft, setDraft] = useState(value);
    const [isDragging, setIsDragging] = useState(false);
    const committedRef = useRef(value);

    useEffect(() => {
        committedRef.current = value;
        if (!isDragging) {
            setDraft(value);
        }
    }, [isDragging, value]);

    const formattedValue = useMemo(() => draft.toFixed(step < 1 ? 1 : 0), [draft, step]);

    const startInteraction = useCallback(() => {
        if (isDragging) {
            return;
        }
        setIsDragging(true);
        onDragStart?.();
    }, [isDragging, onDragStart]);

    const commitValue = useCallback(() => {
        const hasChanged = draft !== committedRef.current;
        if (hasChanged) {
            committedRef.current = draft;
            onChange(draft);
        }
        if (isDragging) {
            setIsDragging(false);
            onDragEnd?.(hasChanged);
        } else if (hasChanged) {
            onDragEnd?.(true);
        }
    }, [draft, isDragging, onChange, onDragEnd]);

    const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setDraft(parseFloat(event.target.value));
    }, []);

    const handleKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
        if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) {
            return;
        }
        startInteraction();
    }, [startInteraction]);

    const handleKeyUp = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
        if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) {
            return;
        }
        commitValue();
    }, [commitValue]);

    return (
        <div className="flex flex-col gap-1">
            <div className="flex justify-between text-base md:text-xl font-medium text-mint-cream/80">

            <span className="flex items-center gap-2">
                {Icon}
                {label}
            </span>

                <div className={"flex flex-row gap-1 justify-center items-center"}>
                    <span className={"text-xl dm-mono font-medium"}>{formattedValue}</span>
                    <div className={"flex flex-col gap-0 justify-center items-center text-night/60"}>
                        <HiChevronUp/>
                        <HiChevronDown/>
                    </div>
                </div>

            </div>

            <SmoothSlider min={min}
                          max={max}
                          step={step}
                          value={draft}
                          onChange={handleInputChange}
                          onPointerDown={startInteraction}
                          onPointerUp={commitValue}
                          onPointerCancel={commitValue}
                          onTouchStart={startInteraction}
                          onTouchEnd={commitValue}
                          onTouchCancel={commitValue}
                          onBlur={commitValue}
                          onKeyDown={handleKeyDown}
                          onKeyUp={handleKeyUp}/>
        </div>
    );
}
