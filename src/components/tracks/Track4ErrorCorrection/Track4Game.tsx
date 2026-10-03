import React, { useState, useEffect, useMemo } from 'react';
import { RepairLevelConfig } from '../../../core/levels/track4Levels';
import {
  QubitPhysicalState,
  PlayerRepairAction,
  CorrectionGate,
  generateCorruptedState,
  calculateSyndrome,
  applyRepairToQubits,
  evaluateRepairLevel,
} from '../../../core/engines/errorCorrectionEngine';
import { EvaluationResult } from '../../../core/types';
import { ResultPanel } from '../../common/ResultPanel';
import { ShieldCheck, AlertCircle, Wrench, CheckCircle } from 'lucide-react';

interface Track4GameProps {
  level: RepairLevelConfig;
  evaluation: EvaluationResult;
  onEvaluate: (result: EvaluationResult) => void;
  onRecordInteraction: () => void;
  onNextLevel: () => void;
}

export const Track4Game: React.FC<Track4GameProps> = ({
  level,
  evaluation,
  onEvaluate,
  onRecordInteraction,
  onNextLevel,
}) => {
  const [selectedQubit, setSelectedQubit] = useState<number | null>(null);
  const [selectedGate, setSelectedGate] = useState<CorrectionGate | null>(null);
  const [isApplied, setIsApplied] = useState(false);

  useEffect(() => {
    setSelectedQubit(null);
    setSelectedGate(null);
    setIsApplied(false);
  }, [level.id]);

  // Initial corrupted state
  const initialCorrupted = useMemo(() => {
    return generateCorruptedState(level.errorLevel);
  }, [level.errorLevel]);

  // Active syndrome calculated from actual corrupted memory
  const syndrome = useMemo(() => {
    return calculateSyndrome(initialCorrupted);
  }, [initialCorrupted]);

  // Player action
  const currentAction: PlayerRepairAction = useMemo(() => {
    return {
      targetQubit: selectedQubit,
      gate: selectedGate,
      applied: isApplied,
    };
  }, [selectedQubit, selectedGate, isApplied]);

  // Simulated state after applying repair
  const repairedQubits = useMemo(() => {
    return applyRepairToQubits(initialCorrupted, currentAction);
  }, [initialCorrupted, currentAction]);

  const handleSelectQubit = (qIdx: number) => {
    onRecordInteraction();
    setSelectedQubit(qIdx);
  };

  const handleSelectGate = (gate: CorrectionGate) => {
    onRecordInteraction();
    setSelectedGate(gate);
  };

  const handleApplyRepair = () => {
    onRecordInteraction();
    setIsApplied(true);
  };

  // Run evaluation
  const handleVerify = () => {
    const res = evaluateRepairLevel({
      level: level.errorLevel,
      action: currentAction,
      hasVerified: true,
    });
    onEvaluate(res);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="game-layout-grid">
        {/* Game Area: Quantum Memory & Physical Qubits */}
        <div className="game-area-container" data-ui-zone="qec-memory-area">
          <div className="game-area-header">
            <span style={{ fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} style={{ color: 'var(--accent-indigo)' }} />
              Quantum Memory Register (3-Qubit Repetition Code)
            </span>
            <span className="badge badge-indigo">
              Logical Target: |{level.errorLevel.logicalValue === 0 ? '0_L' : '1_L'}⟩ = |{level.errorLevel.logicalValue === 0 ? '000' : '111'}⟩
            </span>
          </div>

          <div
            className="game-area-canvas-wrapper"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '24px',
              padding: '24px',
            }}
          >
            {/* 3 Physical Qubit Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', width: '100%', maxWidth: '520px' }}>
              {initialCorrupted.map((q, idx) => {
                const isSelected = selectedQubit === idx;
                const isCorrupted = level.errorLevel.corruptedQubitIndex === idx;
                const activeVal = isApplied && selectedQubit === idx ? repairedQubits[idx].value : q.value;
                const activePhase = isApplied && selectedQubit === idx ? repairedQubits[idx].phaseSign : q.phaseSign;

                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectQubit(idx)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '16px',
                      backgroundColor: isSelected ? 'var(--accent-blue-light)' : 'var(--bg-card)',
                      border: `2px solid ${isSelected ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-lg)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>
                      QUBIT {idx + 1}
                    </span>
                    <div
                      className="mono"
                      style={{
                        fontSize: '32px',
                        fontWeight: 700,
                        margin: '10px 0',
                        color: activeVal !== level.errorLevel.logicalValue ? 'var(--vector-red)' : '#15803D',
                      }}
                    >
                      |{activeVal}⟩
                    </div>
                    {level.errorLevel.errorType === 'phase-flip' && (
                      <span className="mono" style={{ fontSize: '11px', color: activePhase < 0 ? 'var(--vector-red)' : 'var(--text-muted)' }}>
                        Phase: {activePhase > 0 ? '+1' : '-1'}
                      </span>
                    )}
                    <span
                      className={`badge ${isSelected ? 'badge-blue' : ''}`}
                      style={{ marginTop: '8px', fontSize: '11px' }}
                    >
                      {isSelected ? 'SELECTED' : 'CLICK TO SELECT'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Verification State Banner */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 20px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-full)',
                fontSize: '13px',
              }}
            >
              <span>Current Physical State:</span>
              <strong className="mono" style={{ fontSize: '15px' }}>
                |{(isApplied ? repairedQubits : initialCorrupted).map(q => q.value).join('')}⟩
              </strong>
              <span>→ Target:</span>
              <strong className="mono" style={{ fontSize: '15px', color: '#15803D' }}>
                |{level.errorLevel.logicalValue === 0 ? '000' : '111'}⟩
              </strong>
            </div>
          </div>
        </div>

        {/* Control Panel: Syndrome Readout & Repair Toolbox */}
        <div className="control-panel-container" data-ui-zone="qec-syndrome-panel">
          <div className="control-section-header">Syndrome Diagnosis Panel</div>

          {/* Syndrome Readout */}
          <div
            style={{
              padding: '16px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Parity Syndrome Bits:</span>
              <span
                className="mono badge badge-amber"
                style={{ fontSize: '16px', fontWeight: 700, padding: '4px 10px' }}
              >
                S1S2 = {syndrome.syndromeString}
              </span>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>• S1 = q1 ⊕ q2 = <strong>{syndrome.s1}</strong> ({syndrome.s1 === 1 ? 'Mismatch' : 'Match'})</div>
              <div>• S2 = q2 ⊕ q3 = <strong>{syndrome.s2}</strong> ({syndrome.s2 === 1 ? 'Mismatch' : 'Match'})</div>
            </div>

            <div
              style={{
                marginTop: '10px',
                padding: '8px 10px',
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '11px',
                color: 'var(--text-muted)',
              }}
            >
              <strong>Syndrome Lookup Key:</strong> 00 = No Error | 10 = Q1 | 11 = Q2 | 01 = Q3
            </div>
          </div>

          {/* Repair Toolbox */}
          <div className="control-section-header">Repair Toolbox</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['X', 'Z', 'H'] as CorrectionGate[]).map(gate => {
              const isSelected = selectedGate === gate;
              return (
                <button
                  key={gate}
                  className={`btn ${isSelected ? 'btn-primary' : ''}`}
                  onClick={() => handleSelectGate(gate)}
                  style={{
                    flex: 1,
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    fontSize: '16px',
                    padding: '12px',
                  }}
                >
                  [{gate}]
                </button>
              );
            })}
          </div>

          {/* Apply Correction Button */}
          <button
            className="btn btn-primary"
            disabled={selectedQubit === null || selectedGate === null}
            onClick={handleApplyRepair}
            style={{ width: '100%', marginTop: '6px' }}
          >
            <Wrench size={16} />
            <span>Apply Gate [{selectedGate || '?'}] to Qubit {selectedQubit !== null ? selectedQubit + 1 : '?'}</span>
          </button>
        </div>
      </div>

      {/* Result Panel */}
      <ResultPanel
        evaluation={evaluation}
        metrics={[
          {
            label: 'Extracted Syndrome',
            value: `${syndrome.syndromeString}`,
            subtext: syndrome.indicatedQubitIndex >= 0 ? `Indicates Q${syndrome.indicatedQubitIndex + 1}` : 'No Error',
            highlight: true,
          },
          {
            label: 'Selected Target',
            value: selectedQubit !== null ? `Qubit ${selectedQubit + 1}` : 'None',
            subtext: selectedGate ? `With Gate [${selectedGate}]` : 'No Gate Selected',
          },
          {
            label: 'Correction Applied',
            value: isApplied ? 'YES' : 'PENDING',
            subtext: isApplied ? 'Ready to Verify' : 'Press Apply first',
          },
        ]}
        onSubmitOrRun={handleVerify}
        runButtonLabel="Verify & Repair"
        onNextLevel={onNextLevel}
        showNextLevelButton={evaluation.status === 'success'}
      />
    </div>
  );
};
