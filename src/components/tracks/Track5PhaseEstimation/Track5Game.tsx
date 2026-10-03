// Track 5 — Quantum Phase Estimation: QUANTUM RADAR
// Genuine interactive quantum signal hunting and phase-estimation puzzle game.
// Player Role: QUANTUM SIGNAL OPERATOR
// Core Loop: SCAN -> SELECT -> CONFIGURE -> RUN QPE -> OBSERVE -> ESTIMATE -> LOCK

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { PhaseLevelConfig } from '../../../core/levels/track5Levels';
import {
  simulateQPE,
  sampleQPEMeasurements,
  evaluateQuantumRadarLevel,
  calculateCircularDistance,
  calculateConfidence,
  type QuantumRadarState,
  type RadarSignal,
} from '../../../core/engines/phaseEstimationEngine';
import type { EvaluationResult } from '../../../core/types';
import { RadarCanvas } from './RadarCanvas';
import { QPECircuitVisualizer } from './QPECircuitVisualizer';
import { MeasurementHistogram } from './MeasurementHistogram';
import { EducationalPopup } from '../../common/EducationalPopup';
import { COMPONENT_HELP } from '../../../core/educationData';
import { soundEngine } from '../../../core/audio/soundEngine';
import {
  Radio,
  Crosshair,
  BarChart2,
  RotateCcw,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Clock,
  Compass,
  Cpu,
  Layers,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface Track5GameProps {
  level: PhaseLevelConfig;
  evaluation: EvaluationResult;
  onEvaluate: (result: EvaluationResult) => void;
  onRecordInteraction: () => void;
  onNextLevel: () => void;
}

export const Track5Game: React.FC<Track5GameProps> = ({
  level,
  evaluation,
  onEvaluate,
  onRecordInteraction,
  onNextLevel,
}) => {
  // Game State
  const [selectedSignalId, setSelectedSignalId] = useState<string | null>(null);
  const [selectedPrecisionBits, setSelectedPrecisionBits] = useState<number>(
    level.requiredPrecisionBits || 3
  );
  const [selectedShots, setSelectedShots] = useState<number>(50);
  const [hasRunQPE, setHasRunQPE] = useState<boolean>(false);
  const [measurementCounts, setMeasurementCounts] = useState<Record<string, number> | null>(null);
  const [totalShotsSampled, setTotalShotsSampled] = useState<number>(0);
  const [playerPhaseEstimate, setPlayerPhaseEstimate] = useState<number>(0.1);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [scansUsed, setScansUsed] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(level.timeLimit || null);
  const [isPracticeMode, setIsPracticeMode] = useState<boolean>(false);
  const [activeHelpComponent, setActiveHelpComponent] = useState<string | null>(null);

  // Initialize level state on change
  useEffect(() => {
    setSelectedSignalId(null);
    setSelectedPrecisionBits(level.requiredPrecisionBits || 3);
    setSelectedShots(50);
    setHasRunQPE(false);
    setMeasurementCounts(null);
    setTotalShotsSampled(0);
    setPlayerPhaseEstimate(0.1);
    setIsLocked(false);
    setScansUsed(0);
    setTimeRemaining(level.timeLimit || null);
    setIsPracticeMode(false);

    // Initial evaluation state is strictly unstarted
    const initialRes = evaluateQuantumRadarLevel(
      {
        selectedSignalId: null,
        selectedPrecisionBits: level.requiredPrecisionBits || 3,
        hasRunQPE: false,
        measurementCounts: null,
        totalShotsSampled: 0,
        playerPhaseEstimate: null,
        isLocked: false,
        scansUsed: 0,
        timeRemaining: level.timeLimit || null,
        isPracticeMode: false,
      },
      level
    );
    onEvaluate(initialRes);
  }, [level.id]);

  // Timer countdown for challenge levels
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || evaluation.status === 'success') {
      return;
    }
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeRemaining, evaluation.status]);

  // Currently targeted signal
  const targetedSignal = useMemo(() => {
    return level.signals.find(s => s.id === selectedSignalId) || null;
  }, [level.signals, selectedSignalId]);

  // Actual Quantum Phase Estimation simulation for targeted signal
  const qpeResult = useMemo(() => {
    if (!targetedSignal) {
      return simulateQPE(0.5, selectedPrecisionBits);
    }
    return simulateQPE(targetedSignal.truePhase, selectedPrecisionBits);
  }, [targetedSignal, selectedPrecisionBits]);

  // Synchronous evaluation runner
  const runEvaluation = useCallback(
    (currentState: QuantumRadarState) => {
      const result = evaluateQuantumRadarLevel(currentState, level);
      onEvaluate(result);
      return result;
    },
    [level, onEvaluate]
  );

  // Handler: Selecting a candidate signal on radar
  const handleSelectSignal = (signalId: string) => {
    soundEngine.playRadarPing();
    onRecordInteraction();
    setSelectedSignalId(signalId);
    setHasRunQPE(false);
    setMeasurementCounts(null);
    setIsLocked(false);

    const nextState: QuantumRadarState = {
      selectedSignalId: signalId,
      selectedPrecisionBits,
      hasRunQPE: false,
      measurementCounts: null,
      totalShotsSampled: 0,
      playerPhaseEstimate,
      isLocked: false,
      scansUsed,
      timeRemaining,
      isPracticeMode,
    };
    runEvaluation(nextState);
  };

  // Handler: Running QPE Experiment
  const handleRunQPE = () => {
    if (!selectedSignalId || !targetedSignal) return;

    if (level.allowedScans && scansUsed >= level.allowedScans) {
      soundEngine.playError();
      return;
    }

    soundEngine.playStateTransition();
    onRecordInteraction();
    const newScans = scansUsed + 1;
    setScansUsed(newScans);

    // Sample probabilistic measurements from actual simulated distribution
    const counts = sampleQPEMeasurements(qpeResult, selectedShots);
    setMeasurementCounts(counts);
    setTotalShotsSampled(selectedShots);
    setHasRunQPE(true);
    setIsLocked(false);

    const nextState: QuantumRadarState = {
      selectedSignalId,
      selectedPrecisionBits,
      hasRunQPE: true,
      measurementCounts: counts,
      totalShotsSampled: selectedShots,
      playerPhaseEstimate,
      isLocked: false,
      scansUsed: newScans,
      timeRemaining,
      isPracticeMode,
    };
    runEvaluation(nextState);
  };

  // Handler: Phase Estimate Slider / Direct adjustment
  const handleEstimateChange = (newEst: number) => {
    soundEngine.playDragTick();
    onRecordInteraction();
    const clamped = Math.max(0, Math.min(0.999, Number(newEst.toFixed(3))));
    setPlayerPhaseEstimate(clamped);

    if (isLocked) {
      setIsLocked(false);
    }
  };

  // Handler: Autofilling estimate from clicked histogram bar
  const handleSelectPhaseFromHistogram = (phase: number) => {
    soundEngine.playClick();
    onRecordInteraction();
    setPlayerPhaseEstimate(Number(phase.toFixed(3)));
    if (isLocked) {
      setIsLocked(false);
    }
  };

  // Handler: Lock Signal & Verify
  const handleLockSignal = () => {
    onRecordInteraction();
    setIsLocked(true);

    const stateToEval: QuantumRadarState = {
      selectedSignalId,
      selectedPrecisionBits,
      hasRunQPE,
      measurementCounts,
      totalShotsSampled,
      playerPhaseEstimate,
      isLocked: true,
      scansUsed,
      timeRemaining,
      isPracticeMode,
    };

    const res = runEvaluation(stateToEval);

    if (res.status === 'success') {
      soundEngine.playLockAcquired();
      setTimeout(() => soundEngine.playSuccess(), 250);
    } else if (res.status === 'incorrect' || res.status === 'invalid') {
      soundEngine.playError();
    } else {
      soundEngine.playClick();
    }
  };

  // Handler: Reset Level
  const handleReset = () => {
    soundEngine.playReset();
    setSelectedSignalId(null);
    setSelectedPrecisionBits(level.requiredPrecisionBits || 3);
    setHasRunQPE(false);
    setMeasurementCounts(null);
    setTotalShotsSampled(0);
    setPlayerPhaseEstimate(0.1);
    setIsLocked(false);
    setScansUsed(0);
    setTimeRemaining(level.timeLimit || null);

    const resetState: QuantumRadarState = {
      selectedSignalId: null,
      selectedPrecisionBits: level.requiredPrecisionBits || 3,
      hasRunQPE: false,
      measurementCounts: null,
      totalShotsSampled: 0,
      playerPhaseEstimate: null,
      isLocked: false,
      scansUsed: 0,
      timeRemaining: level.timeLimit || null,
      isPracticeMode,
    };
    runEvaluation(resetState);
  };

  // Compute live error and confidence metrics
  const targetPhase = level.targetState?.truePhase ?? 0.5;
  const liveError = calculateCircularDistance(playerPhaseEstimate, targetPhase);
  const confidence = useMemo(() => {
    if (!hasRunQPE || !measurementCounts || totalShotsSampled <= 0) return 0;
    const peakCount = measurementCounts[qpeResult.mostProbableBitString] || 0;
    return calculateConfidence(totalShotsSampled, qpeResult.theoreticalPeakProb, peakCount);
  }, [hasRunQPE, measurementCounts, totalShotsSampled, qpeResult]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        maxWidth: '1280px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      {/* 1. MISSION & TARGET CARD (Always Prominently Visible) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Mission Briefing */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg, 12px)',
            border: '1px solid var(--border-subtle, #E2E8F0)',
            padding: '16px 20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
          data-ui-zone="mission-card"
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#92400E',
                  backgroundColor: '#FEF3C7',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Radio size={12} />
                MISSION BRIEFING
              </span>

              {/* Component help for Quantum Radar */}
              <button
                onClick={() => setActiveHelpComponent('signal-source')}
                title="What is a Quantum Signal Source?"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                }}
              >
                <HelpCircle size={14} />
                <span>Help</span>
              </button>
            </div>

            <p style={{ margin: '0 0 10px 0', fontSize: '13px', lineHeight: '1.5', color: '#1E293B', fontWeight: 500 }}>
              {level.description}
            </p>
          </div>

          {/* Mission Meta badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Compass size={13} style={{ color: '#F59E0B' }} />
              Band: {level.targetPhaseRange[0].toFixed(2)}–{level.targetPhaseRange[1].toFixed(2)}
            </span>
            <span style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Crosshair size={13} style={{ color: '#0284C7' }} />
              Tolerance: ±{level.targetTolerance}
            </span>
            {level.allowedScans && (
              <span style={{ fontSize: '11px', color: scansUsed >= level.allowedScans ? '#DC2626' : '#64748B' }}>
                Scans: {scansUsed}/{level.allowedScans}
              </span>
            )}
            {timeRemaining !== null && (
              <span
                style={{
                  fontSize: '11px',
                  color: timeRemaining <= 15 ? '#DC2626' : '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Clock size={13} />
                {timeRemaining}s
              </span>
            )}
          </div>
        </div>

        {/* Target Phase & Lock Status Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg, 12px)',
            border: '1px solid var(--border-subtle, #E2E8F0)',
            padding: '16px 20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
          data-ui-zone="target-card"
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: '#64748B' }}>
                RADAR TARGET STATUS
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  backgroundColor:
                    evaluation.status === 'success'
                      ? '#DCFCE7'
                      : evaluation.status === 'incorrect'
                      ? '#FEE2E2'
                      : '#F1F5F9',
                  color:
                    evaluation.status === 'success'
                      ? '#166534'
                      : evaluation.status === 'incorrect'
                      ? '#991B1B'
                      : '#475569',
                }}
              >
                {evaluation.status === 'success'
                  ? '✓ SIGNAL LOCKED'
                  : isLocked
                  ? 'LOCK FAILED'
                  : 'READY TO SCAN'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
              <div style={{ padding: '8px', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                <span style={{ fontSize: '10px', color: '#64748B', display: 'block' }}>TARGET RANGE</span>
                <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'ui-monospace, monospace' }}>
                  {level.targetPhaseRange[0].toFixed(2)}–{level.targetPhaseRange[1].toFixed(2)}
                </span>
              </div>
              <div style={{ padding: '8px', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                <span style={{ fontSize: '10px', color: '#64748B', display: 'block' }}>ESTIMATED φ</span>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    fontFamily: 'ui-monospace, monospace',
                    color: '#B45309',
                  }}
                >
                  {playerPhaseEstimate.toFixed(3)}
                </span>
              </div>
              <div style={{ padding: '8px', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                <span style={{ fontSize: '10px', color: '#64748B', display: 'block' }}>CONFIDENCE</span>
                <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'ui-monospace, monospace' }}>
                  {confidence > 0 ? `${(confidence * 100).toFixed(0)}%` : '---'}
                </span>
              </div>
            </div>
          </div>

          {/* Feedback banner */}
          <div
            style={{
              marginTop: '10px',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              backgroundColor:
                evaluation.status === 'success'
                  ? '#F0FDF4'
                  : evaluation.status === 'incorrect'
                  ? '#FEF2F2'
                  : '#F8FAFC',
              color:
                evaluation.status === 'success'
                  ? '#15803D'
                  : evaluation.status === 'incorrect'
                  ? '#B91C1C'
                  : '#475569',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {evaluation.status === 'success' ? (
              <CheckCircle2 size={13} />
            ) : evaluation.status === 'incorrect' ? (
              <AlertCircle size={13} />
            ) : (
              <Radio size={13} />
            )}
            <span style={{ flex: 1 }}>{evaluation.feedback}</span>
          </div>
        </div>
      </div>

      {/* 2. QUANTUM RADAR SPECTRUM & TARGET SELECTION */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1fr) minmax(260px, 320px)',
          gap: '16px',
        }}
      >
        {/* Radar Canvas Display */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Radio size={15} style={{ color: '#F59E0B' }} />
              Active Radar Phase Spectrum
              <button
                onClick={() => setActiveHelpComponent('spectrum')}
                title="What is the Quantum Spectrum?"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <HelpCircle size={13} />
              </button>
            </span>

            {/* Practice Mode Toggle */}
            <button
              onClick={() => setIsPracticeMode(!isPracticeMode)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                padding: '3px 8px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                backgroundColor: isPracticeMode ? '#FEF3C7' : '#FFFFFF',
                color: isPracticeMode ? '#92400E' : '#64748B',
                cursor: 'pointer',
              }}
              title="Practice Mode reveals true eigenphases for educational calibration"
            >
              {isPracticeMode ? <Eye size={12} /> : <EyeOff size={12} />}
              <span>Practice Mode</span>
            </button>
          </div>

          <RadarCanvas
            signals={level.signals}
            selectedSignalId={selectedSignalId}
            onSelectSignal={handleSelectSignal}
            targetRange={level.targetPhaseRange}
            isPracticeMode={isPracticeMode}
          />
        </div>

        {/* Selected Signal Details & QPE Controls Panel */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg, 12px)',
            border: '1px solid var(--border-subtle, #E2E8F0)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
          data-ui-zone="qpe-controls"
        >
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: '#64748B' }}>
              TARGETED RECEIVER
            </span>

            {targetedSignal ? (
              <div
                style={{
                  marginTop: '10px',
                  padding: '12px',
                  backgroundColor: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  borderRadius: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#92400E' }}>
                    {targetedSignal.id}: {targetedSignal.name}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: '#F59E0B',
                      color: '#FFFFFF',
                      fontWeight: 600,
                    }}
                  >
                    TARGETED
                  </span>
                </div>
                <div style={{ marginTop: '6px', fontSize: '11px', color: '#B45309' }}>
                  Region: {targetedSignal.knownRegion} {targetedSignal.frequencyBand ? `(${targetedSignal.frequencyBand})` : ''}
                </div>
                <div style={{ marginTop: '2px', fontSize: '11px', color: '#78350F', fontWeight: 600 }}>
                  True Phase: {isPracticeMode ? targetedSignal.truePhase.toFixed(3) : 'HIDDEN (Use QPE)'}
                </div>
              </div>
            ) : (
              <div
                style={{
                  marginTop: '10px',
                  padding: '16px',
                  backgroundColor: '#F8FAFC',
                  border: '1px dashed #CBD5E1',
                  borderRadius: '8px',
                  textAlign: 'center',
                  color: '#64748B',
                  fontSize: '12px',
                }}
              >
                No signal selected. Click a beacon on the radar screen.
              </div>
            )}

            {/* Precision Selector */}
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                  Estimation Precision
                </span>
                <button
                  onClick={() => setActiveHelpComponent('precision')}
                  title="What is Precision?"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
                >
                  <HelpCircle size={13} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {[2, 3, 4].map(bits => {
                  const isAllowed = level.allowedPrecisionBits.includes(bits);
                  const isSelected = selectedPrecisionBits === bits;

                  return (
                    <button
                      key={`prec-${bits}`}
                      disabled={!isAllowed}
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedPrecisionBits(bits);
                        setHasRunQPE(false);
                      }}
                      style={{
                        padding: '6px 4px',
                        fontSize: '11px',
                        fontWeight: isSelected ? 700 : 500,
                        borderRadius: '6px',
                        border: isSelected ? '2px solid #F59E0B' : '1px solid #CBD5E1',
                        backgroundColor: isSelected ? '#FEF3C7' : isAllowed ? '#FFFFFF' : '#F1F5F9',
                        color: isSelected ? '#92400E' : isAllowed ? '#334155' : '#94A3B8',
                        cursor: isAllowed ? 'pointer' : 'not-allowed',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {bits} Bits (1/{1 << bits})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Shots Selector */}
            <div style={{ marginTop: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Sampling Shots
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {[1, 10, 50, 100].map(shots => (
                  <button
                    key={`shots-${shots}`}
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedShots(shots);
                    }}
                    style={{
                      padding: '5px 2px',
                      fontSize: '11px',
                      fontWeight: selectedShots === shots ? 700 : 500,
                      borderRadius: '6px',
                      border: selectedShots === shots ? '2px solid #0284C7' : '1px solid #CBD5E1',
                      backgroundColor: selectedShots === shots ? '#E0F2FE' : '#FFFFFF',
                      color: selectedShots === shots ? '#0369A1' : '#334155',
                      cursor: 'pointer',
                    }}
                  >
                    {shots}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Run QPE Action Button */}
          <div style={{ marginTop: '16px' }}>
            <button
              onClick={handleRunQPE}
              disabled={!selectedSignalId}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                backgroundColor: selectedSignalId ? '#F59E0B' : '#E2E8F0',
                color: selectedSignalId ? '#FFFFFF' : '#94A3B8',
                fontWeight: 600,
                fontSize: '13px',
                border: 'none',
                cursor: selectedSignalId ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: selectedSignalId ? '0 2px 4px rgba(245, 158, 11, 0.3)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Cpu size={16} />
              <span>RUN QPE EXPERIMENT</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. REAL QPE CIRCUIT VISUALIZER */}
      <QPECircuitVisualizer
        numPrecisionBits={selectedPrecisionBits}
        hasRun={hasRunQPE}
        dominantBitString={hasRunQPE ? qpeResult.mostProbableBitString : ''}
      />

      {/* 4. MEASUREMENT DISTRIBUTION HISTOGRAM */}
      <MeasurementHistogram
        simResult={qpeResult}
        sampleCounts={measurementCounts}
        totalShots={totalShotsSampled}
        onSelectPhase={handleSelectPhaseFromHistogram}
        selectedPhase={playerPhaseEstimate}
      />

      {/* 5. ESTIMATION & LOCK ACTION BAR */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg, 12px)',
          border: '1px solid var(--border-subtle, #E2E8F0)',
          padding: '16px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 1.5fr) minmax(200px, 1fr)',
          gap: '20px',
          alignItems: 'center',
        }}
        data-ui-zone="phase-estimate-card"
      >
        {/* Slider & Number Input */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Compass size={16} style={{ color: '#F59E0B' }} />
              Phase Estimate Fine-Tuning (φ)
              <button
                onClick={() => setActiveHelpComponent('estimated-phase')}
                title="What is Estimated Phase?"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <HelpCircle size={13} />
              </button>
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="mono" style={{ fontSize: '15px', fontWeight: 700, color: '#B45309' }}>
                φ = {playerPhaseEstimate.toFixed(3)}
              </span>
              <span style={{ fontSize: '11px', color: '#64748B' }}>
                ({(playerPhaseEstimate * 360).toFixed(1)}°)
              </span>
            </div>
          </div>

          {/* Slider track */}
          <input
            type="range"
            min="0"
            max="0.999"
            step="0.001"
            value={playerPhaseEstimate}
            onChange={e => handleEstimateChange(parseFloat(e.target.value))}
            style={{
              width: '100%',
              accentColor: '#F59E0B',
              cursor: 'pointer',
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '10px', color: '#64748B' }}>
            <span>0.000 (0°)</span>
            <span>0.250 (90°)</span>
            <span>0.500 (180°)</span>
            <span>0.750 (270°)</span>
            <span>0.999 (360°)</span>
          </div>
        </div>

        {/* Action Buttons: Reset & Lock */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} data-ui-zone="lock-button">
          <button
            onClick={handleReset}
            className="btn btn-secondary"
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            title="Reset level configuration"
          >
            <RotateCcw size={15} />
            <span>Reset</span>
          </button>

          <button
            onClick={handleLockSignal}
            disabled={!selectedSignalId || !hasRunQPE}
            style={{
              flex: 1,
              padding: '12px 18px',
              borderRadius: '8px',
              backgroundColor:
                selectedSignalId && hasRunQPE ? '#F59E0B' : '#E2E8F0',
              color: selectedSignalId && hasRunQPE ? '#FFFFFF' : '#94A3B8',
              fontWeight: 700,
              fontSize: '14px',
              border: 'none',
              cursor: selectedSignalId && hasRunQPE ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow:
                selectedSignalId && hasRunQPE
                  ? '0 2px 6px rgba(245, 158, 11, 0.35)'
                  : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <ShieldCheck size={18} />
            <span>LOCK SIGNAL</span>
          </button>
        </div>
      </div>

      {/* 6. EDUCATIONAL POPUP (Collision-free centered modal) */}
      {activeHelpComponent && COMPONENT_HELP[activeHelpComponent] && (
        <EducationalPopup
          isOpen={true}
          type="component-help"
          componentHelp={COMPONENT_HELP[activeHelpComponent]}
          onClose={() => setActiveHelpComponent(null)}
        />
      )}
    </div>
  );
};
