// Track 3 — Quantum Interference (Wave Lab) Game Engine

import { EvaluationResult } from '../types';
import { Complex, complex, expI, magnitudeSq, add, scale } from '../math/complex';

export interface WavePath {
  id: string;
  name: string;
  amplitude: number; // e.g. 1.0
  phase: number;     // in radians: [0, 2 * PI]
  isFixed: boolean;
}

export interface InterferenceLevelDefinition {
  paths: WavePath[];
  targetDetectorA: number; // 0.0 to 1.0 (e.g. 0.80 = 80%)
  targetDetectorB: number; // 0.0 to 1.0 (e.g. 0.20 = 20%)
  tolerance: number;       // e.g. 0.04 (±4%)
  description: string;
}

export interface InterferenceEvaluationInput {
  currentPaths: WavePath[];
  initialPaths: WavePath[];
  targetDetectorA: number;
  targetDetectorB: number;
  tolerance: number;
  hasInteracted: boolean;
}

export interface InterferenceResult {
  probA: number;
  probB: number;
  deltaPhaseDeg: number;
  isConstructiveA: boolean;
  totalAmplitudeA: Complex;
  totalAmplitudeB: Complex;
}

/**
 * Calculates detector probabilities from the actual complex amplitudes and phases of the paths.
 * Uses exact beam splitter / multi-path recombination interference mathematics.
 */
export function calculateInterference(paths: WavePath[]): InterferenceResult {
  const n = paths.length;
  if (n === 0) {
    return {
      probA: 0.5,
      probB: 0.5,
      deltaPhaseDeg: 0,
      isConstructiveA: false,
      totalAmplitudeA: complex(0, 0),
      totalAmplitudeB: complex(0, 0),
    };
  }

  // Two-path standard Mach-Zehnder model
  if (n === 2) {
    const phi1 = paths[0].phase;
    const phi2 = paths[1].phase;
    const deltaPhi = phi1 - phi2;
    let deltaDeg = ((deltaPhi * 180) / Math.PI) % 360;
    if (deltaDeg < 0) deltaDeg += 360;

    const probA = Math.max(0, Math.min(1, (1 + Math.cos(deltaPhi)) / 2));
    const probB = Math.max(0, Math.min(1, (1 - Math.cos(deltaPhi)) / 2));

    const ampA = scale(add(expI(phi1), expI(phi2)), 1 / 2);
    const ampB = scale(add(expI(phi1), expI(phi2 + Math.PI)), 1 / 2);

    return {
      probA,
      probB,
      deltaPhaseDeg: deltaDeg,
      isConstructiveA: probA > 0.9,
      totalAmplitudeA: ampA,
      totalAmplitudeB: ampB,
    };
  }

  // Multi-path model (3 or 4 paths)
  let sumA = complex(0, 0);
  let sumB = complex(0, 0);
  const normFactor = 1 / Math.sqrt(n);

  for (let k = 0; k < n; k++) {
    const path = paths[k];
    const a = path.amplitude;
    const phi = path.phase;

    // Detector A: direct recombination
    const ampK_A = scale(expI(phi), a * normFactor);
    sumA = add(sumA, ampK_A);

    // Detector B: phase-shifted recombination by orthogonal beam splitter matrix
    const shiftB = (k * Math.PI) / (n / 2);
    const ampK_B = scale(expI(phi + shiftB), a * normFactor);
    sumB = add(sumB, ampK_B);
  }

  let rawA = magnitudeSq(sumA);
  let rawB = magnitudeSq(sumB);
  const total = rawA + rawB;
  if (total > 1e-9) {
    rawA /= total;
    rawB /= total;
  } else {
    rawA = 0.5;
    rawB = 0.5;
  }

  const p1 = paths[0].phase;
  const p2 = paths[1].phase;
  let dDeg = (((p1 - p2) * 180) / Math.PI) % 360;
  if (dDeg < 0) dDeg += 360;

  return {
    probA: Math.max(0, Math.min(1, rawA)),
    probB: Math.max(0, Math.min(1, rawB)),
    deltaPhaseDeg: dDeg,
    isConstructiveA: rawA > 0.85,
    totalAmplitudeA: sumA,
    totalAmplitudeB: sumB,
  };
}

