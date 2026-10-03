import { describe, it, expect } from 'vitest';
import {
  sphericalToCartesian,
  cartesianToSpherical,
  normalize,
  angularDistanceDegrees,
  blochProbabilities,
  vector3,
} from '../math/vector3';
import {
  createBasisState,
  createZeroState,
  applySingleQubitGate,
  applyCNOT,
  applyToffoli,
  stateFidelity,
  GATE_X,
  GATE_Z,
  GATE_H,
} from '../math/statevector';
import {
  calculateBlochResultant,
  evaluateBlochLevel,
  BlochSphereState,
} from '../engines/blochEngine';
import {
  evaluateGateLevel,
  PlacedGate,
  GateLevelDefinition,
} from '../engines/gateSimulationEngine';
import {
  calculateInterference,
  evaluateInterferenceLevel,
  WavePath,
} from '../engines/interferenceEngine';
import {
  calculateSyndrome,
  generateCorruptedState,
  applyRepairToQubits,
  evaluateRepairLevel,
} from '../engines/errorCorrectionEngine';
import {
  simulateQPE,
  evaluatePhaseLevel,
} from '../engines/phaseEstimationEngine';

describe('Track 1 — Bloch Sphere Math & Engine', () => {
  it('correctly maps spherical angles to Cartesian coordinates', () => {
    // |0> state at theta = 0
    const v0 = sphericalToCartesian(0, 0);
    expect(v0.x).toBeCloseTo(0);
    expect(v0.y).toBeCloseTo(0);
    expect(v0.z).toBeCloseTo(1);

    // |1> state at theta = PI
    const v1 = sphericalToCartesian(Math.PI, 0);
    expect(v1.x).toBeCloseTo(0);
    expect(v1.y).toBeCloseTo(0);
    expect(v1.z).toBeCloseTo(-1);

    // |+> state at theta = PI/2, phi = 0
    const vPlus = sphericalToCartesian(Math.PI / 2, 0);
    expect(vPlus.x).toBeCloseTo(1);
    expect(vPlus.y).toBeCloseTo(0);
    expect(vPlus.z).toBeCloseTo(0);
  });

  it('calculates angular distance correctly', () => {
    const v0 = vector3(0, 0, 1);
    const v1 = vector3(0, 0, -1);
    expect(angularDistanceDegrees(v0, v1)).toBeCloseTo(180);

    const vPlus = vector3(1, 0, 0);
    expect(angularDistanceDegrees(v0, vPlus)).toBeCloseTo(90);
  });

  it('calculates resultant vector for multiple spheres', () => {
    const spheres: BlochSphereState[] = [
      { id: '1', name: 'Q1', isFixed: true, theta: 0, phi: 0, weight: 1 }, // +Z
      { id: '2', name: 'Q2', isFixed: false, theta: Math.PI, phi: 0, weight: 1 }, // -Z
    ];
    // Two opposite equal weights cancel Z, fallback handled cleanly
    const r = calculateBlochResultant(spheres);
    expect(r).toBeDefined();

    // +Z and +X
    const spheres2: BlochSphereState[] = [
      { id: '1', name: 'Q1', isFixed: true, theta: 0, phi: 0, weight: 1 },
      { id: '2', name: 'Q2', isFixed: false, theta: Math.PI / 2, phi: 0, weight: 1 },
    ];
    const r2 = calculateBlochResultant(spheres2);
    expect(r2.x).toBeCloseTo(1 / Math.SQRT2);
    expect(r2.z).toBeCloseTo(1 / Math.SQRT2);
  });

  it('rejects unstarted or no-input state without success', () => {
    const initialSpheres: BlochSphereState[] = [
      { id: '1', name: 'Q1', isFixed: false, theta: Math.PI / 2, phi: 0, weight: 1 },
    ];
    const res = evaluateBlochLevel({
      currentSpheres: initialSpheres,
      initialSpheres,
      targetTheta: 0,
      targetPhi: 0,
      toleranceDegrees: 5,
      hasInteracted: false,
    });
    expect(res.status).toBe('unstarted');
  });

  it('marks correctly aligned sphere as success', () => {
    const initialSpheres: BlochSphereState[] = [
      { id: '1', name: 'Q1', isFixed: false, theta: Math.PI, phi: 0, weight: 1 },
    ];
    const movedSpheres: BlochSphereState[] = [
      { id: '1', name: 'Q1', isFixed: false, theta: 0.05, phi: 0, weight: 1 },
    ];
    const res = evaluateBlochLevel({
      currentSpheres: movedSpheres,
      initialSpheres,
      targetTheta: 0,
      targetPhi: 0,
      toleranceDegrees: 5, // ~0.087 rad
      hasInteracted: true,
    });
    expect(res.status).toBe('success');
  });
});

