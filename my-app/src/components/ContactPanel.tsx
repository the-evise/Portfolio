"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence, useAnimate } from "motion/react";
import {HiPhone} from "react-icons/hi";
import {HiCheckBadge} from "react-icons/hi2";
import {AiFillInstagram, AiFillMediumCircle, AiOutlineGoogle} from "react-icons/ai";

interface SocialLink {
  name: string;
  username: string;
  url: string;
  icon: ReactNode;
}

const SOCIAL_LINKS: SocialLink[] = [
    {
        name: "Email",
        username: "evise.apply@gmail.com",
        url: "mailto:evise.apply@gmail.com",
        icon: <AiOutlineGoogle />,
    },
  {
    name: "Instagram",
    username: "the_evise",
    url: "https://instagram.com/the_evise",
    icon: <AiFillInstagram />,
  },
  {
    name: "Medium",
    username: "theevise",
    url: "https://medium.com/@theevise",
    icon: <AiFillMediumCircle />,
  },
];

export function ContactPanel() {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [scope, animate] = useAnimate();

  const toggle = useCallback(() => setOpen((prev) => !prev), []);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) {
        return;
      }
      close();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, close]);

  const copyToClipboard = useCallback((value: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(value);
      setTimeout(() => setCopied((current) => (current === value ? null : current)), 1200);
    });
  }, []);

  const popoverId = useId();

  return (
    <div className="relative">
      <motion.button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={popoverId}
        className="group flex size-10 items-center justify-center rounded-lg border border-white/20 bg-night/80 text-white/80 transition hover:border-white/40 hover:text-mint-cream focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-tropical-indigo cursor-pointer"
        onTapStart={() => setPressed(true)}
        onTap={() => {
          setPressed(true);
          void animate(scope.current, { rotate: [0, -15, 10, -5, 0] }, { duration: 0.5, ease: "easeOut" });
          setTimeout(() => setPressed(false), 120);
        }}
        onTapCancel={() => setPressed(false)}
        animate={pressed ? { scale: 1.05 } : { scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 800,
          damping: 40,
          mass: 0.55,
        }}
        initial={{ opacity: 0, x: 5 }}
        whileInView={{
            x: 0,
            opacity: 1,
            transition: {
                delay: 0.35,   // <-- the delay you want
                duration: 0.4,
                ease: "easeOut"
            }
        }}
      >
        <motion.span ref={scope} className="size-6 text-mint-cream">
          <HiPhone className="size-6" />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            id={popoverId}
            role="dialog"
            aria-label="Contact links"
            initial={{ opacity: 0, scale: 0.96, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 top-17 w-fit rounded-2xl border border-tropical-indigo/10 bg-[#05050f] p-4 "
          >
            <p className="mb-3 text-xs text-center font-medium font-mono uppercase tracking-[0.4em] text-cardinal-dark">
              Let&apos;s connect
            </p>
            <div className="flex flex-col gap-3">
              {SOCIAL_LINKS.map((link) => {
                const isCopied = copied === link.username;
                return (
                  <div
                    key={link.name}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#181422] px-3 py-2 ring-2 ring-teal-900/10"
                  >
                    <div className="flex items-center gap-3 text-left">
                        <div className={"w-fit h-fit p-1 rounded-md bg-mint-cream/20"}><span className="text-teal-100/80">{link.icon}</span></div>
                      <div className="leading-tight">
                        <p className="text-sm font-light font-sans text-teal-100/80">{link.name}</p>
                        <p className="text-xs font-medium font-mono text-mint-cream/50">{link.username}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end w-full">
                      <motion.button
                        type="button"
                        onClick={() => window.open(link.url, "_blank")}
                        className="rounded-full border border-white/15 px-3 py-1 text-xs uppercase tracking-wide text-mint-cream/70 transition hover:border-white/30 hover:text-mint-cream cursor-pointer h-8"
                        whileTap={{ scale: 0.92 }}
                      >
                        Visit
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={() => copyToClipboard(link.username)}
                        className="flex justify-center items-center w-15 rounded-full border border-white/15 px-3 py-1 text-xs uppercase tracking-wide text-mint-cream/70 transition hover:border-white/30 hover:text-mint-cream cursor-pointer h-8"
                        whileTap={{ scale: 0.92 }}
                      >
                        {isCopied ? <HiCheckBadge className={"size-6 text-teal-100"}/> : "Copy"}
                      </motion.button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M5 4h4l2 5-3 2c1.2 2.4 3.6 4.8 6 6l2-3 5 2v4c0 1-1 2-2 2C9 22 2 15 2 6c0-1 1-2 3-2z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <path d="M16.5 7.5h.01" />
      <circle cx="12" cy="12" r="3.5" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="m4 12 16-7-4 14-5-4-3.5 3z" />
    </svg>
  );
}

function SoundcloudIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M6 15.5a3.5 3.5 0 0 1 6-2.45A4 4 0 1 1 15 21H9.5A3.5 3.5 0 0 1 6 17.5z" />
      <path d="M2 16v2" />
      <path d="M5 14v6" />
      <path d="M8 13v7" />
    </svg>
  );
}
