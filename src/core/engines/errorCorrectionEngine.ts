// Track 4 — Quantum Error Correction (Quantum Repair Shop) Game Engine

import { EvaluationResult } from '../types';

export type ErrorType = 'bit-flip' | 'phase-flip' | 'none';
export type CorrectionGate = 'X' | 'Z' | 'H';

export interface QubitPhysicalState {
  index: number; // 0, 1, 2 for Q1, Q2, Q3
  value: 0 | 1;  // Computational basis state
  phaseSign: 1 | -1; // 1 for +, -1 for -
}

export interface ErrorCorrectionLevelDefinition {
  logicalValue: 0 | 1;
  errorType: ErrorType;
  corruptedQubitIndex: number; // -1 if none, or 0, 1, 2
  codeType: 'bit-flip-code' | 'phase-flip-code';
  description: string;
}

export interface PlayerRepairAction {
  targetQubit: number | null; // 0, 1, 2
  gate: CorrectionGate | null; // 'X', 'Z', 'H'
  applied: boolean;
}

export interface RepairEvaluationInput {
  level: ErrorCorrectionLevelDefinition;
  action: PlayerRepairAction;
  hasVerified: boolean;
}

export interface SyndromeResult {
  s1: 0 | 1; // q1 XOR q2
  s2: 0 | 1; // q2 XOR q3
  syndromeString: string; // "00", "10", "11", "01"
  indicatedQubitIndex: number; // -1 for none, 0 for Q1, 1 for Q2, 2 for Q3
}

/**
 * Calculates syndromes from actual physical qubit values:
 * S1 = q1 XOR q2
 * S2 = q2 XOR q3
 */
export function calculateSyndrome(qubits: QubitPhysicalState[]): SyndromeResult {
  if (!qubits || qubits.length < 3) {
    return { s1: 0, s2: 0, syndromeString: '00', indicatedQubitIndex: -1 };
  }
  const q1 = qubits[0].value;
  const q2 = qubits[1].value;
  const q3 = qubits[2].value;

  const s1 = (q1 ^ q2) as 0 | 1;
  const s2 = (q2 ^ q3) as 0 | 1;
  const syndromeString = `${s1}${s2}`;

  let indicatedQubitIndex = -1;
  if (syndromeString === '10') indicatedQubitIndex = 0; // Q1
  else if (syndromeString === '11') indicatedQubitIndex = 1; // Q2
  else if (syndromeString === '01') indicatedQubitIndex = 2; // Q3

  return { s1, s2, syndromeString, indicatedQubitIndex };
}

/**
 * Generates initial corrupted physical state based on level definition.
 */
export function generateCorruptedState(level: ErrorCorrectionLevelDefinition): QubitPhysicalState[] {
  const baseValue = level.logicalValue;
  const qubits: QubitPhysicalState[] = [
    { index: 0, value: baseValue, phaseSign: 1 },
    { index: 1, value: baseValue, phaseSign: 1 },
    { index: 2, value: baseValue, phaseSign: 1 },
  ];

  if (level.errorType === 'bit-flip' && level.corruptedQubitIndex >= 0 && level.corruptedQubitIndex < 3) {
    qubits[level.corruptedQubitIndex].value = (1 - baseValue) as 0 | 1;
  } else if (level.errorType === 'phase-flip' && level.corruptedQubitIndex >= 0 && level.corruptedQubitIndex < 3) {
    qubits[level.corruptedQubitIndex].phaseSign = -1;
    // In phase-flip repetition code, qubits are encoded in |+> / |-> basis:
    // A Z error turns |+> into |->, which when measured in X basis behaves like a bit flip.
    if (level.codeType === 'phase-flip-code') {
      qubits[level.corruptedQubitIndex].value = (1 - baseValue) as 0 | 1;
    }
  }

  return qubits;
}

/**
 * Applies a repair gate to a physical qubit state.
 */
