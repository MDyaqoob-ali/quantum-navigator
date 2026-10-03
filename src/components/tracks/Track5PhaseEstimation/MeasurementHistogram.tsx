// Scientific Measurement Distribution Histogram for Quantum Phase Estimation (Track 5)
// Displays theoretical probability % and observed shot counts for each computational basis state |k⟩.
// Interactive: clicking any state bar automatically autofills the corresponding binary fraction decimal.

import React from 'react';
import type { QPESimulationResult } from '../../../core/engines/phaseEstimationEngine';

interface MeasurementHistogramProps {
  simResult: QPESimulationResult;
  sampleCounts: Record<string, number> | null;
  totalShots: number;
  onSelectPhase: (phase: number) => void;
  selectedPhase?: number | null;
}

export const MeasurementHistogram: React.FC<MeasurementHistogramProps> = ({
  simResult,
  sampleCounts,
  totalShots,
  onSelectPhase,
  selectedPhase,
}) => {
  const { probabilities, mostProbableBitString, mostProbablePhase, numQubits } = simResult;

  return (
    <div
      style={{
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg, 12px)',
        border: '1px solid var(--border-subtle, #E2E8F0)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
      data-ui-zone="measurement-distribution"
    >
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>
            Inverse-QFT Estimation Register Probabilities (|k⟩ = |b₁...bₙ⟩)
          </span>
          <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748B' }}>
            Click any column to autofill its decimal phase (k / 2ⁿ) into your phase estimate.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '11px',
              padding: '3px 8px',
              borderRadius: '6px',
              backgroundColor: '#FEF3C7',
              color: '#92400E',
              fontWeight: 600,
              fontFamily: 'ui-monospace, monospace',
            }}
          >
            Peak: |{mostProbableBitString}⟩ (φ ≈ {mostProbablePhase.toFixed(3)})
          </span>
          {sampleCounts && totalShots > 0 && (
            <span
              style={{
                fontSize: '11px',
                padding: '3px 8px',
                borderRadius: '6px',
                backgroundColor: '#EFF6FF',
                color: '#1D4ED8',
                fontWeight: 600,
              }}
            >
              {totalShots} Shots Sampled
            </span>
          )}
        </div>
      </div>

      {/* Histogram Bars */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${probabilities.length}, 1fr)`,
          gap: probabilities.length > 8 ? '4px' : '8px',
          alignItems: 'flex-end',
          height: '140px',
          padding: '12px 4px 0 4px',
          borderBottom: '2px solid #E2E8F0',
        }}
      >
        {probabilities.map(item => {
          const heightPercent = Math.max(5, Math.round(item.prob * 100));
          const isPeak = item.bitString === mostProbableBitString;
          const count = sampleCounts ? sampleCounts[item.bitString] || 0 : null;
          const isMatchingSelected = selectedPhase !== null && selectedPhase !== undefined
            ? Math.abs(item.decimalPhase - selectedPhase) < 0.001
            : false;

          return (
            <div
              key={item.bitString}
              onClick={() => onSelectPhase(item.decimalPhase)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                justifyContent: 'flex-end',
                cursor: 'pointer',
              }}
              title={`Click to select: |${item.bitString}⟩ -> φ = ${item.decimalPhase.toFixed(3)} (${(item.prob * 100).toFixed(1)}%)${count !== null ? ` | ${count} observed shots` : ''}`}
            >
              {/* Theoretical % or Shot count label */}
              <span
                style={{
                  fontSize: probabilities.length > 8 ? '9px' : '10px',
                  fontFamily: 'ui-monospace, monospace',
                  fontWeight: isPeak ? 700 : 500,
                  color: isPeak ? '#B45309' : '#64748B',
                  marginBottom: '4px',
                }}
              >
                {count !== null ? `${count}` : `${(item.prob * 100).toFixed(0)}%`}
              </span>

              {/* Bar element */}
              <div
                style={{
                  width: '100%',
                  height: `${heightPercent}%`,
                  backgroundColor: isMatchingSelected
                    ? '#D97706'
                    : isPeak
                    ? '#F59E0B'
                    : '#E2E8F0',
                  borderRadius: '4px 4px 0 0',
                  transition: 'all 0.2s ease',
                  border: isMatchingSelected ? '2px solid #B45309' : 'none',
                  boxShadow: isPeak ? '0 2px 4px rgba(245, 158, 11, 0.25)' : 'none',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* X-Axis labels: Basis bitstrings and decimal fractions */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${probabilities.length}, 1fr)`,
          gap: probabilities.length > 8 ? '4px' : '8px',
          textAlign: 'center',
        }}
      >
        {probabilities.map(item => {
          const isPeak = item.bitString === mostProbableBitString;
          return (
            <div
              key={`label-${item.bitString}`}
              onClick={() => onSelectPhase(item.decimalPhase)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  fontSize: probabilities.length > 8 ? '9px' : '11px',
                  fontFamily: 'ui-monospace, monospace',
                  fontWeight: isPeak ? 700 : 600,
                  color: isPeak ? '#B45309' : '#1E293B',
                }}
              >
                |{item.bitString}⟩
              </span>
              <span
                style={{
                  fontSize: probabilities.length > 8 ? '8px' : '10px',
                  fontFamily: 'ui-monospace, monospace',
                  color: '#64748B',
                }}
              >
                {item.decimalPhase.toFixed(numQubits > 3 ? 3 : 2)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Comparison Legend: Theory vs Observed */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 12px',
          backgroundColor: '#F8FAFC',
          borderRadius: '8px',
          fontSize: '11px',
          color: '#475569',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', backgroundColor: '#F59E0B', borderRadius: '2px' }} />
            Dominant Peak (Constructive Interference)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', backgroundColor: '#E2E8F0', borderRadius: '2px' }} />
            Neighboring States (Phase Leakage)
          </span>
        </div>
        <span>Formula: φ ≈ k / 2ⁿ</span>
      </div>
    </div>
  );
};
