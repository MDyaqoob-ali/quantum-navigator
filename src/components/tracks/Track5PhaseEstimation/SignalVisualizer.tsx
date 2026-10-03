import React from 'react';
import { QPESimulationResult } from '../../../core/engines/phaseEstimationEngine';

interface SignalVisualizerProps {
  simResult: QPESimulationResult;
  playerEstimate: number;
  sampleCounts?: Record<string, number> | null;
}

export const SignalVisualizer: React.FC<SignalVisualizerProps> = ({
  simResult,
  playerEstimate,
  sampleCounts,
}) => {
  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: '16px',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
      }}
      data-ui-zone="qpe-signal-visualizer"
    >
      {/* Probability Histogram of QPE Measurement Readout */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Inverse-QFT Estimation Register Probabilities (|k⟩ = |b₁b₂b₃⟩)
          </span>
          <span className="badge badge-amber" style={{ fontSize: '11px' }}>
            Peak Bitstring: |{simResult.mostProbableBitString}⟩ (φ ≈ {simResult.mostProbablePhase.toFixed(3)})
          </span>
        </div>

        {/* Histogram Bars */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${simResult.probabilities.length}, 1fr)`,
            gap: '8px',
            alignItems: 'flex-end',
            height: '140px',
            padding: '10px 4px 0 4px',
            borderBottom: '2px solid var(--border-medium)',
          }}
        >
          {simResult.probabilities.map(item => {
            const heightPercent = Math.max(4, Math.round(item.prob * 100));
            const isPeak = item.bitString === simResult.mostProbableBitString;
            const count = sampleCounts ? sampleCounts[item.bitString] || 0 : null;

            return (
              <div
                key={item.bitString}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%',
                  justifyContent: 'flex-end',
                }}
              >
                {/* Probability Value Label */}
                <span className="mono" style={{ fontSize: '10px', color: '#6E7781', marginBottom: '4px' }}>
                  {(item.prob * 100).toFixed(0)}%
                </span>

                {/* Animated bar */}
                <div
                  style={{
                    width: '100%',
                    height: `${heightPercent}%`,
                    backgroundColor: isPeak ? '#F59E0B' : '#E2DDD5',
                    borderRadius: '4px 4px 0 0',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                  }}
                  title={`Bitstring |${item.bitString}⟩: Prob = ${(item.prob * 100).toFixed(1)}%${count !== null ? ` (${count} shots)` : ''}`}
                />
              </div>
            );
          })}
        </div>

        {/* X-Axis Labels: Bitstrings & Decimal Phases */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${simResult.probabilities.length}, 1fr)`,
            gap: '8px',
            marginTop: '6px',
            textAlign: 'center',
          }}
        >
          {simResult.probabilities.map(item => (
            <div key={item.bitString} style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="mono" style={{ fontSize: '11px', fontWeight: 600 }}>
                |{item.bitString}⟩
              </span>
              <span className="mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                {item.decimalPhase.toFixed(3)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Eigenphase Unit Circle Visualization */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '12px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2px' }}>
            Mathematical Form
          </div>
          <div className="mono" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            U|ψ⟩ = e^(2πi·φ)|ψ⟩
          </div>
        </div>

        <div style={{ width: '1px', height: '40px', backgroundColor: 'var(--border-subtle)' }} />

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2px' }}>
            Player Scanner Angle
          </div>
          <div className="mono" style={{ fontSize: '14px', fontWeight: 600, color: '#B45309' }}>
            φ_est = {playerEstimate.toFixed(3)} ({(playerEstimate * 360).toFixed(1)}°)
          </div>
        </div>
      </div>
    </div>
  );
};
