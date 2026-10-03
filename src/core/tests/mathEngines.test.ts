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
  calculateKappa,
  calculateWavenumber,
  calculateSingleBarrierTransmission,
  calculateMultiBarrierTransmission,
  evaluateTunnelingLevel,
  sampleBinomialExperiment,
} from '../engines/tunnelingEngine';
import {
  calculateSpinMeasurement,
  collapseSpinState,
  calculateSequentialSpin,
  sampleSpinExperiment,
  angleToAxis2D,
  evaluateSpinSplitterLevel,
} from '../engines/spinSplitterEngine';
import { TRACK_5_LEVELS } from '../levels/track5Levels';

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

describe('Track 4 — Quantum Tunneling (Tunnel Run) Physics Engine', () => {
  it('calculates decay constant kappa and wavenumber k accurately', () => {
    const kappa = calculateKappa(0.6, 1.0);
    expect(kappa).toBeCloseTo(Math.sqrt(0.8), 5);

    const kFree = calculateWavenumber(0.5);
    expect(kFree).toBeCloseTo(1.0, 5);
  });

  it('calculates single-barrier transmission across all regimes', () => {
    // E < V0: tunneling regime
    const tunnel = calculateSingleBarrierTransmission(0.6, 1.0, 0.8);
    expect(tunnel.regime).toBe('tunneling');
    expect(tunnel.transmission).toBeGreaterThan(0);
    expect(tunnel.transmission).toBeLessThan(1);
    expect(tunnel.transmission + tunnel.reflection).toBeCloseTo(1.0, 6);

    // E > V0: over-barrier transmission
    const over = calculateSingleBarrierTransmission(1.4, 1.0, 0.8);
    expect(over.regime).toBe('over-barrier');
    expect(over.transmission).toBeGreaterThan(0.8);

    // E = V0: boundary threshold
    const equal = calculateSingleBarrierTransmission(1.0, 1.0, 0.8);
    expect(equal.regime).toBe('barrier-equal');
  });

  it('satisfies physical monotonicity requirements in tunneling regime', () => {
    // Width increase monotonically reduces transmission
    const tNarrow = calculateSingleBarrierTransmission(0.6, 1.0, 0.5).transmission;
    const tWide = calculateSingleBarrierTransmission(0.6, 1.0, 1.2).transmission;
    expect(tNarrow).toBeGreaterThan(tWide);

    // Height increase monotonically reduces transmission
    const tLow = calculateSingleBarrierTransmission(0.5, 0.8, 0.8).transmission;
    const tHigh = calculateSingleBarrierTransmission(0.5, 1.6, 0.8).transmission;
    expect(tLow).toBeGreaterThan(tHigh);

    // Energy increase below V0 monotonically increases transmission
    const tLowE = calculateSingleBarrierTransmission(0.3, 1.2, 0.8).transmission;
    const tHighE = calculateSingleBarrierTransmission(0.8, 1.2, 0.8).transmission;
    expect(tHighE).toBeGreaterThan(tLowE);
  });

  it('calculates multi-barrier transmission using Transfer Matrix Method (TMM)', () => {
    const multi = calculateMultiBarrierTransmission(0.65, [
      { id: 'b1', height: 1.0, width: 0.4 },
      { id: 'b2', height: 1.0, width: 0.4 },
    ]);
    expect(multi.transmission).toBeGreaterThan(0);
    expect(multi.transmission).toBeLessThanOrEqual(1.0);
    expect(multi.transmission + multi.reflection).toBeCloseTo(1.0, 6);
  });

  it('samples binomial experiment following calculated probability', () => {
    const exp = sampleBinomialExperiment(0.70, 100);
    expect(exp.trials).toBe(100);
    expect(exp.transmitted + exp.reflected).toBe(100);
    expect(exp.transmitted).toBeGreaterThan(40);
    expect(exp.transmitted).toBeLessThan(95);
  });

  it('evaluates tunneling levels according to target tolerances and constraints', () => {
    const levelConfig = {
      id: 't4_test',
      trackId: 'quantum-tunneling' as const,
      trackNumber: 4,
      levelNumber: 1,
      title: 'Test',
      subtitle: 'Test',
      description: 'Test',
      difficulty: 'Beginner' as const,
      educationalConcept: 'Test',
      hints: ['h1', 'h2', 'h3'],
      initialState: {
        particleEnergy: 0.30,
        barriers: [{ id: 'b1', height: 1.0, width: 0.8, adjustableHeight: false, adjustableWidth: false }],
      },
      targetTransmission: 0.70,
      targetTolerance: 0.03,
      energyRange: { min: 0.15, max: 0.95 },
      adjustableEnergy: true,
    };

    // Unstarted
    const unstarted = evaluateTunnelingLevel(levelConfig.initialState, levelConfig, 0, false);
    expect(unstarted.status).toBe('unstarted');

    // Incomplete
    const incomplete = evaluateTunnelingLevel(levelConfig.initialState, levelConfig, 1, true);
    expect(incomplete.status).toBe('incomplete');

    // Invalid (E >= V0)
    const invalid = evaluateTunnelingLevel(
      { particleEnergy: 1.2, barriers: [{ id: 'b1', height: 1.0, width: 0.8 }] },
      levelConfig,
      1,
      true
    );
    expect(invalid.status).toBe('invalid');

    // Success (E = 0.81 lands at T = 0.700)
    const success = evaluateTunnelingLevel(
      { particleEnergy: 0.81, barriers: [{ id: 'b1', height: 1.0, width: 0.8 }] },
      levelConfig,
      1,
      true
    );
    expect(success.status).toBe('success');
    expect(success.score).toBeGreaterThan(500);
  });
});

