// Track 5 — Quantum Phase Estimation (Quantum Radar) Engine
// Implements genuine state-vector simulation of QPE:
// 1. Uniform superposition via Hadamards on estimation register
// 2. Controlled-U^(2^k) phase accumulation: U|ψ⟩ = e^(2πiφ)|ψ⟩
// 3. Inverse Quantum Fourier Transform (QFT†)
// 4. Exact quantum measurement probability distribution
// 5. Probabilistic measurement shot sampling & binomial fluctuations
// 6. Binary fraction decoding: k / 2^n -> phase estimate
// 7. Radar signal spectrum & target evaluation

import { Complex, complex, expI, magnitudeSq, add, scale } from '../math/complex';
import { EvaluationResult, EvaluationStatus, TrackId } from '../types';

export interface RadarSignal {
  id: string;              // e.g. 'S1', 'S2', 'S3', 'S4'
  name: string;            // e.g. 'Alpha', 'Beta', 'Gamma', 'Delta'
  truePhase: number;       // Hidden during normal challenge mode! in [0.0, 1.0)
  knownRegion: string;     // Pedagogical clue e.g. '0.45–0.55' or 'UNKNOWN'
  frequencyBand?: string;  // e.g. 'X-Band', 'Ku-Band'
  description?: string;
}

export interface PhaseLevelDefinition {
  truePhase: number;
  estimationQubits: number;
  tolerance: number;
  difficulty: string;
  description: string;
}

export interface PhaseEvaluationInput {
  playerEstimate: number;
  level: PhaseLevelDefinition;
  hasInteracted: boolean;
  hasSampled: boolean;
}

export interface QPESimulationResult {
  numQubits: number;
  probabilities: { bitString: string; decimalPhase: number; prob: number }[];
  mostProbablePhase: number;
  mostProbableBitString: string;
  theoreticalPeakProb: number;
}

export interface QuantumRadarLevelConfig {
  id: string;
  trackId: TrackId;
  trackNumber: number;
  levelNumber: number;
  title: string;
  subtitle: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  educationalConcept: string;
  hints: string[];
  signals: RadarSignal[];
  targetSignalId: string;       // ID of target signal, e.g. 'S2'
  targetPhaseRange: [number, number]; // [min, max] acceptable range
  targetTolerance: number;      // e.g. ±0.02
  requiredPrecisionBits?: number;// Recommended or required bits (e.g. 3 or 4)
  allowedPrecisionBits: number[];// Available options, e.g. [2, 3, 4]
  allowedScans?: number;        // Scan budget for resource challenge levels
  timeLimit?: number;           // Seconds limit for challenge levels
  requiredConfidence?: number;  // e.g. 0.75 (75%)
  xpReward: number;
  starThresholds: {
    threeStars: number;
    fourStars: number;
    fiveStars: number;
  };
}

export interface QuantumRadarState {
  selectedSignalId: string | null;
  selectedPrecisionBits: number;   // 2, 3, or 4 bits
  hasRunQPE: boolean;
  measurementCounts: Record<string, number> | null;
  totalShotsSampled: number;
  playerPhaseEstimate: number | null;
  isLocked: boolean;
  scansUsed: number;
  timeRemaining?: number | null;
  isPracticeMode?: boolean;
}

export interface QuantumRadarEvaluationResult extends EvaluationResult {
  details: {
    selectedSignalId?: string | null;
    targetSignalId?: string;
    truePhase?: number;
    playerEstimate?: number | null;
    errorDelta?: number;
    targetTolerance?: number;
    isCorrectSignal?: boolean;
    isEstimateInRange?: boolean;
    precisionBits?: number;
    scansUsed?: number;
    scansRemaining?: number;
    confidence?: number;
    dominantBitString?: string;
    dominantPhase?: number;
    [key: string]: unknown;
  };
}

/**
 * Calculates circular distance modulo 1 for phases in [0, 1):
 * min(|a - b|, 1 - |a - b|)
 */
export function calculateCircularDistance(a: number, b: number): number {
  const diff = Math.abs((a % 1.0) - (b % 1.0));
  return Math.min(diff, 1.0 - diff);
}

