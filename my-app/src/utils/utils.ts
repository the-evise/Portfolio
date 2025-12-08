import { clsx, type ClassValue } from "clsx";
import { animate } from "motion";
import type { MotionValue, ValueAnimationTransition } from "motion";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function continueSpring(
  value: MotionValue<number>,
  frames: number[],
  springConfig: ValueAnimationTransition<number>,
  delay = 0
) {
  for (let i = 0; i < frames.length - 1; i++) {
    const target = frames[i + 1];
    const velocity = value.getVelocity();

    await animate(value, target, {
      ...springConfig,
      velocity,
      delay: i === 0 ? delay : 0,
      restSpeed: 0.003,
    }).finished;
  }
}
