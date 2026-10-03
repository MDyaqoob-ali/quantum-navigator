// Track 5 — Quantum Spin & Measurement: SPIN SPLITTER
// Interactive Stern-Gerlach quantum spin-1/2 measurement and state collapse puzzle game.
// Player Role: QUANTUM EXPERIMENT OPERATOR
// Core Loop: WATCH -> ROTATE -> EXPERIMENT -> OBSERVE -> REASON -> SOLVE

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { SpinLevelConfig } from '../../../core/levels/track5Levels';
import {
  calculateSequentialSpin,
  sampleSpinExperiment,
  evaluateSpinSplitterLevel,
  angleToAxis2D,
  type SpinSplitterState,
  type SpinExperimentSample,
  type BranchSelection,
} from '../../../core/engines/spinSplitterEngine';
import type { EvaluationResult } from '../../../core/types';
import { SpinCanvas } from './SpinCanvas';
import { EducationalPopup } from '../../common/EducationalPopup';
import { COMPONENT_HELP, TRACK_INTROS } from '../../../core/educationData';
import { soundEngine } from '../../../core/audio/soundEngine';
import {
  Compass,
  RotateCcw,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  Play,
  Activity,
  ArrowRight,
  Info,
} from 'lucide-react';

interface Track5GameProps {
  level: SpinLevelConfig;
  evaluation: EvaluationResult;
  onEvaluate: (result: EvaluationResult) => void;
  onRecordInteraction: () => void;
  onNextLevel: () => void;
  onOpenComponentHelp?: (id: string) => void;
}

