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
  simulateQPE,
  sampleQPEMeasurements,
  evaluatePhaseLevel,
  evaluateQuantumRadarLevel,
  verifyQFTUnitarity,
  calculateCircularDistance,
  binaryFractionToPhase,
  phaseToBinaryFraction,
} from '../engines/phaseEstimationEngine.ts';
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

// TRACK 5 TESTS: QUANTUM PHASE ESTIMATION (QUANTUM RADAR)
console.log('\n[Track 5] Quantum Phase Estimation (Quantum Radar) Engine:');
{
  // 1. Exact Dyadic Eigenphase Reconstruction
  const qpe3 = simulateQPE(0.375, 3);
  assert(qpe3.mostProbableBitString === '011', 'QPE identifies bitstring 011 for phi=0.375 (3-bit)');
  assert(approx(qpe3.mostProbablePhase, 0.375), 'QPE identified decimal phase is 0.375');
  assert(approx(qpe3.theoreticalPeakProb, 1.0, 1e-4), 'Exact dyadic phase has 100% peak probability in ideal simulation');

  const qpe2 = simulateQPE(0.25, 2);
  assert(qpe2.mostProbableBitString === '01', 'QPE identifies bitstring 01 for phi=0.25 (2-bit)');
  assert(approx(qpe2.mostProbablePhase, 0.25), '2-bit QPE gives 0.250');

  const qpe4 = simulateQPE(0.4375, 4);
  assert(qpe4.mostProbableBitString === '0111', '4-bit QPE resolves 7/16 = 0.4375 into bitstring 0111');
  assert(approx(qpe4.mostProbablePhase, 0.4375), '4-bit QPE identified phase is 0.4375');

  // 2. Unitarity of Inverse QFT Matrix
  assert(verifyQFTUnitarity(2), 'Inverse QFT matrix is strictly unitary for 2 qubits (QFT† * QFT = I)');
  assert(verifyQFTUnitarity(3), 'Inverse QFT matrix is strictly unitary for 3 qubits');
  assert(verifyQFTUnitarity(4), 'Inverse QFT matrix is strictly unitary for 4 qubits');

  // 3. Periodic Circular Distance
  assert(approx(calculateCircularDistance(0.99, 0.01), 0.02), 'Circular distance handles periodic boundary (0.99 to 0.01 is 0.02)');
  assert(approx(calculateCircularDistance(0.25, 0.75), 0.50), 'Circular distance handles antipodal phases (0.25 to 0.75 is 0.50)');

  // 4. Binary Fraction Conversions
  assert(approx(binaryFractionToPhase('011'), 0.375), 'binaryFractionToPhase maps 011 -> 0.375');
  assert(phaseToBinaryFraction(0.375, 3) === '011', 'phaseToBinaryFraction maps 0.375 -> 011 for 3 bits');
  assert(approx(binaryFractionToPhase('0111'), 0.4375), 'binaryFractionToPhase maps 0111 -> 0.4375');

  // 5. Probabilistic Measurement Sampling
  const shots = 100;
  const sampledCounts = sampleQPEMeasurements(qpe3, shots);
  const totalCounts = Object.values(sampledCounts).reduce((a, b) => a + b, 0);
  assert(totalCounts === shots, 'sampleQPEMeasurements samples exactly requested number of shots');
  assert((sampledCounts['011'] || 0) === shots, 'Dominant dyadic outcome captures 100% of counts in ideal measurement');

  // 6. Non-exact continuous phase diffraction spread
  const nonExactQPE = simulateQPE(0.3125, 3);
  assert(nonExactQPE.probabilities.length === 8, 'Non-exact phase simulation returns complete 8-bin probability vector');
  const sumProb = nonExactQPE.probabilities.reduce((acc, p) => acc + p.prob, 0);
  assert(approx(sumProb, 1.0, 1e-4), 'Non-exact phase distribution strictly conserves total probability = 1.0');

  // 7. Track 5 Level 1 Configuration & Universal Evaluator
  const level1 = TRACK_5_LEVELS[0];

  // No input -> unstarted
  const unstartedRadar = evaluateQuantumRadarLevel(
    {
      selectedSignalId: null,
      selectedPrecisionBits: 2,
      hasRunQPE: false,
      measurementCounts: null,
      totalShotsSampled: 0,
      playerPhaseEstimate: null,
      isLocked: false,
      scansUsed: 0,
    },
    level1
  );
  assert(unstartedRadar.status === 'unstarted', 'No signal selected returns status=unstarted');

  // Signal selected, no QPE run -> incomplete
  const incompleteRadar = evaluateQuantumRadarLevel(
    {
      selectedSignalId: 'S2',
      selectedPrecisionBits: 2,
      hasRunQPE: false,
      measurementCounts: null,
      totalShotsSampled: 0,
      playerPhaseEstimate: null,
      isLocked: false,
      scansUsed: 0,
    },
    level1
  );
  assert(incompleteRadar.status === 'incomplete', 'Signal selected without QPE run returns status=incomplete');

  // Wrong signal selected -> incorrect
  const wrongSignalRadar = evaluateQuantumRadarLevel(
    {
      selectedSignalId: 'S1', // S1 is Alpha, target is S2 Beta
      selectedPrecisionBits: 2,
      hasRunQPE: true,
      measurementCounts: { '01': 100 },
      totalShotsSampled: 100,
      playerPhaseEstimate: 0.20,
      isLocked: true,
      scansUsed: 1,
    },
    level1
  );
  assert(wrongSignalRadar.status === 'incorrect', 'Wrong signal selected returns status=incorrect');

  // Right signal, wrong estimate -> incorrect
  const wrongEstimateRadar = evaluateQuantumRadarLevel(
    {
      selectedSignalId: 'S2',
      selectedPrecisionBits: 2,
      hasRunQPE: true,
      measurementCounts: { '10': 100 },
      totalShotsSampled: 100,
      playerPhaseEstimate: 0.15,
      isLocked: true,
      scansUsed: 1,
    },
    level1
  );
  assert(wrongEstimateRadar.status === 'incorrect', 'Estimate outside tolerance returns status=incorrect');

  // Right signal, correct estimate -> success
  const successRadar = evaluateQuantumRadarLevel(
    {
      selectedSignalId: 'S2',
      selectedPrecisionBits: 2,
      hasRunQPE: true,
      measurementCounts: { '10': 100 },
      totalShotsSampled: 100,
      playerPhaseEstimate: 0.50,
      isLocked: true,
      scansUsed: 1,
    },
    level1
  );
  assert(successRadar.status === 'success', 'Correct signal and estimate within tolerance returns status=success');

  // 8. Verify Solvability of all 10 Track 5 Levels
  let all10Solvable = true;
  for (const lvl of TRACK_5_LEVELS) {
    const targetSig = lvl.signals.find(s => s.id === lvl.targetSignalId);
    if (!targetSig) {
      all10Solvable = false;
      break;
    }
    const evalResult = evaluateQuantumRadarLevel(
      {
        selectedSignalId: lvl.targetSignalId,
        selectedPrecisionBits: lvl.requiredPrecisionBits || 3,
        hasRunQPE: true,
        measurementCounts: { '00': 100 },
        totalShotsSampled: 100,
        playerPhaseEstimate: targetSig.truePhase,
        isLocked: true,
        scansUsed: 1,
      },
      lvl
    );
    if (evalResult.status !== 'success') {
      all10Solvable = false;
      console.error(`Level ${lvl.id} failed verification: ${evalResult.feedback}`);
    }
  }
  assert(all10Solvable, 'All 10 Track 5 Quantum Radar levels are mathematically verified solvable');
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
