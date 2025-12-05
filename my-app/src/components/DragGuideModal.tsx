"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";

interface DragGuideModalProps {
  open: boolean;
  onClose: () => void;
  imageSrc?: string;
  title?: string;
  description?: string;
}

export default function DragGuideModal({
  open,
  onClose,
  imageSrc,
  title = "Swipe to explore",
  description = "Drag left or right to switch between experiments when the tabs are hidden.",
}: DragGuideModalProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[140] flex items-center justify-center bg-mint-cream/10 backdrop-blur-sm px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-night p-4 shadow-2xl"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 8, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {imageSrc ? (
              <div className="relative mb-4 aspect-[4/3] w-full overflow-hidden rounded-xl bg-white/5">
                <Image src={imageSrc} alt="" fill className="object-cover" priority />
              </div>
            ) : (
              <div className="mb-4 aspect-[4/3] w-full overflow-hidden rounded-xl bg-gradient-to-br from-tropical-indigo/20 via-white/10 to-ruddy-blue/30" />
            )}
            <div className="space-y-2 text-mint-cream">
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-sm text-mint-cream/80">{description}</p>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-tropical-indigo px-4 py-2 text-sm font-semibold text-night shadow-lg shadow-tropical-indigo/30 transition hover:scale-[1.01] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tropical-indigo"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
