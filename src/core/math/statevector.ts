// Multi-Qubit Quantum State Vector Simulator

import type { Complex } from './complex';
import { complex, add, mul, conjugate, magnitudeSq, expI, isValidComplex } from './complex';

export interface StateVector {
  numQubits: number;
  amplitudes: Complex[];
}

export type Matrix2x2 = [
  [Complex, Complex],
  [Complex, Complex]
];

// Standard Single-Qubit Gate Matrices
export const GATE_I: Matrix2x2 = [
  [complex(1, 0), complex(0, 0)],
  [complex(0, 0), complex(1, 0)],
];

export const GATE_X: Matrix2x2 = [
  [complex(0, 0), complex(1, 0)],
  [complex(1, 0), complex(0, 0)],
];

export const GATE_Z: Matrix2x2 = [
  [complex(1, 0), complex(0, 0)],
  [complex(0, 0), complex(-1, 0)],
];

export const GATE_H: Matrix2x2 = [
  [complex(1 / Math.SQRT2, 0), complex(1 / Math.SQRT2, 0)],
  [complex(1 / Math.SQRT2, 0), complex(-1 / Math.SQRT2, 0)],
];

export function gatePhase(phi: number): Matrix2x2 {
  return [
    [complex(1, 0), complex(0, 0)],
    [complex(0, 0), expI(phi)],
  ];
}

/**
 * Creates a zero state |0...0> for N qubits (2^N amplitudes).
 */
export function createZeroState(numQubits: number): StateVector {
  const size = 1 << numQubits;
  const amplitudes: Complex[] = new Array(size);
  amplitudes[0] = complex(1, 0);
  for (let i = 1; i < size; i++) {
    amplitudes[i] = complex(0, 0);
  }
  return { numQubits, amplitudes };
}

/**
 * Creates a state initialized to a specific computational basis string e.g. "101"
 */
export function createBasisState(basisString: string): StateVector {
  const numQubits = basisString.length;
  const size = 1 << numQubits;
  const index = parseInt(basisString, 2);
  const amplitudes: Complex[] = new Array(size);
  for (let i = 0; i < size; i++) {
    amplitudes[i] = i === index ? complex(1, 0) : complex(0, 0);
  }
  return { numQubits, amplitudes };
}

/**
 * Validates state vector amplitudes for NaN, Infinity, and normalization.
 */
export function isValidStateVector(state: StateVector): boolean {
  if (!state || !Array.isArray(state.amplitudes) || state.numQubits < 1) return false;
  const expectedSize = 1 << state.numQubits;
  if (state.amplitudes.length !== expectedSize) return false;

  let totalProb = 0;
  for (let i = 0; i < expectedSize; i++) {
    const c = state.amplitudes[i];
    if (!isValidComplex(c)) return false;
    totalProb += magnitudeSq(c);
  }
  return Math.abs(totalProb - 1.0) < 1e-3;
}

/**
 * Normalizes a state vector in place.
 */
export function normalizeStateVector(state: StateVector): StateVector {
  let normSq = 0;
  for (const c of state.amplitudes) {
    normSq += magnitudeSq(c);
  }
  const norm = Math.sqrt(normSq);
  if (norm < 1e-9) {
    return createZeroState(state.numQubits);
  }
  const amplitudes = state.amplitudes.map(c => ({
    re: c.re / norm,
    im: c.im / norm,
  }));
  return { numQubits: state.numQubits, amplitudes };
}

/**
 * Applies a 2x2 unitary matrix to target qubit (0 = least significant bit / bottom wire, or standard convention).
 * We adopt Qubit 0 as Wire 0 (top wire) to Qubit (N-1) as Wire N-1.
 * Bit position: Qubit k corresponds to bit (numQubits - 1 - k).
 */
