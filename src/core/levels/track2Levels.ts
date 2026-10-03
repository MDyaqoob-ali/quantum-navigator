// Track 2 — Quantum Logic Gates Level Definitions

import type { LevelDefinition } from '../types';
import type { GateLevelDefinition } from '../engines/gateSimulationEngine';
import {
  createZeroState,
  createBasisState,
  applySingleQubitGate,
  applyCNOT,
  GATE_X,
  GATE_H,
} from '../math/statevector';
import type { StateVector } from '../math/statevector';
import { complex } from '../math/complex';

export interface GateLevelConfig extends LevelDefinition {
  gateLevel: GateLevelDefinition;
}

// Precompute target states
const targetStateT2L1 = applySingleQubitGate(createZeroState(1), 0, GATE_X); // |1>

// |-> state = (|0> - |1>)/sqrt(2)
const targetStateMinus: StateVector = {
  numQubits: 1,
  amplitudes: [complex(1 / Math.SQRT2, 0), complex(-1 / Math.SQRT2, 0)],
};

// |+> state = (|0> + |1>)/sqrt(2)
const targetStatePlus: StateVector = {
  numQubits: 1,
  amplitudes: [complex(1 / Math.SQRT2, 0), complex(1 / Math.SQRT2, 0)],
};

// Bell state |Phi+> = (|00> + |11>)/sqrt(2)
let bellState = createZeroState(2);
bellState = applySingleQubitGate(bellState, 0, GATE_H);
bellState = applyCNOT(bellState, 0, 1);

// State |101>
const target101 = createBasisState('101');

// 3-qubit GHZ state = (|000> + |111>)/sqrt(2)
let ghzState = createZeroState(3);
ghzState = applySingleQubitGate(ghzState, 0, GATE_H);
ghzState = applyCNOT(ghzState, 0, 1);
ghzState = applyCNOT(ghzState, 1, 2);

// Target for Toffoli: |111> from initial |110>
const target111 = createBasisState('111');

