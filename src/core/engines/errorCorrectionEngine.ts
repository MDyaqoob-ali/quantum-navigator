// Track 4 — Quantum Error Correction (Quantum Shield) Engine
// Core Experience: PROTECT → TRANSMIT → ENCOUNTER NOISE → DIAGNOSE → CORRECT → VERIFY

import { EvaluationResult } from '../types';

export type ErrorType = 'bit-flip' | 'phase-flip' | 'none';
export type CorrectionGate = 'X' | 'Z' | 'H';

export type QuantumShieldPhase =
  | 'message'    // Phase 1: create / receive message
  | 'encode'     // Phase 2: encode / protect with redundancy
  | 'transmit'   // Phase 3: transmit through noisy channel
  | 'noise'      // Phase 4: noise event corrupts physical qubit
  | 'diagnose'   // Phase 5: interactive syndrome check & diagnosis
  | 'repair'     // Phase 6: select qubit and corrective gate, apply
  | 'verify'     // Phase 7: verify restored quantum state
  | 'result';    // Phase 8: verified success or failure feedback

export interface QubitPhysicalState {
  index: number;      // 0, 1, 2 for Q1, Q2, Q3
  value: 0 | 1;       // Computational basis |0⟩ or |1⟩
  phaseSign: 1 | -1;  // +1 for |+⟩ / zero phase, -1 for |-⟩ / π phase
}

export interface ErrorCorrectionLevelDefinition {
  logicalValue: 0 | 1;
  errorType: ErrorType;
  corruptedQubitIndex: number; // -1 if none, or 0, 1, 2
  codeType: 'bit-flip-code' | 'phase-flip-code';
  description: string;
  hideErrorLocation?: boolean;
  hideErrorType?: boolean;
  maxAttempts?: number;
  timeLimitSeconds?: number;
  requireDiagnosticCheck?: boolean;
  requireDiagnosticChoice?: boolean;
}

export interface SyndromeResult {
  s1: 0 | 1; // q1 XOR q2
  s2: 0 | 1; // q2 XOR q3
  syndromeString: '00' | '10' | '11' | '01';
  indicatedQubitIndex: number; // -1 for none, 0 for Q1, 1 for Q2, 2 for Q3
}

export interface QuantumShieldState {
  logicalState: 0 | 1;
  encodedState: QubitPhysicalState[];
  noisyState: QubitPhysicalState[];
  repairedState: QubitPhysicalState[];
  errorType: ErrorType;
  errorLocation: number; // -1 for none, 0, 1, 2
  syndrome: SyndromeResult;
  selectedQubit: number | null;
  selectedOperation: CorrectionGate | null;
  playerDiagnosis: number | null; // 0 for Q1, 1 for Q2, 2 for Q3, -1 for none
  diagnosticChecks: { s1Checked: boolean; s2Checked: boolean };
  correctionHistory: Array<{ qubit: number; gate: CorrectionGate; timestamp: number }>;
  verificationResult: { verified: boolean; pass: boolean; message: string } | null;
  phase: QuantumShieldPhase;
  shieldIntegrity: number; // 0 to 100
  isApplied: boolean;
  hasVerified: boolean;
  attemptsUsed: number;
  timeRemaining?: number;
}

// Backwards-compatible action interface for existing legacy callers
export interface PlayerRepairAction {
  targetQubit: number | null;
  gate: CorrectionGate | null;
  applied: boolean;
}

export interface RepairEvaluationInput {
  level: ErrorCorrectionLevelDefinition;
  action: PlayerRepairAction;
  hasVerified: boolean;
}

/**
 * Encodes logical |0_L⟩ into 3 physical qubits |000⟩.
 */
export function encodeLogicalZero(): QubitPhysicalState[] {
  return [
    { index: 0, value: 0, phaseSign: 1 },
    { index: 1, value: 0, phaseSign: 1 },
    { index: 2, value: 0, phaseSign: 1 },
  ];
}

/**
 * Encodes logical |1_L⟩ into 3 physical qubits |111⟩.
 */
