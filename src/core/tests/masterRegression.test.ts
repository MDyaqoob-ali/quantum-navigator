// Comprehensive Master QA Regression Test Suite for All 5 Tracks
// Tests all 12 evaluation scenarios on all levels

import { TRACK_1_LEVELS } from '../levels/track1Levels';
import { TRACK_2_LEVELS } from '../levels/track2Levels';
import { TRACK_3_LEVELS } from '../levels/track3Levels';
import { TRACK_4_LEVELS } from '../levels/track4Levels';
import { TRACK_5_LEVELS } from '../levels/track5Levels';

import { evaluateBlochLevel } from '../engines/blochEngine';
import { evaluateGateLevel, PlacedGate } from '../engines/gateSimulationEngine';
import { evaluateInterferenceLevel } from '../engines/interferenceEngine';
import { evaluateRepairLevel } from '../engines/errorCorrectionEngine';
import { evaluatePhaseLevel } from '../engines/phaseEstimationEngine';

let totalTests = 0;
let passedTests = 0;

function check(cond: boolean, name: string) {
  totalTests++;
  if (cond) {
    passedTests++;
    console.log(`  ✓ ${name}`);
  } else {
    console.error(`  ❌ FAILED: ${name}`);
    throw new Error(`Regression test failed: ${name}`);
  }
}

console.log('=====================================================');
console.log('STARTING MASTER QA REGRESSION ON ALL 5 QUANTUM TRACKS');
console.log('=====================================================\n');

// 1. TRACK 1 MASTER REGRESSION
console.log('--- TRACK 1: QUBITS & THE BLOCH SPHERE ---');
for (const lvl of TRACK_1_LEVELS) {
  console.log(`Testing Level ${lvl.levelNumber}: ${lvl.title}`);

  // Test 1: No input / unstarted
  const noInput = evaluateBlochLevel({
    currentSpheres: lvl.initialSpheres,
    initialSpheres: lvl.initialSpheres,
    targetTheta: lvl.targetTheta,
    targetPhi: lvl.targetPhi,
    toleranceDegrees: lvl.toleranceDegrees,
    hasInteracted: false,
  });
  check(noInput.status === 'unstarted', `[T1 L${lvl.levelNumber}] No-input returns status="unstarted"`);

  // Test 2: Unmoved / incomplete
  const unmoved = evaluateBlochLevel({
    currentSpheres: lvl.initialSpheres,
    initialSpheres: lvl.initialSpheres,
    targetTheta: lvl.targetTheta,
    targetPhi: lvl.targetPhi,
    toleranceDegrees: lvl.toleranceDegrees,
    hasInteracted: true,
  });
  check(unmoved.status === 'incomplete', `[T1 L${lvl.levelNumber}] Unmoved spheres return status="incomplete"`);

  // Test 3: Clearly wrong input
  const wrongSpheres = lvl.initialSpheres.map(s =>
    s.isFixed ? s : { ...s, theta: Math.PI - lvl.targetTheta, phi: (lvl.targetPhi + Math.PI) % (2 * Math.PI) }
  );
  const wrong = evaluateBlochLevel({
    currentSpheres: wrongSpheres,
    initialSpheres: lvl.initialSpheres,
    targetTheta: lvl.targetTheta,
    targetPhi: lvl.targetPhi,
    toleranceDegrees: lvl.toleranceDegrees,
    hasInteracted: true,
  });
  check(wrong.status === 'incorrect', `[T1 L${lvl.levelNumber}] Opposite input returns status="incorrect"`);

  // Test 4: Invalid input (NaN / Infinity)
  const invalid = evaluateBlochLevel({
    currentSpheres: [{ id: 's1', name: 'Q', isFixed: false, theta: NaN, phi: 0, weight: 1 }],
    initialSpheres: lvl.initialSpheres,
    targetTheta: lvl.targetTheta,
    targetPhi: lvl.targetPhi,
    toleranceDegrees: lvl.toleranceDegrees,
    hasInteracted: true,
  });
  check(invalid.status === 'invalid', `[T1 L${lvl.levelNumber}] NaN input returns status="invalid"`);
}

// 2. TRACK 2 MASTER REGRESSION
console.log('\n--- TRACK 2: QUANTUM LOGIC GATES ---');
for (const lvl of TRACK_2_LEVELS) {
  console.log(`Testing Level ${lvl.levelNumber}: ${lvl.title}`);

  // Test 1: Unstarted
  const unstarted = evaluateGateLevel({
    circuit: [],
    level: lvl.gateLevel,
    hasRun: false,
  });
  check(unstarted.status === 'unstarted', `[T2 L${lvl.levelNumber}] Unstarted returns status="unstarted"`);

  // Test 2: Empty circuit
  const empty = evaluateGateLevel({
    circuit: [],
    level: lvl.gateLevel,
    hasRun: true,
  });
  check(empty.status === 'incomplete', `[T2 L${lvl.levelNumber}] Empty circuit returns status="incomplete"`);

  // Test 3: Wrong gate sequence
  const wrongCircuit: PlacedGate[] = [{ id: 'w1', type: 'Z', targetWire: 0, step: 0 }];
  const wrong = evaluateGateLevel({
    circuit: wrongCircuit,
    level: lvl.gateLevel,
    hasRun: true,
  });
  check(wrong.status === 'incorrect', `[T2 L${lvl.levelNumber}] Wrong circuit returns status="incorrect"`);
}

