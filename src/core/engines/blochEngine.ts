// Track 1 — Qubits & The Bloch Sphere Game Engine

import { EvaluationResult } from '../types';
import {
  Vector3,
  sphericalToCartesian,
  normalize,
  dot,
  angularDistanceDegrees,
  blochProbabilities,
  isValidVector3,
} from '../math/vector3';

export interface BlochSphereState {
  id: string;
  name: string;
  isFixed: boolean;
  theta: number; // [0, Math.PI]
  phi: number;   // [0, 2 * Math.PI)
  weight: number;
}

export interface BlochLevelState {
  spheres: BlochSphereState[];
  targetTheta: number;
  targetPhi: number;
  toleranceDegrees: number;
}

export interface BlochEvaluationInput {
  currentSpheres: BlochSphereState[];
  targetTheta: number;
  targetPhi: number;
  toleranceDegrees: number;
  hasInteracted: boolean;
  initialSpheres: BlochSphereState[];
}

/**
 * Calculates the game-specific resultant vector:
 * R_raw = sum(w_i * r_i)
 * R = normalize(R_raw)
 * Explicitly treated as: "Resultant Vector — Game Puzzle Rule"
 */
export function calculateBlochResultant(spheres: BlochSphereState[]): Vector3 {
  if (!spheres || spheres.length === 0) {
    return { x: 0, y: 0, z: 1 };
  }

  let rx = 0;
  let ry = 0;
  let rz = 0;

  for (const s of spheres) {
    const v = sphericalToCartesian(s.theta, s.phi);
    const w = typeof s.weight === 'number' && !isNaN(s.weight) ? s.weight : 1;
    rx += v.x * w;
    ry += v.y * w;
    rz += v.z * w;
  }

  return normalize({ x: rx, y: ry, z: rz });
}

/**
 * Evaluates Track 1 game state according to universal evaluation rules.
 */
export function evaluateBlochLevel(input: BlochEvaluationInput): EvaluationResult {
  const { currentSpheres, targetTheta, targetPhi, toleranceDegrees, hasInteracted, initialSpheres } = input;

  // 1. Check if user hasn't meaningfully interacted yet
  if (!hasInteracted) {
    return {
      status: 'unstarted',
      score: 0,
      progress: 0,
      feedback: 'Click and drag any movable red vector (↻) on the Bloch sphere to begin aligning with the target.',
      details: { hasInteracted: false },
    };
  }

  // 2. Validate state integrity
  if (!Array.isArray(currentSpheres) || currentSpheres.length === 0 || currentSpheres.length > 4) {
    return {
      status: 'invalid',
      score: 0,
      progress: 0,
      feedback: 'Invalid sphere configuration: Track 1 requires between 1 and 4 spheres.',
      details: { error: 'invalid_sphere_count' },
    };
  }

  for (const s of currentSpheres) {
    if (isNaN(s.theta) || isNaN(s.phi) || isNaN(s.weight) || !isFinite(s.theta) || !isFinite(s.phi)) {
      return {
        status: 'invalid',
        score: 0,
        progress: 0,
        feedback: 'Invalid mathematical values detected in sphere coordinates.',
        details: { error: 'nan_or_infinite_angles' },
      };
    }
  }

  // Check if any movable sphere actually changed from initial
  let changed = false;
  if (initialSpheres && initialSpheres.length === currentSpheres.length) {
    for (let i = 0; i < currentSpheres.length; i++) {
      if (!currentSpheres[i].isFixed) {
        const dTheta = Math.abs(currentSpheres[i].theta - initialSpheres[i].theta);
        const dPhi = Math.abs(currentSpheres[i].phi - initialSpheres[i].phi);
        if (dTheta > 0.01 || dPhi > 0.01) {
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
      feedback: 'No change detected. Rotate the movable vector toward the target orientation.',
      details: { changed: false },
    };
  }

  // 3. Calculate Resultant and Target Vectors
  const resultant = calculateBlochResultant(currentSpheres);
  const target = sphericalToCartesian(targetTheta, targetPhi);

  if (!isValidVector3(resultant) || !isValidVector3(target)) {
    return {
      status: 'invalid',
      score: 0,
      progress: 0,
      feedback: 'Vector computation produced an invalid state vector.',
      details: { error: 'invalid_vector' },
    };
  }

  // 4. Compute Angular Error
  const angularError = angularDistanceDegrees(resultant, target);
  const probs = blochProbabilities(resultant);

  // Progress metric: 0 to 1
  const maxAcceptableError = 180;
  const rawProgress = Math.max(0, 1 - angularError / maxAcceptableError);
  const progress = Math.min(1, Math.max(0, Number(rawProgress.toFixed(3))));

  const isSuccess = angularError <= toleranceDegrees;

  if (isSuccess) {
    // Scoring based on precision (closer to 0 deg error gives higher score up to 1000)
    const precisionFactor = Math.max(0, 1 - angularError / toleranceDegrees);
    const score = Math.round(700 + 300 * precisionFactor);

    return {
      status: 'success',
      score,
      progress: 1.0,
      feedback: `✓ Aligned! The combined resultant matches target within ${angularError.toFixed(1)}° (tolerance: ±${toleranceDegrees}°).`,
      details: {
        angularError: Number(angularError.toFixed(2)),
        toleranceDegrees,
        resultant,
        target,
        measurementProbabilities: probs,
      },
    };
  }

  // Almost or Incorrect
  const isAlmost = angularError <= toleranceDegrees * 2.5;
  const feedback = isAlmost
    ? `Almost aligned! Current error is ${angularError.toFixed(1)}° (tolerance is ±${toleranceDegrees}°). Fine-tune the vector.`
    : `Your resultant is ${angularError.toFixed(1)}° away from the target (tolerance is ±${toleranceDegrees}°). Keep adjusting.`;

  return {
    status: 'incorrect',
    score: Math.round(progress * 400),
    progress,
    feedback,
    details: {
      angularError: Number(angularError.toFixed(2)),
      toleranceDegrees,
      resultant,
      target,
      isAlmost,
    },
  };
}