export function encodeLogicalOne(): QubitPhysicalState[] {
  return [
    { index: 0, value: 1, phaseSign: 1 },
    { index: 1, value: 1, phaseSign: 1 },
    { index: 2, value: 1, phaseSign: 1 },
  ];
}

/**
 * Encodes a logical value (0 or 1) into a 3-qubit repetition code.
 */
export function encodeLogicalState(
  logicalValue: 0 | 1,
  codeType: 'bit-flip-code' | 'phase-flip-code' = 'bit-flip-code'
): QubitPhysicalState[] {
  const base = logicalValue === 0 ? encodeLogicalZero() : encodeLogicalOne();
  if (codeType === 'phase-flip-code') {
    // In phase code, logical 0 is |+++>, logical 1 is |--->
    // In computational basis, |+> has value 0 with phaseSign +1, |-> has phaseSign -1
    return base.map(q => ({
      ...q,
      phaseSign: logicalValue === 0 ? 1 : -1,
    }));
  }
  return base;
}

/**
 * Applies a simulated bit flip (Pauli-X) to a target qubit.
 * X|0⟩ = |1⟩, X|1⟩ = |0⟩.
 */
export function applyBitFlip(qubits: QubitPhysicalState[], qubitIndex: number): QubitPhysicalState[] {
  const cloned = qubits.map(q => ({ ...q }));
  if (qubitIndex >= 0 && qubitIndex < cloned.length) {
    cloned[qubitIndex].value = (1 - cloned[qubitIndex].value) as 0 | 1;
  }
  return cloned;
}

/**
 * Applies a simulated phase flip (Pauli-Z) to a target qubit.
 * Z|0⟩ = |0⟩, Z|1⟩ = -|1⟩, or Z|+⟩ = |-⟩.
 */
export function applyPhaseFlip(
  qubits: QubitPhysicalState[],
  qubitIndex: number,
  codeType: 'bit-flip-code' | 'phase-flip-code' = 'bit-flip-code'
): QubitPhysicalState[] {
  const cloned = qubits.map(q => ({ ...q }));
  if (qubitIndex >= 0 && qubitIndex < cloned.length) {
    cloned[qubitIndex].phaseSign = (cloned[qubitIndex].phaseSign * -1) as 1 | -1;
    // In phase-flip repetition code, measuring in the Hadamard basis turns a phase flip into a bit flip:
    if (codeType === 'phase-flip-code') {
      cloned[qubitIndex].value = (1 - cloned[qubitIndex].value) as 0 | 1;
    }
  }
  return cloned;
}

/**
 * Injects channel noise into the encoded qubits based on level definition.
 */
export function applyChannelNoise(
  qubits: QubitPhysicalState[],
  errorType: ErrorType,
  corruptedQubitIndex: number,
  codeType: 'bit-flip-code' | 'phase-flip-code' = 'bit-flip-code'
): QubitPhysicalState[] {
  if (errorType === 'none' || corruptedQubitIndex < 0 || corruptedQubitIndex >= qubits.length) {
    return qubits.map(q => ({ ...q }));
  }
  if (errorType === 'bit-flip') {
    return applyBitFlip(qubits, corruptedQubitIndex);
  }
  if (errorType === 'phase-flip') {
    return applyPhaseFlip(qubits, corruptedQubitIndex, codeType);
  }
  return qubits.map(q => ({ ...q }));
}

/**
 * Calculates parity syndrome from actual physical qubit states:
 * S1 = q1 XOR q2
 * S2 = q2 XOR q3
 * Mapping:
 * 00 -> No error (-1)
 * 10 -> Qubit 1 (index 0)
 * 11 -> Qubit 2 (index 1)
 * 01 -> Qubit 3 (index 2)
 */
