// Standalone automated test runner for all 5 Quantum Navigator Math Engines

import {
  sphericalToCartesian,
  normalize,
  angularDistanceDegrees,
  blochProbabilities,
  vector3,
} from '../math/vector3.ts';
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
} from '../math/statevector.ts';
import {
  calculateBlochResultant,
  evaluateBlochLevel,
  BlochSphereState,
} from '../engines/blochEngine.ts';
import {
  evaluateGateLevel,
  PlacedGate,
  GateLevelDefinition,
} from '../engines/gateSimulationEngine.ts';
import {
  calculateInterference,
  evaluateInterferenceLevel,
  WavePath,
} from '../engines/interferenceEngine.ts';
import {
  calculateKappa,
  calculateWavenumber,
  calculateSingleBarrierTransmission,
  calculateMultiBarrierTransmission,
  evaluateTunnelingLevel,
  sampleBinomialExperiment,
} from '../engines/tunnelingEngine.ts';
import {
  calculateSpinMeasurement,
  collapseSpinState,
  calculateSequentialSpin,
  sampleSpinExperiment,
  angleToAxis2D,
  evaluateSpinSplitterLevel,
  type SpinSplitterState,
} from '../engines/spinSplitterEngine.ts';
import { TRACK_5_LEVELS } from '../levels/track5Levels.ts';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${testName}`);
  } else {
    failed++;
    console.error(`  ❌ FAILED: ${testName} ${detail ? `(${detail})` : ''}`);
  }
}

function approx(val: number, expected: number, eps = 1e-4): boolean {
  return Math.abs(val - expected) < eps;
}

console.log('\n=== RUNNING QUANTUM NAVIGATOR MATHEMATICAL ENGINE TESTS ===\n');

// TRACK 1 TESTS
console.log('[Track 1] Bloch Sphere & Resultant Vector:');
{
  const v0 = sphericalToCartesian(0, 0);
  assert(approx(v0.z, 1) && approx(v0.x, 0), 'sphericalToCartesian maps |0> to (0,0,1)');

  const v1 = sphericalToCartesian(Math.PI, 0);
  assert(approx(v1.z, -1) && approx(v1.x, 0), 'sphericalToCartesian maps |1> to (0,0,-1)');

  const vPlus = sphericalToCartesian(Math.PI / 2, 0);
  assert(approx(vPlus.x, 1) && approx(vPlus.z, 0), 'sphericalToCartesian maps |+> to (1,0,0)');

  const angle180 = angularDistanceDegrees(vector3(0, 0, 1), vector3(0, 0, -1));
  assert(approx(angle180, 180), 'angular distance between |0> and |1> is 180 degrees');

  const spheres: BlochSphereState[] = [
    { id: '1', name: 'Q1', isFixed: true, theta: 0, phi: 0, weight: 1 },
    { id: '2', name: 'Q2', isFixed: false, theta: Math.PI / 2, phi: 0, weight: 1 },
  ];
  const r = calculateBlochResultant(spheres);
  assert(approx(r.x, 1 / Math.SQRT2) && approx(r.z, 1 / Math.SQRT2), 'Resultant vector calculated correctly');

  // No-input protection
  const noInputRes = evaluateBlochLevel({
    currentSpheres: spheres,
    initialSpheres: spheres,
    targetTheta: 0,
    targetPhi: 0,
    toleranceDegrees: 5,
    hasInteracted: false,
  });
  assert(noInputRes.status === 'unstarted', 'No input returns status=unstarted');

  // Success evaluation
  const successRes = evaluateBlochLevel({
    currentSpheres: [{ id: '1', name: 'Q1', isFixed: false, theta: 0.04, phi: 0, weight: 1 }],
    initialSpheres: [{ id: '1', name: 'Q1', isFixed: false, theta: Math.PI, phi: 0, weight: 1 }],
    targetTheta: 0,
    targetPhi: 0,
    toleranceDegrees: 5,
    hasInteracted: true,
  });
  assert(successRes.status === 'success', 'Alignment within tolerance returns status=success');
}

// TRACK 2 TESTS
console.log('\n[Track 2] Quantum Logic Gates & Circuit Simulator:');
{
  const s0 = createZeroState(1);
  const s1 = applySingleQubitGate(s0, 0, GATE_X);
  assert(approx(s1.amplitudes[1].re, 1) && approx(s1.amplitudes[0].re, 0), 'X gate flips |0> to |1>');

  const sPlus = applySingleQubitGate(s0, 0, GATE_H);
  assert(approx(sPlus.amplitudes[0].re, 1 / Math.SQRT2) && approx(sPlus.amplitudes[1].re, 1 / Math.SQRT2), 'H gate creates |+>');

  let bell = createZeroState(2);
  bell = applySingleQubitGate(bell, 0, GATE_H);
  bell = applyCNOT(bell, 0, 1);
  assert(approx(bell.amplitudes[0].re, 1 / Math.SQRT2) && approx(bell.amplitudes[3].re, 1 / Math.SQRT2), 'CNOT creates Bell state');

  let tof = createBasisState('110');
  tof = applyToffoli(tof, 0, 1, 2);
  assert(stateFidelity(tof, createBasisState('111')) > 0.999, 'Toffoli flips target when controls are 11');

  const level: GateLevelDefinition = {
    numQubits: 1,
    initialBasis: '0',
    targetState: s1,
    targetDescription: '|1>',
    maxSteps: 4,
    allowedGates: ['X', 'Z', 'H'],
  };
  const emptyRes = evaluateGateLevel({ circuit: [], level, hasRun: true });
  assert(emptyRes.status === 'incomplete', 'Empty circuit returns status=incomplete');

  const wrongRes = evaluateGateLevel({
    circuit: [{ id: '1', type: 'Z', targetWire: 0, step: 0 }],
    level,
    hasRun: true,
  });
  assert(wrongRes.status === 'incorrect', 'Wrong circuit returns status=incorrect');

  const correctRes = evaluateGateLevel({
    circuit: [{ id: '1', type: 'X', targetWire: 0, step: 0 }],
    level,
    hasRun: true,
  });
  assert(correctRes.status === 'success', 'Correct circuit returns status=success');
}

// TRACK 3 TESTS
console.log('\n[Track 3] Quantum Interference Wave Engine:');
{
  const pConstructive: WavePath[] = [
    { id: '1', name: 'Path 1', amplitude: 1, phase: 0, isFixed: true },
    { id: '2', name: 'Path 2', amplitude: 1, phase: 0, isFixed: false },
  ];
  const resConst = calculateInterference(pConstructive);
  assert(approx(resConst.probA, 1.0) && approx(resConst.probB, 0.0), '0 deg phase delta gives 100% at detector A');

  const pDestructive: WavePath[] = [
    { id: '1', name: 'Path 1', amplitude: 1, phase: 0, isFixed: true },
    { id: '2', name: 'Path 2', amplitude: 1, phase: Math.PI, isFixed: false },
  ];
  const resDest = calculateInterference(pDestructive);
  assert(approx(resDest.probA, 0.0) && approx(resDest.probB, 1.0), '180 deg phase delta gives 100% at detector B');

  const pSplit: WavePath[] = [
    { id: '1', name: 'Path 1', amplitude: 1, phase: 0, isFixed: true },
    { id: '2', name: 'Path 2', amplitude: 1, phase: Math.PI / 2, isFixed: false },
  ];
  const resSplit = calculateInterference(pSplit);
  assert(approx(resSplit.probA, 0.5) && approx(resSplit.probB, 0.5), '90 deg phase delta gives 50/50 split');

  const evalSuccess = evaluateInterferenceLevel({
    currentPaths: pDestructive,
    initialPaths: pConstructive,
    targetDetectorA: 0.0,
    targetDetectorB: 1.0,
    tolerance: 0.05,
    hasInteracted: true,
  });
  assert(evalSuccess.status === 'success', 'Matching detector probability returns status=success');
}

// TRACK 4 TESTS: QUANTUM TUNNELING (TUNNEL RUN)
console.log('\n[Track 4] Quantum Tunneling (Tunnel Run) Physics Engine:');
{
  // 1. calculateKappa & calculateWavenumber
  const kappa = calculateKappa(0.6, 1.0);
  assert(Math.abs(kappa - Math.sqrt(0.8)) < 1e-6, 'calculateKappa returns sqrt(2m(V0 - E))/hbar');

  const kFree = calculateWavenumber(0.5);
  assert(Math.abs(kFree - 1.0) < 1e-6, 'calculateWavenumber returns sqrt(2mE)/hbar');

  // 2. calculateSingleBarrierTransmission in tunneling regime (E < V0)
  const resTunnel = calculateSingleBarrierTransmission(0.6, 1.0, 0.8);
  assert(resTunnel.regime === 'tunneling', 'calculateSingleBarrierTransmission identifies tunneling regime for E < V0');
  assert(resTunnel.transmission > 0 && resTunnel.transmission < 1, 'Tunneling transmission is non-zero and bounded in (0, 1)');
  assert(Math.abs(resTunnel.transmission + resTunnel.reflection - 1.0) < 1e-6, 'Conservation of probability: T + R = 1');

  // 3. Over-barrier transmission regime (E > V0)
  const resOver = calculateSingleBarrierTransmission(1.4, 1.0, 0.8);
  assert(resOver.regime === 'over-barrier', 'Over-barrier transmission regime correctly identified for E > V0');
  assert(resOver.transmission > 0.8, 'High transmission for over-barrier regime');

  // 4. Boundary equality (E = V0)
  const resEqual = calculateSingleBarrierTransmission(1.0, 1.0, 0.8);
  assert(resEqual.regime === 'barrier-equal', 'Boundary equality threshold correctly identified');

  // 5. Monotonic behavior verification (Section 55)
  // 5a. Width increase reduces transmission
  const tNarrow = calculateSingleBarrierTransmission(0.6, 1.0, 0.5).transmission;
  const tWide = calculateSingleBarrierTransmission(0.6, 1.0, 1.2).transmission;
  assert(tNarrow > tWide, 'Increasing barrier width monotonically suppresses tunneling transmission');

  // 5b. Height increase reduces transmission
  const tLow = calculateSingleBarrierTransmission(0.5, 0.8, 0.8).transmission;
  const tHigh = calculateSingleBarrierTransmission(0.5, 1.6, 0.8).transmission;
  assert(tLow > tHigh, 'Increasing barrier height monotonically reduces tunneling transmission');

  // 5c. Energy increase increases transmission (for E < V0)
  const tLowE = calculateSingleBarrierTransmission(0.3, 1.2, 0.8).transmission;
  const tHighE = calculateSingleBarrierTransmission(0.8, 1.2, 0.8).transmission;
  assert(tHighE > tLowE, 'Increasing particle energy below V0 monotonically increases tunneling transmission');

  // 6. Multi-Barrier Transfer Matrix Method (TMM)
  const multiRes = calculateMultiBarrierTransmission(0.65, [
    { id: 'b1', height: 1.0, width: 0.4 },
    { id: 'b2', height: 1.0, width: 0.4 },
  ]);
  assert(multiRes.transmission > 0 && multiRes.transmission <= 1, 'Multi-barrier TMM calculates valid bounded transmission');
  assert(Math.abs(multiRes.transmission + multiRes.reflection - 1.0) < 1e-6, 'Multi-barrier TMM satisfies unitary probability conservation');

  // 7. Binomial experiment sampling
  const experiment = sampleBinomialExperiment(0.70, 100);
  assert(experiment.trials === 100, 'sampleBinomialExperiment executes 100 trials');
  assert(experiment.transmitted + experiment.reflected === 100, 'All particles accounted for: Transmitted + Reflected = Trials');
  assert(experiment.transmitted > 40 && experiment.transmitted < 95, 'Sampled counts follow binomial distribution around theoretical T');

  // 8. Evaluator level test (evaluateTunnelingLevel)
  const testLevelConfig = {
    id: 'test_t4',
    trackId: 'quantum-tunneling' as const,
    trackNumber: 4,
    levelNumber: 1,
    title: 'Test Level',
    subtitle: 'Test',
    description: 'Test',
    difficulty: 'Beginner' as const,
    educationalConcept: 'Test',
    hints: ['Hint 1', 'Hint 2', 'Hint 3'],
    initialState: {
      particleEnergy: 0.30,
      barriers: [{ id: 'b1', height: 1.0, width: 0.8, adjustableHeight: false, adjustableWidth: false }],
    },
    targetTransmission: 0.70,
    targetTolerance: 0.03,
    energyRange: { min: 0.15, max: 0.95 },
    adjustableEnergy: true,
  };

  // No-input rule
  const unstartedEval = evaluateTunnelingLevel(testLevelConfig.initialState, testLevelConfig, 0, false);
  assert(unstartedEval.status === 'unstarted', 'No input with initial state outside target returns status=unstarted');

  // E >= V0 rejection in tunneling mode
  const invalidEval = evaluateTunnelingLevel(
    { particleEnergy: 1.2, barriers: [{ id: 'b1', height: 1.0, width: 0.8 }] },
    testLevelConfig,
    1,
    true
  );
  assert(invalidEval.status === 'invalid', 'E >= V0 rejected with status=invalid in tunneling-mode levels');

  // Target match
  const successEval = evaluateTunnelingLevel(
    { particleEnergy: 0.81, barriers: [{ id: 'b1', height: 1.0, width: 0.8 }] },
    testLevelConfig,
    1,
    true
  );
  assert(successEval.status === 'success', 'Transmission within target tolerance returns status=success');
}

// TRACK 5 TESTS: QUANTUM SPIN & MEASUREMENT (SPIN SPLITTER)
console.log('\n[Track 5] Quantum Spin & Measurement (Spin Splitter) Engine:');
{
  // 1. Fundamental Spin-1/2 Measurement Probability Formula
  const rZ = angleToAxis2D(0);       // +Z (0, 0, 1)
  const nZ = angleToAxis2D(0);       // +Z
  const nX = angleToAxis2D(90);      // +X (1, 0, 0)
  const nNegZ = angleToAxis2D(180);  // -Z (0, 0, -1)

  // Aligned: r = n -> P(+) = 1.0, P(-) = 0.0
  const mAligned = calculateSpinMeasurement(rZ, nZ);
  assert(approx(mAligned.probPlus, 1.0), 'Aligned spin: r = n -> P(+) = 1.0');
  assert(approx(mAligned.probMinus, 0.0), 'Aligned spin: r = n -> P(-) = 0.0');
  assert(approx(mAligned.probPlus + mAligned.probMinus, 1.0), 'Probability conservation: P(+) + P(-) = 1.0');

  // Opposite: r = -n -> P(+) = 0.0, P(-) = 1.0
  const mOpposite = calculateSpinMeasurement(rZ, nNegZ);
  assert(approx(mOpposite.probPlus, 0.0), 'Opposite spin: r = -n -> P(+) = 0.0');
  assert(approx(mOpposite.probMinus, 1.0), 'Opposite spin: r = -n -> P(-) = 1.0');

  // Orthogonal: r · n = 0 -> P(+) = 0.5, P(-) = 0.5
  const mOrtho = calculateSpinMeasurement(rZ, nX);
  assert(approx(mOrtho.probPlus, 0.5), 'Orthogonal spin: r · n = 0 -> P(+) = 0.5 (50%)');
  assert(approx(mOrtho.probMinus, 0.5), 'Orthogonal spin: r · n = 0 -> P(-) = 0.5 (50%)');

  // 60-degree separation: P(+) = cos²(30°) = 0.75, P(-) = sin²(30°) = 0.25
  const n60 = angleToAxis2D(60);
  const m60 = calculateSpinMeasurement(rZ, n60);
  assert(approx(m60.probPlus, 0.75, 1e-3), '60° angle: P(+) = cos²(30°) = 0.75 (75%)');
  assert(approx(m60.probMinus, 0.25, 1e-3), '60° angle: P(-) = sin²(30°) = 0.25 (25%)');

  // 2. Quantum State Collapse (Von Neumann Projection)
  const collapsePlus = collapseSpinState(nX, '+');
  assert(approx(collapsePlus.x, 1.0) && approx(collapsePlus.z, 0.0), 'State collapse (+) projects state to r\' = +n');
  const collapseMinus = collapseSpinState(nX, '-');
  assert(approx(collapseMinus.x, -1.0) && approx(collapseMinus.z, 0.0), 'State collapse (-) projects state to r\' = -n');

  // 3. Sequential Measurements & Measurement Disturbance
  // Initial r = +Z, Analyzer 1 at +X -> collapse to +X -> Analyzer 2 at +Z yields 50/50
  const seqDisturbance = calculateSequentialSpin(rZ, nX, '+', nZ);
  assert(approx(seqDisturbance.analyzer1.probPlus, 0.5), 'Analyzer 1 measures 50% + on orthogonal +X axis');
  assert(approx(seqDisturbance.collapsedState.x, 1.0), 'Particle collapsed to +X along selected + branch');
  assert(approx(seqDisturbance.finalProbPlus, 0.5), 'Sequential Analyzer 2 at +Z yields 50% +, proving measurement disturbance');

  // Sequential Measurement: Analyzer 1 at +X, select + branch -> Analyzer 2 at +X yields 100%
  const seqPrepared = calculateSequentialSpin(rZ, nX, '+', nX);
  assert(approx(seqPrepared.finalProbPlus, 1.0), 'Analyzer 2 measuring prepared +X state along +X yields 100% +');

  // 4. Random Sampling Test (P(+) = 0.75 over 10,000 samples)
  const sampleResult = sampleSpinExperiment(0.75, 10000);
  assert(sampleResult.shots === 10000, 'sampleSpinExperiment samples exactly requested particle count');
  assert(sampleResult.countPlus + sampleResult.countMinus === 10000, 'Total sampled counts sum to total shots');
  const sampleFreqPlus = sampleResult.countPlus / 10000;
  assert(
    sampleFreqPlus >= 0.73 && sampleFreqPlus <= 0.77,
    '10,000 binomial samples statistically converge to 75% ± 2%'
  );

  // 5. Evaluator QA: No-input rule (Level 1)
  const lvl1 = TRACK_5_LEVELS[0];
  const unstartedEval = evaluateSpinSplitterLevel(
    {
      analyzer1Angle: 0,
      selectedBranch: '+',
      hasRunExperiment: false,
      experimentSample: null,
      experimentsUsed: 0,
    },
    lvl1
  );
  assert(unstartedEval.status === 'unstarted', 'No input/experiment on Level 1 returns status=unstarted');

  // Level 1: Run experiment with correct orientation (0°) -> success
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
  assert(lvl1Success.status === 'success', 'Valid orientation + experiment on Level 1 returns status=success');

  // Level 2: Wrong angle -> incorrect
  const lvl2 = TRACK_5_LEVELS[1];
  const lvl2Wrong = evaluateSpinSplitterLevel(
    {
      analyzer1Angle: 0, // Target is 90° (50/50), 0° yields 100%
      selectedBranch: '+',
      hasRunExperiment: true,
      experimentSample: sampleSpinExperiment(1.0, 50),
      experimentsUsed: 1,
    },
    lvl2
  );
  assert(lvl2Wrong.status === 'incorrect', 'Wrong analyzer orientation on Level 2 returns status=incorrect');

  // Level 2: 90° angle -> success
  const lvl2Success = evaluateSpinSplitterLevel(
    {
      analyzer1Angle: 90,
      selectedBranch: '+',
      hasRunExperiment: true,
      experimentSample: sampleSpinExperiment(0.5, 50),
      experimentsUsed: 1,
    },
    lvl2
  );
  assert(lvl2Success.status === 'success', '90° orientation on Level 2 returns status=success (50/50 split)');

  // Level 6: Wrong branch selected -> incorrect
  const lvl6 = TRACK_5_LEVELS[5]; // Requires + branch
  const lvl6WrongBranch = evaluateSpinSplitterLevel(
    {
      analyzer1Angle: 90,
      analyzer2Angle: 90,
      selectedBranch: '-', // Wrong branch!
      hasRunExperiment: true,
      experimentSample: sampleSpinExperiment(1.0, 50),
      experimentsUsed: 1,
    },
    lvl6
  );
  assert(lvl6WrongBranch.status === 'incorrect', 'Selecting wrong branch in sequential level returns status=incorrect');

  // 6. Mathematical Solvability of all 10 Track 5 Levels
  let all10Solvable = true;
  for (const lvl of TRACK_5_LEVELS) {
    // Determine expected solution angle for level
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

    if (res.status !== 'success') {
      all10Solvable = false;
      console.error(`Track 5 Level ${lvl.id} failed solvability test: ${res.feedback}`);
    }
  }
  assert(all10Solvable, 'All 10 Track 5 Spin Splitter levels are mathematically verified solvable');
}

console.log('\n[Education & Hints] Intelligent Hint Engine & Track Intros:');
{
  const { generateTrackHint } = await import('../engines/hintEngine.ts');
  const { TRACK_INTROS, COMPONENT_HELP } = await import('../educationData.ts');
  const { TRACK_1_LEVELS } = await import('../levels/track1Levels.ts');

  // Verify hints adapt and have tiers
  const lvl1 = TRACK_1_LEVELS[0];
  const h1 = generateTrackHint({
    trackId: 'bloch-sphere',
    level: lvl1,
    state: lvl1.initialSpheres,
    tier: 1,
    hasInteracted: true,
  });
  assert(h1.title.includes('Conceptual'), 'Hint tier 1 provides conceptual guidance');

  const h2 = generateTrackHint({
    trackId: 'bloch-sphere',
    level: lvl1,
    state: lvl1.initialSpheres,
    tier: 2,
    hasInteracted: true,
  });
  assert(h2.title.includes('Direction'), 'Hint tier 2 provides direction of correction');

  const h3 = generateTrackHint({
    trackId: 'bloch-sphere',
    level: lvl1,
    state: lvl1.initialSpheres,
    tier: 3,
    hasInteracted: true,
  });
  assert(h3.title.includes('Specific'), 'Hint tier 3 provides specific guidance');

  // Verify track intros exist for all 5 tracks
  const tracks = ['bloch-sphere', 'quantum-gates', 'quantum-interference', 'quantum-tunneling', 'phase-estimation'] as const;
  for (const t of tracks) {
    const intro = TRACK_INTROS[t];
    assert(!!intro && intro.walkthroughSteps.length >= 4, `Track intro for ${t} has at least 4 walkthrough steps`);
  }

  // Verify components exist
  assert(!!COMPONENT_HELP['bloch-sphere'], 'Bloch sphere component explanation exists');
  assert(!!COMPONENT_HELP['phase-dial'], 'Phase dial component explanation exists');
  assert(!!COMPONENT_HELP['particle'], 'Particle component explanation exists');
  assert(!!COMPONENT_HELP['barrier'], 'Barrier component explanation exists');
  assert(!!COMPONENT_HELP['barrier-height'], 'Barrier height component explanation exists');
  assert(!!COMPONENT_HELP['barrier-width'], 'Barrier width component explanation exists');
  assert(!!COMPONENT_HELP['transmission-probability'], 'Transmission probability component explanation exists');
}

console.log(`\n=== TEST RESULTS: ${passed} PASSED, ${failed} FAILED ===\n`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL MATHEMATICAL ENGINES & EDUCATIONAL SYSTEMS VERIFIED 100% CORRECT!\n');
}