export function applyRepairToQubits(
  qubits: QubitPhysicalState[],
  action: PlayerRepairAction
): QubitPhysicalState[] {
  const updated = qubits.map(q => ({ ...q }));
  if (action.targetQubit === null || action.gate === null || !action.applied) {
    return updated;
  }

  const q = updated[action.targetQubit];
  if (!q) return updated;

  if (action.gate === 'X') {
    q.value = (1 - q.value) as 0 | 1;
  } else if (action.gate === 'Z') {
    q.phaseSign = (q.phaseSign * -1) as 1 | -1;
    q.value = (1 - q.value) as 0 | 1;
  } else if (action.gate === 'H') {
    // Basis toggle
    q.value = (1 - q.value) as 0 | 1;
  }

  return updated;
}

/**
 * Evaluates Track 4 according to universal evaluation rules.
 */
export function evaluateRepairLevel(input: RepairEvaluationInput): EvaluationResult {
  const { level, action, hasVerified } = input;

  // 1. Unstarted check
  if (!hasVerified) {
    return {
      status: 'unstarted',
      score: 0,
      progress: 0,
      feedback: 'Read the syndrome panel, diagnose which qubit is corrupted, select the repair gate, and click "Verify & Repair".',
      details: { hasVerified: false },
    };
  }

  // 2. Incomplete inputs
  if (action.targetQubit === null && level.errorType !== 'none') {
    return {
      status: 'incomplete',
      score: 0,
      progress: 0.1,
      feedback: 'No qubit selected. Select Q1, Q2, or Q3 based on the syndrome readout.',
      details: { missing: 'targetQubit' },
    };
  }

  if (action.gate === null && level.errorType !== 'none') {
    return {
      status: 'incomplete',
      score: 0,
      progress: 0.1,
      feedback: 'No correction gate selected. Choose [X], [Z], or [H] to apply the correction.',
      details: { missing: 'gate' },
    };
  }

  // 3. Simulate corruption and player's correction
  const initialCorrupted = generateCorruptedState(level);
  const syndrome = calculateSyndrome(initialCorrupted);
  const repairedQubits = applyRepairToQubits(initialCorrupted, action);

  // Check if repaired qubits match original logical state
  const targetVal = level.logicalValue;
  const isRestored = repairedQubits.every(
    q => q.value === targetVal && (level.errorType !== 'phase-flip' || q.phaseSign === 1)
  );

  const syndromeText = syndrome.syndromeString;
  const targetQubitName = `Q${(level.corruptedQubitIndex + 1)}`;
  const chosenQubitName = action.targetQubit !== null ? `Q${action.targetQubit + 1}` : 'None';

  if (isRestored) {
    return {
      status: 'success',
      score: 1000,
      progress: 1.0,
      feedback: `✓ Memory restored! Syndrome ${syndromeText} correctly mapped to ${targetQubitName}. The ${action.gate} gate repaired the corruption.`,
      details: {
        syndrome: syndromeText,
        corruptedQubit: targetQubitName,
        correctedQubit: chosenQubitName,
        gateUsed: action.gate,
        repairedState: repairedQubits.map(q => q.value).join(''),
      },
    };
  }

  // Diagnostic feedback on wrong answer
  let feedback = '';
  if (action.targetQubit !== level.corruptedQubitIndex) {
    feedback = `Syndrome ${syndromeText} identifies ${targetQubitName}, but your correction was applied to ${chosenQubitName}. Memory remains corrupted.`;
  } else {
    feedback = `Target qubit ${chosenQubitName} was correctly diagnosed, but gate [${action.gate}] did not repair the ${level.errorType}. Try the appropriate conjugate gate.`;
  }

  return {
    status: 'incorrect',
    score: 250,
    progress: 0.3,
    feedback,
    details: {
      syndrome: syndromeText,
      expectedQubit: targetQubitName,
      chosenQubit: chosenQubitName,
      gateUsed: action.gate,
      actualState: repairedQubits.map(q => q.value).join(''),
    },
  };
}
