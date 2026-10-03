// Track 5 — Quantum Phase Estimation (Quantum Signal Scanner) Game Engine

import { EvaluationResult } from '../types';
import { Complex, complex, expI, magnitudeSq, add, scale } from '../math/complex';

export interface PhaseLevelDefinition {
  truePhase: number;       // In range [0.0, 1.0), e.g. 0.375 (3/8), 0.5 (1/2), 0.125 (1/8)
  estimationQubits: number;// Typically 3 qubits (8 bins) or 4 qubits (16 bins)
  tolerance: number;       // e.g. 0.05
  difficulty: string;
  description: string;
}

export interface PhaseEvaluationInput {
  playerEstimate: number; // e.g. 0.375
  level: PhaseLevelDefinition;
  hasInteracted: boolean;
  hasSampled: boolean;
}

export interface QPESimulationResult {
  probabilities: { bitString: string; decimalPhase: number; prob: number }[];
  mostProbablePhase: number;
  mostProbableBitString: string;
  theoreticalPeakProb: number;
}

/**
 * Simulates a full real Quantum Phase Estimation algorithm:
 * Target eigenstate |1> with eigenvalue e^(2*pi*i*phi).
 * Applies Hadamard superposition, controlled-U phase evolution, and inverse QFT.
 * Calculates exact mathematical probability distribution:
 * P(k) = |(1/N) * sum_{j=0}^{N-1} e^(2*pi*i*j*(phi - k/N))|^2
 */
export function simulateQPE(truePhase: number, numEstQubits = 3): QPESimulationResult {
  const N = 1 << numEstQubits;
  const probabilities: { bitString: string; decimalPhase: number; prob: number }[] = [];

  let maxProb = -1;
  let mostProbablePhase = 0;
  let mostProbableBitString = '';

  for (let k = 0; k < N; k++) {
    // Amplitude = (1/N) * sum_{j=0}^{N-1} exp(2 * pi * i * j * (phi - k/N))
    let sum = complex(0, 0);
    for (let j = 0; j < N; j++) {
      const angle = 2 * Math.PI * j * (truePhase - k / N);
      sum = add(sum, expI(angle));
    }
    const amp = scale(sum, 1 / N);
    const prob = Math.max(0, Math.min(1, magnitudeSq(amp)));

    const bitString = k.toString(2).padStart(numEstQubits, '0');
    const decimalPhase = k / N;

    probabilities.push({ bitString, decimalPhase, prob });

    if (prob > maxProb) {
      maxProb = prob;
      mostProbablePhase = decimalPhase;
      mostProbableBitString = bitString;
    }
  }

  return {
    probabilities,
    mostProbablePhase,
    mostProbableBitString,
    theoreticalPeakProb: maxProb,
  };
}

/**
 * Samples QPE measurement shots from the simulated probability distribution.
 */
export function sampleQPEMeasurements(
  simResult: QPESimulationResult,
  shots = 100
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of simResult.probabilities) {
    counts[item.bitString] = 0;
  }

  for (let i = 0; i < shots; i++) {
    const r = Math.random();
    let cum = 0;
    for (const item of simResult.probabilities) {
      cum += item.prob;
      if (r <= cum || item === simResult.probabilities[simResult.probabilities.length - 1]) {
        counts[item.bitString] = (counts[item.bitString] || 0) + 1;
        break;
      }
    }
  }

  return counts;
}

/**
 * Evaluates Track 5 state according to universal evaluation rules.
 */
export function evaluatePhaseLevel(input: PhaseEvaluationInput): EvaluationResult {
  const { playerEstimate, level, hasInteracted } = input;

  // 1. Unstarted check
  if (!hasInteracted) {
    return {
      status: 'unstarted',
      score: 0,
      progress: 0,
      feedback: 'Use the phase scanner dial to analyze the unknown quantum signal and submit your estimated phase φ.',
      details: { hasInteracted: false },
    };
  }

  // 2. Validate input
  if (isNaN(playerEstimate) || playerEstimate < 0 || playerEstimate > 1) {
    return {
      status: 'invalid',
      score: 0,
      progress: 0,
      feedback: 'Phase estimate must be a valid number between 0.000 and 1.000.',
      details: { playerEstimate },
    };
  }

  // 3. Mathematical comparison
  // Account for circular boundary modulo 1 (e.g. 0.99 vs 0.01 is delta 0.02)
  let rawDelta = Math.abs(playerEstimate - level.truePhase);
  if (rawDelta > 0.5) rawDelta = 1 - rawDelta;

  const error = Number(rawDelta.toFixed(4));
  const sim = simulateQPE(level.truePhase, level.estimationQubits);

  const maxError = 0.5;
  const progress = Math.min(1, Math.max(0, Number((1 - error / maxError).toFixed(3))));

  const isSuccess = error <= level.tolerance;

  if (isSuccess) {
    const precisionBonus = Math.max(0, 1 - error / level.tolerance);
    const score = Math.round(750 + 250 * precisionBonus);

    return {
      status: 'success',
      score,
      progress: 1.0,
      feedback: `✓ Signal resolved! Estimated φ = ${playerEstimate.toFixed(3)} is within ±${level.tolerance} of true phase φ = ${level.truePhase.toFixed(3)} (error: ${error.toFixed(4)}).`,
      details: {
        playerEstimate,
        truePhase: level.truePhase,
        error,
        tolerance: level.tolerance,
        mostProbableBitString: sim.mostProbableBitString,
        mostProbablePhase: sim.mostProbablePhase,
      },
    };
  }

  const isAlmost = error <= level.tolerance * 2.2;
  const feedback = isAlmost
    ? `Close estimate! Your estimate φ = ${playerEstimate.toFixed(3)} is near the peak but differs by ${error.toFixed(3)} (tolerance: ±${level.tolerance}). Read the binary readout histogram.`
    : `Your estimate φ = ${playerEstimate.toFixed(3)} differs from the target phase by ${error.toFixed(3)} (tolerance: ±${level.tolerance}). Scan the signal carefully.`;

  return {
    status: 'incorrect',
    score: Math.round(progress * 400),
    progress,
    feedback,
    details: {
      playerEstimate,
      truePhase: level.truePhase,
      error,
      tolerance: level.tolerance,
      isAlmost,
      mostProbableBitString: sim.mostProbableBitString,
      mostProbablePhase: sim.mostProbablePhase,
    },
  };
}
