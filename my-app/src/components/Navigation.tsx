'use client';

import { HiBriefcase, HiCollection, HiCode } from "react-icons/hi";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/utils/utils";
import SparkLogo from "../../public/SparkLogo.svg";
import SparkLogoGlow from "../../public/SparkLogoGlow.svg";
import { motion, AnimatePresence, useAnimate } from "motion/react";
import LogoBg from "../../public/LogoBg.svg";
import Image from "next/image";
import { useFullScreenScroller } from "@/components/FullScreenScroller";
import { ContactPanel } from "@/components/ContactPanel";

type NavId = string;

const defaultTabs: { id: NavId; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: "about", label: "ABOUT ME", icon: HiBriefcase },
  { id: "comp", label: "COMPONENTS", icon: HiCollection },
  { id: "work", label: "WORK PROCESS", icon: HiCode },
];

const iconFallbackMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  about: HiBriefcase,
  components: HiCollection,
  work: HiCode,
};

export default function Navigation() {
  const scroller = useFullScreenScroller();
  const [standaloneActive, setStandaloneActive] = useState<NavId>("about");

  const tabs = useMemo(() => {
    if (scroller?.sections?.length) {
      return scroller.sections.map(({ id, label }) => ({
        id,
        label: label.toUpperCase(),
        icon: iconFallbackMap[id] ?? HiCollection,
      }));
    }
    return defaultTabs;
  }, [scroller?.sections]);

  const active = scroller?.activeSectionId ?? standaloneActive;

  const handleTabClick = (id: NavId) => {
    if (scroller) {
      scroller.scrollToSection(id);
      return;
    }
    setStandaloneActive(id);
  };

  const [pressed, setPressed] = useState(false);
  const [spinCount, setSpinCount] = useState(0);

    const [navReady, setNavReady] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setNavReady(true), 250); // after page settles
        return () => clearTimeout(t);
    }, []);


    return (
    <motion.div
        className="pointer-events-none fixed top-2 left-1/2 -translate-x-1/2 sm:top-4 z-[90] w-[95%] max-w-[1500px] px-2 min-w-[310px]"
        initial={{ opacity: 0 }}
        whileInView={{
            opacity: 1,
            transition: {
                duration: 0.4,
                ease: "easeOut"
            }
        }}

    >
      <div className="pointer-events-auto mx-auto flex items-center gap-4 rounded-xl bg-[#07021A]/80 px-4 py-3 backdrop-blur-2xl">

        <motion.button
          aria-label="Spark"
          className="rounded-lg flex justify-center items-center content-center size-[40px] border border-tropical-indigo bg-night transition"
          onClick={() => console.log("spark")}
          onTapStart={() => setPressed(true)}
          onTap={() => {
            setPressed(true);
            setSpinCount((count) => count + 1);
            setTimeout(() => setPressed(false), 120);
          }}
          onTapCancel={() => setPressed(false)}
          animate={pressed ? { scale: 1.05 } : { scale: 1 }}
          initial={{ opacity: 0, x: -5 }}
          whileInView={{
              x: 0,
              opacity: 1,
              transition: {
                  delay: 0.35,   // <-- the delay you want
                  duration: 0.4,
                  ease: "easeOut"
              }
          }}
          transition={{
            type: "spring",
            stiffness: 2200,
            damping: 80,
            mass: 0.25,
          }}
        >
          <LogoLayers rotations={spinCount} />
        </motion.button>

        <motion.nav
            className="flex-1 flex items-center justify-center gap-3 sm:gap-5"
            initial={{opacity: 0}}
            whileInView={{
                y: [-5, 0],
                opacity: 1,
                transition: {
                    delay: 1.1,   // <-- the delay you want
                    duration: 0.4,
                    ease: "easeOut"
                }
            }}

        >
          {tabs.map(({ id, label, icon: Icon }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                onClick={() => handleTabClick(id)}
                className={cn(
                  "group cursor-pointer rounded-lg border transition-all duration-200",
                  "size-10 sm:size-auto sm:h-10",
                  isActive
                    ? "border-ruddy-blue shadow-[0_0_8px_#6FADFF50] bg-night"
                    : "border-ruddy-blue/50 hover:border-ruddy-blue/60 bg-night/80"
                )}
              >
                <Icon size={20} className={cn("sm:hidden mx-auto", isActive ? "text-ruddy-blue" : "text-mint-cream/60")} />
                <span
                  className={cn(
                    "hidden sm:inline-block px-5 text-sm font-medium",
                    isActive ? "text-ruddy-blue" : "text-mint-cream/60 group-hover:text-mint-cream"
                  )}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </motion.nav>

        <ContactPanel />
      </div>
    </motion.div>
  );
}

/** stacked SVG logo */
function LogoLayers({ rotations }: { rotations: number }) {
    const [scope, animate] = useAnimate();
    const [mounted, setMounted] = useState(false);

    // Register mount
    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 900); // wait for parent entrance
        return () => clearTimeout(t);
    }, []);

    // Trigger rotation ONLY when:
    // - mounted is true (after entrance)
    // - rotations changes (tap)
    useEffect(() => {
        if (!mounted) return;
        void animate(
            ".logo-rotor-element",
            { rotate: [0, 360] },
            { duration: 0.6, ease: "easeOut" }
        );
    }, [rotations, mounted, animate]);

    return (
        <motion.div
            ref={scope}
            className="relative flex justify-center items-center h-full w-full origin-center"
            initial={{ opacity: 0 }}
            whileInView={{
                opacity: 1,
                transition: { duration: 0.2, delay: 0.2 }
            }}
        >
            <LogoBg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
            <SparkLogoGlow className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-110 mix-blend-color-dodge" />
            <SparkLogo className="logo-rotor-element absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mix-blend-color-dodge" />
            <Image src="/noise.png" alt="" fill className="pointer-events-none object-cover opacity-10" />
        </motion.div>
    );
}

