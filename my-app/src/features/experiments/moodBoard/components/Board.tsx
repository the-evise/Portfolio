import { useState } from "react";
import { motion } from "motion/react";
import MoodBoardIndicator, { MoodName } from "@/features/experiments/moodBoard/components/MoodBoardIndicator";
import MoodBoard from "@/features/experiments/moodBoard/components/MoodBoard";

export default function Board() {
    const [mood, setMood] = useState<MoodName>("whale");
    const [version, setVersion] = useState(0);

    const handleMoodChange = (nextMood: MoodName) => {
        setMood(nextMood);
        setVersion((v) => v + 1); // force a fresh layout/images on each mood change
    };

    return (
        <motion.div
            className={"flex flex-col gap-2 sm:gap-4 w-fit mx-auto rounded-3xl border border-white/5 bg-ruddy-blue p-2"}
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ type: "spring", stiffness: 220, damping: 28 }}
        >
            <MoodBoardIndicator onChange={handleMoodChange} initial={mood} />
            <MoodBoard mood={mood} version={version} />
        </motion.div>
    );
}
