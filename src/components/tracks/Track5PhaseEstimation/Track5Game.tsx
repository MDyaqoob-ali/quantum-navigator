import React, { useState, useEffect, useMemo } from 'react';
import { PhaseLevelConfig } from '../../../core/levels/track5Levels';
import {
  simulateQPE,
  sampleQPEMeasurements,
  evaluatePhaseLevel,
} from '../../../core/engines/phaseEstimationEngine';
import { EvaluationResult } from '../../../core/types';
import { SignalVisualizer } from './SignalVisualizer';
import { ResultPanel } from '../../common/ResultPanel';
import { Radio, BarChart2 } from 'lucide-react';

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
  const [playerEstimate, setPlayerEstimate] = useState<number>(0.1);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [sampleCounts, setSampleCounts] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    setPlayerEstimate(0.1);
    setHasInteracted(false);
    setSampleCounts(null);
  }, [level.id]);

  // Real QPE Simulation on unknown true phase
  const qpeResult = useMemo(() => {
    return simulateQPE(level.phaseLevel.truePhase, level.phaseLevel.estimationQubits);
  }, [level.phaseLevel.truePhase, level.phaseLevel.estimationQubits]);

  // Handle dial adjustment
  const handleEstimateChange = (newEst: number) => {
    onRecordInteraction();
    setHasInteracted(true);
    setPlayerEstimate(Math.max(0, Math.min(1, Number(newEst.toFixed(3)))));
  };

  // Run experimental sampling
  const handleSampleShots = () => {
    onRecordInteraction();
    const counts = sampleQPEMeasurements(qpeResult, 100);
    setSampleCounts(counts);
  };

  // Run evaluation
  const handleVerify = () => {
    const res = evaluatePhaseLevel({
      playerEstimate,
      level: level.phaseLevel,
      hasInteracted,
      hasSampled: !!sampleCounts,
    });
    onEvaluate(res);
  };

  // Calculate live phase delta
  let liveDelta = Math.abs(playerEstimate - level.phaseLevel.truePhase);
  if (liveDelta > 0.5) liveDelta = 1 - liveDelta;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="game-layout-grid">
        {/* Game Area: Quantum Signal & Histogram */}
        <div className="game-area-container" data-ui-zone="qpe-signal-area">
          <div className="game-area-header">
            <span style={{ fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Radio size={16} style={{ color: 'var(--accent-amber)' }} />
              Quantum Signal Spectrum (QPE Register Readout)
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-amber">3-Qubit Hadamard & IQFT</span>
              <button
                className="btn btn-sm"
                onClick={handleSampleShots}
                title="Sample 100 measurement shots from real QPE distribution"
              >
                <BarChart2 size={13} />
                <span>Run 100 Shots</span>
              </button>
            </div>
          </div>

          <div className="game-area-canvas-wrapper" style={{ padding: '20px' }}>
            <SignalVisualizer
              simResult={qpeResult}
              playerEstimate={playerEstimate}
              sampleCounts={sampleCounts}
            />
          </div>
        </div>

        {/* Control Panel: Phase Estimation Scanner Dial */}
        <div className="control-panel-container" data-ui-zone="phase-scanner-panel">
          <div className="control-section-header">Phase Scanner Calibration</div>

          {/* Scanner Dial / Range */}
          <div
            style={{
              padding: '16px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Estimated Phase φ:</span>
              <span
                className="mono badge badge-amber"
                style={{ fontSize: '18px', fontWeight: 700, padding: '4px 12px' }}
              >
                φ = {playerEstimate.toFixed(3)}
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={1}
              step={0.005}
              value={playerEstimate}
              onChange={e => handleEstimateChange(parseFloat(e.target.value))}
              style={{
                width: '100%',
                cursor: 'pointer',
                accentColor: 'var(--accent-amber)',
              }}
            />

            {/* Quick Step Buttons for Standard Binary Fractions */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
              {[
                { label: '0.125 (1/8)', val: 0.125 },
                { label: '0.250 (1/4)', val: 0.250 },
                { label: '0.375 (3/8)', val: 0.375 },
                { label: '0.500 (1/2)', val: 0.500 },
                { label: '0.625 (5/8)', val: 0.625 },
                { label: '0.750 (3/4)', val: 0.750 },
              ].map(item => (
                <button
                  key={item.val}
                  className="btn btn-sm"
                  onClick={() => handleEstimateChange(item.val)}
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    padding: '3px 8px',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Educational Concept Guide Box */}
          <div
            style={{
              padding: '14px',
              backgroundColor: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              fontSize: '12px',
              color: 'var(--text-secondary)',
            }}
          >
            <strong>Decoding Binary Fraction Bitstrings:</strong>
            <div className="mono" style={{ marginTop: '4px', fontSize: '12px', color: 'var(--text-primary)' }}>
              φ = 0.b₁b₂b₃ = b₁·½ + b₂·¼ + b₃·⅛
            </div>
            <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
              Locate the highest probability column in the histogram to identify the underlying eigenphase.
            </div>
          </div>
        </div>
      </div>

      {/* Result Panel */}
      <ResultPanel
        evaluation={evaluation}
        metrics={[
          {
            label: 'Player Estimate φ',
            value: `${playerEstimate.toFixed(3)}`,
            subtext: `Target Tolerance: ±${level.phaseLevel.tolerance}`,
            highlight: liveDelta <= level.phaseLevel.tolerance,
          },
          {
            label: 'Estimated Angle',
            value: `${(playerEstimate * 360).toFixed(1)}°`,
            subtext: `Rad: ${(playerEstimate * 2 * Math.PI).toFixed(2)} rad`,
          },
          {
            label: 'Scanner Error',
            value: `${liveDelta.toFixed(4)}`,
            subtext: `Max Allowed: ${level.phaseLevel.tolerance}`,
          },
        ]}
        onSubmitOrRun={handleVerify}
        runButtonLabel="Verify Phase Estimate"
        onNextLevel={onNextLevel}
        showNextLevelButton={evaluation.status === 'success'}
      />
    </div>
  );
};