export const TRACK_2_LEVELS: GateLevelConfig[] = [
  {
    id: 't2_l1',
    trackId: 'quantum-gates',
    trackNumber: 2,
    levelNumber: 1,
    title: 'The Quantum NOT Gate',
    subtitle: 'Pauli-X Operation',
    description: 'Transform the initial state |0⟩ into the target state |1⟩ using the Pauli-X gate.',
    difficulty: 'Beginner',
    educationalConcept: 'The Pauli-X gate acts as a quantum bit-flip, mapping |0⟩ to |1⟩ and |1⟩ to |0⟩.',
    hints: [
      'The X gate flips the computational basis bit.',
      'Place the [X] gate on wire 0.',
      'Click "Run Circuit" to simulate the transformation.',
    ],
    initialState: { basis: '0', numQubits: 1 },
    targetState: targetStateT2L1,
    tolerance: 0.001,
    gateLevel: {
      numQubits: 1,
      initialBasis: '0',
      targetState: targetStateT2L1,
      targetDescription: '|1⟩',
      maxSteps: 3,
      optimalGateCount: 1,
      allowedGates: ['X', 'Z', 'H'],
    },
  },
  {
    id: 't2_l2',
    trackId: 'quantum-gates',
    trackNumber: 2,
    levelNumber: 2,
    title: 'The Phase Flip',
    subtitle: 'Pauli-Z Operation',
    description: 'The qubit starts in the |+⟩ superposition state. Use the Pauli-Z gate to flip its phase to |−⟩.',
    difficulty: 'Beginner',
    educationalConcept: 'The Pauli-Z gate leaves |0⟩ unchanged but imparts a -1 phase factor to |1⟩, converting |+⟩ = (|0⟩+|1⟩)/√2 into |−⟩ = (|0⟩−|1⟩)/√2.',
    hints: [
      'Notice the state is already in superposition (|0⟩+|1⟩)/√2.',
      'Applying Z alters the relative phase without changing the measurement probabilities.',
    ],
    initialState: { basis: '0', numQubits: 1 },
    targetState: targetStateMinus,
    tolerance: 0.001,
    gateLevel: {
      numQubits: 1,
      initialBasis: '0',
      targetState: targetStateMinus,
      targetDescription: '|−⟩ = (|0⟩ − |1⟩)/√2',
      maxSteps: 3,
      optimalGateCount: 2, // H then Z
      allowedGates: ['X', 'Z', 'H'],
    },
  },
  {
    id: 't2_l3',
    trackId: 'quantum-gates',
    trackNumber: 2,
    levelNumber: 3,
    title: 'Superposition Creation',
    subtitle: 'Hadamard Operation',
    description: 'Transform computational basis state |0⟩ into equal superposition state |+⟩ using the Hadamard gate.',
    difficulty: 'Beginner',
    educationalConcept: 'The Hadamard (H) gate creates an equal superposition of |0⟩ and |1⟩ from a definitive classical bit state.',
    hints: [
      'Place the [H] gate on Wire 0.',
      'Observe how both |0⟩ and |1⟩ have 50% probability after applying H.',
    ],
    initialState: { basis: '0', numQubits: 1 },
    targetState: targetStatePlus,
    tolerance: 0.001,
    gateLevel: {
      numQubits: 1,
      initialBasis: '0',
      targetState: targetStatePlus,
      targetDescription: '|+⟩ = (|0⟩ + |1⟩)/√2',
      maxSteps: 3,
      optimalGateCount: 1,
      allowedGates: ['X', 'Z', 'H'],
    },
  },
  {
    id: 't2_l4',
    trackId: 'quantum-gates',
    trackNumber: 2,
    levelNumber: 4,
    title: 'Dual Gate Sequencing',
    subtitle: 'Composing Unitary Gates',
    description: 'Starting from |0⟩, construct a circuit that produces the |−⟩ state. (Hint: combine H and Z or X and H).',
    difficulty: 'Intermediate',
    educationalConcept: 'Quantum gates are unitary operators that can be composed sequentially. Order of gates matters.',
    hints: [
      'H|1⟩ = |−⟩, so if you flip |0⟩ with X first, then apply H, you get |−⟩.',
      'Alternatively, apply H first to get |+⟩, then apply Z to flip the phase.',
    ],
    initialState: { basis: '0', numQubits: 1 },
    targetState: targetStateMinus,
    tolerance: 0.001,
    gateLevel: {
      numQubits: 1,
      initialBasis: '0',
      targetState: targetStateMinus,
      targetDescription: '|−⟩',
      maxSteps: 4,
      optimalGateCount: 2,
      allowedGates: ['X', 'Z', 'H'],
    },
  },
  {
    id: 't2_l5',
    trackId: 'quantum-gates',
    trackNumber: 2,
    levelNumber: 5,
    title: 'Quantum Entanglement',
    subtitle: 'The Bell State Circuit',
    description: 'Create the maximally entangled 2-qubit Bell state |Φ+⟩ = (|00⟩ + |11⟩)/√2 using H and CNOT.',
    difficulty: 'Intermediate',
    educationalConcept: 'Entanglement connects multiple qubits such that neither qubit can be described independently of the other.',
    hints: [
      'First apply H to Qubit 0 (Wire 0) to put it into superposition.',
      'Then place a CNOT gate with Control on Wire 0 and Target on Wire 1.',
    ],
    initialState: { basis: '00', numQubits: 2 },
    targetState: bellState,
    tolerance: 0.001,
    gateLevel: {
      numQubits: 2,
      initialBasis: '00',
      targetState: bellState,
      targetDescription: '|Φ+⟩ = (|00⟩ + |11⟩)/√2',
      maxSteps: 4,
      optimalGateCount: 2,
      allowedGates: ['X', 'Z', 'H', 'CNOT'],
    },
  },
  {
    id: 't2_l6',
    trackId: 'quantum-gates',
    trackNumber: 2,
    levelNumber: 6,
    title: 'Multi-Register Synthesis',
    subtitle: 'Targeting State |101⟩',
    description: 'Synthesize basis state |101⟩ across 3 qubits starting from |000⟩ with optimal gate count.',
    difficulty: 'Intermediate',
    educationalConcept: 'Manipulating individual wires in a multi-qubit register requires targeted single-qubit operations.',
    hints: [
      'Qubit 0 needs to become 1, Qubit 1 stays 0, Qubit 2 needs to become 1.',
      'Place X gates on Wire 0 and Wire 2.',
    ],
    initialState: { basis: '000', numQubits: 3 },
    targetState: target101,
    tolerance: 0.001,
    gateLevel: {
      numQubits: 3,
      initialBasis: '000',
      targetState: target101,
      targetDescription: '|101⟩',
      maxSteps: 4,
      optimalGateCount: 2,
      allowedGates: ['X', 'Z', 'H', 'CNOT'],
    },
  },
  {
    id: 't2_l7',
    trackId: 'quantum-gates',
    trackNumber: 2,
    levelNumber: 7,
    title: 'Controlled-Controlled-NOT',
    subtitle: 'The Toffoli Gate',
    description: 'Starting from |110⟩, activate the target wire using the Toffoli gate to reach |111⟩.',
    difficulty: 'Advanced',
    educationalConcept: 'The Toffoli gate is universal for classical reversible computing. It flips the target if and only if both control wires are |1⟩.',
    hints: [
      'The initial state is already |110⟩ (Wires 0 and 1 are 1).',
      'Add a Toffoli gate with controls on Wire 0 and 1, and target on Wire 2.',
    ],
    initialState: { basis: '110', numQubits: 3 },
    targetState: target111,
    tolerance: 0.001,
    gateLevel: {
      numQubits: 3,
      initialBasis: '110',
      targetState: target111,
      targetDescription: '|111⟩',
      maxSteps: 4,
      optimalGateCount: 1,
      allowedGates: ['X', 'Z', 'H', 'CNOT', 'Toffoli'],
    },
  },
  {
    id: 't2_l8',
    trackId: 'quantum-gates',
    trackNumber: 2,
    levelNumber: 8,
    title: 'The GHZ Tri-Entangled State',
    subtitle: '3-Qubit Greenberger–Horne–Zeilinger State',
    description: 'Synthesize the 3-qubit GHZ state (|000⟩ + |111⟩)/√2 starting from |000⟩.',
    difficulty: 'Expert',
    educationalConcept: 'GHZ states exhibit genuine tripartite entanglement, fundamental to quantum communication and error correction.',
    hints: [
      'Put Wire 0 in superposition with H.',
      'Entangle Wire 0 to Wire 1 with CNOT.',
      'Entangle Wire 1 to Wire 2 with another CNOT.',
    ],
    initialState: { basis: '000', numQubits: 3 },
    targetState: ghzState,
    tolerance: 0.001,
    gateLevel: {
      numQubits: 3,
      initialBasis: '000',
      targetState: ghzState,
      targetDescription: '|GHZ⟩ = (|000⟩ + |111⟩)/√2',
      maxSteps: 5,
      optimalGateCount: 3,
      allowedGates: ['X', 'Z', 'H', 'CNOT', 'Toffoli'],
    },
  },
];
