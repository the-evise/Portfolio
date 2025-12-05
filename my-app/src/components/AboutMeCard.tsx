"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {motion, useMotionValue, useSpring, useTransform} from "motion/react";
import Image from "next/image";
import {
    HiBriefcase,
    HiGlobeAlt,
    HiAcademicCap,
} from "react-icons/hi";
import {cn} from "@/utils/utils";

const HIGHLIGHTS = [
    {label: "Experience", value: "4+ yrs", icon: HiBriefcase},
    {label: "Projects", value: "12 shipped", icon: HiAcademicCap},
    {label: "Timezone", value: "GMT +3:30", icon: HiGlobeAlt},
] as const;

const FOCUS_AREAS = [
    "Design Systems",
    "React / Next.js",
    "Interaction & Motion",
    "Visual Prototyping",
] as const;

const CARD_VARIANTS = {
    hidden: {opacity: 0, y: 24},
    visible: {opacity: 1, y: 0},
};

const SECTION_VARIANTS = {
    hidden: {opacity: 0, y: 16},
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1] as const,
            staggerChildren: 0.08,
            delayChildren: 0.08,
        },
    },
};

const ITEM_VARIANTS = {
    hidden: {opacity: 0, y: 10},
    visible: {opacity: 1, y: 0},
};

export default function AboutMeCard() {
    const cardRef = useRef<HTMLDivElement | null>(null);
    const [introReady, setIntroReady] = useState(false);
    const rotateX = useSpring(0, {stiffness: 150, damping: 20});
    const rotateY = useSpring(0, {stiffness: 150, damping: 20});
    const glow = useSpring(0, {stiffness: 120, damping: 24});
    const boxShadow = useTransform(glow, (value) => `0 35px 80px rgba(12, 16, 31, ${0.25 + value * 0.25})`);
    const contentShiftX = useTransform(rotateY, (v) => v * 1.1);
    const contentShiftY = useTransform(rotateX, (v) => v * -1.1);

    const tiltFromPoint = useCallback((clientX: number, clientY: number, target: DOMRect) => {
        const x = (clientX - target.left) / target.width;
        const y = (clientY - target.top) / target.height;
        const tiltX = (0.5 - y) * 10;
        const tiltY = (x - 0.5) * 12;
        rotateX.set(tiltX);
        rotateY.set(tiltY);
        glow.set(0.35);
    }, [rotateX, rotateY, glow]);

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        tiltFromPoint(event.clientX, event.clientY, rect);
    };

    const handlePointerLeave = () => {
        rotateX.set(0);
        rotateY.set(0);
        glow.set(0);
    };

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        tiltFromPoint(event.clientX, event.clientY, rect);
    };

    const handlePointerUp = () => {
        rotateX.set(0);
        rotateY.set(0);
        glow.set(0);
    };

    useEffect(() => {
        const timer = setTimeout(() => setIntroReady(true), 450);
        return () => clearTimeout(timer);
    }, []);

    return (
        <motion.div
            ref={cardRef}
            className={cn("relative w-[350px] h-[514px] md:w-[377px] [perspective:1200px] cursor-default", "md:w-[430px] lg:w-[480px] transform-gpu")}
            variants={CARD_VARIANTS}
            initial="hidden"
            animate={introReady ? "visible" : "hidden"}
            transition={{duration: 0.6, ease: "easeOut"}}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            style={{boxShadow}}
        >
            <motion.div
                className="absolute inset-0 z-0 h-full w-full rounded-2xl overflow-hidden"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{delay: 0.4, duration: 0.6, ease: "easeOut"}}
                style={{rotateX, rotateY}}
            >
                <Image
                    src="/Cover-mobile.jpg"
                    alt=""
                    fill
                    className="absolute inset-0 w-[120%] h-[120%] -translate-x-[10%] -translate-y-[10%] object-cover blur-xl"
                    style={{ transform: "scale(1.15)" }}
                />
            </motion.div>

            <motion.section
                className="absolute inset-0 z-10 flex h-full flex-col justify-between rounded-2xl border-2 border-cardinal-dark/40 bg-[linear-gradient(rgba(255,255,255,0.75),rgba(255,255,255,0.65)),url('/snoise.svg')] bg-cover bg-center bg-blend-multiply p-2 md:p-4 text-night shadow-[0_5px_80px_rgba(12,16,31,0.45)] backdrop-blur-sm"
                variants={SECTION_VARIANTS}
                initial="hidden"
                animate="visible"
                style={{x: contentShiftX, y: contentShiftY}}
            >
                <motion.div className="flex items-center gap-2 md:gap-4" variants={ITEM_VARIANTS}>
                    <div
                        className="relative rounded-2xl bg-[linear-gradient(62deg,#60AAFF_0%,#EDC8FF_49%,#B499FF_97%)] p-[2px] md:p-1">
                        <div
                            className="relative flex items-center justify-center rounded-[calc(theme(borderRadius.2xl)-2px)] bg-ruddy-blue/10">
                            <div
                                className="absolute inset-0 rounded-[calc(theme(borderRadius.2xl)-2px)] bg-[linear-gradient(62deg,#60AAFF_0%,#EDC8FF_49%,#B499FF_97%)] mix-blend-soft-light"/>
                            <Image src="/pfp.jpg" alt="Robert Evise" width={108} height={108}
                                   className="rounded-[calc(theme(borderRadius.2xl)-2px)] object-cover"/>
                        </div>
                    </div>

                    <div className="flex-1 text-left space-y-1">
                        <motion.h2 className="text-2xl md:text-3xl font-sans font-bold text-[#160B32]" variants={ITEM_VARIANTS}>
                            Hamed Zarepour
                        </motion.h2>
                        <motion.p className="text-sm md:text-base uppercase tracking-[0.3em] text-[#160B32aa] font-mono ml-0.5 md:ml-1"
                                  variants={ITEM_VARIANTS}>
                            React Developer
                        </motion.p>
                    </div>
                </motion.div>

                <motion.div className="grid grid-cols-3 gap-1 md:gap-4 text-sm transition-colors duration-300" variants={ITEM_VARIANTS}>
                    {HIGHLIGHTS.map(({label, value, icon: Icon}) => (
                        <motion.div
                            key={label}
                            className="group flex flex-col justify-center items-center gap-1 rounded-lg border border-ruddy-blue/20 bg-ruddy-blue/15 p-1 sm:p-2 text-center select-none pointer-default"
                            variants={ITEM_VARIANTS}
                            whileHover={{scale: 0.95}}
                            transition={{duration: 0.4}}
                        >
                            <Icon className={"size-6 text-blue-600 group-hover:text-blue-950 transition-colors duration-300"}/>
                            <dt className="text-night/80 font-sans lowercase font-bold">{label}</dt>
                            <dd className="mt-1 md:mt-2 text-sm font-medium uppercase font-mono text-blue-950 group-hover:text-blue-600 transition-colors duration-300">{value}</dd>
                        </motion.div>
                    ))}
                </motion.div>

                <motion.div className="flex flex-wrap gap-2 select-none" variants={ITEM_VARIANTS}>
                    {FOCUS_AREAS.map((item) => (
                        <motion.span
                            key={item}
                            className="rounded-full border border-tropical-indigo/30 bg-tropical-indigo/10 px-3 py-1 text-xs md:px-4 md:py-2 md:text-sm font-medium text-rose-950"
                            variants={ITEM_VARIANTS}
                            whileHover={{scale: 1.05}}
                        >
                            {item}
                        </motion.span>
                    ))}
                </motion.div>

                <motion.div className="flex flex-col gap-2 rounded-[8px] bg-mint-cream/30 p-3 text-sm"
                            variants={ITEM_VARIANTS}>
                    <p className="text-night/70">Exploring</p>
                    <span className="text-base font-semibold">Scalable design systems & motion-driven UX built with React.</span>
                    <motion.a
                        href="mailto:evise.apply@gmail.com"
                        className="mt-2 inline-flex items-center justify-center rounded-md bg-night px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-mint-cream"
                        whileHover={{scale: 1.04, backgroundColor: "#6f6efb"}}
                        whileTap={{scale: 0.97}}
                    >
                        Let’s Collaborate
                    </motion.a>
                </motion.div>
            </motion.section>

            <motion.div
                className="pointer-events-none absolute inset-0 z-20 rounded-2xl bg-gradient-to-tr from-white/40 via-transparent to-transparent mix-blend-screen"
                style={{opacity: glow, rotateX, rotateY}}
            />
        </motion.div>
    );
}
