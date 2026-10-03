// Track 4 — Quantum Error Correction Level Definitions

import type { LevelDefinition } from '../types';
import type { ErrorCorrectionLevelDefinition } from '../engines/errorCorrectionEngine';

export interface RepairLevelConfig extends LevelDefinition {
  errorLevel: ErrorCorrectionLevelDefinition;
}

export const TRACK_4_LEVELS: RepairLevelConfig[] = [
  {
    id: 't4_l1',
    trackId: 'error-correction',
    trackNumber: 4,
    levelNumber: 1,
    title: 'The Single Bit-Flip',
    subtitle: 'Elementary Quantum Syndrome Diagnosis',
    description: 'Noise corrupted Qubit 2, flipping it from 0 to 1. Inspect the syndrome readout (11), select Q2, apply [X], and verify.',
    difficulty: 'Beginner',
    educationalConcept: 'In a 3-qubit repetition code (|0_L⟩ = |000⟩), syndrome parity measurements S1 = q1⊕q2 and S2 = q2⊕q3 detect errors without collapsing the logical state.',
    hints: [
      'Look at the syndrome indicators: S1=1, S2=1 (syndrome 11).',
      'Syndrome 11 means both parities failed, which uniquely points to Qubit 2 (Q2).',
      'Select Q2, click gate [X], then press "Verify & Repair".',
    ],
    initialState: { logical: 0, corruptedQubit: 1, syndrome: '11' },
    targetState: { logical: 0, state: '000' },
    tolerance: 0,
    errorLevel: {
      logicalValue: 0,
      errorType: 'bit-flip',
      corruptedQubitIndex: 1, // Q2
      codeType: 'bit-flip-code',
      description: 'Bit flip on Q2 in logical |0_L⟩',
    },
  },
  {
    id: 't4_l2',
    trackId: 'error-correction',
    trackNumber: 4,
    levelNumber: 2,
    title: 'Header Disparity',
    subtitle: 'Syndrome 10 Analysis',
    description: 'A stray cosmic ray corrupted Q1. The syndrome reads 10. Diagnose the error location and restore the register.',
    difficulty: 'Beginner',
    educationalConcept: 'Syndrome 10 means S1=1 (q1 ≠ q2) and S2=0 (q2 = q3). Therefore, Q1 is the outlier bit that flipped.',
    hints: [
      'Syndrome 10 indicates that only parity 1 failed.',
      'This uniquely isolates the error on Qubit 1 (Q1).',
      'Select Q1 and apply the bit-flip correction [X].',
    ],
    initialState: { logical: 0, corruptedQubit: 0, syndrome: '10' },
    targetState: { logical: 0, state: '000' },
    tolerance: 0,
    errorLevel: {
      logicalValue: 0,
      errorType: 'bit-flip',
      corruptedQubitIndex: 0, // Q1
      codeType: 'bit-flip-code',
      description: 'Bit flip on Q1 in logical |0_L⟩',
    },
  },
  {
    id: 't4_l3',
    trackId: 'error-correction',
    trackNumber: 4,
    levelNumber: 3,
    title: 'Tail Disparity',
    subtitle: 'Syndrome 01 Analysis',
    description: 'Syndrome panel signals 01 on logical state |0_L⟩. Trace which physical qubit failed and restore logical purity.',
    difficulty: 'Beginner',
    educationalConcept: 'Syndrome 01 means S1=0 (q1 = q2) and S2=1 (q2 ≠ q3). Therefore, Q3 is corrupted.',
    hints: [
      'S1=0 confirms Q1 and Q2 match. S2=1 shows Q2 and Q3 disagree.',
      'Thus, Qubit 3 (Q3) is the damaged qubit.',
      'Apply gate [X] to Q3.',
    ],
    initialState: { logical: 0, corruptedQubit: 2, syndrome: '01' },
    targetState: { logical: 0, state: '000' },
    tolerance: 0,
    errorLevel: {
      logicalValue: 0,
      errorType: 'bit-flip',
      corruptedQubitIndex: 2, // Q3
      codeType: 'bit-flip-code',
      description: 'Bit flip on Q3 in logical |0_L⟩',
    },
  },
  {
    id: 't4_l4',
    trackId: 'error-correction',
    trackNumber: 4,
    levelNumber: 4,
    title: 'Logical |1_L⟩ Inversion',
    subtitle: 'Protecting Excited Code Words',
    description: 'The logical state is |1_L⟩ = |111⟩. Thermal relaxation flipped one qubit to 0. Diagnose from syndrome 11.',
    difficulty: 'Intermediate',
    educationalConcept: 'Error correction protects arbitrary quantum codewords. Whether encoded in |0_L⟩ or |1_L⟩, the syndrome logic is invariant.',
    hints: [
      'Syndrome 11 still points to Qubit 2.',
      'Select Q2 and apply [X] to return it from 0 to 1.',
    ],
    initialState: { logical: 1, corruptedQubit: 1, syndrome: '11' },
    targetState: { logical: 1, state: '111' },
    tolerance: 0,
    errorLevel: {
      logicalValue: 1,
      errorType: 'bit-flip',
      corruptedQubitIndex: 1, // Q2
      codeType: 'bit-flip-code',
      description: 'Bit flip on Q2 in logical |1_L⟩ = |111⟩',
    },
  },
  {
    id: 't4_l5',
    trackId: 'error-correction',
    trackNumber: 4,
    levelNumber: 5,
    title: 'The Phase-Flip Challenge',
    subtitle: 'Z Errors & Basis Transformation',
    description: 'A dephasing error (Pauli-Z) has damaged a qubit. Diagnose the corrupted qubit and apply the phase correction [Z].',
    difficulty: 'Advanced',
    educationalConcept: 'Phase errors Z|0⟩ = |0⟩, Z|1⟩ = -|1⟩ do not change bit values but destroy quantum coherence. In the Hadamard basis, H Z H = X, converting phase errors into bit flips.',
    hints: [
      'Phase flips modify the phase sign (+/-).',
      'The syndrome detects which qubit suffered the relative phase shift.',
      'Select the diagnosed qubit and apply the [Z] correction gate.',
    ],
    initialState: { logical: 0, corruptedQubit: 1, syndrome: '11' },
    targetState: { logical: 0, state: '000' },
    tolerance: 0,
    errorLevel: {
      logicalValue: 0,
      errorType: 'phase-flip',
      corruptedQubitIndex: 1, // Q2
      codeType: 'phase-flip-code',
      description: 'Phase flip Z on Q2',
    },
  },
  {
    id: 't4_l6',
    trackId: 'error-correction',
    trackNumber: 4,
    levelNumber: 6,
    title: 'Master Quantum Repair',
    subtitle: 'Arbitrary Syndrome Synthesis',
    description: 'Unannounced noise affected an unknown qubit in the memory register. Read the syndrome, choose the correct gate ([X] or [Z]), and repair.',
    difficulty: 'Expert',
    educationalConcept: 'Fault-tolerant quantum computing relies on automated syndrome extraction loops executing in nanoseconds on real quantum processing units.',
    hints: [
      'Analyze the syndrome carefully: 10 indicates Q1, 11 indicates Q2, 01 indicates Q3.',
      'Verify whether bit flip or phase flip is reported in the syndrome monitor.',
    ],
    initialState: { logical: 1, corruptedQubit: 0, syndrome: '10' },
    targetState: { logical: 1, state: '111' },
    tolerance: 0,
    errorLevel: {
      logicalValue: 1,
      errorType: 'bit-flip',
      corruptedQubitIndex: 0, // Q1
      codeType: 'bit-flip-code',
      description: 'Master error diagnosis on Q1',
    },
  },
];
