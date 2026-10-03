// Track 4 — Quantum Error Correction (Quantum Shield) Level Definitions
// 10 Progressive Levels: Section 28 Specification

import type { LevelDefinition } from '../types';
import type { ErrorCorrectionLevelDefinition } from '../engines/errorCorrectionEngine';

export interface RepairLevelConfig extends LevelDefinition {
  errorLevel: ErrorCorrectionLevelDefinition;
}

export const TRACK_4_LEVELS: RepairLevelConfig[] = [
  // LEVEL 1 — WHY PROTECT?
  {
    id: 't4_l1',
    trackId: 'error-correction',
    trackNumber: 4,
    levelNumber: 1,
    title: 'Why Protect?',
    subtitle: 'The Fragility of Quantum Information',
    description: 'Quantum information is extremely fragile. Without protection, a stray environmental interaction can flip a qubit, destroying the message forever. Encode your message to begin protecting it.',
    difficulty: 'Beginner',
    educationalConcept: 'An unencoded quantum bit has no redundancy: if noise flips |0⟩ to |1⟩, the original state is irretrievably lost. Redundancy provides a reference frame for error recovery.',
    hints: [
      'Quantum states are delicate and easily corrupted by thermal noise or stray fields.',
      'To protect information, we must distribute a single logical qubit across multiple physical qubits.',
      'Click [ENCODE] to create the 3-qubit redundant code, send it through the channel, and verify.',
    ],
    initialState: { logical: 0, corruptedQubit: 1, syndrome: '11' },
    targetState: { logical: 0, state: '000' },
    tolerance: 0,
    errorLevel: {
      logicalValue: 0,
      errorType: 'bit-flip',
      corruptedQubitIndex: 1, // Q2
      codeType: 'bit-flip-code',
      description: 'Introductory bit flip on Q2 in logical |0_L⟩',
      hideErrorLocation: false,
      requireDiagnosticCheck: false,
      requireDiagnosticChoice: false,
    },
  },

  // LEVEL 2 — ADD REDUNDANCY
  {
    id: 't4_l2',
    trackId: 'error-correction',
    trackNumber: 4,
    levelNumber: 2,
    title: 'Add Redundancy',
    subtitle: 'The 3-Qubit Repetition Code',
    description: 'Turn a single logical qubit |0_L⟩ into a 3-qubit redundant codeword |000⟩. Observe how distributing information creates safety against single physical errors.',
    difficulty: 'Beginner',
    educationalConcept: 'Repetition codes map logical states to entangled multi-qubit codewords: |0_L⟩ = |000⟩ and |1_L⟩ = |111⟩. Parity measurements can then detect single qubit differences.',
    hints: [
      'A repetition code duplicates information into physical qubits: |0_L⟩ → |000⟩.',
      'If any single physical qubit flips (e.g. Q1), the remaining two qubits retain majority agreement.',
      'Encode the logical state, transmit through the channel, and repair the damaged qubit.',
    ],
    initialState: { logical: 0, corruptedQubit: 0, syndrome: '10' },
    targetState: { logical: 0, state: '000' },
    tolerance: 0,
    errorLevel: {
      logicalValue: 0,
      errorType: 'bit-flip',
      corruptedQubitIndex: 0, // Q1
      codeType: 'bit-flip-code',
      description: 'Bit flip on Q1 in logical |0_L⟩ = |000⟩',
      hideErrorLocation: false,
      requireDiagnosticCheck: false,
      requireDiagnosticChoice: false,
    },
  },

  // LEVEL 3 — SURVIVE ONE ERROR
  {
    id: 't4_l3',
    trackId: 'error-correction',
    trackNumber: 4,
    levelNumber: 3,
    title: 'Survive One Error',
    subtitle: 'Direct Bit-Flip Inversion',
    description: 'A known bit-flip error corrupted Qubit 2, changing |000⟩ into |010⟩. Select Q2 in the toolbox, apply Pauli-X, and verify that the logical state is restored.',
    difficulty: 'Beginner',
    educationalConcept: 'Pauli-X acts as a quantum bit-flip operator: X|0⟩ = |1⟩ and X|1⟩ = |0⟩. Applying X to the damaged qubit inverts the error, restoring code purity.',
    hints: [
      'Observe the physical register: Qubit 2 holds value 1, differing from Q1 and Q3.',
      'The Pauli-X gate inverts bit values: X|1⟩ = |0⟩.',
      'Select Q2 in the toolbox, select gate [X], click "Apply Repair", then verify.',
    ],
    initialState: { logical: 0, corruptedQubit: 1, syndrome: '11' },
    targetState: { logical: 0, state: '000' },
    tolerance: 0,
    errorLevel: {
      logicalValue: 0,
      errorType: 'bit-flip',
      corruptedQubitIndex: 1, // Q2
      codeType: 'bit-flip-code',
      description: 'Bit flip on Q2 in |000⟩',
      hideErrorLocation: false,
      requireDiagnosticCheck: false,
      requireDiagnosticChoice: false,
    },
  },

  // LEVEL 4 — FIND THE ERROR
  {
    id: 't4_l4',
    trackId: 'error-correction',
    trackNumber: 4,
    levelNumber: 4,
    title: 'Find the Error',
    subtitle: 'Introducing Parity Syndromes',
    description: 'The error location is hidden! You cannot simply inspect the qubits directly without collapsing quantum superpositions. Use the syndrome readout (S1, S2) to identify which qubit flipped.',
    difficulty: 'Intermediate',
    educationalConcept: 'Syndromes measure relative parity without measuring individual computational states: S1 = q1 ⊕ q2 and S2 = q2 ⊕ q3. Syndrome 10 isolates Q1.',
    hints: [
      'Look at the syndrome readout: S1 = 1 (mismatch between Q1 and Q2) and S2 = 0 (Q2 and Q3 match).',
      'Because Q2 matches Q3, both are healthy, meaning Q1 is the outlier bit that flipped.',
      'Select Q1 in the repair toolbox, apply [X], and run verification.',
    ],
    initialState: { logical: 0, corruptedQubit: 0, syndrome: '10' },
    targetState: { logical: 0, state: '000' },
    tolerance: 0,
    errorLevel: {
      logicalValue: 0,
      errorType: 'bit-flip',
      corruptedQubitIndex: 0, // Q1
      codeType: 'bit-flip-code',
      description: 'Hidden bit flip on Q1, syndrome 10',
      hideErrorLocation: true,
      requireDiagnosticCheck: false,
      requireDiagnosticChoice: false,
    },
  },

  // LEVEL 5 — SYNDROME DETECTIVE
  {
    id: 't4_l5',
    trackId: 'error-correction',
    trackNumber: 4,
    levelNumber: 5,
    title: 'Syndrome Detective',
    subtitle: 'Active Diagnostic Extraction',
    description: 'Run diagnostic checks [CHECK S1] and [CHECK S2] to extract parity clues. Then answer the diagnostic question to confirm your diagnosis before applying the repair.',
    difficulty: 'Intermediate',
    educationalConcept: 'Syndrome interpretation key: 00 = No Error, 10 = Q1 corrupted, 11 = Q2 corrupted, 01 = Q3 corrupted. Rigorous diagnosis prevents accidental wrong corrections.',
    hints: [
      'Click [CHECK S1] and [CHECK S2] to probe parity comparisons between adjacent qubits.',
      'Check the syndrome: if S1=0 and S2=1, Q2 agrees with Q1 but disagrees with Q3.',
      'Select Q3 in the diagnostic selector, select Q3 + [X] in the toolbox, apply, and verify.',
    ],
    initialState: { logical: 0, corruptedQubit: 2, syndrome: '01' },
    targetState: { logical: 0, state: '000' },
    tolerance: 0,
    errorLevel: {
      logicalValue: 0,
      errorType: 'bit-flip',
      corruptedQubitIndex: 2, // Q3
      codeType: 'bit-flip-code',
      description: 'Active syndrome probing on Q3',
      hideErrorLocation: true,
      requireDiagnosticCheck: true,
      requireDiagnosticChoice: true,
    },
  },

  // LEVEL 6 — REPAIR UNDER PRESSURE
  {
    id: 't4_l6',
    trackId: 'error-correction',
    trackNumber: 4,
    levelNumber: 6,
    title: 'Repair Under Pressure',
    subtitle: 'Limited Attempts & Shield Integrity',
    description: 'Logical message |1_L⟩ = |111⟩ was transmitted through volatile cosmic noise. You have only 2 repair attempts before the quantum shield collapses. Diagnose accurately on the first try!',
    difficulty: 'Intermediate',
    educationalConcept: 'Faulty corrections introduce additional entropy and can corrupt the entire code block. In quantum systems, corrections must be executed with high fidelity.',
    hints: [
      'The logical target is |1_L⟩ = |111⟩.',
      'Run the parity checks: syndrome 11 means both parities failed, which isolates Q2.',
      'Select Q2 in the toolbox, apply gate [X], and verify.',
    ],
    initialState: { logical: 1, corruptedQubit: 1, syndrome: '11' },
    targetState: { logical: 1, state: '111' },
    tolerance: 0,
    errorLevel: {
      logicalValue: 1,
      errorType: 'bit-flip',
      corruptedQubitIndex: 1, // Q2
      codeType: 'bit-flip-code',
      description: 'Pressure repair on Q2 in logical |111⟩',
      hideErrorLocation: true,
      maxAttempts: 2,
      requireDiagnosticCheck: true,
      requireDiagnosticChoice: true,
    },
  },

  // LEVEL 7 — X OR Z?
  {
    id: 't4_l7',
    trackId: 'error-correction',
    trackNumber: 4,
    levelNumber: 7,
    title: 'X or Z?',
    subtitle: 'Bit-Flip vs Phase-Flip Errors',
    description: 'Quantum noise can alter bit values (Pauli-X) OR quantum relative phase (Pauli-Z). A phase flip leaves the bit value as 0 or 1, but flips the phase sign (+ to -). Use Pauli-Z to repair phase errors.',
    difficulty: 'Advanced',
    educationalConcept: 'Pauli-Z acts as Z|0⟩ = |0⟩ and Z|1⟩ = -|1⟩. A bit flip (X) will not correct a phase flip (Z); each error type requires its exact conjugate operator.',
    hints: [
      'Inspect the error readout: a phase flip (Pauli-Z) has damaged the quantum register.',
      'Pauli-X inverts bits, but Pauli-Z inverts relative phase: Z applied to a phase-flipped qubit restores positive phase.',
      'Select the corrupted qubit, choose gate [Z] (not X!), apply repair, and verify.',
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
      hideErrorLocation: false,
      hideErrorType: false,
      requireDiagnosticCheck: true,
      requireDiagnosticChoice: true,
    },
  },

  // LEVEL 8 — PHASE REPAIR
  {
    id: 't4_l8',
    trackId: 'error-correction',
    trackNumber: 4,
    levelNumber: 8,
    title: 'Phase Repair & Basis Transformation',
    subtitle: 'H Z H = X Equivalence',
    description: 'In phase-flip repetition codes, qubits are stored in the Hadamard basis (|+⟩ and |-⟩). Notice how applying Hadamard gates transforms a phase flip into a bit flip: H Z H = X.',
    difficulty: 'Advanced',
    educationalConcept: 'Phase errors in computational basis behave identically to bit-flip errors in the Hadamard basis: H Z H = X and H X H = Z. This symmetry enables universal CSS quantum codes.',
    hints: [
      'In the phase code, Qubit 1 has encountered a phase corruption.',
      'The syndrome detects relative phase differences between adjacent qubits.',
      'Select Q1 and apply the [Z] phase gate to restore phase coherence.',
    ],
    initialState: { logical: 0, corruptedQubit: 0, syndrome: '10' },
    targetState: { logical: 0, state: '000' },
    tolerance: 0,
    errorLevel: {
      logicalValue: 0,
      errorType: 'phase-flip',
      corruptedQubitIndex: 0, // Q1
      codeType: 'phase-flip-code',
      description: 'Phase flip Z on Q1 with basis rotation',
      hideErrorLocation: true,
      hideErrorType: false,
      requireDiagnosticCheck: true,
      requireDiagnosticChoice: true,
    },
  },

  // LEVEL 9 — MIXED NOISE
  {
    id: 't4_l9',
    trackId: 'error-correction',
    trackNumber: 4,
    levelNumber: 9,
    title: 'Mixed Noise Investigation',
    subtitle: 'Unknown Noise Type & Location',
    description: 'Unknown noise has corrupted the channel. Neither the error location NOR the error type (bit flip vs phase flip) is disclosed. Investigate the diagnostics, determine the error, and execute repair.',
    difficulty: 'Expert',
    educationalConcept: 'Arbitrary quantum noise can be decomposed into linear combinations of Pauli operators {I, X, Y, Z}. Diagnosing Pauli-X and Pauli-Z separately enables complete error correction.',
    hints: [
      'Check both the syndrome parity values and the noise monitor indicator.',
      'Syndrome 01 indicates the third qubit (Q3) has suffered disparity.',
      'Examine whether bit parity or phase parity failed, select Q3, choose the matching gate ([X] or [Z]), and apply.',
    ],
    initialState: { logical: 1, corruptedQubit: 2, syndrome: '01' },
    targetState: { logical: 1, state: '111' },
    tolerance: 0,
    errorLevel: {
      logicalValue: 1,
      errorType: 'bit-flip',
      corruptedQubitIndex: 2, // Q3
      codeType: 'bit-flip-code',
      description: 'Mixed noise challenge on Q3 in logical |111⟩',
      hideErrorLocation: true,
      hideErrorType: true,
      requireDiagnosticCheck: true,
      requireDiagnosticChoice: true,
    },
  },

  // LEVEL 10 — QUANTUM SHIELD MASTER
  {
    id: 't4_l10',
    trackId: 'error-correction',
    trackNumber: 4,
    levelNumber: 10,
    title: 'Quantum Shield Master',
    subtitle: 'The Ultimate Fault-Tolerant Test',
    description: 'Full real-time challenge: Encode logical message, transmit through an unpredictable channel, extract parity syndromes, diagnose the corrupted qubit under 60-second time pressure, and restore!',
    difficulty: 'Expert',
    educationalConcept: 'Full fault-tolerant quantum computing requires continuous real-time execution of the entire QEC pipeline: protect, transmit, diagnose, correct, and verify before decoherence destroys the computation.',
    hints: [
      'Follow the full pipeline: Encode → Transmit → Diagnose → Correct → Verify.',
      'Check S1 and S2 immediately to isolate the corrupted qubit index.',
      'Select the diagnosed qubit, choose the corrective gate, click Apply, and verify before time runs out!',
    ],
    initialState: { logical: 0, corruptedQubit: 1, syndrome: '11' },
    targetState: { logical: 0, state: '000' },
    tolerance: 0,
    errorLevel: {
      logicalValue: 0,
      errorType: 'bit-flip',
      corruptedQubitIndex: 1, // Q2
      codeType: 'bit-flip-code',
      description: 'Quantum Shield Master challenge on Q2',
      hideErrorLocation: true,
      hideErrorType: false,
      maxAttempts: 2,
      timeLimitSeconds: 60,
      requireDiagnosticCheck: true,
      requireDiagnosticChoice: true,
    },
  },
];
