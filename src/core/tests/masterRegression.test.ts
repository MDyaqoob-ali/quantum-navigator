// Comprehensive Master QA Regression Test Suite for All 5 Tracks
// Tests all levels and evaluation scenarios on all tracks

import { describe, it, expect } from 'vitest';
import { TRACK_1_LEVELS } from '../levels/track1Levels';
import { TRACK_2_LEVELS } from '../levels/track2Levels';
import { TRACK_3_LEVELS } from '../levels/track3Levels';
import { TRACK_4_LEVELS } from '../levels/track4Levels';
import { TRACK_5_LEVELS } from '../levels/track5Levels';

import { evaluateBlochLevel } from '../engines/blochEngine';
import { evaluateGateLevel, PlacedGate } from '../engines/gateSimulationEngine';
import { evaluateInterferenceLevel } from '../engines/interferenceEngine';
import { evaluateTunnelingLevel } from '../engines/tunnelingEngine';
import { evaluateSpinSplitterLevel, sampleSpinExperiment } from '../engines/spinSplitterEngine';

describe('Master QA Regression — Track 1: Qubits & The Bloch Sphere', () => {
  for (const lvl of TRACK_1_LEVELS) {
    it(`Level ${lvl.levelNumber}: ${lvl.title} passes all evaluation scenarios`, () => {
      // 1. Unstarted
      const noInput = evaluateBlochLevel({
        currentSpheres: lvl.initialSpheres,
        initialSpheres: lvl.initialSpheres,
        targetTheta: lvl.targetTheta,
        targetPhi: lvl.targetPhi,
        toleranceDegrees: lvl.toleranceDegrees,
        hasInteracted: false,
      });
      expect(noInput.status).toBe('unstarted');

      // 2. Unmoved / Incomplete
      const unmoved = evaluateBlochLevel({
        currentSpheres: lvl.initialSpheres,
        initialSpheres: lvl.initialSpheres,
        targetTheta: lvl.targetTheta,
        targetPhi: lvl.targetPhi,
        toleranceDegrees: lvl.toleranceDegrees,
        hasInteracted: true,
      });
      expect(unmoved.status).toBe('incomplete');

      // 3. Opposite direction
      const opp = evaluateBlochLevel({
        currentSpheres: lvl.initialSpheres.map((s: any) => ({
          ...s,
          theta: Math.PI - s.theta,
          phi: (s.phi + Math.PI) % (2 * Math.PI),
        })),
        initialSpheres: lvl.initialSpheres,
        targetTheta: lvl.targetTheta,
        targetPhi: lvl.targetPhi,
        toleranceDegrees: lvl.toleranceDegrees,
        hasInteracted: true,
      });
      expect(opp.status === 'incorrect' || opp.status === 'incomplete').toBe(true);

      // 4. Invalid input (NaN)
      const invalid = evaluateBlochLevel({
        currentSpheres: [{ id: '1', name: 'NaN', isFixed: false, theta: NaN, phi: 0, weight: 1 }],
        initialSpheres: lvl.initialSpheres,
        targetTheta: lvl.targetTheta,
        targetPhi: lvl.targetPhi,
        toleranceDegrees: lvl.toleranceDegrees,
        hasInteracted: true,
      });
      expect(invalid.status).toBe('invalid');
    });
  }
});

describe('Master QA Regression — Track 2: Quantum Logic Gates', () => {
  for (const lvl of TRACK_2_LEVELS) {
    it(`Level ${lvl.levelNumber}: ${lvl.title} passes circuit evaluation scenarios`, () => {
      // 1. Unstarted
      const unstarted = evaluateGateLevel({
        circuit: [],
        level: lvl.gateLevel,
        hasInteracted: false,
      });
      expect(unstarted.status).toBe('unstarted');

      // 2. Empty circuit
      const empty = evaluateGateLevel({
        circuit: [],
        level: lvl.gateLevel,
        hasRun: true,
      });
      expect(empty.status).toBe('incomplete');

      // 3. Deliberately wrong circuit
      const wrong = [
        { id: 'wrong_1', type: 'Z' as const, targetWire: 0, timeStep: 0 },
      ];
      const wrongEval = evaluateGateLevel({
        circuit: wrong,
        level: lvl.gateLevel,
        hasRun: true,
      });
      expect(wrongEval.status === 'incorrect' || wrongEval.status === 'incomplete').toBe(true);
    });
  }
});

describe('Master QA Regression — Track 3: Quantum Interference', () => {
  for (const lvl of TRACK_3_LEVELS) {
    it(`Level ${lvl.levelNumber}: ${lvl.title} passes wave evaluation scenarios`, () => {
      // 1. Unstarted
      const noInt = evaluateInterferenceLevel({
        currentPaths: lvl.interferenceLevel.paths,
        initialPaths: lvl.interferenceLevel.paths,
        targetDetectorA: lvl.interferenceLevel.targetDetectorA,
        targetDetectorB: lvl.interferenceLevel.targetDetectorB,
        tolerance: lvl.interferenceLevel.tolerance,
        hasInteracted: false,
      });
      expect(noInt.status).toBe('unstarted');

      // 2. Unmoved phase
      const unmoved = evaluateInterferenceLevel({
        currentPaths: lvl.interferenceLevel.paths,
        initialPaths: lvl.interferenceLevel.paths,
        targetDetectorA: lvl.interferenceLevel.targetDetectorA,
        targetDetectorB: lvl.interferenceLevel.targetDetectorB,
        tolerance: lvl.interferenceLevel.tolerance,
        hasInteracted: true,
      });
      expect(unmoved.status).toBe('incomplete');
    });
  }
});

