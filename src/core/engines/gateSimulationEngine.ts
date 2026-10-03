// Track 2 — Quantum Logic Gates Game Engine

import { EvaluationResult } from '../types';
import {
  StateVector,
  createBasisState,
  createZeroState,
  applySingleQubitGate,
  applyCNOT,
  applyToffoli,
  stateFidelity,
  getProbabilities,
  GATE_X,
  GATE_Z,
  GATE_H,
  isValidStateVector,
} from '../math/statevector';

export type GateType = 'X' | 'Z' | 'H' | 'CNOT' | 'Toffoli';

export interface PlacedGate {
  id: string;
  type: GateType;
  targetWire: number;
  controlWires?: number[]; // 1 control for CNOT, 2 for Toffoli
  step: number;            // Time slot column (0-indexed)
}

export interface GateLevelDefinition {
  numQubits: number;
  initialBasis: string;     // e.g. "0", "00", "000"
  targetState: StateVector; // Desired target state vector
  targetDescription: string;// Human readable label e.g. "|1>", "|+>", "|Φ+> = (|00>+|11>)/√2"
  maxSteps: number;
  optimalGateCount?: number;
  allowedGates: GateType[];
}

export interface GateEvaluationInput {
  circuit: PlacedGate[];
  level: GateLevelDefinition;
  hasRun: boolean;
}

export interface CircuitSimulationResult {
  initialState: StateVector;
  finalState: StateVector;
  intermediateStates: StateVector[];
  probabilities: number[];
  fidelity: number;
}

/**
 * Simulates a circuit step by step on the initial basis state.
 */
export function simulateCircuit(
  circuit: PlacedGate[],
  numQubits: number,
  initialBasis: string
): CircuitSimulationResult {
  let currentState = createBasisState(initialBasis);
  const intermediateStates: StateVector[] = [currentState];

  // Sort gates chronologically by time step
  const sortedGates = [...circuit].sort((a, b) => a.step - b.step);

  for (const gate of sortedGates) {
    if (gate.type === 'X') {
      currentState = applySingleQubitGate(currentState, gate.targetWire, GATE_X);
    } else if (gate.type === 'Z') {
      currentState = applySingleQubitGate(currentState, gate.targetWire, GATE_Z);
    } else if (gate.type === 'H') {
      currentState = applySingleQubitGate(currentState, gate.targetWire, GATE_H);
    } else if (gate.type === 'CNOT' && gate.controlWires && gate.controlWires.length >= 1) {
      currentState = applyCNOT(currentState, gate.controlWires[0], gate.targetWire);
    } else if (gate.type === 'Toffoli' && gate.controlWires && gate.controlWires.length >= 2) {
      currentState = applyToffoli(
        currentState,
        gate.controlWires[0],
        gate.controlWires[1],
        gate.targetWire
      );
    }
    intermediateStates.push(currentState);
  }

  const probabilities = getProbabilities(currentState);
  return {
    initialState: createBasisState(initialBasis),
    finalState: currentState,
    intermediateStates,
    probabilities,
    fidelity: 0,
  };
}

/**
 * Evaluates the circuit against the level target according to universal evaluation rules.
 */
export function evaluateGateLevel(input: GateEvaluationInput): EvaluationResult {
  const { circuit, level, hasRun } = input;

  // 1. Unstarted check
  if (!hasRun) {
    return {
      status: 'unstarted',
      score: 0,
      progress: 0,
      feedback: 'Place gates from the palette onto the circuit wires, then press "Run Circuit" to simulate.',
      details: { circuitLength: circuit.length },
    };
  }

  // 2. Empty circuit check
  if (!circuit || circuit.length === 0) {
    return {
      status: 'incomplete',
      score: 0,
      progress: 0,
      feedback: 'Circuit is empty. Drag gates from the palette onto the wire slots to construct your quantum circuit.',
      details: { circuitLength: 0 },
    };
  }

  // 3. Circuit validation
  for (const gate of circuit) {
    if (gate.targetWire < 0 || gate.targetWire >= level.numQubits) {
      return {
        status: 'invalid',
        score: 0,
        progress: 0,
        feedback: `Gate targeting wire ${gate.targetWire} is out of bounds for a ${level.numQubits}-qubit system.`,
        details: { gate },
      };
    }

    if (gate.type === 'CNOT') {
      if (!gate.controlWires || gate.controlWires.length < 1) {
        return {
          status: 'invalid',
          score: 0,
          progress: 0,
          feedback: 'CNOT gate requires an active control wire.',
          details: { gate },
        };
      }
      if (gate.controlWires[0] === gate.targetWire) {
        return {
          status: 'invalid',
          score: 0,
          progress: 0,
          feedback: 'CNOT control wire cannot be the same as the target wire.',
          details: { gate },
        };
      }
    }

    if (gate.type === 'Toffoli') {
      if (!gate.controlWires || gate.controlWires.length < 2) {
        return {
          status: 'invalid',
          score: 0,
          progress: 0,
          feedback: 'Toffoli gate requires two distinct control wires.',
          details: { gate },
        };
      }
      if (
        gate.controlWires[0] === gate.targetWire ||
        gate.controlWires[1] === gate.targetWire ||
        gate.controlWires[0] === gate.controlWires[1]
      ) {
        return {
          status: 'invalid',
          score: 0,
          progress: 0,
          feedback: 'Toffoli controls and target must all be on distinct wires.',
          details: { gate },
        };
      }
    }
  }

  // 4. Run real quantum state simulation
  const sim = simulateCircuit(circuit, level.numQubits, level.initialBasis);
  if (!isValidStateVector(sim.finalState)) {
    return {
      status: 'invalid',
      score: 0,
      progress: 0,
      feedback: 'Quantum state became invalid during simulation.',
      details: { finalState: sim.finalState },
    };
  }

  // 5. Compare with target state using fidelity
  const fidelity = stateFidelity(sim.finalState, level.targetState);
  sim.fidelity = fidelity;

  const isSuccess = fidelity >= 0.999;

  if (isSuccess) {
    // Score based on gate efficiency
    const optimal = level.optimalGateCount || 2;
    const gateCount = circuit.length;
    const efficiencyPenalty = Math.max(0, (gateCount - optimal) * 40);
    const score = Math.max(650, 1000 - efficiencyPenalty);

    return {
      status: 'success',
      score,
      progress: 1.0,
      feedback: `✓ Target state prepared with ${(fidelity * 100).toFixed(1)}% fidelity using ${gateCount} gate${gateCount > 1 ? 's' : ''}!`,
      details: {
        fidelity: Number(fidelity.toFixed(4)),
        gateCount,
        probabilities: sim.probabilities,
        targetDescription: level.targetDescription,
      },
    };
  }

  // Partial / Incorrect
  const progress = Math.min(0.95, Math.max(0.1, Number(fidelity.toFixed(3))));
  return {
    status: 'incorrect',
    score: Math.round(progress * 400),
    progress,
    feedback: `Circuit produced a state with ${(fidelity * 100).toFixed(1)}% fidelity to target ${level.targetDescription}. Try a different gate combination.`,
    details: {
      fidelity: Number(fidelity.toFixed(4)),
      circuitLength: circuit.length,
      probabilities: sim.probabilities,
      targetDescription: level.targetDescription,
    },
  };
}
