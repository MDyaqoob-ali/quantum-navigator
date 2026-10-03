import React, { useState, useEffect, useMemo, useRef } from 'react';
import { RepairLevelConfig } from '../../../core/levels/track4Levels';
import {
  QubitPhysicalState,
  CorrectionGate,
  ErrorType,
  QuantumShieldPhase,
  QuantumShieldState,
  encodeLogicalState,
  applyChannelNoise,
  calculateSyndrome,
  applyCorrection,
  verifyEncodedState,
  evaluateQuantumShield,
} from '../../../core/engines/errorCorrectionEngine';
import { EvaluationResult } from '../../../core/types';
import { ResultPanel } from '../../common/ResultPanel';
import { EducationalPopup } from '../../common/EducationalPopup';
import { COMPONENT_HELP } from '../../../core/educationData';
import {
  ShieldCheck,
  AlertTriangle,
  Wrench,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Radio,
  RotateCcw,
  Zap,
  Timer,
  Eye,
  Activity,
  Check,
  X,
  Play,
  Flame,
} from 'lucide-react';

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
  // Phase state
  const [phase, setPhase] = useState<QuantumShieldPhase>('message');

  // Core quantum states
  const [encodedQubits, setEncodedQubits] = useState<QubitPhysicalState[]>([]);
  const [noisyQubits, setNoisyQubits] = useState<QubitPhysicalState[]>([]);
  const [repairedQubits, setRepairedQubits] = useState<QubitPhysicalState[]>([]);

  // Transmission animation state
  const [isTransmitting, setIsTransmitting] = useState(false);

  // Diagnostic checks state
  const [s1Checked, setS1Checked] = useState(false);
  const [s2Checked, setS2Checked] = useState(false);
  const [isScanningS1, setIsScanningS1] = useState(false);
  const [isScanningS2, setIsScanningS2] = useState(false);
  const [playerDiagnosis, setPlayerDiagnosis] = useState<number | null>(null);

  // Repair toolbox state
  const [selectedQubit, setSelectedQubit] = useState<number | null>(null);
  const [selectedGate, setSelectedGate] = useState<CorrectionGate | null>(null);
  const [isApplied, setIsApplied] = useState(false);

  // Shield integrity and constraints
  const [shieldIntegrity, setShieldIntegrity] = useState(100);
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [hasVerified, setHasVerified] = useState(false);

  // Educational popup & tutorial state
  const [activeHelpComponent, setActiveHelpComponent] = useState<string | null>(null);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [showMeHowStep, setShowMeHowStep] = useState<number | null>(null);

  // Sandbox / Practice mode
  const [isSandboxMode, setIsSandboxMode] = useState(false);
  const [sandboxLogical, setSandboxLogical] = useState<0 | 1>(0);
  const [sandboxErrorType, setSandboxErrorType] = useState<ErrorType>('bit-flip');
  const [sandboxQubitIndex, setSandboxQubitIndex] = useState(1);

  const timerRef = useRef<any>(null);

  // -------------------------------------------------------------
  // LEVEL INITIALIZATION & RESET
  // -------------------------------------------------------------
  const initLevel = () => {
    const errorLevel = level.errorLevel;
    const baseEncoded = encodeLogicalState(errorLevel.logicalValue, errorLevel.codeType);
    const noisy = applyChannelNoise(
      baseEncoded,
      errorLevel.errorType,
      errorLevel.corruptedQubitIndex,
      errorLevel.codeType
    );

    setEncodedQubits(baseEncoded);
    setNoisyQubits(noisy);
    setRepairedQubits(noisy.map(q => ({ ...q })));

    setPhase('message');
    setIsTransmitting(false);
    setS1Checked(false);
    setS2Checked(false);
    setIsScanningS1(false);
    setIsScanningS2(false);
    setPlayerDiagnosis(null);
    setSelectedQubit(null);
    setSelectedGate(null);
    setIsApplied(false);
    setShieldIntegrity(100);
    setAttemptsUsed(0);
    setHasVerified(false);

    if (errorLevel.timeLimitSeconds) {
      setTimeLeft(errorLevel.timeLimitSeconds);
    } else {
      setTimeLeft(null);
    }
  };

  useEffect(() => {
    initLevel();
  }, [level.id]);

  // First-time Track 4 intro check
  useEffect(() => {
    const seen = localStorage.getItem('track4IntroSeen');
    if (!seen) {
      setIsHowToPlayOpen(true);
      localStorage.setItem('track4IntroSeen', 'true');
    }
  }, []);

  // Timer countdown for Master level (Level 10)
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || hasVerified) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, hasVerified]);

  // Active parities calculated from actual live physical state
  const liveSyndrome = useMemo(() => {
    const targetQubits = isApplied ? repairedQubits : noisyQubits;
    return calculateSyndrome(targetQubits, level.errorLevel.codeType);
  }, [noisyQubits, repairedQubits, isApplied, level.errorLevel.codeType]);

  // Initial noise syndrome
  const noiseSyndrome = useMemo(() => {
    return calculateSyndrome(noisyQubits, level.errorLevel.codeType);
  }, [noisyQubits, level.errorLevel.codeType]);

  // Target values
  const targetStateStr = level.errorLevel.logicalValue === 0 ? '000' : '111';
  const currentStateStr = (isApplied ? repairedQubits : noisyQubits).map(q => q.value).join('');
  const isCurrentlyRestored = isApplied && currentStateStr === targetStateStr && liveSyndrome.syndromeString === '00';

  // -------------------------------------------------------------
  // PHASE TRANSITIONS & ACTIONS
  // -------------------------------------------------------------
  const handleProceedToEncode = () => {
    onRecordInteraction();
    setPhase('encode');
  };

  const handleExecuteEncode = () => {
    onRecordInteraction();
    const encoded = encodeLogicalState(level.errorLevel.logicalValue, level.errorLevel.codeType);
    setEncodedQubits(encoded);
    setShieldIntegrity(100);
  };

  const handleSendThroughChannel = () => {
    onRecordInteraction();
    setPhase('transmit');
    setIsTransmitting(true);

    setTimeout(() => {
      setIsTransmitting(false);
      const noisy = applyChannelNoise(
        encodedQubits,
        level.errorLevel.errorType,
        level.errorLevel.corruptedQubitIndex,
        level.errorLevel.codeType
      );
      setNoisyQubits(noisy);
      setRepairedQubits(noisy.map(q => ({ ...q })));
      setShieldIntegrity(80);
      setPhase('noise');
    }, 1200);
  };

  const handleProceedToDiagnose = () => {
    onRecordInteraction();
    setPhase('diagnose');
  };

  // Interactive syndrome scan buttons
  const handleCheckS1 = () => {
    onRecordInteraction();
    setIsScanningS1(true);
    setTimeout(() => {
      setIsScanningS1(false);
      setS1Checked(true);
    }, 450);
  };

  const handleCheckS2 = () => {
    onRecordInteraction();
    setIsScanningS2(true);
    setTimeout(() => {
      setIsScanningS2(false);
      setS2Checked(true);
    }, 450);
  };

  const handleSelectDiagnosis = (qIdx: number) => {
    onRecordInteraction();
    setPlayerDiagnosis(qIdx);
  };

  const handleProceedToRepair = () => {
    onRecordInteraction();
    setPhase('repair');
  };

  // Repair Toolbox actions
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
    if (selectedQubit === null || selectedGate === null) return;
    onRecordInteraction();

    const updated = applyCorrection(noisyQubits, selectedQubit, selectedGate);
    setRepairedQubits(updated);
    setIsApplied(true);
    setAttemptsUsed(prev => prev + 1);

    // If wrong qubit or gate, decrease shield integrity
    if (selectedQubit !== level.errorLevel.corruptedQubitIndex || (level.errorLevel.errorType === 'bit-flip' && selectedGate !== 'X')) {
      setShieldIntegrity(prev => Math.max(20, prev - 25));
    }
  };

  // Run official evaluation & verification
  const handleVerify = () => {
    onRecordInteraction();
    setHasVerified(true);
    setPhase('verify');

    const stateObj: QuantumShieldState = {
      logicalState: level.errorLevel.logicalValue,
      encodedState: encodedQubits,
      noisyState: noisyQubits,
      repairedState: repairedQubits,
      errorType: level.errorLevel.errorType,
      errorLocation: level.errorLevel.corruptedQubitIndex,
      syndrome: noiseSyndrome,
      selectedQubit,
      selectedOperation: selectedGate,
      playerDiagnosis,
      diagnosticChecks: { s1Checked, s2Checked },
      correctionHistory: [],
      verificationResult: null,
      phase: 'verify',
      shieldIntegrity,
      isApplied,
      hasVerified: true,
      attemptsUsed,
      timeRemaining: timeLeft ?? undefined,
    };

    const res = evaluateQuantumShield(stateObj, level.errorLevel);
    onEvaluate(res);
  };

  // Sandbox injection handler
  const handleSandboxInject = () => {
    const base = encodeLogicalState(sandboxLogical, sandboxErrorType === 'phase-flip' ? 'phase-flip-code' : 'bit-flip-code');
    const noisy = applyChannelNoise(base, sandboxErrorType, sandboxQubitIndex, sandboxErrorType === 'phase-flip' ? 'phase-flip-code' : 'bit-flip-code');
    setEncodedQubits(base);
    setNoisyQubits(noisy);
    setRepairedQubits(noisy.map(q => ({ ...q })));
    setPhase('diagnose');
    setS1Checked(false);
    setS2Checked(false);
    setSelectedQubit(null);
    setSelectedGate(null);
    setIsApplied(false);
    setPlayerDiagnosis(null);
  };

  // -------------------------------------------------------------
  // RENDER HELPERS
  // -------------------------------------------------------------
  const phasesList: { key: QuantumShieldPhase; label: string; num: string }[] = [
    { key: 'message', label: 'MESSAGE', num: '①' },
    { key: 'encode', label: 'PROTECT', num: '②' },
    { key: 'transmit', label: 'TRANSMIT', num: '③' },
    { key: 'diagnose', label: 'DIAGNOSE', num: '④' },
    { key: 'repair', label: 'REPAIR', num: '⑤' },
    { key: 'verify', label: 'VERIFY', num: '⑥' },
  ];

  const currentPhaseIndex = phasesList.findIndex(p => p.key === phase);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* ============================================================== */}
      {/* 1. TOP HEADER & SHIELD INTEGRITY & PRACTICE MODE TOGGLE         */}
      {/* ============================================================== */}
      <div
        data-ui-zone="quantum-shield-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '12px 18px',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {/* Title & Game Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#EDE9FE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-purple)',
            }}
          >
            <ShieldCheck size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.5px' }}>
                QUANTUM SHIELD
              </span>
              <span className="badge badge-purple" style={{ fontSize: '10px', fontWeight: 700 }}>
                LEVEL {level.levelNumber}/10
              </span>
              {level.errorLevel.timeLimitSeconds && (
                <span className="badge badge-amber" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Timer size={12} />
                  {timeLeft !== null ? `${timeLeft}s` : '60s'}
                </span>
              )}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {level.title} — {level.subtitle}
            </div>
          </div>
        </div>

        {/* Shield Integrity & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {/* Shield Integrity Meter (Section 15) */}
          <div
            data-ui-zone="shield-integrity-meter"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>SHIELD:</span>
              <button
                onClick={() => setActiveHelpComponent('shield-integrity')}
                title="What is Shield Integrity?"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
              >
                <HelpCircle size={12} />
              </button>
            </div>
            <div
              style={{
                width: '80px',
                height: '8px',
                backgroundColor: '#E2E8F0',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${shieldIntegrity}%`,
                  height: '100%',
                  backgroundColor: shieldIntegrity > 60 ? '#10B981' : shieldIntegrity > 30 ? '#F59E0B' : '#EF4444',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <span className="mono" style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {shieldIntegrity}%
            </span>
          </div>

          {/* Sandbox Toggle */}
          <button
            className={`btn btn-sm ${isSandboxMode ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setIsSandboxMode(!isSandboxMode)}
            style={{ fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Sparkles size={13} />
            <span>{isSandboxMode ? 'Exit Lab' : 'Noise Lab'}</span>
          </button>

          {/* How to Play Button (Section 7) */}
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => setIsHowToPlayOpen(true)}
            style={{ fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <HelpCircle size={13} />
            <span>? How to Play</span>
          </button>

          {/* Reset Current Level */}
          <button
            className="btn btn-sm btn-secondary"
            onClick={initLevel}
            title="Reset current level state"
            style={{ fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. OPTIONAL SANDBOX / NOISE GENERATOR (Section 42 & 43)        */}
      {/* ============================================================== */}
      {isSandboxMode && (
        <div
          data-ui-zone="sandbox-noise-lab"
          style={{
            padding: '16px 20px',
            backgroundColor: '#F5F3FF',
            border: '2px dashed var(--accent-purple)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-purple">INTERACTIVE NOISE GENERATOR</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-purple)' }}>
                Inject controlled noise into physical qubits and discover the resulting parity syndrome!
              </span>
            </div>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => setIsSandboxMode(false)}
              style={{ fontSize: '11px' }}
            >
              Close Lab
            </button>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Message:</span>
              <button
                className={`btn btn-sm ${sandboxLogical === 0 ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSandboxLogical(0)}
              >
                |0_L⟩
              </button>
              <button
                className={`btn btn-sm ${sandboxLogical === 1 ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSandboxLogical(1)}
              >
                |1_L⟩
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Noise Type:</span>
              <button
                className={`btn btn-sm ${sandboxErrorType === 'bit-flip' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSandboxErrorType('bit-flip')}
              >
                Bit Flip (X)
              </button>
              <button
                className={`btn btn-sm ${sandboxErrorType === 'phase-flip' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSandboxErrorType('phase-flip')}
              >
                Phase Flip (Z)
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Target Qubit:</span>
              {[0, 1, 2].map(qIdx => (
                <button
                  key={qIdx}
                  className={`btn btn-sm ${sandboxQubitIndex === qIdx ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSandboxQubitIndex(qIdx)}
                >
                  Q{qIdx + 1}
                </button>
              ))}
            </div>

            <button
              className="btn btn-sm btn-primary"
              onClick={handleSandboxInject}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Zap size={14} />
              <span>Inject Noise & Experiment</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. STEP PROGRESS INDICATOR (Section 10)                        */}
      {/* ============================================================== */}
      <div
        data-ui-zone="quantum-shield-step-tracker"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          padding: '10px 16px',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-md)',
          overflowX: 'auto',
        }}
      >
        {phasesList.map((p, idx) => {
          const isCurrent = p.key === phase || (p.key === 'diagnose' && phase === 'noise');
          const isPassed = currentPhaseIndex > idx;

          return (
            <div
              key={p.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: isCurrent ? 'var(--accent-purple)' : isPassed ? '#EDE9FE' : 'transparent',
                color: isCurrent ? '#FFFFFF' : isPassed ? 'var(--accent-purple)' : 'var(--text-muted)',
                fontWeight: isCurrent ? 800 : 600,
                fontSize: '12px',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              <span>{p.num}</span>
              <span>{p.label}</span>
              {isPassed && <Check size={12} />}
            </div>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* 4. MAIN FLOW-BASED LABORATORY VIEW (Section 44)                */}
      {/* ============================================================== */}
      <div className="game-layout-grid">
        {/* LEFT COLUMN: Pipeline & Physical Memory Area */}
        <div className="game-area-container" data-ui-zone="shield-flow-lab">
          <div className="game-area-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={16} style={{ color: 'var(--accent-purple)' }} />
              Quantum Pipeline: Protect → Transmit → Diagnose → Correct
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-purple">
                Target: |{level.errorLevel.logicalValue === 0 ? '0_L' : '1_L'}⟩ = |{targetStateStr}⟩
              </span>
              <button
                onClick={() => setActiveHelpComponent('encoded-qubits')}
                title="What are Encoded Qubits?"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <HelpCircle size={14} />
              </button>
            </div>
          </div>

          <div
            className="game-area-canvas-wrapper"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              padding: '24px',
              minHeight: '380px',
              justifyContent: 'center',
            }}
          >
            {/* STAGE A: Phase 1 (MESSAGE) */}
            {phase === 'message' && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px',
                  textAlign: 'center',
                  padding: '20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    LOGICAL QUANTUM MESSAGE
                  </span>
                  <button
                    onClick={() => setActiveHelpComponent('quantum-message')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-blue)' }}
                  >
                    <HelpCircle size={13} />
                  </button>
                </div>

                <div
                  className="mono"
                  style={{
                    fontSize: '48px',
                    fontWeight: 800,
                    color: 'var(--accent-purple)',
                    padding: '16px 36px',
                    backgroundColor: '#EDE9FE',
                    borderRadius: 'var(--radius-lg)',
                    border: '2px solid #DDD6FE',
                  }}
                >
                  |{level.errorLevel.logicalValue === 0 ? '0_L' : '1_L'}⟩
                </div>

                <div style={{ maxWidth: '440px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  This is the single logical quantum message we want to protect. A raw, unencoded qubit has no backup: if noise flips it, the information is permanently lost.
                </div>

                <button
                  className="btn btn-primary"
                  onClick={handleProceedToEncode}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', padding: '10px 24px' }}
                >
                  <span>Proceed to Encoding & Protection</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* STAGE B: Phase 2 (ENCODE) */}
            {phase === 'encode' && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '18px',
                  textAlign: 'center',
                  padding: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    3-QUBIT REDUNDANCY ENCODING
                  </span>
                  <button
                    onClick={() => setActiveHelpComponent('encoded-qubits')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-blue)' }}
                  >
                    <HelpCircle size={13} />
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div className="mono badge badge-purple" style={{ fontSize: '20px', padding: '10px 18px' }}>
                    |{level.errorLevel.logicalValue === 0 ? '0_L' : '1_L'}⟩
                  </div>
                  <ArrowRight size={20} style={{ color: 'var(--text-muted)' }} />
                  <div className="mono badge badge-blue" style={{ fontSize: '20px', padding: '10px 18px' }}>
                    |{targetStateStr}⟩
                  </div>
                </div>

                <div style={{ maxWidth: '460px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  By distributing our logical information across 3 entangled physical qubits (Q1, Q2, Q3), we introduce quantum redundancy.
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    className="btn btn-primary"
                    onClick={handleSendThroughChannel}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px' }}
                  >
                    <span>Send Through Channel</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STAGE C: Phase 3 (TRANSMIT) */}
            {phase === 'transmit' && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '20px',
                  padding: '24px',
                  textAlign: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    TRANSMITTING THROUGH NOISY QUANTUM CHANNEL
                  </span>
                  <button
                    onClick={() => setActiveHelpComponent('noise-channel')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-blue)' }}
                  >
                    <HelpCircle size={13} />
                  </button>
                </div>

                {/* Animated Noisy Channel Wave */}
                <div
                  style={{
                    width: '100%',
                    maxWidth: '480px',
                    padding: '24px',
                    backgroundColor: '#F8FAFC',
                    border: '2px dashed #94A3B8',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '18px',
                      color: 'var(--accent-blue)',
                      letterSpacing: '4px',
                    }}
                  >
                    ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Transmitting Q1, Q2, Q3 across environmental noise...
                  </div>
                  <div
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '18px',
                      color: 'var(--accent-blue)',
                      letterSpacing: '4px',
                    }}
                  >
                    ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈
                  </div>
                </div>
              </div>
            )}

            {/* STAGE D: Active Quantum Memory Register (Phases 4, 5, 6, 7) */}
            {['noise', 'diagnose', 'repair', 'verify'].includes(phase) && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}>
                {/* Noise Warning Banner when in Noise phase */}
                {phase === 'noise' && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      width: '100%',
                      maxWidth: '520px',
                      padding: '10px 16px',
                      backgroundColor: '#FEF3C7',
                      border: '1px solid #FCD34D',
                      borderRadius: 'var(--radius-md)',
                      color: '#92400E',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangle size={18} />
                      <span style={{ fontSize: '13px', fontWeight: 700 }}>
                        {level.errorLevel.hideErrorLocation
                          ? '⚠ NOISE EVENT DETECTED: A physical qubit was corrupted in transit!'
                          : `⚠ NOISE EVENT: Qubit ${level.errorLevel.corruptedQubitIndex + 1} corrupted!`}
                      </span>
                    </div>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={handleProceedToDiagnose}
                      style={{ fontSize: '11px', fontWeight: 700 }}
                    >
                      Diagnose →
                    </button>
                  </div>
                )}

                {/* 3 Physical Qubit Nodes (Section 45) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', width: '100%', maxWidth: '520px' }}>
                  {(isApplied ? repairedQubits : noisyQubits).map((q, idx) => {
                    const isSelected = selectedQubit === idx;
                    const isCorrupted = q.value !== level.errorLevel.logicalValue || q.phaseSign !== 1;
                    const showCorruptedBadge = !level.errorLevel.hideErrorLocation && isCorrupted;

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (phase === 'repair') handleSelectQubit(idx);
                        }}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          padding: '16px 12px',
                          backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                          border: `2px solid ${isSelected ? 'var(--accent-blue)' : isCorrupted && !level.errorLevel.hideErrorLocation ? '#F59E0B' : 'var(--border-subtle)'}`,
                          borderRadius: 'var(--radius-lg)',
                          cursor: phase === 'repair' ? 'pointer' : 'default',
                          boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                          transition: 'all 0.15s ease',
                          position: 'relative',
                        }}
                      >
                        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)' }}>
                          QUBIT {idx + 1}
                        </span>

                        <div
                          className="mono"
                          style={{
                            fontSize: '34px',
                            fontWeight: 800,
                            margin: '8px 0',
                            color: isCorrupted && !level.errorLevel.hideErrorLocation ? 'var(--vector-red)' : 'var(--text-primary)',
                          }}
                        >
                          |{q.value}⟩
                        </div>

                        {/* Phase Indicator if relevant */}
                        {level.errorLevel.errorType === 'phase-flip' && (
                          <span
                            className="mono"
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              color: q.phaseSign < 0 ? 'var(--vector-red)' : 'var(--text-muted)',
                            }}
                          >
                            Phase: {q.phaseSign > 0 ? '+1' : '-1'}
                          </span>
                        )}

                        {/* Health Status Icon & Text */}
                        <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700 }}>
                          {showCorruptedBadge ? (
                            <span style={{ color: '#D97706', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <AlertTriangle size={12} /> ⚠ Corrupted
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <CheckCircle size={12} /> Physical Bit
                            </span>
                          )}
                        </div>

                        {phase === 'repair' && (
                          <span
                            className={`badge ${isSelected ? 'badge-blue' : ''}`}
                            style={{ marginTop: '8px', fontSize: '10px' }}
                          >
                            {isSelected ? 'SELECTED' : 'CLICK TO REPAIR'}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* State Banner: Before vs Current vs Target */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '8px 18px',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '12px',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                  }}
                >
                  <span>Current Register:</span>
                  <strong className="mono" style={{ fontSize: '14px', color: currentStateStr === targetStateStr ? '#15803D' : '#D97706' }}>
                    |{currentStateStr}⟩
                  </strong>
                  <span>→ Target State:</span>
                  <strong className="mono" style={{ fontSize: '14px', color: '#15803D' }}>
                    |{targetStateStr}⟩
                  </strong>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Diagnostic Console & Repair Toolbox */}
        <div className="control-panel-container" data-ui-zone="shield-control-panel">
          {/* Section A: Quantum Diagnostic Console (Section 16, 17, 18) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="control-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Radio size={15} style={{ color: 'var(--accent-blue)' }} />
                Diagnostic Console (Syndrome Checker)
              </span>
              <button
                onClick={() => setActiveHelpComponent('syndrome-checker')}
                title="What is a Syndrome?"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600 }}
              >
                <HelpCircle size={13} />
                <span>? Help</span>
              </button>
            </div>

            {/* Parity Probing Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                className={`btn btn-sm ${s1Checked ? 'btn-secondary' : 'btn-primary'}`}
                onClick={handleCheckS1}
                disabled={isScanningS1}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '10px' }}
              >
                <span style={{ fontSize: '11px', fontWeight: 700 }}>
                  {isScanningS1 ? 'Scanning S1...' : s1Checked ? `✓ S1 = ${noiseSyndrome.s1}` : 'CHECK S1 (Q1 ⊕ Q2)'}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  {s1Checked ? (noiseSyndrome.s1 === 1 ? 'Parity Mismatch' : 'Parity Match') : 'Probe Q1 ↔ Q2 parity'}
                </span>
              </button>

              <button
                className={`btn btn-sm ${s2Checked ? 'btn-secondary' : 'btn-primary'}`}
                onClick={handleCheckS2}
                disabled={isScanningS2}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '10px' }}
              >
                <span style={{ fontSize: '11px', fontWeight: 700 }}>
                  {isScanningS2 ? 'Scanning S2...' : s2Checked ? `✓ S2 = ${noiseSyndrome.s2}` : 'CHECK S2 (Q2 ⊕ Q3)'}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  {s2Checked ? (noiseSyndrome.s2 === 1 ? 'Parity Mismatch' : 'Parity Match') : 'Probe Q2 ↔ Q3 parity'}
                </span>
              </button>
            </div>

            {/* Syndrome Display (Section 46) */}
            <div
              style={{
                padding: '12px 14px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>MEASURED SYNDROME</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {s1Checked && s2Checked ? (
                    noiseSyndrome.syndromeString === '00'
                      ? 'No parity disparity detected'
                      : `Parity discrepancy points to Q${noiseSyndrome.indicatedQubitIndex + 1}`
                  ) : (
                    'Run checks above to extract syndrome bits'
                  )}
                </div>
              </div>
              <div
                className="mono badge badge-amber"
                style={{ fontSize: '18px', fontWeight: 800, padding: '4px 12px' }}
              >
                {s1Checked && s2Checked ? noiseSyndrome.syndromeString : (s1Checked ? `${noiseSyndrome.s1}?` : (s2Checked ? `?${noiseSyndrome.s2}` : '??'))}
              </div>
            </div>

            {/* Diagnostic Puzzle Question (Section 18) */}
            <div
              style={{
                padding: '12px 14px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Which qubit is inconsistent with the parity syndrome?
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {[0, 1, 2].map(qIdx => {
                  const isSelected = playerDiagnosis === qIdx;
                  return (
                    <button
                      key={qIdx}
                      className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => handleSelectDiagnosis(qIdx)}
                      style={{ fontSize: '12px', fontWeight: 700 }}
                    >
                      Q{qIdx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section B: Repair Toolbox (Section 19 & 47) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
            <div className="control-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Wrench size={15} style={{ color: 'var(--accent-purple)' }} />
                Repair Toolbox
              </span>
              <button
                onClick={() => setActiveHelpComponent('correction-toolbox')}
                title="What is the Correction Toolbox?"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-purple)', fontSize: '11px', fontWeight: 600 }}
              >
                ? Help
              </button>
            </div>

            {/* Qubit Selector */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                TARGET QUBIT:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {[0, 1, 2].map(qIdx => {
                  const isSelected = selectedQubit === qIdx;
                  return (
                    <button
                      key={qIdx}
                      className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => handleSelectQubit(qIdx)}
                      style={{ fontSize: '12px', fontWeight: 700 }}
                    >
                      Q{qIdx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Gate Selector */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                CORRECTION GATE:
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['X', 'Z', 'H'] as CorrectionGate[]).map(gate => {
                  const isSelected = selectedGate === gate;
                  return (
                    <button
                      key={gate}
                      className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => handleSelectGate(gate)}
                      style={{
                        flex: 1,
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 800,
                        fontSize: '15px',
                        padding: '8px',
                      }}
                    >
                      [{gate}]
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Operation Summary */}
            <div
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: selectedQubit !== null && selectedGate ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              Selected:{' '}
              <strong>
                {selectedQubit !== null ? `Q${selectedQubit + 1}` : 'No Qubit'} + [{selectedGate || '?'}]
              </strong>
            </div>

            {/* Apply Repair Button */}
            <button
              className="btn btn-primary"
              disabled={selectedQubit === null || selectedGate === null}
              onClick={handleApplyRepair}
              style={{ width: '100%', padding: '10px' }}
            >
              <Wrench size={16} />
              <span>
                Apply [{selectedGate || '?'}] to Qubit {selectedQubit !== null ? selectedQubit + 1 : '?'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 5. VERIFICATION & RESULT PANEL (Section 23, 24, 48)            */}
      {/* ============================================================== */}
      <ResultPanel
        evaluation={evaluation}
        metrics={[
          {
            label: 'Initial Syndrome',
            value: noiseSyndrome.syndromeString,
            subtext: noiseSyndrome.indicatedQubitIndex >= 0 ? `Points to Q${noiseSyndrome.indicatedQubitIndex + 1}` : 'No Error',
            highlight: true,
          },
          {
            label: 'Diagnosed Target',
            value: playerDiagnosis !== null ? `Qubit ${playerDiagnosis + 1}` : 'Pending',
            subtext: selectedQubit !== null ? `Selected Q${selectedQubit + 1}` : 'Select in Toolbox',
          },
          {
            label: 'Applied Gate',
            value: isApplied && selectedGate ? `[${selectedGate}] on Q${selectedQubit! + 1}` : 'Not Applied',
            subtext: isApplied ? 'Simulated in Memory' : 'Click Apply first',
          },
          {
            label: 'Verification Status',
            value: evaluation.status === 'success' ? 'RESTORED' : evaluation.status === 'incorrect' ? 'FAILED' : 'READY',
            subtext: evaluation.status === 'success' ? 'Parity 00 Verified' : 'Click Verify below',
          },
        ]}
        onSubmitOrRun={handleVerify}
        runButtonLabel="Run Verification"
        onNextLevel={onNextLevel}
        showNextLevelButton={evaluation.status === 'success'}
      />

      {/* ============================================================== */}
      {/* 6. TRACK 4 INTRODUCTION MODAL (Section 4 & 5)                  */}
      {/* ============================================================== */}
      {isHowToPlayOpen && (
        <div className="modal-backdrop" data-ui-zone="track4-intro-modal">
          <div
            className="modal-content"
            style={{ maxWidth: '540px', padding: '28px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}
          >
            {showMeHowStep === null ? (
              // Main Intro View
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-purple)', textTransform: 'uppercase' }}>
                      TRACK 4 — QUANTUM SHIELD
                    </div>
                    <h2 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Quantum Error Correction
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsHowToPlayOpen(false)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    WHAT IS THIS?
                  </h4>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Quantum information can be affected by noise. Error-correction techniques use structured information to detect and correct certain errors.
                  </p>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    HOW DO I PLAY?
                  </h4>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Protect a quantum message, send it through a noisy channel, inspect the resulting error, diagnose it using the available information, repair it, and verify the result.
                  </p>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    WHAT WILL I LEARN?
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <li>Quantum noise</li>
                    <li>Bit-flip errors</li>
                    <li>Phase-flip errors</li>
                    <li>Redundancy</li>
                    <li>Syndrome detection</li>
                    <li>Error correction</li>
                    <li>Verification</li>
                  </ul>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowMeHowStep(0)}
                    style={{ flex: 1, padding: '10px' }}
                  >
                    [ SHOW ME HOW ]
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => setIsHowToPlayOpen(false)}
                    style={{ flex: 1, padding: '10px' }}
                  >
                    [ START TRACK ]
                  </button>
                </div>
              </div>
            ) : (
              // Show Me How 4-Step Interactive Walkthrough (Section 5)
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-purple)' }}>
                    SHOW ME HOW — STEP {showMeHowStep + 1} OF 4
                  </span>
                  <button
                    onClick={() => setShowMeHowStep(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div
                  style={{
                    padding: '24px',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center',
                    minHeight: '130px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {showMeHowStep === 0 && '“Start with a logical quantum message.”'}
                    {showMeHowStep === 1 && '“Protect it using redundancy.”'}
                    {showMeHowStep === 2 && '“Noise may corrupt part of the protected information.”'}
                    {showMeHowStep === 3 && '“Use diagnostic information to identify and repair the error.”'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '380px' }}>
                    {showMeHowStep === 0 && 'The original logical state (|0_L⟩ or |1_L⟩) contains the quantum message you must preserve.'}
                    {showMeHowStep === 1 && 'Encoding maps 1 logical qubit into 3 physical qubits (|000⟩ or |111⟩) to resist single-qubit failure.'}
                    {showMeHowStep === 2 && 'Transmission through environmental noise can invert bit values (X) or relative phase signs (Z).'}
                    {showMeHowStep === 3 && 'Parity syndromes isolate the outlier qubit without destroying the superposed message.'}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  {showMeHowStep > 0 ? (
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowMeHowStep(prev => (prev !== null ? prev - 1 : 0))}
                    >
                      Previous
                    </button>
                  ) : <div />}

                  {showMeHowStep < 3 ? (
                    <button
                      className="btn btn-primary"
                      onClick={() => setShowMeHowStep(prev => (prev !== null ? prev + 1 : 0))}
                    >
                      Next Step →
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setShowMeHowStep(null);
                        setIsHowToPlayOpen(false);
                      }}
                    >
                      [ START LEVEL 1 ]
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Component Educational Popup */}
      <EducationalPopup
        isOpen={!!activeHelpComponent}
        onClose={() => setActiveHelpComponent(null)}
        type="component-help"
        componentHelp={activeHelpComponent ? COMPONENT_HELP[activeHelpComponent] : undefined}
      />
    </div>
  );
};