describe('Track 5 — Quantum Spin & Measurement (Spin Splitter) Engine', () => {
  const rZ = angleToAxis2D(0);      // +Z
  const nZ = angleToAxis2D(0);      // +Z
  const nX = angleToAxis2D(90);     // +X
  const nNegZ = angleToAxis2D(180); // -Z

  it('calculates physical spin-1/2 probabilities with exact conservation P(+) + P(-) = 1', () => {
    // Aligned: P(+) = 1.0, P(-) = 0.0
    const mAligned = calculateSpinMeasurement(rZ, nZ);
    expect(mAligned.probPlus).toBeCloseTo(1.0);
    expect(mAligned.probMinus).toBeCloseTo(0.0);
    expect(mAligned.probPlus + mAligned.probMinus).toBeCloseTo(1.0);

    // Opposite: P(+) = 0.0, P(-) = 1.0
    const mOpposite = calculateSpinMeasurement(rZ, nNegZ);
    expect(mOpposite.probPlus).toBeCloseTo(0.0);
    expect(mOpposite.probMinus).toBeCloseTo(1.0);

    // Orthogonal: P(+) = 0.5, P(-) = 0.5
    const mOrtho = calculateSpinMeasurement(rZ, nX);
    expect(mOrtho.probPlus).toBeCloseTo(0.5);
    expect(mOrtho.probMinus).toBeCloseTo(0.5);

    // 60-degree separation: P(+) = cos²(30°) = 0.75
    const m60 = calculateSpinMeasurement(rZ, angleToAxis2D(60));
    expect(m60.probPlus).toBeCloseTo(0.75);
    expect(m60.probMinus).toBeCloseTo(0.25);
  });

  it('performs exact quantum state collapse (Von Neumann projection)', () => {
    const colPlus = collapseSpinState(nX, '+');
    expect(colPlus.x).toBeCloseTo(1.0);
    expect(colPlus.z).toBeCloseTo(0.0);

    const colMinus = collapseSpinState(nX, '-');
    expect(colMinus.x).toBeCloseTo(-1.0);
    expect(colMinus.z).toBeCloseTo(0.0);
  });

  it('verifies sequential measurement disturbance and prepared state measurement', () => {
    // Disturbance: +Z measured along +X -> collapse to +X -> Analyzer 2 at +Z yields 50/50
    const seqDist = calculateSequentialSpin(rZ, nX, '+', nZ);
    expect(seqDist.analyzer1.probPlus).toBeCloseTo(0.5);
    expect(seqDist.collapsedState.x).toBeCloseTo(1.0);
    expect(seqDist.finalProbPlus).toBeCloseTo(0.5);

    // Prepared state measurement: +Z measured along +X -> collapse to +X -> Analyzer 2 at +X yields 100%
    const seqPrep = calculateSequentialSpin(rZ, nX, '+', nX);
    expect(seqPrep.finalProbPlus).toBeCloseTo(1.0);
  });

  it('statistically converges under random binomial sampling', () => {
    const sample = sampleSpinExperiment(0.75, 10000);
    expect(sample.shots).toBe(10000);
    expect(sample.countPlus + sample.countMinus).toBe(10000);
    expect(sample.observedFreqPlus).toBeGreaterThanOrEqual(0.73);
    expect(sample.observedFreqPlus).toBeLessThanOrEqual(0.77);
  });

  it('evaluates Spin Splitter states according to universal evaluator rules', () => {
    const lvl1 = TRACK_5_LEVELS[0];

    // Unstarted
    const unstarted = evaluateSpinSplitterLevel(
      {
        analyzer1Angle: 0,
        selectedBranch: '+',
        hasRunExperiment: false,
        experimentSample: null,
        experimentsUsed: 0,
      },
      lvl1
    );
    expect(unstarted.status).toBe('unstarted');
    expect(unstarted.details.probPlus).toBeCloseTo(1.0);
    expect(unstarted.details.errorDelta).toBeCloseTo(0.0);

    // Rotated prior to running experiment -> status is incomplete and probabilities update live
    const rotatedUnrun = evaluateSpinSplitterLevel(
      {
        analyzer1Angle: 90,
        selectedBranch: '+',
        hasRunExperiment: false,
        experimentSample: null,
        experimentsUsed: 0,
      },
      lvl1
    );
    expect(rotatedUnrun.status).toBe('incomplete');
    expect(rotatedUnrun.details.probPlus).toBeCloseTo(0.5);
    expect(rotatedUnrun.details.errorDelta).toBeCloseTo(0.5);

    // Level 1 success
    const lvl1Success = evaluateSpinSplitterLevel(
      {
        analyzer1Angle: 0,
        selectedBranch: '+',
        hasRunExperiment: true,
        experimentSample: sampleSpinExperiment(1.0, 50),
        experimentsUsed: 1,
      },
      lvl1
    );
    expect(lvl1Success.status).toBe('success');

    // Level 2 wrong orientation
    const lvl2 = TRACK_5_LEVELS[1];
    const lvl2Wrong = evaluateSpinSplitterLevel(
      {
        analyzer1Angle: 0,
        selectedBranch: '+',
        hasRunExperiment: true,
        experimentSample: sampleSpinExperiment(1.0, 50),
        experimentsUsed: 1,
      },
      lvl2
    );
    expect(lvl2Wrong.status).toBe('incorrect');

    // Level 6 wrong branch
    const lvl6 = TRACK_5_LEVELS[5];
    const lvl6WrongBranch = evaluateSpinSplitterLevel(
      {
        analyzer1Angle: 90,
        analyzer2Angle: 90,
        selectedBranch: '-', // Wrong branch
        hasRunExperiment: true,
        experimentSample: sampleSpinExperiment(1.0, 50),
        experimentsUsed: 1,
      },
      lvl6
    );
    expect(lvl6WrongBranch.status).toBe('incorrect');
  });

  it('verifies that all 10 Track 5 Spin Splitter levels are solvable', () => {
    TRACK_5_LEVELS.forEach(lvl => {
      let a1 = lvl.analyzer1InitialAngle;
      let a2 = lvl.analyzer2InitialAngle;
      let branch = lvl.targetBranch || '+';

      if (lvl.id === 't5_l1') a1 = 0;
      if (lvl.id === 't5_l2') a1 = 90;
      if (lvl.id === 't5_l3') a1 = 120;
      if (lvl.id === 't5_l4') a1 = 60;
      if (lvl.id === 't5_l5') a1 = 180;
      if (lvl.id === 't5_l6') { a1 = 90; a2 = 90; branch = '+'; }
      if (lvl.id === 't5_l7') { a1 = 90; a2 = 0; branch = '+'; }
      if (lvl.id === 't5_l8') { a1 = 90; a2 = 30; branch = '+'; }
      if (lvl.id === 't5_l9') a1 = 60;
      if (lvl.id === 't5_l10') { a1 = 0; a2 = 53; branch = '+'; }

      const res = evaluateSpinSplitterLevel(
        {
          analyzer1Angle: a1,
          analyzer2Angle: a2,
          selectedBranch: branch,
          hasRunExperiment: true,
          experimentSample: sampleSpinExperiment(lvl.targetProbPlus, 50),
          experimentsUsed: 1,
        },
        lvl
      );
      expect(res.status).toBe('success');
    });
  });
});