export function calculateSyndrome(
  qubits: QubitPhysicalState[],
  codeType: 'bit-flip-code' | 'phase-flip-code' = 'bit-flip-code'
): SyndromeResult {
  if (!qubits || qubits.length < 3) {
    return { s1: 0, s2: 0, syndromeString: '00', indicatedQubitIndex: -1 };
  }

  let q1: number, q2: number, q3: number;

  if (codeType === 'phase-flip-code') {
    // In phase code after basis rotation, syndrome checks phase disparity
    // If qubits are represented in bit values via Hadamard basis transformation:
    q1 = qubits[0].value;
    q2 = qubits[1].value;
    q3 = qubits[2].value;
  } else {
    q1 = qubits[0].value;
    q2 = qubits[1].value;
    q3 = qubits[2].value;
  }

  const s1 = (q1 ^ q2) as 0 | 1;
  const s2 = (q2 ^ q3) as 0 | 1;
  const syndromeString = `${s1}${s2}` as '00' | '10' | '11' | '01';

  const indicatedQubitIndex = identifyBitFlipLocation(syndromeString);

  return { s1, s2, syndromeString, indicatedQubitIndex };
}

/**
 * Maps syndrome string to physical qubit index:
 * '10' -> 0 (Q1)
 * '11' -> 1 (Q2)
 * '01' -> 2 (Q3)
 * '00' -> -1 (No error)
 */
export function identifyBitFlipLocation(syndromeString: string): number {
  if (syndromeString === '10') return 0; // Q1
  if (syndromeString === '11') return 1; // Q2
  if (syndromeString === '01') return 2; // Q3
  return -1; // 00 or invalid
}

/**
 * Applies a correction gate to the physical qubits.
 * Modifies the actual simulated state:
 * Gate X: flips bit value (X|0⟩ = |1⟩, X|1⟩ = |0⟩)
 * Gate Z: flips phase sign (Z|+⟩ = |-⟩, Z|1⟩ = -|1⟩)
 * Gate H: Hadamard basis transformation
 */
export function applyCorrection(
  qubits: QubitPhysicalState[],
  qubitIndex: number,
  gate: CorrectionGate
): QubitPhysicalState[] {
  const cloned = qubits.map(q => ({ ...q }));
  if (qubitIndex < 0 || qubitIndex >= cloned.length) {
    return cloned;
  }

  const q = cloned[qubitIndex];
  if (gate === 'X') {
    q.value = (1 - q.value) as 0 | 1;
  } else if (gate === 'Z') {
    q.phaseSign = (q.phaseSign * -1) as 1 | -1;
    // In phase code, Z restores phase disparity:
    q.value = (1 - q.value) as 0 | 1;
  } else if (gate === 'H') {
    // Basis rotation (HZH = X)
    q.value = (1 - q.value) as 0 | 1;
  }

  return cloned;
}

/**
 * Verifies whether the encoded state satisfies the target logical state and has syndrome 00.
 */
export function verifyEncodedState(
  qubits: QubitPhysicalState[],
  expectedLogical: 0 | 1,
  codeType: 'bit-flip-code' | 'phase-flip-code' = 'bit-flip-code'
): { isRestored: boolean; syndrome: string; currentState: string; targetState: string } {
  const syndrome = calculateSyndrome(qubits, codeType);
  const currentState = qubits.map(q => q.value).join('');
  const targetState = expectedLogical === 0 ? '000' : '111';

  const allMatchLogical = qubits.every(q => q.value === expectedLogical);
  const phasesHealthy = codeType !== 'phase-flip-code' || qubits.every(q => q.phaseSign === 1 || expectedLogical === 1);
  const isRestored = syndrome.syndromeString === '00' && allMatchLogical && phasesHealthy;

  return {
    isRestored,
    syndrome: syndrome.syndromeString,
    currentState,
    targetState,
  };
}

/**
 * Quick predicate checking whether the quantum shield repair is solved.
 */
export function isQuantumShieldSolved(
  qubits: QubitPhysicalState[],
  expectedLogical: 0 | 1,
  codeType: 'bit-flip-code' | 'phase-flip-code' = 'bit-flip-code'
): boolean {
  return verifyEncodedState(qubits, expectedLogical, codeType).isRestored;
}

/**
 * Evaluates Track 4 Quantum Shield state according to Section 55 & universal evaluation rules.
 */