describe('Track 2 — Quantum Gates & Simulation Engine', () => {
  it('applies X gate: flips |0> to |1>', () => {
    const state0 = createZeroState(1);
    const state1 = applySingleQubitGate(state0, 0, GATE_X);
    expect(state1.amplitudes[0].re).toBeCloseTo(0);
    expect(state1.amplitudes[1].re).toBeCloseTo(1);
  });

  it('applies H gate: creates superposition (|0> + |1>)/sqrt(2)', () => {
    const state0 = createZeroState(1);
    const statePlus = applySingleQubitGate(state0, 0, GATE_H);
    expect(statePlus.amplitudes[0].re).toBeCloseTo(1 / Math.SQRT2);
    expect(statePlus.amplitudes[1].re).toBeCloseTo(1 / Math.SQRT2);
  });

  it('applies CNOT gate: creates Bell state (|00> + |11>)/sqrt(2)', () => {
    let state = createZeroState(2);
    state = applySingleQubitGate(state, 0, GATE_H); // H on wire 0
    state = applyCNOT(state, 0, 1); // CNOT control 0, target 1
    // Basis states: 00, 01, 10, 11
    expect(state.amplitudes[0].re).toBeCloseTo(1 / Math.SQRT2); // |00>
    expect(state.amplitudes[1].re).toBeCloseTo(0);
    expect(state.amplitudes[2].re).toBeCloseTo(0);
    expect(state.amplitudes[3].re).toBeCloseTo(1 / Math.SQRT2); // |11>
  });

  it('applies Toffoli gate correctly on 3 qubits', () => {
    // Initial state |110> (wire 0 is 1, wire 1 is 1, wire 2 is 0)
    let state = createBasisState('110');
    state = applyToffoli(state, 0, 1, 2);
    // Since controls 0 and 1 are active, wire 2 flips from 0 to 1 -> |111>
    const expected = createBasisState('111');
    expect(stateFidelity(state, expected)).toBeCloseTo(1.0);
  });

  it('evaluates gate circuit correctly', () => {
    const targetState = applySingleQubitGate(createZeroState(1), 0, GATE_X);
    const level: GateLevelDefinition = {
      numQubits: 1,
      initialBasis: '0',
      targetState,
      targetDescription: '|1>',
      maxSteps: 4,
      allowedGates: ['X', 'Z', 'H'],
    };

    // Empty circuit
    const emptyRes = evaluateGateLevel({ circuit: [], level, hasRun: true });
    expect(emptyRes.status).toBe('incomplete');

    // Wrong circuit: Z gate on |0> keeps it |0>
    const wrongCircuit: PlacedGate[] = [{ id: '1', type: 'Z', targetWire: 0, step: 0 }];
    const wrongRes = evaluateGateLevel({ circuit: wrongCircuit, level, hasRun: true });
    expect(wrongRes.status).toBe('incorrect');

    // Correct circuit: X gate on |0> turns into |1>
    const correctCircuit: PlacedGate[] = [{ id: '1', type: 'X', targetWire: 0, step: 0 }];
    const correctRes = evaluateGateLevel({ circuit: correctCircuit, level, hasRun: true });
    expect(correctRes.status).toBe('success');
  });
});

describe('Track 3 — Quantum Interference Wave Engine', () => {
  it('produces constructive interference at 0 phase difference', () => {
    const paths: WavePath[] = [
      { id: '1', name: 'Path 1', amplitude: 1, phase: 0, isFixed: true },
      { id: '2', name: 'Path 2', amplitude: 1, phase: 0, isFixed: false },
    ];
    const res = calculateInterference(paths);
    expect(res.probA).toBeCloseTo(1.0);
    expect(res.probB).toBeCloseTo(0.0);
  });

  it('produces destructive interference at PI phase difference', () => {
    const paths: WavePath[] = [
      { id: '1', name: 'Path 1', amplitude: 1, phase: 0, isFixed: true },
      { id: '2', name: 'Path 2', amplitude: 1, phase: Math.PI, isFixed: false },
    ];
    const res = calculateInterference(paths);
    expect(res.probA).toBeCloseTo(0.0);
    expect(res.probB).toBeCloseTo(1.0);
  });

  it('produces equal 50/50 split at PI/2 phase difference', () => {
    const paths: WavePath[] = [
      { id: '1', name: 'Path 1', amplitude: 1, phase: 0, isFixed: true },
      { id: '2', name: 'Path 2', amplitude: 1, phase: Math.PI / 2, isFixed: false },
    ];
    const res = calculateInterference(paths);
    expect(res.probA).toBeCloseTo(0.5);
    expect(res.probB).toBeCloseTo(0.5);
  });

  it('evaluates player input against target probability', () => {
    const initialPaths: WavePath[] = [
      { id: '1', name: 'Path 1', amplitude: 1, phase: 0, isFixed: true },
      { id: '2', name: 'Path 2', amplitude: 1, phase: 0, isFixed: false },
    ];
    const movedPaths: WavePath[] = [
      { id: '1', name: 'Path 1', amplitude: 1, phase: 0, isFixed: true },
      { id: '2', name: 'Path 2', amplitude: 1, phase: Math.PI, isFixed: false },
    ];

    const evalRes = evaluateInterferenceLevel({
      currentPaths: movedPaths,
      initialPaths,
      targetDetectorA: 0.0,
      targetDetectorB: 1.0,
      tolerance: 0.05,
      hasInteracted: true,
    });
    expect(evalRes.status).toBe('success');
  });
});