export const Track5Game: React.FC<Track5GameProps> = ({
  level,
  evaluation,
  onEvaluate,
  onRecordInteraction,
  onNextLevel,
  onOpenComponentHelp,
}) => {
  // Game State
  const [analyzer1Angle, setAnalyzer1Angle] = useState<number>(level.analyzer1InitialAngle ?? 0);
  const [analyzer2Angle, setAnalyzer2Angle] = useState<number>(level.analyzer2InitialAngle ?? 0);
  const [selectedBranch, setSelectedBranch] = useState<BranchSelection>('+');
  const [experimentShots, setExperimentShots] = useState<number>(
    level.requiredExperimentShots || 50
  );
  const [hasRunExperiment, setHasRunExperiment] = useState<boolean>(false);
  const [experimentSample, setExperimentSample] = useState<SpinExperimentSample | null>(null);
  const [experimentsUsed, setExperimentsUsed] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(level.timeLimit || null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [activeHelpComponent, setActiveHelpComponent] = useState<string | null>(null);
  const [showHowToPlayModal, setShowHowToPlayModal] = useState<boolean>(false);

  // Initialize level state on level change
  useEffect(() => {
    const initA1 = level.analyzer1InitialAngle ?? 0;
    const initA2 = level.analyzer2InitialAngle ?? 0;
    setAnalyzer1Angle(initA1);
    setAnalyzer2Angle(initA2);
    setSelectedBranch('+');
    setExperimentShots(level.requiredExperimentShots || 50);
    setHasRunExperiment(false);
    setExperimentSample(null);
    setExperimentsUsed(0);
    setTimeRemaining(level.timeLimit || null);
    setIsSimulating(false);

    // Initial evaluation status is unstarted
    const initialRes = evaluateSpinSplitterLevel(
      {
        analyzer1Angle: initA1,
        analyzer2Angle: level.analyzerCount === 2 ? initA2 : undefined,
        selectedBranch: '+',
        hasRunExperiment: false,
        experimentSample: null,
        experimentsUsed: 0,
        timeRemaining: level.timeLimit || null,
      },
      level
    );
    onEvaluate(initialRes);
  }, [level.id]);

  // Countdown timer for challenge levels
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

  // Live physical simulation based on current apparatus orientation
  const livePhysics = useMemo(() => {
    const axis1 = angleToAxis2D(analyzer1Angle);
    const axis2 =
      level.analyzerCount === 2 && analyzer2Angle !== undefined
        ? angleToAxis2D(analyzer2Angle)
        : undefined;

    return calculateSequentialSpin(
      level.sourceState,
      axis1,
      selectedBranch,
      axis2
    );
  }, [level.sourceState, level.analyzerCount, analyzer1Angle, analyzer2Angle, selectedBranch]);

  // Active target detector probabilities
  const activeProbPlus = useMemo(() => {
    if (level.targetDetector === 'analyzer1' || level.analyzerCount === 1) {
      return livePhysics.analyzer1.probPlus;
    }
    return livePhysics.finalProbPlus;
  }, [level.targetDetector, level.analyzerCount, livePhysics]);

  const activeProbMinus = 1.0 - activeProbPlus;
  const currentError = Math.abs(activeProbPlus - level.targetProbPlus);
  const isTargetSatisfied = currentError <= level.targetTolerance;

  // Helper to send live evaluations to App.tsx
  const sendEvaluation = useCallback(
    (
      a1: number,
      a2: number,
      branch: BranchSelection,
      hasRun: boolean = false,
      sample: SpinExperimentSample | null = null,
      usedExp: number = experimentsUsed
    ) => {
      const res = evaluateSpinSplitterLevel(
        {
          analyzer1Angle: a1,
          analyzer2Angle: level.analyzerCount === 2 ? a2 : undefined,
          selectedBranch: branch,
          hasRunExperiment: hasRun,
          experimentSample: sample,
          experimentsUsed: usedExp,
          timeRemaining,
        },
        level
      );
      onEvaluate(res);
    },
    [level, timeRemaining, experimentsUsed, onEvaluate]
  );

  // Synchronize with external Reset action from TrackHeader or MissionCard
  useEffect(() => {
    if (
      evaluation.status === 'unstarted' &&
      (!evaluation.details || Object.keys(evaluation.details).length === 0)
    ) {
      const initA1 = level.analyzer1InitialAngle ?? 0;
      const initA2 = level.analyzer2InitialAngle ?? 0;
      setAnalyzer1Angle(initA1);
      setAnalyzer2Angle(initA2);
      setSelectedBranch('+');
      setExperimentShots(level.requiredExperimentShots || 50);
      setHasRunExperiment(false);
      setExperimentSample(null);
      setExperimentsUsed(0);
      setTimeRemaining(level.timeLimit || null);
      setIsSimulating(false);

      const initialRes = evaluateSpinSplitterLevel(
        {
          analyzer1Angle: initA1,
          analyzer2Angle: level.analyzerCount === 2 ? initA2 : undefined,
          selectedBranch: '+',
          hasRunExperiment: false,
          experimentSample: null,
          experimentsUsed: 0,
          timeRemaining: level.timeLimit || null,
        },
        level
      );
      onEvaluate(initialRes);
    }
  }, [evaluation.status, evaluation.details, level, onEvaluate]);

  // Handlers for rotating Analyzer 1
  const handleRotateA1 = useCallback(
    (newAngle: number) => {
      const normalized = ((newAngle % 360) + 360) % 360;
      setAnalyzer1Angle(normalized);
      onRecordInteraction();
      sendEvaluation(normalized, analyzer2Angle, selectedBranch, false, null, experimentsUsed);
    },
    [analyzer2Angle, selectedBranch, experimentsUsed, sendEvaluation, onRecordInteraction]
  );

  // Handlers for rotating Analyzer 2
  const handleRotateA2 = useCallback(
    (newAngle: number) => {
      const normalized = ((newAngle % 360) + 360) % 360;
      setAnalyzer2Angle(normalized);
      onRecordInteraction();
      sendEvaluation(analyzer1Angle, normalized, selectedBranch, false, null, experimentsUsed);
    },
    [analyzer1Angle, selectedBranch, experimentsUsed, sendEvaluation, onRecordInteraction]
  );

  // Handler for branch selection
  const handleSelectBranch = useCallback(
    (branch: BranchSelection) => {
      setSelectedBranch(branch);
      soundEngine.playClick();
      onRecordInteraction();
      sendEvaluation(analyzer1Angle, analyzer2Angle, branch, false, null, experimentsUsed);
    },
    [analyzer1Angle, analyzer2Angle, experimentsUsed, sendEvaluation, onRecordInteraction]
  );

  // Step rotation helper
  const stepAngle = (analyzer: 'a1' | 'a2', delta: number) => {
    soundEngine.playClick();
    if (analyzer === 'a1') {
      handleRotateA1(analyzer1Angle + delta);
    } else {
      handleRotateA2(analyzer2Angle + delta);
    }
  };

  // Run experiment action
  const handleRunExperiment = () => {
    if (isSimulating) return;

    soundEngine.playClick();
    onRecordInteraction();

    const newExperimentsUsed = experimentsUsed + 1;
    setExperimentsUsed(newExperimentsUsed);
    setIsSimulating(true);

    // Sample binomial particle measurements from true theoretical probability
    const sample = sampleSpinExperiment(activeProbPlus, experimentShots);
    setExperimentSample(sample);
    setHasRunExperiment(true);

    const updatedState: SpinSplitterState = {
      analyzer1Angle,
      analyzer2Angle: level.analyzerCount === 2 ? analyzer2Angle : undefined,
      selectedBranch,
      hasRunExperiment: true,
      experimentSample: sample,
      experimentsUsed: newExperimentsUsed,
      timeRemaining,
    };

    // Evaluate against quantum physical criteria
    const evalResult = evaluateSpinSplitterLevel(updatedState, level);

    setTimeout(() => {
      setIsSimulating(false);
      onEvaluate(evalResult);
      if (evalResult.status === 'success') {
        soundEngine.playSuccess();
      } else {
        soundEngine.playError();
      }
    }, 900);
  };

  // Reset attempt
  const handleReset = () => {
    soundEngine.playClick();
    const initA1 = level.analyzer1InitialAngle ?? 0;
    const initA2 = level.analyzer2InitialAngle ?? 0;
    setAnalyzer1Angle(initA1);
    setAnalyzer2Angle(initA2);
    setSelectedBranch('+');
    setHasRunExperiment(false);
    setExperimentSample(null);
    setExperimentsUsed(0);
    setTimeRemaining(level.timeLimit || null);
    setIsSimulating(false);

    sendEvaluation(initA1, initA2, '+', false, null, 0);
  };

  // Helper for component help popups
  const handleHelpClick = (helpId: string) => {
    if (onOpenComponentHelp) {
      onOpenComponentHelp(helpId);
    } else {
      setActiveHelpComponent(helpId);
    }
  };

  // Cardinal direction label helper
  const getCardinalLabel = (deg: number): string => {
    if (deg === 0) return '+Z (0°)';
    if (deg === 90) return '+X (90°)';
    if (deg === 180) return '-Z (180°)';
    if (deg === 270) return '-X (270°)';
    return `${deg}°`;
  };

  return (
    <div className="t5-container" data-ui-zone="track5-game-container">
      {/* Main Two-Column Layout */}
      <div className="t5-layout-grid">
        {/* LEFT COLUMN: Target Card + Stern-Gerlach Interactive Canvas */}
        <div className="t5-col">
          {/* Target & Live Output Panel */}
          <div className="t5-card">
            <div className="t5-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span className="t5-card-title">🎯 Target vs Live Apparatus</span>
                {level.allowedExperiments && (
                  <span className="t5-chip-runs">
                    Runs: {experimentsUsed} / {level.allowedExperiments}
                  </span>
                )}
                {timeRemaining !== null && (
                  <span className={`t5-chip-timer ${timeRemaining <= 15 ? 't5-chip-timer-alert' : ''}`}>
                    <Clock size={12} />
                    {timeRemaining}s
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  className={
                    evaluation.status === 'success'
                      ? 't5-badge-success'
                      : isTargetSatisfied
                      ? 't5-badge-info'
                      : 't5-badge-warning'
                  }
                >
                  {evaluation.status === 'success'
                    ? '✓ TARGET REACHED'
                    : isTargetSatisfied
                    ? 'RUN EXPERIMENT TO VERIFY'
                    : 'ADJUST ANALYZER'}
                </span>
                <button
                  onClick={() => setShowHowToPlayModal(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '2px',
                  }}
                  title="How to Play: Spin Splitter"
                >
                  <HelpCircle size={16} />
                </button>
              </div>
            </div>

            {/* Target vs Current Comparison Grid */}
            <div className="t5-comparison-grid">
              {/* TARGET BARS */}
              <div className="t5-meter-group">
                <span className="t5-meter-header">Target Distribution</span>
                <div className="t5-meter-row t5-meter-row-plus">
                  <span>Detector +</span>
                  <span>
                    {(level.targetProbPlus * 100).toFixed(0)}% ±{' '}
                    {(level.targetTolerance * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="t5-progress-track">
                  <div
                    className="t5-progress-fill-plus"
                    style={{ width: `${level.targetProbPlus * 100}%` }}
                  />
                </div>

                <div className="t5-meter-row t5-meter-row-minus" style={{ marginTop: '4px' }}>
                  <span>Detector −</span>
                  <span>
                    {((1.0 - level.targetProbPlus) * 100).toFixed(0)}% ±{' '}
                    {(level.targetTolerance * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="t5-progress-track">
                  <div
                    className="t5-progress-fill-minus"
                    style={{ width: `${(1.0 - level.targetProbPlus) * 100}%` }}
                  />
                </div>
              </div>

              {/* CURRENT LIVE READOUT */}
              <div className="t5-meter-group">
                <div className="t5-meter-header">
                  <span>Current Apparatus</span>
                  <span style={{ color: isTargetSatisfied ? '#059669' : '#64748B' }}>
                    Error: {(currentError * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="t5-meter-row t5-meter-row-plus">
                  <span>Detector +</span>
                  <span>{(activeProbPlus * 100).toFixed(1)}%</span>
                </div>
                <div className="t5-progress-track">
                  <div
                    className="t5-progress-fill-plus"
                    style={{ width: `${activeProbPlus * 100}%` }}
                  />
                </div>

                <div className="t5-meter-row t5-meter-row-minus" style={{ marginTop: '4px' }}>
                  <span>Detector −</span>
                  <span>{(activeProbMinus * 100).toFixed(1)}%</span>
                </div>
                <div className="t5-progress-track">
                  <div
                    className="t5-progress-fill-minus"
                    style={{ width: `${activeProbMinus * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Spin Canvas Component */}
          <SpinCanvas
            level={level}
            analyzer1Angle={analyzer1Angle}
            analyzer2Angle={analyzer2Angle}
            selectedBranch={selectedBranch}
            onRotateAnalyzer1={handleRotateA1}
            onRotateAnalyzer2={handleRotateA2}
            onSelectBranch={handleSelectBranch}
            isSimulating={isSimulating}
            experimentSample={experimentSample}
            theoryProbPlus={activeProbPlus}
            theoryProbMinus={activeProbMinus}
            onOpenComponentHelp={handleHelpClick}
          />
        </div>

        {/* RIGHT COLUMN: Apparatus Controls + Experiment Stats & Feedback */}
        <div className="t5-col">
          {/* Controls Card */}
          <div className="t5-card">
            <div className="t5-card-header">
              <span className="t5-card-title">
                <Compass size={14} /> Apparatus Calibration
              </span>
              <button
                onClick={() => handleHelpClick('spin-analyzer')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94A3B8',
                  display: 'flex',
                }}
                title="Help: Spin Analyzer"
              >
                <HelpCircle size={15} />
              </button>
            </div>

            {/* Analyzer 1 Angle Controls */}
            <div className="t5-control-section">
              <div className="t5-control-row">
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Compass size={14} style={{ color: '#2563EB' }} />
                  {level.analyzerCount === 1 ? 'Analyzer Orientation' : 'Analyzer 1 (Preparation)'}
                </span>
                <span className="t5-angle-chip">
                  {getCardinalLabel(analyzer1Angle)}
                </span>
              </div>

              {level.analyzer1Adjustable ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="t5-step-group">
                    <button
                      onClick={() => stepAngle('a1', -15)}
                      className="t5-btn-step"
                    >
                      −15°
                    </button>
                    <button
                      onClick={() => stepAngle('a1', -5)}
                      className="t5-btn-step"
                    >
                      −5°
                    </button>
                    <button
                      onClick={() => stepAngle('a1', 5)}
                      className="t5-btn-step"
                    >
                      +5°
                    </button>
                    <button
                      onClick={() => stepAngle('a1', 15)}
                      className="t5-btn-step"
                    >
                      +15°
                    </button>
                  </div>
                  {/* Preset Quick Alignments */}
                  <div className="t5-presets-group">
                    <button
                      onClick={() => handleRotateA1(0)}
                      className="t5-btn-preset"
                    >
                      +Z (0°)
                    </button>
                    <button
                      onClick={() => handleRotateA1(90)}
                      className="t5-btn-preset"
                    >
                      +X (90°)
                    </button>
                    <button
                      onClick={() => handleRotateA1(180)}
                      className="t5-btn-preset"
                    >
                      -Z (180°)
                    </button>
                    <button
                      onClick={() => handleRotateA1(270)}
                      className="t5-btn-preset"
                    >
                      -X (270°)
                    </button>
                  </div>
                </div>
              ) : (
                <span style={{ fontSize: '12px', color: '#94A3B8', fontStyle: 'italic' }}>
                  Fixed orientation for this mission.
                </span>
              )}
            </div>

            {/* Sequential Measurements: Branch Selection & Analyzer 2 */}
            {level.analyzerCount === 2 && (
              <div className="t5-control-section-alt">
                <div className="t5-control-row">
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#312E81', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={14} style={{ color: '#4F46E5' }} />
                    Branch Routing
                  </span>
                  <button
                    onClick={() => handleHelpClick('branch')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#818CF8' }}
                    title="Help: Selective Branch"
                  >
                    <HelpCircle size={14} />
                  </button>
                </div>

                <div className="t5-branch-group">
                  <button
                    onClick={() => handleSelectBranch('+')}
                    className={`t5-branch-btn ${
                      selectedBranch === '+' ? 't5-branch-btn-active-plus' : ''
                    }`}
                  >
                    + Branch (r' = +n₁)
                  </button>
                  <button
                    onClick={() => handleSelectBranch('-')}
                    className={`t5-branch-btn ${
                      selectedBranch === '-' ? 't5-branch-btn-active-minus' : ''
                    }`}
                  >
                    − Branch (r' = −n₁)
                  </button>
                </div>

                {/* Analyzer 2 Orientation */}
                <div className="t5-control-row" style={{ paddingTop: '8px', borderTop: '1px solid #C7D2FE' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                    Analyzer 2 (Measurement)
                  </span>
                  <span className="t5-angle-chip-indigo">
                    {getCardinalLabel(analyzer2Angle)}
                  </span>
                </div>

                {level.analyzer2Adjustable && (
                  <div className="t5-step-group">
                    <button
                      onClick={() => stepAngle('a2', -15)}
                      className="t5-btn-step"
                    >
                      −15°
                    </button>
                    <button
                      onClick={() => stepAngle('a2', -5)}
                      className="t5-btn-step"
                    >
                      −5°
                    </button>
                    <button
                      onClick={() => stepAngle('a2', 5)}
                      className="t5-btn-step"
                    >
                      +5°
                    </button>
                    <button
                      onClick={() => stepAngle('a2', 15)}
                      className="t5-btn-step"
                    >
                      +15°
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Particle Experiment Shots Selector */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                Particle Beam Count:
              </span>
              <div className="t5-shots-group">
                {[10, 50, 100].map(shots => (
                  <button
                    key={shots}
                    onClick={() => {
                      soundEngine.playClick();
                      setExperimentShots(shots);
                    }}
                    className={`t5-shots-btn ${
                      experimentShots === shots ? 't5-shots-btn-active' : ''
                    }`}
                  >
                    {shots}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Action Button: Run Experiment */}
            <button
              onClick={handleRunExperiment}
              disabled={isSimulating}
              className={`t5-run-btn ${
                isTargetSatisfied ? 't5-run-btn-ready' : 't5-run-btn-primary'
              }`}
            >
              <Play size={16} />
              <span>
                {isSimulating
                  ? 'Measuring Particle Beam...'
                  : `Run Experiment (${experimentShots} particles)`}
              </span>
            </button>
          </div>

          {/* Results: Theory vs Observed Readout Card */}
          <div className="t5-card">
            <div className="t5-card-header">
              <span className="t5-card-title">
                <Activity size={14} /> Experimental Results
              </span>
              <button
                onClick={() => handleHelpClick('detector')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94A3B8',
                  display: 'flex',
                }}
                title="Help: Detectors"
              >
                <HelpCircle size={15} />
              </button>
            </div>

            {/* Theory vs Observed Comparison */}
            <div className="t5-results-grid">
              <div className="t5-readout-card t5-readout-card-theory">
                <span className="t5-readout-title" style={{ color: '#1E40AF' }}>
                  THEORETICAL PROBABILITY
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: '#334155' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>+ Outcome:</span>
                    <strong style={{ color: '#047857', fontFamily: 'monospace' }}>
                      {(activeProbPlus * 100).toFixed(1)}%
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>− Outcome:</span>
                    <strong style={{ color: '#BE123C', fontFamily: 'monospace' }}>
                      {(activeProbMinus * 100).toFixed(1)}%
                    </strong>
                  </div>
                </div>
              </div>

              <div className="t5-readout-card t5-readout-card-observed">
                <span className="t5-readout-title" style={{ color: '#0F172A' }}>
                  OBSERVED RUN ({experimentSample ? experimentSample.shots : 0})
                </span>
                {experimentSample ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: '#334155' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>+ Count:</span>
                      <strong style={{ color: '#047857', fontFamily: 'monospace' }}>
                        {experimentSample.countPlus} (
                        {(experimentSample.observedFreqPlus * 100).toFixed(0)}%)
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>− Count:</span>
                      <strong style={{ color: '#BE123C', fontFamily: 'monospace' }}>
                        {experimentSample.countMinus} (
                        {(experimentSample.observedFreqMinus * 100).toFixed(0)}%)
                      </strong>
                    </div>
                  </div>
                ) : (
                  <span style={{ color: '#94A3B8', fontStyle: 'italic', fontSize: '11px' }}>
                    Click "Run Experiment" to observe particle deflection.
                  </span>
                )}
              </div>
            </div>

            {/* Educational takeaway note */}
            <div className="t5-note-callout">
              <Info size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#D97706' }} />
              <span>
                <strong>Educational Note:</strong> Individual runs fluctuate statistically, but
                repeated measurements approach the theoretical probability P(+) = cos²(θ/2).
              </span>
            </div>

            {/* Live Evaluator Feedback */}
            {hasRunExperiment && (
              <div
                className={`t5-feedback-banner ${
                  evaluation.status === 'success'
                    ? 't5-feedback-success'
                    : evaluation.status === 'incorrect'
                    ? 't5-feedback-incorrect'
                    : 't5-feedback-default'
                }`}
              >
                {evaluation.status === 'success' ? (
                  <CheckCircle2 size={18} style={{ color: '#059669', flexShrink: 0, marginTop: '2px' }} />
                ) : (
                  <AlertCircle size={18} style={{ color: '#E11D48', flexShrink: 0, marginTop: '2px' }} />
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span>{evaluation.feedback}</span>
                  {evaluation.status === 'success' && (
                    <button
                      onClick={onNextLevel}
                      className="btn btn-sm btn-success"
                      style={{ alignSelf: 'flex-start', marginTop: '4px' }}
                    >
                      <span>Next Level</span>
                      <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Educational Walkthrough Modal (? How to Play) */}
      {showHowToPlayModal && (
        <div className="t5-modal-backdrop" onClick={() => setShowHowToPlayModal(false)}>
          <div className="t5-modal-dialog" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Compass size={18} style={{ color: '#2563EB' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  How to Play: Spin Splitter
                </h3>
              </div>
              <button
                onClick={() => setShowHowToPlayModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: '16px', fontWeight: 'bold' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>
              <div style={{ padding: '10px 12px', backgroundColor: '#EFF6FF', borderRadius: '10px', border: '1px solid #BFDBFE' }}>
                <strong style={{ color: '#1E40AF', display: 'block', marginBottom: '2px' }}>
                  1. Quantum Spin & Measurement Axis
                </strong>
                A spin-1/2 particle entering a Stern-Gerlach analyzer has state vector{' '}
                <strong>r</strong>. The analyzer measures spin along chosen direction{' '}
                <strong>n</strong>.
              </div>

              <div style={{ padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <strong style={{ color: '#0F172A', display: 'block', marginBottom: '2px' }}>
                  2. Two Measurement Outcomes
                </strong>
                Spin measurement always produces either <strong>+</strong> or{' '}
                <strong>−</strong> with probabilities P(+) = cos²(θ/2) and P(−) = sin²(θ/2),
                where θ is the angle between <strong>r</strong> and <strong>n</strong>.
              </div>

              <div style={{ padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <strong style={{ color: '#0F172A', display: 'block', marginBottom: '2px' }}>
                  3. Rotate by Needle Drag or Preset Buttons
                </strong>
                Click and drag the analyzer needle directly on the canvas (or use the angle buttons) to rotate the measurement
                axis and watch probabilities redistribute in real time!
              </div>

              <div style={{ padding: '10px 12px', backgroundColor: '#EEF2FF', borderRadius: '10px', border: '1px solid #C7D2FE' }}>
                <strong style={{ color: '#3730A3', display: 'block', marginBottom: '2px' }}>
                  4. State Collapse in Sequential Analyzers
                </strong>
                After measurement, the particle is projected onto the measured outcome (r' = ±n).
                Analyzer 2 therefore acts on this newly prepared state!
              </div>
            </div>

            <button
              onClick={() => setShowHowToPlayModal(false)}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '6px', fontWeight: 700 }}
            >
              Got it, let's play!
            </button>
          </div>
        </div>
      )}

      {/* Component Help Educational Popup */}
      {activeHelpComponent && COMPONENT_HELP[activeHelpComponent] && (
        <EducationalPopup
          type="component-help"
          componentHelp={COMPONENT_HELP[activeHelpComponent]}
          isOpen={Boolean(activeHelpComponent)}
          onClose={() => setActiveHelpComponent(null)}
        />
      )}
    </div>
  );
};