export function evaluateQuantumShield(
  state: QuantumShieldState,
  level: ErrorCorrectionLevelDefinition
): EvaluationResult {
  // 1. Unstarted check: player has not verified
  if (!state.hasVerified && !state.verificationResult) {
    return {
      status: 'unstarted',
      score: 0,
      progress: 0,
      feedback: 'Protect the message, send through the noisy channel, diagnose the syndrome, apply the repair, and verify.',
      details: { phase: state.phase },
    };
  }

  // 2. Diagnostic checks incomplete (if required)
  if (level.requireDiagnosticCheck) {
    if (!state.diagnosticChecks.s1Checked || !state.diagnosticChecks.s2Checked) {
      return {
        status: 'incomplete',
        score: 0,
        progress: 0.2,
        feedback: 'Incomplete diagnostics: You must run both syndrome parity checks [CHECK S1] and [CHECK S2] before repairing.',
        details: { missing: 'diagnosticChecks', checks: state.diagnosticChecks },
      };
    }
  }

  // 3. Diagnostic choice incomplete (if required)
  if (level.requireDiagnosticChoice) {
    if (state.playerDiagnosis === null) {
      return {
        status: 'incomplete',
        score: 0,
        progress: 0.3,
        feedback: 'Incomplete diagnosis: Select which qubit is inconsistent (Q1, Q2, or Q3) in the diagnostic console.',
        details: { missing: 'playerDiagnosis' },
      };
    }

    if (state.playerDiagnosis !== level.corruptedQubitIndex && level.corruptedQubitIndex >= 0) {
      const chosenQ = `Q${state.playerDiagnosis + 1}`;
      const actualQ = `Q${level.corruptedQubitIndex + 1}`;
      return {
        status: 'incorrect',
        score: 100,
        progress: 0.3,
        feedback: `❌ INCORRECT DIAGNOSIS: You identified ${chosenQ} as corrupted, but the syndrome parity points to ${actualQ}. No repair can be accepted until diagnosed accurately.`,
        details: {
          chosenDiagnosis: chosenQ,
          expectedDiagnosis: actualQ,
          syndrome: state.syndrome.syndromeString,
        },
      };
    }
  }

  // 4. Missing qubit selection
  if (state.selectedQubit === null && level.errorType !== 'none') {
    return {
      status: 'incomplete',
      score: 0,
      progress: 0.4,
      feedback: 'No qubit selected. Choose Q1, Q2, or Q3 in the Repair Toolbox.',
      details: { missing: 'selectedQubit' },
    };
  }

  // 5. Missing operation
  if (state.selectedOperation === null && level.errorType !== 'none') {
    return {
      status: 'incomplete',
      score: 0,
      progress: 0.5,
      feedback: 'No correction operation selected. Select gate [X] for bit flip or [Z] for phase flip.',
      details: { missing: 'selectedOperation' },
    };
  }

  // 6. Not applied
  if (!state.isApplied && level.errorType !== 'none') {
    const qName = state.selectedQubit !== null ? `Q${state.selectedQubit + 1}` : '?';
    return {
      status: 'incomplete',
      score: 0,
      progress: 0.6,
      feedback: `You selected [${state.selectedOperation}] on ${qName}. Click "Apply Repair" to execute the operation on the quantum memory.`,
      details: { missing: 'isApplied' },
    };
  }

  // 7. Verify actual restored state
  const verification = verifyEncodedState(state.repairedState, level.logicalValue, level.codeType);
  const targetStateStr = verification.targetState;
  const actualStateStr = verification.currentState;
  const chosenQubitName = state.selectedQubit !== null ? `Q${state.selectedQubit + 1}` : 'None';
  const targetQubitName = level.corruptedQubitIndex >= 0 ? `Q${level.corruptedQubitIndex + 1}` : 'None';

  if (verification.isRestored) {
    const logicalSymbol = level.logicalValue === 0 ? '|0_L⟩' : '|1_L⟩';
    return {
      status: 'success',
      score: 1000,
      progress: 1.0,
      feedback: `✓ QUANTUM INFORMATION RESTORED: Encoded message restored to target state ${logicalSymbol} = |${targetStateStr}⟩. Parity syndrome: 00. Logical integrity: VALID.`,
      details: {
        originalLogical: logicalSymbol,
        targetState: targetStateStr,
        repairedState: actualStateStr,
        syndrome: verification.syndrome,
        correctedQubit: chosenQubitName,
        gateUsed: state.selectedOperation,
        verified: true,
      },
    };
  }

  // 8. Detailed pedagogical feedback on repair failure (Sections 20, 21, 37)
  let feedback = '';
  if (state.selectedQubit !== level.corruptedQubitIndex) {
    feedback = `❌ REPAIR FAILED: Player Action: [${state.selectedOperation}] on ${chosenQubitName}. Actual Result: |${actualStateStr}⟩, Target: |${targetStateStr}⟩. ${chosenQubitName} was modified, but the syndrome indicated ${targetQubitName}.`;
  } else if (level.errorType === 'bit-flip' && state.selectedOperation !== 'X') {
    feedback = `❌ WRONG CORRECTION: The diagnosed error was a bit flip, while [${state.selectedOperation}] applies a phase flip. Bit flips require Pauli-X.`;
  } else if (level.errorType === 'phase-flip' && state.selectedOperation !== 'Z') {
    feedback = `❌ WRONG CORRECTION: The diagnosed error was a phase flip, while [${state.selectedOperation}] applies a bit flip. Phase flips require Pauli-Z.`;
  } else {
    feedback = `❌ REPAIR FAILED: Actual result: |${actualStateStr}⟩, Target: |${targetStateStr}⟩. Parity syndrome remains ${verification.syndrome}. Quantum information is not restored.`;
  }

  return {
    status: 'incorrect',
    score: 250,
    progress: 0.5,
    feedback,
    details: {
      playerAction: `[${state.selectedOperation}] on ${chosenQubitName}`,
      actualResult: actualStateStr,
      target: targetStateStr,
      syndrome: verification.syndrome,
      verified: false,
    },
  };
}

