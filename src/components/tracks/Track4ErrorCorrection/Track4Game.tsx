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
import { EducationalPopup } from '../../common/EducationalPopup';
import { COMPONENT_HELP } from '../../../core/educationData';
import { ShieldCheck, AlertCircle, Wrench, CheckCircle, HelpCircle, ArrowRight, Sparkles } from 'lucide-react';

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
  const [activeHelpComponent, setActiveHelpComponent] = useState<string | null>(null);

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

  // Post-repair syndrome
  const postSyndrome = useMemo(() => {
    return calculateSyndrome(repairedQubits);
  }, [repairedQubits]);

  const handleSelectQubit = (qIdx: number) => {
    onRecordInteraction();
    setSelectedQubit(qIdx);
    setIsApplied(false);
  };

  const handleSelectGate = (gate: CorrectionGate) => {
    onRecordInteraction();
    setSelectedGate(gate);
    setIsApplied(false);
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

  const isBitFlip = level.errorLevel.errorType === 'bit-flip';
  const isPhaseFlip = level.errorLevel.errorType === 'phase-flip';
  const beforeStateStr = initialCorrupted.map(q => q.value).join('');
  const afterStateStr = (isApplied ? repairedQubits : initialCorrupted).map(q => q.value).join('');
  const targetStateStr = level.errorLevel.logicalValue === 0 ? '000' : '111';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Phase Flip Concept Callout when phase flip level */}
      {isPhaseFlip && (
        <div
          style={{
            padding: '12px 18px',
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-blue">PHASE FLIP CODE</span>
            <span style={{ fontSize: '13px', color: '#1E40AF', fontWeight: 600 }}>
              Z|0⟩ = |0⟩, Z|1⟩ = -|1⟩. A phase flip changes relative phase; it requires a [Z] Pauli gate to invert!
            </span>
          </div>
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => setActiveHelpComponent('phase-flip-concept')}
            style={{ fontSize: '11px', fontWeight: 700 }}
          >
            ? Explain Phase Flip
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* PEDAGOGICAL RESULTS & VERIFICATION PANEL (Section 33)           */}
      {/* ============================================================== */}
      <div
        data-ui-zone="qec-verification-pipeline"
        style={{
          padding: '14px 18px',
          backgroundColor: '#FFFFFF',
          border: '2px solid var(--border-medium)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
          QEC PEDAGOGICAL PIPELINE: STATE → SYNDROME → DIAGNOSIS → ACTION → VERIFICATION
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)' }}>BEFORE REPAIR</div>
            <div className="mono" style={{ fontSize: '15px', fontWeight: 700, color: '#D97706' }}>
              |{beforeStateStr}⟩
            </div>
          </div>

          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)' }}>SYNDROME S1S2</div>
            <div className="mono badge badge-amber" style={{ fontSize: '13px', fontWeight: 700 }}>
              {syndrome.syndromeString}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)' }}>DIAGNOSIS</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: selectedQubit !== null ? 'var(--accent-blue)' : 'var(--text-muted)' }}>
              {selectedQubit !== null ? `Qubit ${selectedQubit + 1}` : 'Pending Selection'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)' }}>ACTION</div>
            <div className="mono" style={{ fontSize: '13px', fontWeight: 700, color: isApplied ? '#15803D' : 'var(--text-muted)' }}>
              {isApplied ? `[${selectedGate}] on Q${selectedQubit! + 1}` : 'Not Applied'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)' }}>AFTER REPAIR</div>
            <div className="mono" style={{ fontSize: '15px', fontWeight: 700, color: isApplied ? (afterStateStr === targetStateStr ? '#15803D' : '#D97706') : 'var(--text-muted)' }}>
              |{afterStateStr}⟩
            </div>
          </div>

          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)' }}>VERIFICATION</div>
            <div style={{ fontSize: '12px', fontWeight: 700 }}>
              {evaluation.status === 'success' ? (
                <span style={{ color: '#15803D' }}>✓ RESTORED (00)</span>
              ) : evaluation.status === 'incorrect' ? (
                <span style={{ color: 'var(--vector-red)' }}>❌ FAILED</span>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>Pending Verify</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="game-layout-grid">
        {/* Game Area: Quantum Memory & Physical Qubits */}
        <div className="game-area-container" data-ui-zone="qec-memory-area">
          <div className="game-area-header">
            <span style={{ fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} style={{ color: 'var(--accent-indigo)' }} />
              Quantum Memory Register (3-Qubit Repetition Code)
            </span>
            <span className="badge badge-indigo">
              Logical Target: |{level.errorLevel.logicalValue === 0 ? '0_L' : '1_L'}⟩ = |{targetStateStr}⟩
            </span>
          </div>

          <div
            className="game-area-canvas-wrapper"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '20px',
              padding: '24px',
            }}
          >
            {/* 3 Physical Qubit Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', width: '100%', maxWidth: '520px' }}>
              {initialCorrupted.map((q, idx) => {
                const isSelected = selectedQubit === idx;
                const activeVal = isApplied && selectedQubit === idx ? repairedQubits[idx].value : q.value;
                const activePhase = isApplied && selectedQubit === idx ? repairedQubits[idx].phaseSign : q.phaseSign;
                const isDifferentFromTarget = activeVal !== level.errorLevel.logicalValue;

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
                        color: isDifferentFromTarget ? 'var(--vector-red)' : '#15803D',
                      }}
                    >
                      |{activeVal}⟩
                    </div>
                    {isPhaseFlip && (
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
                |{afterStateStr}⟩
              </strong>
              <span>→ Target:</span>
              <strong className="mono" style={{ fontSize: '15px', color: '#15803D' }}>
                |{targetStateStr}⟩
              </strong>
            </div>
          </div>
        </div>

        {/* Control Panel: Syndrome Readout & Repair Toolbox */}
        <div className="control-panel-container" data-ui-zone="qec-syndrome-panel">
          <div className="control-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Syndrome Diagnosis Panel</span>
            <button
              onClick={() => setActiveHelpComponent('syndrome-bits')}
              title="Learn how Syndromes work (Free)"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600 }}
            >
              <HelpCircle size={13} />
              <span>? Help</span>
            </button>
          </div>

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
              <div>• S1 = q1 ⊕ q2 = <strong>{syndrome.s1}</strong> ({syndrome.s1 === 1 ? 'Odd Mismatch' : 'Even Match'})</div>
              <div>• S2 = q2 ⊕ q3 = <strong>{syndrome.s2}</strong> ({syndrome.s2 === 1 ? 'Odd Mismatch' : 'Even Match'})</div>
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
              <strong>Syndrome Lookup Key:</strong><br />
              00 = No Error | 10 = Qubit 1 | 11 = Qubit 2 | 01 = Qubit 3
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

          {/* Step Guidance & Apply Correction Button */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {selectedQubit === null ? (
                '① Click on a qubit above to select target'
              ) : selectedGate === null ? (
                `② Select correction gate for Q${selectedQubit + 1}`
              ) : !isApplied ? (
                `③ Click Apply below to simulate [${selectedGate}] on Q${selectedQubit + 1}`
              ) : (
                `✓ Gate [${selectedGate}] applied to Q${selectedQubit + 1}. Now click "Verify & Repair".`
              )}
            </div>

            <button
              className="btn btn-primary"
              disabled={selectedQubit === null || selectedGate === null}
              onClick={handleApplyRepair}
              style={{ width: '100%' }}
            >
              <Wrench size={16} />
              <span>
                Apply Gate [{selectedGate || '?'}] to Qubit {selectedQubit !== null ? selectedQubit + 1 : '?'}
              </span>
            </button>
          </div>
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
            label: 'Diagnosed Target',
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

      {/* Component Help Popup */}
      <EducationalPopup
        isOpen={!!activeHelpComponent}
        onClose={() => setActiveHelpComponent(null)}
        type="component-help"
        componentHelp={activeHelpComponent ? COMPONENT_HELP[activeHelpComponent] : undefined}
      />
    </div>
  );
};