describe('Master QA Regression — Track 4: Quantum Tunneling (Tunnel Run)', () => {
  const track4Solutions = [
    { particleEnergy: 0.81, barriers: [{ id: 'b1', height: 1.0, width: 0.8 }] },
    { particleEnergy: 0.60, barriers: [{ id: 'b1', height: 1.0, width: 1.25 }] },
    { particleEnergy: 0.50, barriers: [{ id: 'b1', height: 1.35, width: 0.7 }] },
    { particleEnergy: 0.65, barriers: [{ id: 'b1', height: 1.0, width: 0.85 }] },
    { particleEnergy: 0.65, barriers: [{ id: 'b1', height: 1.15, width: 0.9 }] },
    { particleEnergy: 0.60, barriers: [{ id: 'b1', height: 1.00, width: 0.70 }] },
    { particleEnergy: 0.80, barriers: [{ id: 'b1', height: 1.2, width: 0.4 }, { id: 'b2', height: 1.2, width: 0.4 }] },
    { particleEnergy: 0.35, barriers: [{ id: 'b1', height: 1.0, width: 0.5 }, { id: 'b2', height: 1.3, width: 0.4 }] },
    { particleEnergy: 0.50, barriers: [{ id: 'b1', height: 1.1, width: 0.35 }, { id: 'b2', height: 1.1, width: 0.35 }, { id: 'b3', height: 1.1, width: 0.35 }] },
    { particleEnergy: 0.92, barriers: [{ id: 'b1', height: 1.0, width: 0.20 }, { id: 'b2', height: 1.2, width: 0.3 }, { id: 'b3', height: 1.2, width: 0.3 }, { id: 'b4', height: 1.0, width: 0.3 }] },
  ];

  for (let i = 0; i < TRACK_4_LEVELS.length; i++) {
    const lvl = TRACK_4_LEVELS[i];
    it(`Level ${lvl.levelNumber}: ${lvl.title} passes tunneling evaluation scenarios`, () => {
      // 1. Unstarted
      const unstarted = evaluateTunnelingLevel(lvl.tunnelingLevel.initialState, lvl.tunnelingLevel, 0, false);
      expect(unstarted.status).toBe('unstarted');

      // 2. Unmoved / Incomplete
      const incomplete = evaluateTunnelingLevel(lvl.tunnelingLevel.initialState, lvl.tunnelingLevel, 1, true);
      expect(incomplete.status === 'incomplete' || incomplete.status === 'incorrect').toBe(true);

      // 3. Invalid (E >= V0 in tunneling mode)
      const invalid = evaluateTunnelingLevel(
        { particleEnergy: 9.9, barriers: lvl.tunnelingLevel.initialState.barriers },
        lvl.tunnelingLevel,
        1,
        true
      );
      expect(invalid.status).toBe('invalid');

      // 4. Verified physical solution reaches success
      const solution = track4Solutions[i];
      const success = evaluateTunnelingLevel(solution, lvl.tunnelingLevel, 1, true);
      expect(success.status).toBe('success');
      expect(success.score).toBeGreaterThan(500);
    });
  }
});

describe('Master QA Regression — Track 5: Quantum Spin & Measurement (Spin Splitter)', () => {
  for (const lvl of TRACK_5_LEVELS) {
    it(`Level ${lvl.levelNumber}: ${lvl.title} passes spin evaluation scenarios`, () => {
      // 1. Unstarted
      const unstarted = evaluateSpinSplitterLevel(
        {
          analyzer1Angle: lvl.analyzer1InitialAngle,
          analyzer2Angle: lvl.analyzer2InitialAngle,
          selectedBranch: '+',
          hasRunExperiment: false,
          experimentSample: null,
          experimentsUsed: 0,
        },
        lvl
      );
      expect(unstarted.status).toBe('unstarted');

      // 2. Budget exceeded check (if level has allowedExperiments)
      if (lvl.allowedExperiments) {
        const overBudget = evaluateSpinSplitterLevel(
          {
            analyzer1Angle: lvl.analyzer1InitialAngle,
            analyzer2Angle: lvl.analyzer2InitialAngle,
            selectedBranch: '+',
            hasRunExperiment: true,
            experimentSample: sampleSpinExperiment(lvl.targetProbPlus, 50),
            experimentsUsed: lvl.allowedExperiments + 1,
          },
          lvl
        );
        expect(overBudget.status).toBe('invalid');
      }

      // 3. Wrong branch check (if level requires branch selection)
      if (lvl.branchSelectionRequired && lvl.targetBranch) {
        const wrongBranch = lvl.targetBranch === '+' ? '-' : '+';
        const branchFail = evaluateSpinSplitterLevel(
          {
            analyzer1Angle: lvl.analyzer1InitialAngle,
            analyzer2Angle: lvl.analyzer2InitialAngle,
            selectedBranch: wrongBranch,
            hasRunExperiment: true,
            experimentSample: sampleSpinExperiment(lvl.targetProbPlus, 50),
            experimentsUsed: 1,
          },
          lvl
        );
        expect(branchFail.status).toBe('incorrect');
      }

      // 4. Solvable configuration yields success
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

      const success = evaluateSpinSplitterLevel(
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
      expect(success.status).toBe('success');
      expect(success.score).toBeGreaterThan(150);
    });
  }
});