/**
 * Backward-compatible evaluation function for existing tests and legacy wrappers.
 */
export function evaluateRepairLevel(input: RepairEvaluationInput): EvaluationResult {
  const { level, action, hasVerified } = input;

  // Generate initial corrupted state
  const encoded = encodeLogicalState(level.logicalValue, level.codeType);
  const noisy = applyChannelNoise(encoded, level.errorType, level.corruptedQubitIndex, level.codeType);
  const syndrome = calculateSyndrome(noisy, level.codeType);

  // Apply repair if requested
  let repaired = noisy.map(q => ({ ...q }));
  if (action.applied && action.targetQubit !== null && action.gate !== null) {
    repaired = applyCorrection(noisy, action.targetQubit, action.gate);
  }

  const shieldState: QuantumShieldState = {
    logicalState: level.logicalValue,
    encodedState: encoded,
    noisyState: noisy,
    repairedState: repaired,
    errorType: level.errorType,
    errorLocation: level.corruptedQubitIndex,
    syndrome,
    selectedQubit: action.targetQubit,
    selectedOperation: action.gate,
    playerDiagnosis: level.requireDiagnosticChoice ? action.targetQubit : null,
    diagnosticChecks: { s1Checked: true, s2Checked: true },
    correctionHistory: [],
    verificationResult: hasVerified ? { verified: true, pass: false, message: '' } : null,
    phase: hasVerified ? 'verify' : 'repair',
    shieldIntegrity: 80,
    isApplied: action.applied,
    hasVerified,
    attemptsUsed: 1,
  };

  return evaluateQuantumShield(shieldState, level);
}

/**
 * Generates initial corrupted physical state (legacy support for tests).
 */
export function generateCorruptedState(level: ErrorCorrectionLevelDefinition): QubitPhysicalState[] {
  const encoded = encodeLogicalState(level.logicalValue, level.codeType);
  return applyChannelNoise(encoded, level.errorType, level.corruptedQubitIndex, level.codeType);
}

/**
 * Applies repair to qubits (legacy support for tests).
 */
export function applyRepairToQubits(
  qubits: QubitPhysicalState[],
  action: PlayerRepairAction
): QubitPhysicalState[] {
  if (action.targetQubit === null || action.gate === null || !action.applied) {
    return qubits.map(q => ({ ...q }));
  }
  return applyCorrection(qubits, action.targetQubit, action.gate);
}
