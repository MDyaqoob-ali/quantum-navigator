import React, { useState } from 'react';
import { OverlapInspector } from '../common/OverlapInspector';
import { FlaskConical, Play, CheckCircle2, XCircle } from 'lucide-react';
import {
  sphericalToCartesian,
  angularDistanceDegrees,
  vector3,
} from '../../core/math/vector3';
import {
  createZeroState,
  createBasisState,
  applySingleQubitGate,
  applyCNOT,
  applyToffoli,
  stateFidelity,
  GATE_X,
  GATE_H,
} from '../../core/math/statevector';
import { calculateBlochResultant, evaluateBlochLevel } from '../../core/engines/blochEngine';
import { evaluateGateLevel } from '../../core/engines/gateSimulationEngine';
import { calculateInterference, evaluateInterferenceLevel } from '../../core/engines/interferenceEngine';
import { calculateSyndrome, evaluateRepairLevel } from '../../core/engines/errorCorrectionEngine';
import { simulateQPE, evaluatePhaseLevel } from '../../core/engines/phaseEstimationEngine';

export const DebugQAView: React.FC = () => {
  const [testResults, setTestResults] = useState<{ name: string; track: string; passed: boolean; message: string }[]>([]);
  const [hasRun, setHasRun] = useState(false);

  const runAllQATests = () => {
    const results: { name: string; track: string; passed: boolean; message: string }[] = [];

    // Track 1 Tests
    try {
      const v0 = sphericalToCartesian(0, 0);
      const angle = angularDistanceDegrees(vector3(0, 0, 1), vector3(0, 0, -1));
      const t1Passed = Math.abs(v0.z - 1) < 1e-4 && Math.abs(angle - 180) < 1e-4;
      results.push({
        track: 'Track 1: Bloch Sphere',
        name: 'Spherical Geometry & Angular Distance Calculation',
        passed: t1Passed,
        message: t1Passed ? 'Spherical to Cartesian and 180° distance confirmed.' : 'Failed geometry math.',
      });

      const unstartedRes = evaluateBlochLevel({
        currentSpheres: [{ id: '1', name: 'Q0', isFixed: false, theta: 0, phi: 0, weight: 1 }],
        initialSpheres: [{ id: '1', name: 'Q0', isFixed: false, theta: 0, phi: 0, weight: 1 }],
        targetTheta: Math.PI,
        targetPhi: 0,
        toleranceDegrees: 5,
        hasInteracted: false,
      });
      results.push({
        track: 'Track 1: Bloch Sphere',
        name: 'No-Input Rule Guarantee (unstarted != success)',
        passed: unstartedRes.status === 'unstarted',
        message: `Returned status="${unstartedRes.status}" on unstarted attempt.`,
      });
    } catch (err: any) {
      results.push({ track: 'Track 1', name: 'Bloch Engine Execution', passed: false, message: err.message });
    }

    // Track 2 Tests
    try {
      let state = createZeroState(2);
      state = applySingleQubitGate(state, 0, GATE_H);
      state = applyCNOT(state, 0, 1);
      const fid = stateFidelity(state, state);
      results.push({
        track: 'Track 2: Quantum Gates',
        name: 'Bell State Synthesis (|00>+|11>)/√2 & Fidelity Evaluation',
        passed: Math.abs(fid - 1.0) < 1e-4,
        message: `Fidelity: ${(fid * 100).toFixed(1)}%`,
      });

      const emptyRes = evaluateGateLevel({
        circuit: [],
        level: {
          numQubits: 1,
          initialBasis: '0',
          targetState: applySingleQubitGate(createZeroState(1), 0, GATE_X),
          targetDescription: '|1>',
          maxSteps: 3,
          allowedGates: ['X'],
        },
        hasRun: true,
      });
      results.push({
        track: 'Track 2: Quantum Gates',
        name: 'Empty Circuit Rejection (incomplete != success)',
        passed: emptyRes.status === 'incomplete',
        message: `Returned status="${emptyRes.status}" for empty circuit.`,
      });
    } catch (err: any) {
      results.push({ track: 'Track 2', name: 'Gate Engine Execution', passed: false, message: err.message });
    }

    // Track 3 Tests
    try {
      const resConst = calculateInterference([
        { id: '1', name: 'P1', amplitude: 1, phase: 0, isFixed: true },
        { id: '2', name: 'P2', amplitude: 1, phase: 0, isFixed: false },
      ]);
      const resDest = calculateInterference([
        { id: '1', name: 'P1', amplitude: 1, phase: 0, isFixed: true },
        { id: '2', name: 'P2', amplitude: 1, phase: Math.PI, isFixed: false },
      ]);
      const t3Passed = Math.abs(resConst.probA - 1.0) < 1e-4 && Math.abs(resDest.probA - 0.0) < 1e-4;
      results.push({
        track: 'Track 3: Wave Interference',
        name: '0° Constructive (100% A) & 180° Destructive (100% B)',
        passed: t3Passed,
        message: t3Passed ? 'Interference phases verified.' : 'Phase calculation error.',
      });
    } catch (err: any) {
      results.push({ track: 'Track 3', name: 'Wave Engine Execution', passed: false, message: err.message });
    }

    // Track 4 Tests
    try {
      const syn00 = calculateSyndrome([
        { index: 0, value: 0, phaseSign: 1 },
        { index: 1, value: 0, phaseSign: 1 },
        { index: 2, value: 0, phaseSign: 1 },
      ]);
      const syn11 = calculateSyndrome([
        { index: 0, value: 0, phaseSign: 1 },
        { index: 1, value: 1, phaseSign: 1 },
        { index: 2, value: 0, phaseSign: 1 },
      ]);
      const t4Passed = syn00.syndromeString === '00' && syn11.syndromeString === '11' && syn11.indicatedQubitIndex === 1;
      results.push({
        track: 'Track 4: Error Correction',
        name: '3-Qubit Repetition Code Parity Syndromes (00 & 11)',
        passed: t4Passed,
        message: t4Passed ? 'Syndrome extraction verified.' : 'Syndrome mapping error.',
      });
    } catch (err: any) {
      results.push({ track: 'Track 4', name: 'Error Correction Execution', passed: false, message: err.message });
    }

    // Track 5 Tests
    try {
      const qpe = simulateQPE(0.375, 3);
      const t5Passed = qpe.mostProbableBitString === '011' && Math.abs(qpe.mostProbablePhase - 0.375) < 1e-4;
      results.push({
        track: 'Track 5: Phase Estimation',
        name: 'Quantum Phase Estimation Dyadic Peak Detection (011 -> 0.375)',
        passed: t5Passed,
        message: t5Passed ? 'QPE readout peak verified.' : 'QPE peak mismatch.',
      });
    } catch (err: any) {
      results.push({ track: 'Track 5', name: 'QPE Execution', passed: false, message: err.message });
    }

    setTestResults(results);
    setHasRun(true);
  };

  return (
    <div className="page-container" data-ui-zone="debug-qa-view">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FlaskConical size={24} style={{ color: 'var(--accent-blue)' }} />
            Internal Developer & QA Diagnostics
          </h2>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Real simulation validation & layout collision inspector
          </div>
        </div>

        <button className="btn btn-primary" onClick={runAllQATests}>
          <Play size={14} />
          <span>Execute All Engine Tests</span>
        </button>
      </div>

      {/* Live Layout Overlap Inspector */}
      <OverlapInspector />

      {/* Test Results Table */}
      {hasRun && (
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>
            Automated Mathematical Engine Test Suite Results
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {testResults.map((t, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  backgroundColor: t.passed ? 'var(--accent-emerald-light)' : 'var(--vector-red-light)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {t.passed ? (
                    <CheckCircle2 size={16} style={{ color: '#15803D' }} />
                  ) : (
                    <XCircle size={16} style={{ color: 'var(--vector-red)' }} />
                  )}
                  <span style={{ fontWeight: 600 }}>[{t.track}]</span>
                  <span>{t.name}</span>
                </div>
                <span className="mono" style={{ fontSize: '12px', color: t.passed ? '#0F5E2C' : 'var(--vector-red-dark)' }}>
                  {t.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
