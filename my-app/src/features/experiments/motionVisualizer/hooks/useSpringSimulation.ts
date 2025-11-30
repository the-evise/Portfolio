import { useMemo } from "react";

export interface SpringSimulationOptions {
  stiffness: number;
  damping: number;
  mass: number;
  /**
   * Total duration captured in milliseconds. Defaults to 2000ms (~2s).
   */
  durationMs?: number;
  /**
   * Starting displacement from the target. Defaults to 300px (drop height).
   */
  initialDisplacement?: number;
  /**
   * Final resting position toward which the mass moves. Defaults to 0px.
   */
  target?: number;
  /**
   * Samples per second used to approximate the continuous motion. Defaults to 60.
   */
  fps?: number;
}

export interface SpringSimulationPoint {
  /**
   * Time stamp in milliseconds since the start of the simulation.
   */
  time: number;
  /**
   * Position of the simulated mass relative to the origin.
   */
  position: number;
}

/**
 * Approximates a 1D damped spring and returns chart-ready points describing how the
 * animated mass moves toward the `target` over `durationMs`.
 */
export function useSpringSimulation({
  stiffness,
  damping,
  mass,
  durationMs = 2000,
  initialDisplacement = 300,
  target = 0,
  fps = 60,
}: SpringSimulationOptions): SpringSimulationPoint[] {
  return useMemo(() => {
    const dt = 1 / fps;
    const totalSeconds = durationMs / 1000;
    const points: SpringSimulationPoint[] = [];
    let velocity = 0;
    let position = initialDisplacement;

    for (let t = 0; t < totalSeconds; t += dt) {
      const force = -stiffness * (position - target);
      const dampingForce = -damping * velocity;
      const acceleration = (force + dampingForce) / mass;
      velocity += acceleration * dt;
      position += velocity * dt;
      points.push({ time: Math.round(t * 1000), position });
    }

    return points;
  }, [damping, durationMs, fps, initialDisplacement, mass, stiffness, target]);
}
