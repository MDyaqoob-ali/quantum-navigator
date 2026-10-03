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
    <div className="w-full flex flex-col gap-5 select-none" data-ui-zone="track5-game-container">
      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (7 cols): Target Card + Stern-Gerlach Interactive Canvas */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Target & Live Output Panel */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  TARGET vs LIVE APPARATUS
                </span>
                {level.allowedExperiments && (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    Runs: {experimentsUsed} / {level.allowedExperiments}
                  </span>
                )}
                {timeRemaining !== null && (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                      timeRemaining <= 15
                        ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    {timeRemaining}s
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    evaluation.status === 'success'
                      ? 'bg-emerald-100 text-emerald-800'
                      : isTargetSatisfied
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {evaluation.status === 'success'
                    ? '✓ TARGET REACHED'
                    : isTargetSatisfied
                    ? 'RUN EXPERIMENT TO VERIFY'
                    : 'ADJUST ANALYZER'}
                </span>
                <button
                  onClick={() => setShowHowToPlayModal(true)}
                  className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                  title="How to Play: Spin Splitter"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Target vs Current Comparison Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
              {/* TARGET BARS */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Target Distribution
                </span>
                <div className="flex flex-col gap-1.5 text-xs font-medium">
                  <div className="flex justify-between items-center text-emerald-800 font-semibold">
                    <span>Detector +</span>
                    <span>
                      {(level.targetProbPlus * 100).toFixed(0)}% ±{' '}
                      {(level.targetTolerance * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${level.targetProbPlus * 100}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-rose-800 font-semibold mt-1">
                    <span>Detector −</span>
                    <span>
                      {((1.0 - level.targetProbPlus) * 100).toFixed(0)}% ±{' '}
                      {(level.targetTolerance * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-rose-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${(1.0 - level.targetProbPlus) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* CURRENT LIVE READOUT */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Current Apparatus
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      isTargetSatisfied ? 'text-emerald-600' : 'text-slate-600'
                    }`}
                  >
                    Error: {(currentError * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 text-xs font-medium">
                  <div className="flex justify-between items-center text-emerald-800 font-semibold">
                    <span>Detector +</span>
                    <span>{(activeProbPlus * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-200"
                      style={{ width: `${activeProbPlus * 100}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-rose-800 font-semibold mt-1">
                    <span>Detector −</span>
                    <span>{(activeProbMinus * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-rose-600 h-full rounded-full transition-all duration-200"
                      style={{ width: `${activeProbMinus * 100}%` }}
                    />
                  </div>
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

        {/* RIGHT COLUMN (5 cols): Apparatus Controls + Experiment Stats & Feedback */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Controls Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                APPARATUS CALIBRATION
              </span>
              <button
                onClick={() => handleHelpClick('spin-analyzer')}
                className="text-slate-400 hover:text-blue-600 transition-colors"
                title="Help: Spin Analyzer"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>

            {/* Analyzer 1 Angle Controls */}
            <div className="flex flex-col gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-blue-600" />
                  {level.analyzerCount === 1 ? 'Analyzer Orientation' : 'Analyzer 1 (Preparation)'}
                </span>
                <span className="px-2.5 py-0.5 bg-blue-100/70 text-blue-800 rounded font-mono font-bold text-xs">
                  {getCardinalLabel(analyzer1Angle)}
                </span>
              </div>

              {level.analyzer1Adjustable ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-1.5">
                    <button
                      onClick={() => stepAngle('a1', -15)}
                      className="flex-1 py-1.5 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 transition-colors"
                    >
                      −15°
                    </button>
                    <button
                      onClick={() => stepAngle('a1', -5)}
                      className="flex-1 py-1.5 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 transition-colors"
                    >
                      −5°
                    </button>
                    <button
                      onClick={() => stepAngle('a1', 5)}
                      className="flex-1 py-1.5 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 transition-colors"
                    >
                      +5°
                    </button>
                    <button
                      onClick={() => stepAngle('a1', 15)}
                      className="flex-1 py-1.5 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 transition-colors"
                    >
                      +15°
                    </button>
                  </div>
                  {/* Preset Quick Alignments */}
                  <div className="flex items-center justify-between gap-1 text-[11px]">
                    <button
                      onClick={() => handleRotateA1(0)}
                      className="flex-1 py-1 bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-700 rounded border border-slate-200 font-mono"
                    >
                      +Z (0°)
                    </button>
                    <button
                      onClick={() => handleRotateA1(90)}
                      className="flex-1 py-1 bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-700 rounded border border-slate-200 font-mono"
                    >
                      +X (90°)
                    </button>
                    <button
                      onClick={() => handleRotateA1(180)}
                      className="flex-1 py-1 bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-700 rounded border border-slate-200 font-mono"
                    >
                      -Z (180°)
                    </button>
                    <button
                      onClick={() => handleRotateA1(270)}
                      className="flex-1 py-1 bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-700 rounded border border-slate-200 font-mono"
                    >
                      -X (270°)
                    </button>
                  </div>
                </div>
              ) : (
                <span className="text-xs text-slate-400 italic">Fixed orientation for this mission.</span>
              )}
            </div>

            {/* Sequential Measurements: Branch Selection & Analyzer 2 */}
            {level.analyzerCount === 2 && (
              <div className="flex flex-col gap-3 bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100/70">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    Branch Routing
                  </span>
                  <button
                    onClick={() => handleHelpClick('branch')}
                    className="text-slate-400 hover:text-indigo-600"
                    title="Help: Selective Branch"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSelectBranch('+')}
                    className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all border ${
                      selectedBranch === '+'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                        : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    + Branch (r' = +n₁)
                  </button>
                  <button
                    onClick={() => handleSelectBranch('-')}
                    className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all border ${
                      selectedBranch === '-'
                        ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                        : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    − Branch (r' = −n₁)
                  </button>
                </div>

                {/* Analyzer 2 Orientation */}
                <div className="flex items-center justify-between pt-2 border-t border-indigo-100">
                  <span className="text-xs font-semibold text-slate-700">
                    Analyzer 2 (Measurement)
                  </span>
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-mono font-bold text-xs">
                    {getCardinalLabel(analyzer2Angle)}
                  </span>
                </div>

                {level.analyzer2Adjustable && (
                  <div className="flex items-center justify-between gap-1.5">
                    <button
                      onClick={() => stepAngle('a2', -15)}
                      className="flex-1 py-1.5 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 transition-colors"
                    >
                      −15°
                    </button>
                    <button
                      onClick={() => stepAngle('a2', -5)}
                      className="flex-1 py-1.5 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 transition-colors"
                    >
                      −5°
                    </button>
                    <button
                      onClick={() => stepAngle('a2', 5)}
                      className="flex-1 py-1.5 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 transition-colors"
                    >
                      +5°
                    </button>
                    <button
                      onClick={() => stepAngle('a2', 15)}
                      className="flex-1 py-1.5 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 transition-colors"
                    >
                      +15°
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Particle Experiment Shots Selector */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-xs font-semibold text-slate-600">
                Particle Beam Count:
              </span>
              <div className="flex items-center gap-1">
                {[10, 50, 100].map(shots => (
                  <button
                    key={shots}
                    onClick={() => {
                      soundEngine.playClick();
                      setExperimentShots(shots);
                    }}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                      experimentShots === shots
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all ${
                isSimulating
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : isTargetSatisfied
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-500/20'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <Play className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>
                {isSimulating
                  ? 'Measuring Particle Beam...'
                  : `Run Experiment (${experimentShots} particles)`}
              </span>
            </button>
          </div>

          {/* Results: Theory vs Observed Readout Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                EXPERIMENTAL MEASUREMENT RESULTS
              </span>
              <button
                onClick={() => handleHelpClick('detector')}
                className="text-slate-400 hover:text-blue-600"
                title="Help: Detectors"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>

            {/* Theory vs Observed Comparison */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                <span className="font-bold text-blue-900 block mb-1">
                  THEORETICAL PROBABILITY
                </span>
                <div className="text-slate-700 flex flex-col gap-0.5">
                  <div className="flex justify-between">
                    <span>+ Outcome:</span>
                    <span className="font-mono font-bold text-emerald-700">
                      {(activeProbPlus * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>− Outcome:</span>
                    <span className="font-mono font-bold text-rose-700">
                      {(activeProbMinus * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-900 block mb-1">
                  OBSERVED RUN ({experimentSample ? experimentSample.shots : 0} particles)
                </span>
                {experimentSample ? (
                  <div className="text-slate-700 flex flex-col gap-0.5">
                    <div className="flex justify-between">
                      <span>+ Count:</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {experimentSample.countPlus} (
                        {(experimentSample.observedFreqPlus * 100).toFixed(0)}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>− Count:</span>
                      <span className="font-mono font-bold text-rose-700">
                        {experimentSample.countMinus} (
                        {(experimentSample.observedFreqMinus * 100).toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-slate-400 italic">
                    Click "Run Experiment" to observe particle counts.
                  </span>
                )}
              </div>
            </div>

            {/* Educational takeaway note */}
            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 text-xs text-amber-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Educational Note:</strong> Individual runs fluctuate statistically, but
                repeated measurements approach the theoretical probability P(+) = cos²(θ/2).
              </span>
            </div>

            {/* Live Evaluator Feedback */}
            {hasRunExperiment && (
              <div
                className={`p-3.5 rounded-xl border text-xs font-medium flex items-start gap-2.5 ${
                  evaluation.status === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                    : evaluation.status === 'incorrect'
                    ? 'bg-rose-50 text-rose-900 border-rose-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                {evaluation.status === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <div className="flex flex-col gap-1">
                  <span>{evaluation.feedback}</span>
                  {evaluation.status === 'success' && (
                    <button
                      onClick={onNextLevel}
                      className="mt-2 self-start inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      <span>Next Level</span>
                      <ChevronRight className="w-3.5 h-3.5" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900">
                  How to Play: Spin Splitter
                </h3>
              </div>
              <button
                onClick={() => setShowHowToPlayModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                <strong className="text-blue-900 block mb-1">
                  1. Quantum Spin & Measurement Axis
                </strong>
                A spin-1/2 particle entering a Stern-Gerlach analyzer has state vector{' '}
                <strong>r</strong>. The analyzer measures spin along chosen direction{' '}
                <strong>n</strong>.
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <strong className="text-slate-900 block mb-1">
                  2. Two Measurement Outcomes
                </strong>
                Spin measurement always produces either <strong>+</strong> or{' '}
                <strong>−</strong> with probabilities P(+) = cos²(θ/2) and P(−) = sin²(θ/2),
                where θ is the angle between <strong>r</strong> and <strong>n</strong>.
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <strong className="text-slate-900 block mb-1">
                  3. Rotate by Mouse Drag
                </strong>
                Click and drag the analyzer needle directly on the canvas to rotate the measurement
                axis and watch probabilities redistribute in real time!
              </div>

              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                <strong className="text-indigo-900 block mb-1">
                  4. State Collapse in Sequential Analyzers
                </strong>
                After measurement, the particle is projected onto the measured outcome (r' = ±n).
                Analyzer 2 therefore acts on this newly prepared state!
              </div>
            </div>

            <button
              onClick={() => setShowHowToPlayModal(false)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors mt-2"
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