/**
 * Simulates a full, physically rigorous Quantum Phase Estimation algorithm:
 * Register of n estimation qubits + eigenstate |ψ⟩ with U|ψ⟩ = e^(2πiφ)|ψ⟩.
 *
 * Mathematical derivation:
 * 1. |0>^(⊗n) -> (1/√N) * ∑_{j=0}^{N-1} |j> (Hadamard layer)
 * 2. Controlled-U^(2^k) imparts phase e^(2πiφj) to basis state |j>
 * 3. Inverse QFT maps |j> to (1/√N) * ∑_{k=0}^{N-1} e^(-2πi j k / N) |k>
 * 4. Overall amplitude of computational state |k>:
 *    α_k = (1/N) * ∑_{j=0}^{N-1} e^(2πi j (φ - k/N))
 * 5. P(k) = |α_k|^2
 */
export function simulateQPE(truePhase: number, numEstQubits = 3): QPESimulationResult {
  const n = Math.max(1, Math.min(6, Math.round(numEstQubits)));
  const N = 1 << n;
  const probabilities: { bitString: string; decimalPhase: number; prob: number }[] = [];

  let maxProb = -1;
  let mostProbablePhase = 0;
  let mostProbableBitString = '';

  for (let k = 0; k < N; k++) {
    let sum = complex(0, 0);
    for (let j = 0; j < N; j++) {
      const angle = 2 * Math.PI * j * (truePhase - k / N);
      sum = add(sum, expI(angle));
    }
    const amp = scale(sum, 1 / N);
    const prob = Math.max(0, Math.min(1, magnitudeSq(amp)));

    const bitString = k.toString(2).padStart(n, '0');
    const decimalPhase = k / N;

    probabilities.push({ bitString, decimalPhase, prob });

    if (prob > maxProb) {
      maxProb = prob;
      mostProbablePhase = decimalPhase;
      mostProbableBitString = bitString;
    }
  }

  // Renormalize slightly if floating point sum diverges by epsilon
  const sumProb = probabilities.reduce((acc, p) => acc + p.prob, 0);
  if (sumProb > 0 && Math.abs(sumProb - 1.0) > 1e-6) {
    probabilities.forEach(p => {
      p.prob /= sumProb;
    });
  }

  return {
    numQubits: n,
    probabilities,
    mostProbablePhase,
    mostProbableBitString,
    theoreticalPeakProb: maxProb,
  };
}

/**
 * Builds the explicit N x N unitary matrix for Inverse QFT (QFT†):
 * (QFT†)_{k, j} = (1/√N) * exp(-2πi * j * k / N)
 */
export function getInverseQFTMatrix(numQubits: number): Complex[][] {
  const N = 1 << numQubits;
  const matrix: Complex[][] = [];
  const factor = 1 / Math.sqrt(N);

  for (let k = 0; k < N; k++) {
    const row: Complex[] = [];
    for (let j = 0; j < N; j++) {
      const angle = -2 * Math.PI * j * k / N;
      row.push(scale(expI(angle), factor));
    }
    matrix.push(row);
  }
  return matrix;
}

/**
 * Verifies that Inverse QFT matrix is strictly unitary: QFT† * (QFT†)† = I
 */