/**
 * Samples shot counts from true detector probabilities.
 */
export function sampleInterferenceShots(
  probA: number,
  shots = 100
): { countA: number; countB: number } {
  let countA = 0;
  for (let i = 0; i < shots; i++) {
    if (Math.random() < probA) {
      countA++;
    }
  }
  return { countA, countB: shots - countA };
}

/**
 * Evaluates Track 3 state according to universal evaluation rules.
 */
export function evaluateInterferenceLevel(input: InterferenceEvaluationInput): EvaluationResult {
  const { currentPaths, initialPaths, targetDetectorA, tolerance, hasInteracted } = input;

  if (!hasInteracted) {
    return {
      status: 'unstarted',
      score: 0,
      progress: 0,
      feedback: 'Drag the phase dials on movable paths to adjust interference until detector outputs match the target.',
      details: { hasInteracted: false },
    };
  }

  // Check if player actually changed a movable path
  let changed = false;
  if (initialPaths && initialPaths.length === currentPaths.length) {
    for (let i = 0; i < currentPaths.length; i++) {
      if (!currentPaths[i].isFixed) {
        if (Math.abs(currentPaths[i].phase - initialPaths[i].phase) > 0.03) {
          changed = true;
          break;
        }
      }
    }
  } else {
    changed = true;
  }

  if (!changed) {
    return {
      status: 'incomplete',
      score: 0,
      progress: 0.1,
      feedback: 'No phase change detected. Turn a movable phase dial to shift the interference pattern.',
      details: { changed: false },
    };
  }

  // Calculate actual interference
  const result = calculateInterference(currentPaths);
  const error = Math.abs(result.probA - targetDetectorA);
  const maxPossibleError = 1.0;
  const progress = Math.min(1, Math.max(0, Number((1 - error / maxPossibleError).toFixed(3))));

  const isSuccess = error <= tolerance;

  if (isSuccess) {
    const accuracyBonus = Math.max(0, 1 - error / tolerance);
    const score = Math.round(750 + 250 * accuracyBonus);

    return {
      status: 'success',
      score,
      progress: 1.0,
      feedback: `✓ Interference pattern aligned! Detector A reached ${(result.probA * 100).toFixed(1)}% (target: ${(targetDetectorA * 100).toFixed(1)}%, error: ${(error * 100).toFixed(1)}%).`,
      details: {
        probA: Number(result.probA.toFixed(3)),
        probB: Number(result.probB.toFixed(3)),
        targetA: targetDetectorA,
        error: Number(error.toFixed(3)),
        deltaPhaseDeg: Number(result.deltaPhaseDeg.toFixed(1)),
      },
    };
  }

  const isAlmost = error <= tolerance * 2.5;
  const feedback = isAlmost
    ? `Almost there! Detector A is at ${(result.probA * 100).toFixed(1)}%, target is ${(targetDetectorA * 100).toFixed(1)}% (error: ${(error * 100).toFixed(1)}%, tolerance: ±${(tolerance * 100).toFixed(1)}%). Fine-tune the phase dial.`
    : `Your detector probability is ${(result.probA * 100).toFixed(1)}%, but the target is ${(targetDetectorA * 100).toFixed(1)}% (error: ${(error * 100).toFixed(1)}%). Keep adjusting phase.`;

  return {
    status: 'incorrect',
    score: Math.round(progress * 400),
    progress,
    feedback,
    details: {
      probA: Number(result.probA.toFixed(3)),
      probB: Number(result.probB.toFixed(3)),
      targetA: targetDetectorA,
      error: Number(error.toFixed(3)),
      deltaPhaseDeg: Number(result.deltaPhaseDeg.toFixed(1)),
      isAlmost,
    },
  };
}
