"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export function PortalLoader() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 950);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {!ready && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-[#050510] via-[#0c0c22] to-[#120f2b]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <motion.div className="relative flex h-24 w-24 items-center justify-center">
            <motion.span
              className="absolute h-24 w-24 rounded-full border-2 border-transparent border-t-tropical-indigo"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
            />
            <motion.span
              className="absolute h-16 w-16 rounded-full border-2 border-transparent border-b-mint-cream/70"
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            />

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