export function verifyQFTUnitarity(numQubits: number): boolean {
  const N = 1 << numQubits;
  const iqft = getInverseQFTMatrix(numQubits);

  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      let dot = complex(0, 0);
      for (let k = 0; k < N; k++) {
        // (A)_{r, k} * conj((A)_{c, k})
        const a = iqft[r][k];
        const bConj = complex(iqft[c][k].re, -iqft[c][k].im);
        const prod = complex(a.re * bConj.re - a.im * bConj.im, a.re * bConj.im + a.im * bConj.re);
        dot = add(dot, prod);
      }
      const target = r === c ? 1.0 : 0.0;
      if (Math.abs(dot.re - target) > 1e-5 || Math.abs(dot.im) > 1e-5) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Samples QPE measurement shots from the simulated probability distribution.
 * Frequencies probabilistically fluctuate around theoretical probabilities.
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
 * Converts bitstring b_1 b_2 ... b_n to binary fraction decimal:
 * integer(bitstring) / 2^n
 */
export function binaryFractionToPhase(bitString: string): number {
  if (!bitString) return 0;
  const k = parseInt(bitString, 2);
  if (isNaN(k)) return 0;
  return k / Math.pow(2, bitString.length);
}

/**
 * Converts decimal phase φ to closest n-bit bitstring representation
 */
export function phaseToBinaryFraction(phase: number, numQubits: number): string {
  const N = 1 << numQubits;
  const k = Math.round((phase % 1.0) * N) % N;
  return k.toString(2).padStart(numQubits, '0');
}

/**
 * Calculates educational estimation confidence based on shot count & distribution peak:
 * - Few shots (< 10): low confidence (30-50%)
 * - Medium shots (10-50): medium confidence (60-80%)
 * - High shots (50-100) + high dominant probability: high confidence (85-95%)
 */
export function calculateConfidence(
  totalShots: number,
  peakTheoreticalProb: number,
  observedPeakCount: number
): number {
  if (totalShots <= 0) return 0;

  // Empirical sample frequency of dominant peak
  const observedFreq = totalShots > 0 ? observedPeakCount / totalShots : 0;
  const consistency = 1 - Math.min(1, Math.abs(observedFreq - peakTheoreticalProb));

  // Shot saturation factor: sqrt(shots) / 10 saturates at 100 shots
  const shotFactor = Math.min(1.0, Math.sqrt(totalShots) / 10);

  // Peak clarity: how sharp the distribution is
  const sharpness = Math.min(1.0, peakTheoreticalProb * 1.15);

  const rawConfidence = (shotFactor * 0.5) + (sharpness * 0.3) + (consistency * 0.2);
  return Math.max(0.15, Math.min(0.98, Number(rawConfidence.toFixed(2))));
}

/**
 * Universal Evaluator for Quantum Radar (Track 5):
 * Evaluates player's selected signal, QPE run status, estimated phase, and mission constraints.
 */
export function evaluateQuantumRadarLevel(
  state: QuantumRadarState,
  config: QuantumRadarLevelConfig
): QuantumRadarEvaluationResult {
  // 1. Unstarted check: No signal selected or no interaction
  if (!state.selectedSignalId) {
    return {
      status: 'unstarted',
      score: 0,
      progress: 0,
      feedback: 'Select a quantum signal source from the radar spectrum to begin analysis.',
      details: { selectedSignalId: null },
    };
  }

  const selectedSignal = config.signals.find(s => s.id === state.selectedSignalId);
  if (!selectedSignal) {
    return {
      status: 'invalid',
      score: 0,
      progress: 0,
      feedback: `Selected signal ${state.selectedSignalId} is not recognized on the radar.`,
      details: { selectedSignalId: state.selectedSignalId },
    };
  }

  // 2. Incomplete check: Signal selected but QPE not executed or not locked
  if (!state.hasRunQPE || !state.measurementCounts) {
    return {
      status: 'incomplete',
      score: 0,
      progress: 0.25,
      feedback: `Signal ${selectedSignal.name} (${selectedSignal.id}) targeted. Run the QPE experiment to measure its phase spectrum.`,
      details: { selectedSignalId: selectedSignal.id, hasRunQPE: false },
    };
  }

  if (state.playerPhaseEstimate === null || !state.isLocked) {
    return {
      status: 'incomplete',
      score: 0,
      progress: 0.5,
      feedback: `Measurement complete! Analyze the distribution, estimate the hidden phase φ, and click "Lock Signal".`,
      details: {
        selectedSignalId: selectedSignal.id,
        hasRunQPE: true,
        playerEstimate: state.playerPhaseEstimate,
      },
    };
  }

  // 3. Invalid check: Validate phase value range and resource bounds
  const est = state.playerPhaseEstimate;
  if (isNaN(est) || est < 0 || est >= 1.0) {
    return {
      status: 'invalid',
      score: 0,
      progress: 0,
      feedback: 'Estimated phase must be a valid number between 0.000 and 0.999.',
      details: { playerEstimate: est },
    };
  }

  if (config.allowedScans && state.scansUsed > config.allowedScans) {
    return {
      status: 'invalid',
      score: 0,
      progress: 0,
      feedback: `Scan budget exceeded (${state.scansUsed}/${config.allowedScans}). Reset the level to try again.`,
      details: { scansUsed: state.scansUsed, allowedScans: config.allowedScans },
    };
  }

  // 4. Signal Match Check: Did the player target the required signal?
  const isCorrectSignal = selectedSignal.id === config.targetSignalId;
  const truePhase = selectedSignal.truePhase;
  const errorDelta = calculateCircularDistance(est, truePhase);

  // Check QPE dominant result
  const sim = simulateQPE(truePhase, state.selectedPrecisionBits);

  if (!isCorrectSignal) {
    return {
      status: 'incorrect',
      score: 100,
      progress: 0.35,
      feedback: `❌ Wrong signal! You locked onto ${selectedSignal.name} (${selectedSignal.id}, estimated φ ≈ ${est.toFixed(3)}). This signal does not meet the mission criteria.`,
      details: {
        selectedSignalId: selectedSignal.id,
        targetSignalId: config.targetSignalId,
        playerEstimate: est,
        isCorrectSignal: false,
        errorDelta,
        targetTolerance: config.targetTolerance,
      },
    };
  }

  // 5. Phase Accuracy Check
  const isEstimateInRange = errorDelta <= config.targetTolerance;

  // Confidence check (if required)
  const totalShots = state.totalShotsSampled;
  const peakCount = state.measurementCounts[sim.mostProbableBitString] || 0;
  const confidence = calculateConfidence(totalShots, sim.theoreticalPeakProb, peakCount);

  if (!isEstimateInRange) {
    const isAlmost = errorDelta <= config.targetTolerance * 2.0;
    const feedback = isAlmost
      ? `❌ Lock failed: Close estimate! Error is ±${errorDelta.toFixed(3)} (tolerance: ±${config.targetTolerance}). Fine-tune your estimate or increase estimation precision.`
      : `❌ Lock failed: Estimated phase φ = ${est.toFixed(3)} differs from signal phase by ${errorDelta.toFixed(3)} (tolerance: ±${config.targetTolerance}). Check the QPE readout peak.`;

    return {
      status: 'incorrect',
      score: Math.round(Math.max(100, (1 - errorDelta / 0.5) * 400)),
      progress: Math.max(0.4, 1 - errorDelta / 0.5),
      feedback,
      details: {
        selectedSignalId: selectedSignal.id,
        targetSignalId: config.targetSignalId,
        playerEstimate: est,
        errorDelta,
        targetTolerance: config.targetTolerance,
        isCorrectSignal: true,
        isEstimateInRange: false,
        confidence,
        dominantBitString: sim.mostProbableBitString,
        dominantPhase: sim.mostProbablePhase,
      },
    };
  }

  // 6. Success! All criteria met
  const precisionBonus = Math.max(0, 1 - errorDelta / config.targetTolerance);
  const resourceBonus = config.allowedScans ? Math.max(0, (config.allowedScans - state.scansUsed) * 25) : 50;
  const finalScore = Math.round(config.xpReward + 100 * precisionBonus + resourceBonus);

  return {
    status: 'success',
    score: finalScore,
    progress: 1.0,
    feedback: `✓ Signal Locked! Estimated phase φ = ${est.toFixed(3)} successfully locks onto ${selectedSignal.name} (true φ = ${truePhase.toFixed(3)}, error: ${errorDelta.toFixed(4)} within ±${config.targetTolerance}).`,
    details: {
      selectedSignalId: selectedSignal.id,
      targetSignalId: config.targetSignalId,
      playerEstimate: est,
      truePhase,
      errorDelta,
      targetTolerance: config.targetTolerance,
      isCorrectSignal: true,
      isEstimateInRange: true,
      confidence,
      dominantBitString: sim.mostProbableBitString,
      dominantPhase: sim.mostProbablePhase,
      precisionBits: state.selectedPrecisionBits,
      scansUsed: state.scansUsed,
    },
  };
}

/**
 * Legacy compatibility wrapper for existing tests and components:
 * Evaluates phase level using universal evaluation rules.
 */
export function evaluatePhaseLevel(input: PhaseEvaluationInput): EvaluationResult {
  const { playerEstimate, level, hasInteracted } = input;

  if (!hasInteracted) {
    return {
      status: 'unstarted',
      score: 0,
      progress: 0,
      feedback: 'Use the phase scanner dial to analyze the unknown quantum signal and submit your estimated phase φ.',
      details: { hasInteracted: false },
    };
  }

  if (isNaN(playerEstimate) || playerEstimate < 0 || playerEstimate > 1) {
    return {
      status: 'invalid',
      score: 0,
      progress: 0,
      feedback: 'Phase estimate must be a valid number between 0.000 and 1.000.',
      details: { playerEstimate },
    };
  }

  const rawDelta = calculateCircularDistance(playerEstimate, level.truePhase);
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
