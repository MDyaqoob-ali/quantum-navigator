// Interactive SVG Circuit Visualizer for Quantum Phase Estimation (Track 5)
// Displays estimation register wires, Hadamards, controlled-unitary powers U^(2^k),
// Inverse QFT block, and measurement meters.

import React from 'react';

interface QPECircuitVisualizerProps {
  numPrecisionBits: number; // 2, 3, or 4 bits
  hasRun: boolean;
  dominantBitString?: string;
}

export const QPECircuitVisualizer: React.FC<QPECircuitVisualizerProps> = ({
  numPrecisionBits,
  hasRun,
  dominantBitString = '',
}) => {
  const n = Math.max(2, Math.min(4, numPrecisionBits));
  const totalWires = n + 1; // n estimation qubits + 1 target eigenstate wire

  const wireSpacing = 42;
  const topMargin = 26;
  const leftMargin = 55;
  const svgHeight = topMargin + totalWires * wireSpacing + 10;
  const svgWidth = 620;

  // Key horizontal coordinates
  const hGateX = leftMargin + 45;
  const cuStartX = leftMargin + 115;
  const cuSpacing = 48;
  const cuEndX = cuStartX + n * cuSpacing;
  const iqftX = cuEndX + 45;
  const iqftWidth = 70;
  const measureX = iqftX + iqftWidth + 45;
  const targetWireY = topMargin + n * wireSpacing;

  return (
    <div
      style={{
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg, 12px)',
        border: '1px solid var(--border-subtle, #E2E8F0)',
        padding: '14px 16px',
        overflowX: 'auto',
      }}
      data-ui-zone="qpe-circuit"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>
            Quantum Phase Estimation Circuit Architecture
          </span>
          <span
            style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '999px',
              backgroundColor: '#FEF3C7',
              color: '#92400E',
              fontWeight: 500,
            }}
          >
            {n} Estimation Qubits ({1 << n} Phase Bins)
          </span>
        </div>
        <span style={{ fontSize: '11px', color: '#64748B' }}>
          U|ψ⟩ = e^(2πiφ)|ψ⟩
        </span>
      </div>

      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{ width: '100%', height: `${svgHeight}px`, display: 'block' }}
      >
        <defs>
          <linearGradient id="iqftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF3C7" />
            <stop offset="100%" stopColor="#FDE68A" />
          </linearGradient>
        </defs>

        {/* 1. Wire lines */}
        {Array.from({ length: totalWires }).map((_, idx) => {
          const y = topMargin + idx * wireSpacing;
          const isTarget = idx === n;
          return (
            <g key={`wire-${idx}`}>
              {/* Qubit label */}
              <text
                x={leftMargin - 12}
                y={y + 4}
                fontFamily="ui-monospace, monospace"
                fontSize="11"
                fontWeight="600"
                fill={isTarget ? '#0284C7' : '#334155'}
                textAnchor="end"
              >
                {isTarget ? '|ψ⟩' : `q${idx} |0⟩`}
              </text>

              {/* Wire line */}
              <line
                x1={leftMargin}
                y1={y}
                x2={svgWidth - 20}
                y2={y}
                stroke={isTarget ? '#94A3B8' : '#CBD5E1'}
                strokeWidth={isTarget ? 2 : 1.5}
                strokeDasharray={isTarget ? '4 3' : undefined}
              />
            </g>
          );
        })}

        {/* 2. Hadamard Gates on estimation qubits */}
        {Array.from({ length: n }).map((_, idx) => {
          const y = topMargin + idx * wireSpacing;
          return (
            <g key={`h-gate-${idx}`}>
              <rect
                x={hGateX - 14}
                y={y - 14}
                width="28"
                height="28"
                rx="4"
                fill="#EFF6FF"
                stroke="#3B82F6"
                strokeWidth="1.5"
              />
              <text
                x={hGateX}
                y={y + 4}
                fontFamily="ui-monospace, monospace"
                fontSize="12"
                fontWeight="bold"
                fill="#1D4ED8"
                textAnchor="middle"
              >
                H
              </text>
            </g>
          );
        })}

        {/* 3. Controlled Unitary Powers U^(2^k) */}
        {Array.from({ length: n }).map((_, idx) => {
          const controlY = topMargin + idx * wireSpacing;
          const cuX = cuStartX + idx * cuSpacing;
          const power = Math.pow(2, idx);
          const label = power === 1 ? 'U' : `U^${power}`;

          return (
            <g key={`cu-${idx}`}>
              {/* Control vertical connection line to target */}
              <line
                x1={cuX}
                y1={controlY}
                x2={cuX}
                y2={targetWireY}
                stroke="#D97706"
                strokeWidth="1.5"
              />
              {/* Control dot */}
              <circle
                cx={cuX}
                cy={controlY}
                r="4.5"
                fill="#D97706"
              />
              {/* Controlled Unitary box on target wire */}
              <rect
                x={cuX - 18}
                y={targetWireY - 14}
                width="36"
                height="28"
                rx="4"
                fill="#FFFBEB"
                stroke="#D97706"
                strokeWidth="1.5"
              />
              <text
                x={cuX}
                y={targetWireY + 4}
                fontFamily="ui-monospace, monospace"
                fontSize="10"
                fontWeight="bold"
                fill="#B45309"
                textAnchor="middle"
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* 4. Inverse QFT (QFT†) Block spanning all n estimation wires */}
        <rect
          x={iqftX}
          y={topMargin - 16}
          width={iqftWidth}
          height={n * wireSpacing - 8}
          rx="6"
          fill="url(#iqftGrad)"
          stroke="#F59E0B"
          strokeWidth="1.5"
        />
        <text
          x={iqftX + iqftWidth / 2}
          y={topMargin + (n * wireSpacing) / 2 - 12}
          fontFamily="ui-monospace, monospace"
          fontSize="13"
          fontWeight="bold"
          fill="#92400E"
          textAnchor="middle"
        >
          QFT†
        </text>
        <text
          x={iqftX + iqftWidth / 2}
          y={topMargin + (n * wireSpacing) / 2 + 6}
          fontFamily="system-ui, sans-serif"
          fontSize="9"
          fill="#B45309"
          textAnchor="middle"
        >
          Inverse QFT
        </text>

        {/* 5. Measurement Meters & Readout bits */}
        {Array.from({ length: n }).map((_, idx) => {
          const y = topMargin + idx * wireSpacing;
          const bitVal = dominantBitString.length > idx ? dominantBitString[idx] : null;

          return (
            <g key={`measure-${idx}`}>
              <rect
                x={measureX - 14}
                y={y - 14}
                width="28"
                height="28"
                rx="4"
                fill="#F8FAFC"
                stroke="#64748B"
                strokeWidth="1.5"
              />
              {/* Meter gauge arc */}
              <path
                d={`M ${measureX - 8} ${y + 6} A 8 8 0 0 1 ${measureX + 8} ${y + 6}`}
                fill="none"
                stroke="#475569"
                strokeWidth="1"
              />
              <line
                x1={measureX}
                y1={y + 6}
                x2={measureX + 4}
                y2={y - 4}
                stroke="#0F172A"
                strokeWidth="1.2"
              />

              {/* Bit output label if run */}
              {hasRun && bitVal !== null && (
                <text
                  x={measureX + 26}
                  y={y + 4}
                  fontFamily="ui-monospace, monospace"
                  fontSize="12"
                  fontWeight="bold"
                  fill="#F59E0B"
                >
                  {bitVal}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
