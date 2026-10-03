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
  calculateSyndrome,
  evaluateRepairLevel,
  encodeLogicalZero,
  encodeLogicalOne,
  applyBitFlip,
  applyPhaseFlip,
  identifyBitFlipLocation,
  applyCorrection,
  verifyEncodedState,
  isQuantumShieldSolved,
} from '../engines/errorCorrectionEngine.ts';
import {
  simulateQPE,
  evaluatePhaseLevel,
} from '../engines/phaseEstimationEngine.ts';

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

// TRACK 4 TESTS
console.log('\n[Track 4] Quantum Error Correction (Quantum Shield) Engine:');
{
  // 1. Encoding functions
  const zeroEncoded = encodeLogicalZero();
  assert(zeroEncoded.length === 3 && zeroEncoded.every(q => q.value === 0 && q.phaseSign === 1), 'encodeLogicalZero returns |000⟩');

  const oneEncoded = encodeLogicalOne();
  assert(oneEncoded.length === 3 && oneEncoded.every(q => q.value === 1 && q.phaseSign === 1), 'encodeLogicalOne returns |111⟩');

  // 2. Bit-flip & Phase-flip error engine
  const flippedQ1 = applyBitFlip(encodeLogicalZero(), 0);
  assert(flippedQ1[0].value === 1 && flippedQ1[1].value === 0 && flippedQ1[2].value === 0, 'applyBitFlip inverts Q1');

  const flippedQ2 = applyBitFlip(encodeLogicalZero(), 1);
  assert(flippedQ2[1].value === 1, 'applyBitFlip inverts Q2');

  const flippedQ3 = applyBitFlip(encodeLogicalZero(), 2);
  assert(flippedQ3[2].value === 1, 'applyBitFlip inverts Q3');

  const phaseFlipped = applyPhaseFlip(encodeLogicalZero(), 1);
  assert(phaseFlipped[1].phaseSign === -1, 'applyPhaseFlip inverts phaseSign of Q2');

  // 3. Syndrome calculations across all mappings
  assert(calculateSyndrome(encodeLogicalZero()).syndromeString === '00', 'Syndrome 00 means no error');
  assert(calculateSyndrome(flippedQ1).syndromeString === '10', 'Syndrome 10 identifies Q1 error');
  assert(calculateSyndrome(flippedQ2).syndromeString === '11', 'Syndrome 11 identifies Q2 error');
  assert(calculateSyndrome(flippedQ3).syndromeString === '01', 'Syndrome 01 identifies Q3 error');

  // 4. identifyBitFlipLocation mappings
  assert(identifyBitFlipLocation('10') === 0, 'identifyBitFlipLocation("10") maps to Q1 (0)');
  assert(identifyBitFlipLocation('11') === 1, 'identifyBitFlipLocation("11") maps to Q2 (1)');
  assert(identifyBitFlipLocation('01') === 2, 'identifyBitFlipLocation("01") maps to Q3 (2)');
  assert(identifyBitFlipLocation('00') === -1, 'identifyBitFlipLocation("00") maps to none (-1)');

  // 5. Corrections & Verifications
  const repairedQ2 = applyCorrection(flippedQ2, 1, 'X');
  assert(repairedQ2[1].value === 0, 'applyCorrection with X repairs Q2');

  const verificationSuccess = verifyEncodedState(repairedQ2, 0);
  assert(verificationSuccess.isRestored === true && verificationSuccess.syndrome === '00', 'verifyEncodedState confirms restoration to 000');
  assert(isQuantumShieldSolved(repairedQ2, 0) === true, 'isQuantumShieldSolved returns true for restored state');

  // 6. Wrong correction tests
  const wrongRepaired = applyCorrection(flippedQ2, 0, 'X'); // Wrong qubit Q1
  assert(verifyEncodedState(wrongRepaired, 0).isRestored === false, 'Wrong qubit correction fails verification');
  assert(isQuantumShieldSolved(wrongRepaired, 0) === false, 'isQuantumShieldSolved returns false for wrong qubit');

  // 7. Evaluator level test
  const qecLevel = {
    logicalValue: 0 as const,
    errorType: 'bit-flip' as const,
    corruptedQubitIndex: 1,
    codeType: 'bit-flip-code' as const,
    description: 'Q2 bit flip',
  };
  const wrongQ = evaluateRepairLevel({
    level: qecLevel,
    action: { targetQubit: 0, gate: 'X', applied: true },
    hasVerified: true,
  });
  assert(wrongQ.status === 'incorrect', 'Wrong qubit selection returns status=incorrect');

  const correctQ = evaluateRepairLevel({
    level: qecLevel,
    action: { targetQubit: 1, gate: 'X', applied: true },
    hasVerified: true,
  });
  assert(correctQ.status === 'success', 'Correct syndrome repair returns status=success');
}

// TRACK 5 TESTS
console.log('\n[Track 5] Quantum Phase Estimation Engine:');
{
  const qpe = simulateQPE(0.375, 3);
  assert(qpe.mostProbableBitString === '011', 'QPE identifies bitstring 011 for phi=0.375');
  assert(approx(qpe.mostProbablePhase, 0.375), 'QPE identified decimal phase is 0.375');

  const qpeLevel = {
    truePhase: 0.25,
    estimationQubits: 3,
    tolerance: 0.05,
    difficulty: 'Beginner',
    description: 'Find phase 0.250',
  };
  const wrongPhase = evaluatePhaseLevel({
    playerEstimate: 0.7,
    level: qpeLevel,
    hasInteracted: true,
    hasSampled: true,
  });
  assert(wrongPhase.status === 'incorrect', 'Estimate outside tolerance returns status=incorrect');

  const correctPhase = evaluatePhaseLevel({
    playerEstimate: 0.25,
    level: qpeLevel,
    hasInteracted: true,
    hasSampled: true,
  });
  assert(correctPhase.status === 'success', 'Estimate within tolerance returns status=success');
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
  const tracks = ['bloch-sphere', 'quantum-gates', 'quantum-interference', 'error-correction', 'phase-estimation'] as const;
  for (const t of tracks) {
    const intro = TRACK_INTROS[t];
    assert(!!intro && intro.walkthroughSteps.length === 4, `Track intro for ${t} has all 4 walkthrough steps`);
  }

  // Verify components exist
  assert(!!COMPONENT_HELP['bloch-sphere'], 'Bloch sphere component explanation exists');
  assert(!!COMPONENT_HELP['phase-dial'], 'Phase dial component explanation exists');
  assert(!!COMPONENT_HELP['syndrome-bits'], 'Syndrome bits component explanation exists');
  assert(!!COMPONENT_HELP['phase-flip-concept'], 'Phase-flip concept explanation exists');
}

console.log(`\n=== TEST RESULTS: ${passed} PASSED, ${failed} FAILED ===\n`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL MATHEMATICAL ENGINES & EDUCATIONAL SYSTEMS VERIFIED 100% CORRECT!\n');
}