describe('Track 4 — Quantum Error Correction Engine', () => {
  it('correctly diagnoses syndromes for bit-flip repetition code', () => {
    // 00 -> no error
    expect(calculateSyndrome([
      { index: 0, value: 0, phaseSign: 1 },
      { index: 1, value: 0, phaseSign: 1 },
      { index: 2, value: 0, phaseSign: 1 },
    ]).syndromeString).toBe('00');

    // 10 -> Q1 corrupted (0 XOR 1 = 1, 0 XOR 0 = 0 -> 10)
    expect(calculateSyndrome([
      { index: 0, value: 1, phaseSign: 1 },
      { index: 1, value: 0, phaseSign: 1 },
      { index: 2, value: 0, phaseSign: 1 },
    ]).syndromeString).toBe('10');

    // 11 -> Q2 corrupted (0 XOR 1 = 1, 1 XOR 0 = 1 -> 11)
    expect(calculateSyndrome([
      { index: 0, value: 0, phaseSign: 1 },
      { index: 1, value: 1, phaseSign: 1 },
      { index: 2, value: 0, phaseSign: 1 },
    ]).syndromeString).toBe('11');

    // 01 -> Q3 corrupted (0 XOR 0 = 0, 0 XOR 1 = 1 -> 01)
    expect(calculateSyndrome([
      { index: 0, value: 0, phaseSign: 1 },
      { index: 1, value: 0, phaseSign: 1 },
      { index: 2, value: 1, phaseSign: 1 },
    ]).syndromeString).toBe('01');
  });

  it('rejects wrong qubit repair and accepts correct repair', () => {
    const level = {
      logicalValue: 0 as const,
      errorType: 'bit-flip' as const,
      corruptedQubitIndex: 1, // Q2 is corrupted to 1
      codeType: 'bit-flip-code' as const,
      description: 'Bit flip on Q2',
    };

    // Wrong qubit (selected Q1 instead of Q2)
    const wrongRes = evaluateRepairLevel({
      level,
      action: { targetQubit: 0, gate: 'X', applied: true },
      hasVerified: true,
    });
    expect(wrongRes.status).toBe('incorrect');

    // Correct qubit and gate (Q2 + X)
    const correctRes = evaluateRepairLevel({
      level,
      action: { targetQubit: 1, gate: 'X', applied: true },
      hasVerified: true,
    });
    expect(correctRes.status).toBe('success');
  });
});

describe('Track 5 — Quantum Phase Estimation Engine', () => {
  it('peaks at exact binary fraction eigenphases', () => {
    // True phase phi = 0.375 = 3/8
    const sim = simulateQPE(0.375, 3);
    expect(sim.mostProbableBitString).toBe('011'); // 3 in binary
    expect(sim.mostProbablePhase).toBe(0.375);
    expect(sim.theoreticalPeakProb).toBeCloseTo(1.0);
  });

  it('evaluates phase estimates within tolerance', () => {
    const level = {
      truePhase: 0.25,
      estimationQubits: 3,
      tolerance: 0.05,
      difficulty: 'Beginner',
      description: 'Find phase 0.250',
    };

    // Wrong estimate
    const wrongRes = evaluatePhaseLevel({
      playerEstimate: 0.6,
      level,
      hasInteracted: true,
      hasSampled: true,
    });
    expect(wrongRes.status).toBe('incorrect');

    // Accurate estimate
    const correctRes = evaluatePhaseLevel({
      playerEstimate: 0.25,
      level,
      hasInteracted: true,
      hasSampled: true,
    });
    expect(correctRes.status).toBe('success');
  });
});
