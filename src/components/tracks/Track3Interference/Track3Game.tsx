import React, { useState, useEffect, useMemo } from 'react';
import { WaveLevelConfig } from '../../../core/levels/track3Levels';
import {
  WavePath,
  calculateInterference,
  evaluateInterferenceLevel,
  sampleInterferenceShots,
} from '../../../core/engines/interferenceEngine';
import { EvaluationResult } from '../../../core/types';
import { WaveCanvas } from './WaveCanvas';
import { ResultPanel } from '../../common/ResultPanel';
import { EducationalPopup } from '../../common/EducationalPopup';
import { COMPONENT_HELP } from '../../../core/educationData';
import { Activity, Lock, RefreshCw, BarChart2, HelpCircle } from 'lucide-react';
import { soundEngine } from '../../../core/audio/soundEngine';

interface Track3GameProps {
  level: WaveLevelConfig;
  evaluation: EvaluationResult;
  onEvaluate: (result: EvaluationResult) => void;
  onRecordInteraction: () => void;
  onNextLevel: () => void;
}

export const Track3Game: React.FC<Track3GameProps> = ({
  level,
  evaluation,
  onEvaluate,
  onRecordInteraction,
  onNextLevel,
}) => {
  const [paths, setPaths] = useState<WavePath[]>(() =>
    level.interferenceLevel.paths.map(p => ({ ...p }))
  );
  const [hasInteracted, setHasInteracted] = useState(false);
  const [experimentShots, setExperimentShots] = useState<{ countA: number; countB: number } | null>(null);

  useEffect(() => {
    setPaths(level.interferenceLevel.paths.map(p => ({ ...p })));
    setHasInteracted(false);
    setExperimentShots(null);
  }, [level.id]);

  // Handle phase shift on path
  const handlePhaseChange = (index: number, newPhase: number) => {
    onRecordInteraction();
    setHasInteracted(true);
    setPaths(prev => {
      const next = [...prev];
      next[index] = { ...next[index], phase: newPhase };
      return next;
    });
  };

  // Live interference calculation
  const interferenceResult = useMemo(() => {
    return calculateInterference(paths);
  }, [paths]);

  // Run experimental shot sampling
  const handleRunExperiment = () => {
    soundEngine.playStateTransition();
    onRecordInteraction();
    const sampled = sampleInterferenceShots(interferenceResult.probA, 100);
    setExperimentShots(sampled);
  };

  // Run evaluation
  const handleVerify = () => {
    const res = evaluateInterferenceLevel({
      currentPaths: paths,
      initialPaths: level.interferenceLevel.paths,
      targetDetectorA: level.interferenceLevel.targetDetectorA,
      targetDetectorB: level.interferenceLevel.targetDetectorB,
      tolerance: level.interferenceLevel.tolerance,
      hasInteracted,
    });
    if (res.status === 'success') {
      soundEngine.playSuccess();
    } else if (res.status === 'incorrect') {
      soundEngine.playError();
    } else {
      soundEngine.playClick();
    }
    onEvaluate(res);
  };

  const probAPercent = (interferenceResult.probA * 100).toFixed(1);
  const probBPercent = (interferenceResult.probB * 100).toFixed(1);
  const targetA = level.interferenceLevel.targetDetectorA;
  const targetB = level.interferenceLevel.targetDetectorB;
  const targetAPercent = (targetA * 100).toFixed(0);
  const targetBPercent = (targetB * 100).toFixed(0);
  const tolPercent = (level.interferenceLevel.tolerance * 100).toFixed(0);
  const errorPercent = (Math.abs(interferenceResult.probA - targetA) * 100).toFixed(1);
  const isTargetMatched = Math.abs(interferenceResult.probA - targetA) <= level.interferenceLevel.tolerance;

  const [activeHelpComponent, setActiveHelpComponent] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* ============================================================== */}
      {/* CRITICAL FIX: PROMINENT TARGET DETECTOR OUTPUT COMPARISON CARD */}
      {/* ============================================================== */}
      <div
        data-ui-zone="target-comparison-panel"
        style={{
          padding: '16px 20px',
          backgroundColor: '#FFFFFF',
          border: `2px solid ${isTargetMatched ? '#15803D' : 'var(--border-medium)'}`,
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-primary)' }}>
              🎯 TARGET DETECTOR OUTPUT vs CURRENT RESULT
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Required: A = {targetAPercent}% ± {tolPercent}%, B = {targetBPercent}% ± {tolPercent}%
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              className={`badge ${isTargetMatched ? 'badge-emerald' : 'badge-amber'}`}
              style={{ fontWeight: 800, fontSize: '12px', padding: '4px 10px' }}
            >
              {isTargetMatched ? '✓ TARGET MATCHED' : 'STATUS: KEEP ADJUSTING'}
            </span>
            <span className="mono" style={{ fontSize: '13px', fontWeight: 700, color: isTargetMatched ? '#15803D' : '#D97706' }}>
              ERROR: {errorPercent} percentage points
            </span>
          </div>
        </div>

        {/* Side-by-Side Target vs Current Bar Comparison */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {/* TARGET CARD */}
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              TARGET OBJECTIVE
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
                <span style={{ fontWeight: 600, color: '#15803D' }}>Detector A (Target)</span>
                <span className="mono" style={{ fontWeight: 700 }}>{targetAPercent}%</span>
              </div>
              <div style={{ width: '100%', height: '12px', backgroundColor: 'var(--border-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ width: `${targetAPercent}%`, height: '100%', backgroundColor: '#15803D' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
                <span style={{ fontWeight: 600, color: '#B45309' }}>Detector B (Target)</span>
                <span className="mono" style={{ fontWeight: 700 }}>{targetBPercent}%</span>
              </div>
              <div style={{ width: '100%', height: '12px', backgroundColor: 'var(--border-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ width: `${targetBPercent}%`, height: '100%', backgroundColor: '#B45309' }} />
              </div>
            </div>
          </div>

          {/* CURRENT RESULT (Real-time live) */}
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: isTargetMatched ? '#ECFDF5' : 'var(--bg-secondary)',
              border: `1px solid ${isTargetMatched ? '#10B981' : 'var(--border-medium)'}`,
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: isTargetMatched ? '#15803D' : 'var(--text-secondary)', textTransform: 'uppercase' }}>
                CURRENT LIVE RESULT
              </span>
              <span className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Δφ = {interferenceResult.deltaPhaseDeg.toFixed(0)}°
              </span>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
                <span style={{ fontWeight: 600, color: '#15803D' }}>Detector A (Live)</span>
                <span className="mono" style={{ fontWeight: 700 }}>{probAPercent}%</span>
              </div>
              <div style={{ width: '100%', height: '12px', backgroundColor: 'var(--border-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ width: `${probAPercent}%`, height: '100%', backgroundColor: '#15803D', transition: 'width 0.1s ease' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
                <span style={{ fontWeight: 600, color: '#B45309' }}>Detector B (Live)</span>
                <span className="mono" style={{ fontWeight: 700 }}>{probBPercent}%</span>
              </div>
              <div style={{ width: '100%', height: '12px', backgroundColor: 'var(--border-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ width: `${probBPercent}%`, height: '100%', backgroundColor: '#B45309', transition: 'width 0.1s ease' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="game-layout-grid">
        {/* Game Area: Real-Time Wave Superposition Canvas */}
        <div className="game-area-container" data-ui-zone="wave-area">
          <div className="game-area-header">
            <span style={{ fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={16} style={{ color: 'var(--accent-teal)' }} />
              Coherent Optical Interferometer ({paths.length} Path{paths.length > 1 ? 's' : ''})
              <button
                onClick={() => setActiveHelpComponent('beam-splitter')}
                title="Learn about Beam Splitters (Free)"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <HelpCircle size={14} />
              </button>
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-teal">Live Wave Superposition</span>
              <button
                className="btn btn-sm"
                onClick={handleRunExperiment}
                title="Sample 100 experimental photon counts from actual distribution"
              >
                <BarChart2 size={13} />
                <span>Run 100 Shots</span>
              </button>
            </div>
          </div>

          <div className="game-area-canvas-wrapper" style={{ padding: '16px' }}>
            <WaveCanvas paths={paths} result={interferenceResult} />
          </div>
        </div>

        {/* Control Panel: Phase Dials & Target Readout */}
        <div className="control-panel-container" data-ui-zone="phase-control-panel">
          <div className="control-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Phase Controls & Dials</span>
            <button
              onClick={() => setActiveHelpComponent('phase-dial')}
              title="Learn about Phase Dials (Free)"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600 }}
            >
              <HelpCircle size={13} />
              <span>? Help</span>
            </button>
          </div>

          {/* Individual Path Phase Sliders / Dials */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {paths.map((p, idx) => {
              const deg = Math.round((p.phase * 180) / Math.PI);
              return (
                <div
                  key={p.id}
                  style={{
                    padding: '12px',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '13px' }}>{p.name}</span>
                    {p.isFixed ? (
                      <span className="badge" style={{ fontSize: '11px', color: '#6E7781' }}>
                        <Lock size={11} /> FIXED
                      </span>
                    ) : (
                      <span className="badge badge-teal" style={{ fontSize: '11px' }}>
                        <RefreshCw size={11} /> MOVABLE
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="range"
                      min={0}
                      max={360}
                      step={1}
                      value={deg}
                      disabled={p.isFixed}
                      onChange={e => {
                        const newRad = (Number(e.target.value) * Math.PI) / 180;
                        handlePhaseChange(idx, newRad);
                      }}
                      style={{
                        flex: 1,
                        cursor: p.isFixed ? 'not-allowed' : 'pointer',
                        accentColor: 'var(--accent-teal)',
                      }}
                    />
                    <span className="mono" style={{ fontSize: '13px', fontWeight: 600, minWidth: '45px', textAlign: 'right' }}>
                      {deg}°
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detector Probabilities Visualization */}
          <div
            style={{
              padding: '14px',
              backgroundColor: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, color: '#15803D' }}>Detector A Output (Theory)</span>
                <span className="mono" style={{ fontWeight: 700 }}>{probAPercent}%</span>
              </div>
              <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--border-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ width: `${probAPercent}%`, height: '100%', backgroundColor: '#15803D', transition: 'width 0.1s ease' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, color: '#B45309' }}>Detector B Output (Theory)</span>
                <span className="mono" style={{ fontWeight: 700 }}>{probBPercent}%</span>
              </div>
              <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--border-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ width: `${probBPercent}%`, height: '100%', backgroundColor: '#B45309', transition: 'width 0.1s ease' }} />
              </div>
            </div>

            {experimentShots && (
              <div
                style={{
                  padding: '8px 10px',
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-medium)',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-secondary)',
                }}
              >
                <strong>100 Shot Experiment:</strong> Det A = {experimentShots.countA} counts | Det B = {experimentShots.countB} counts
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Result Panel */}
      <ResultPanel
        evaluation={evaluation}
        metrics={[
          {
            label: 'Detector A Probability',
            value: `${probAPercent}%`,
            subtext: `Target: ${targetAPercent}% (±${(level.interferenceLevel.tolerance * 100).toFixed(0)}%)`,
            highlight: Math.abs(interferenceResult.probA - level.interferenceLevel.targetDetectorA) <= level.interferenceLevel.tolerance,
          },
          {
            label: 'Relative Phase Δφ',
            value: `${interferenceResult.deltaPhaseDeg.toFixed(0)}°`,
            subtext: interferenceResult.isConstructiveA ? 'Constructive Peak' : 'Partial / Destructive',
          },
          {
            label: 'Current Error',
            value: `${errorPercent}%`,
            subtext: `Tolerance: ±${(level.interferenceLevel.tolerance * 100).toFixed(1)}%`,
          },
        ]}
        onSubmitOrRun={handleVerify}
        runButtonLabel="Verify Interference"
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
