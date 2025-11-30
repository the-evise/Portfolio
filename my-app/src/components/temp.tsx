"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {motion, useSpring, useTransform} from "motion/react";
import Image from "next/image";
import {HiBriefcase, HiGlobeAlt, HiAcademicCap} from "react-icons/hi";

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
    hidden: {opacity: 0, y: 32},
    visible: {opacity: 1, y: 0},
};

export default function AboutMeCard() {
    const cardRef = useRef<HTMLDivElement | null>(null);
    const [introReady, setIntroReady] = useState(false);

    // Tilt springs
    const rotateX = useSpring(0, {stiffness: 110, damping: 20});
    const rotateY = useSpring(0, {stiffness: 110, damping: 20});
    const glow = useSpring(0, {stiffness: 120, damping: 24});

    const boxShadow = useTransform(
        glow,
        (v) => `0 50px 100px rgba(12,16,31,${0.22 + v * 0.22})`
    );

    const contentShiftX = useTransform(rotateY, (v) => v * 0.8);
    const contentShiftY = useTransform(rotateX, (v) => v * -0.8);

    const tiltFromPoint = useCallback(
        (clientX: number, clientY: number, rect: DOMRect) => {
            const x = (clientX - rect.left) / rect.width;
            const y = (clientY - rect.top) / rect.height;

            const tiltX = (0.5 - y) * 8;
            const tiltY = (x - 0.5) * 10;

            rotateX.set(tiltX);
            rotateY.set(tiltY);
            glow.set(0.35);
        },
        []
    );

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        tiltFromPoint(e.clientX, e.clientY, rect);
    };

    useEffect(() => {
        const t = setTimeout(() => setIntroReady(true), 550);
        return () => clearTimeout(t);
    }, []);

    return (
        <motion.div
            ref={cardRef}
            className="
        relative
        w-[360px] md:w-[430px] lg:w-[480px]
        h-[540px] md:h-[620px]
        cursor-default
        rounded-2xl
        [perspective:1300px]
      "
            variants={CARD_VARIANTS}
            initial="hidden"
            animate={introReady ? "visible" : "hidden"}
            transition={{duration: 0.7, ease: "easeOut"}}
            onPointerMove={handlePointerMove}
            onPointerLeave={() => {
                rotateX.set(0);
                rotateY.set(0);
                glow.set(0);
            }}
            style={{boxShadow}}
        >
            {/* Background Layer */}
            <motion.div
                className="absolute inset-0 rounded-2xl overflow-hidden"
                style={{rotateX, rotateY}}
            >
                <Image
                    src="/Cover-mobile.jpg"
                    alt=""
                    fill
                    className="object-cover blur-lg opacity-80"
                />
            </motion.div>

            {/* Content */}
            <motion.section
                className="
          absolute inset-0 z-10
          rounded-2xl
          flex flex-col
          justify-between
          p-4 md:p-6 lg:p-8
          bg-[rgba(255,255,255,0.65)]
          bg-[linear-gradient(rgba(255,255,255,0.7),rgba(255,255,255,0.6))]
          backdrop-blur-md
          border border-night/20
        "
                style={{x: contentShiftX, y: contentShiftY}}
            >
                {/* Top Section */}
                <div className="flex items-center gap-4">
                    {/* Profile Frame */}
                    <div
                        className="relative rounded-2xl p-[3px] bg-gradient-to-br from-blue-400 via-purple-300 to-violet-500">
                        <div className="rounded-2xl overflow-hidden bg-white/10">
                            <Image
                                src="/pfp.jpg"
                                alt=""
                                width={120}
                                height={120}
                                className="object-cover"
                            />
                        </div>
                    </div>

                    {/* Name + Role */}
                    <div className="flex flex-col gap-1">
                        <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-cardinal-light">
                            React Developer
                        </p>
                        <h2 className="text-3xl font-display tracking-wide">
                            Hamed Zarepour
                        </h2>
                        <p className="text-[14px] text-night/70 leading-relaxed">
                            Building systems and motion-driven interfaces with clarity and intent.
                        </p>
                    </div>
                </div>

                {/* Highlights */}
                <div className="grid grid-cols-3 gap-2 md:gap-4 mt-3">
                    {HIGHLIGHTS.map(({label, value, icon: Icon}) => (
                        <motion.div
                            key={label}
                            className="
                flex flex-col items-center justify-center
                gap-1 p-3 md:p-4
                rounded-xl
                bg-white/30
                border border-white/40
                text-center
              "
                            whileHover={{scale: 0.96}}
                            transition={{duration: 0.25}}
                        >
                            <Icon className="size-7 text-blue-700"/>
                            <div className="text-[13px] font-semibold">{label}</div>
                            <div className="text-[12px] font-mono text-night/80">{value}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Focus Areas */}
                <div className="flex flex-wrap gap-2 mt-1">
                    {FOCUS_AREAS.map((item) => (
                        <motion.span
                            key={item}
                            className="
                text-xs font-medium
                px-4 py-1.5
                rounded-full
                bg-blue-200/30
                border border-blue-400/40
                text-blue-950
              "
                            whileHover={{scale: 1.05}}
                        >
                            {item}
                        </motion.span>
                    ))}
                </div>

                {/* CTA Block */}
                <div className="mt-4 p-4 rounded-lg bg-night text-mint-cream">
                    <p className="text-night/40 text-[12px]">Exploring</p>
                    <p className="text-base font-semibold mb-3">
                        Motion-driven UX & scalable design systems.
                    </p>

                    <motion.a
                        href="mailto:hello@evise.studio"
                        className="
              inline-flex items-center justify-center
              w-full py-2 rounded-md
              bg-tropical-indigo text-night font-semibold text-xs uppercase
              tracking-[0.2em]
            "
                        whileHover={{scale: 1.04}}
                        whileTap={{scale: 0.96}}
                    >
                        Contact
                    </motion.a>
                </div>
            </motion.section>

            {/* Highlight Glow */}
            <motion.div
                className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/40 via-transparent to-transparent mix-blend-screen"
                style={{opacity: glow}}
            />
        </motion.div>
    );
}