export function applySingleQubitGate(
  state: StateVector,
  targetQubit: number,
  gate: Matrix2x2
): StateVector {
  const n = state.numQubits;
  const size = 1 << n;
  const newAmplitudes: Complex[] = new Array(size);
  // Bitmask for target qubit (wire index: 0 is highest bit, n-1 is lowest bit)
  const bitPos = n - 1 - targetQubit;
  const mask = 1 << bitPos;

  const u00 = gate[0][0];
  const u01 = gate[0][1];
  const u10 = gate[1][0];
  const u11 = gate[1][1];

  for (let i = 0; i < size; i++) {
    if ((i & mask) === 0) {
      const j = i | mask;
      const a0 = state.amplitudes[i];
      const a1 = state.amplitudes[j];

      // new_a0 = u00*a0 + u01*a1
      newAmplitudes[i] = add(mul(u00, a0), mul(u01, a1));
      // new_a1 = u10*a0 + u11*a1
      newAmplitudes[j] = add(mul(u10, a0), mul(u11, a1));
    }
  }

  return { numQubits: n, amplitudes: newAmplitudes };
}

/**
 * Applies a controlled 2x2 gate with one or more control qubits.
 */
export function applyControlledGate(
  state: StateVector,
  controlQubits: number[],
  targetQubit: number,
  gate: Matrix2x2
): StateVector {
  const n = state.numQubits;
  const size = 1 << n;
  const newAmplitudes = [...state.amplitudes];

  const targetBitPos = n - 1 - targetQubit;
  const targetMask = 1 << targetBitPos;

  // Build control mask: all control bits must be 1
  let controlMask = 0;
  for (const c of controlQubits) {
    const bitPos = n - 1 - c;
    controlMask |= 1 << bitPos;
  }

  const u00 = gate[0][0];
  const u01 = gate[0][1];
  const u10 = gate[1][0];
  const u11 = gate[1][1];

  for (let i = 0; i < size; i++) {
    if ((i & targetMask) === 0) {
      const j = i | targetMask;
      // Check if both basis indices have all control bits active
      if ((i & controlMask) === controlMask) {
        const a0 = state.amplitudes[i];
        const a1 = state.amplitudes[j];

        newAmplitudes[i] = add(mul(u00, a0), mul(u01, a1));
        newAmplitudes[j] = add(mul(u10, a0), mul(u11, a1));
      }
    }
  }

  return { numQubits: n, amplitudes: newAmplitudes };
}

/**
 * Applies CNOT gate (control wire, target wire).
 */
export function applyCNOT(state: StateVector, control: number, target: number): StateVector {
  return applyControlledGate(state, [control], target, GATE_X);
}

/**
 * Applies Toffoli (CCNOT) gate (control1, control2, target).
 */
export function applyToffoli(
  state: StateVector,
  control1: number,
  control2: number,
  target: number
): StateVector {
  return applyControlledGate(state, [control1, control2], target, GATE_X);
}

/**
 * Calculates measurement probability distribution over all 2^N basis states.
 */
export function getProbabilities(state: StateVector): number[] {
  return state.amplitudes.map(c => magnitudeSq(c));
}

/**
 * Computes quantum state fidelity F = |<psi|phi>|^2.
 * Validates closeness regardless of global phase!
 */
export function stateFidelity(a: StateVector, b: StateVector): number {
  if (a.numQubits !== b.numQubits) return 0;
  let innerProduct = complex(0, 0);
  for (let i = 0; i < a.amplitudes.length; i++) {
    const cA = a.amplitudes[i];
    const cB = b.amplitudes[i];
    // innerProduct += conj(cA) * cB
    innerProduct = add(innerProduct, mul(conjugate(cA), cB));
  }
  return magnitudeSq(innerProduct);
}

/**
 * Samples measurement outcomes given shot count using true calculated probabilities.
 */
export function sampleMeasurements(
  state: StateVector,
  shots: number
): { counts: Record<string, number>; mostProbable: string } {
  const probs = getProbabilities(state);
  const n = state.numQubits;
  const counts: Record<string, number> = {};

  for (let shot = 0; shot < shots; shot++) {
    const r = Math.random();
    let cumProb = 0;
    let chosenIndex = 0;
    for (let i = 0; i < probs.length; i++) {
      cumProb += probs[i];
      if (r <= cumProb || i === probs.length - 1) {
        chosenIndex = i;
        break;
      }
    }
    const bitString = chosenIndex.toString(2).padStart(n, '0');
    counts[bitString] = (counts[bitString] || 0) + 1;
  }

  let mostProbable = '';
  let maxCount = -1;
  for (const [bits, cnt] of Object.entries(counts)) {
    if (cnt > maxCount) {
      maxCount = cnt;
      mostProbable = bits;
    }
  }

  return { counts, mostProbable };
}