// 3. TRACK 3 MASTER REGRESSION
console.log('\n--- TRACK 3: QUANTUM INTERFERENCE ---');
for (const lvl of TRACK_3_LEVELS) {
  console.log(`Testing Level ${lvl.levelNumber}: ${lvl.title}`);

  // Test 1: No interaction
  const noInt = evaluateInterferenceLevel({
    currentPaths: lvl.interferenceLevel.paths,
    initialPaths: lvl.interferenceLevel.paths,
    targetDetectorA: lvl.interferenceLevel.targetDetectorA,
    targetDetectorB: lvl.interferenceLevel.targetDetectorB,
    tolerance: lvl.interferenceLevel.tolerance,
    hasInteracted: false,
  });
  check(noInt.status === 'unstarted', `[T3 L${lvl.levelNumber}] No interaction returns status="unstarted"`);

  // Test 2: Incomplete (unmoved phase)
  const unmoved = evaluateInterferenceLevel({
    currentPaths: lvl.interferenceLevel.paths,
    initialPaths: lvl.interferenceLevel.paths,
    targetDetectorA: lvl.interferenceLevel.targetDetectorA,
    targetDetectorB: lvl.interferenceLevel.targetDetectorB,
    tolerance: lvl.interferenceLevel.tolerance,
    hasInteracted: true,
  });
  check(unmoved.status === 'incomplete', `[T3 L${lvl.levelNumber}] Unmoved phase returns status="incomplete"`);
}

// 4. TRACK 4 MASTER REGRESSION
console.log('\n--- TRACK 4: QUANTUM ERROR CORRECTION ---');
for (const lvl of TRACK_4_LEVELS) {
  console.log(`Testing Level ${lvl.levelNumber}: ${lvl.title}`);

  // Test 1: Unverified
  const unverified = evaluateRepairLevel({
    level: lvl.errorLevel,
    action: { targetQubit: null, gate: null, applied: false },
    hasVerified: false,
  });
  check(unverified.status === 'unstarted', `[T4 L${lvl.levelNumber}] Unverified returns status="unstarted"`);

  // Test 2: Incomplete (no qubit or gate selected)
  const incomplete = evaluateRepairLevel({
    level: lvl.errorLevel,
    action: { targetQubit: null, gate: null, applied: true },
    hasVerified: true,
  });
  check(incomplete.status === 'incomplete', `[T4 L${lvl.levelNumber}] No qubit/gate returns status="incomplete"`);

  // Test 3: Wrong qubit selected
  const wrongQubitIndex = (lvl.errorLevel.corruptedQubitIndex + 1) % 3;
  const wrongQ = evaluateRepairLevel({
    level: lvl.errorLevel,
    action: { targetQubit: wrongQubitIndex, gate: 'X', applied: true },
    hasVerified: true,
  });
  check(wrongQ.status === 'incorrect', `[T4 L${lvl.levelNumber}] Wrong qubit returns status="incorrect"`);

  // Test 4: Correct qubit and gate
  const correctGate = lvl.errorLevel.errorType === 'phase-flip' ? 'Z' : 'X';
  const correct = evaluateRepairLevel({
    level: lvl.errorLevel,
    action: { targetQubit: lvl.errorLevel.corruptedQubitIndex, gate: correctGate, applied: true },
    hasVerified: true,
  });
  check(correct.status === 'success', `[T4 L${lvl.levelNumber}] Correct repair returns status="success"`);
}

// 5. TRACK 5 MASTER REGRESSION
console.log('\n--- TRACK 5: QUANTUM PHASE ESTIMATION ---');
for (const lvl of TRACK_5_LEVELS) {
  console.log(`Testing Level ${lvl.levelNumber}: ${lvl.title}`);

  // Test 1: Unstarted
  const unstarted = evaluatePhaseLevel({
    playerEstimate: 0.1,
    level: lvl.phaseLevel,
    hasInteracted: false,
    hasSampled: false,
  });
  check(unstarted.status === 'unstarted', `[T5 L${lvl.levelNumber}] Unstarted returns status="unstarted"`);

  // Test 2: Wrong estimate
  const wrongEst = (lvl.phaseLevel.truePhase + 0.5) % 1.0;
  const wrong = evaluatePhaseLevel({
    playerEstimate: wrongEst,
    level: lvl.phaseLevel,
    hasInteracted: true,
    hasSampled: true,
  });
  check(wrong.status === 'incorrect', `[T5 L${lvl.levelNumber}] Wrong estimate returns status="incorrect"`);

  // Test 3: Correct estimate
  const correct = evaluatePhaseLevel({
    playerEstimate: lvl.phaseLevel.truePhase,
    level: lvl.phaseLevel,
    hasInteracted: true,
    hasSampled: true,
  });
  check(correct.status === 'success', `[T5 L${lvl.levelNumber}] Exact phase estimate returns status="success"`);
}

console.log(`\n=====================================================`);
console.log(`MASTER REGRESSION COMPLETE: ${passedTests} / ${totalTests} TESTS PASSED!`);
console.log(`=====================================================\n`);
