import React from 'react';
import { PlacedGate, GateType } from '../../../core/engines/gateSimulationEngine';
import { Trash2 } from 'lucide-react';

interface CircuitCanvasProps {
  numQubits: number;
  initialBasis: string;
  maxSteps: number;
  circuit: PlacedGate[];
  onPlaceGate: (wire: number, step: number, gateType: GateType) => void;
  onRemoveGate: (gateId: string) => void;
  selectedGateType: GateType | null;
}

export const CircuitCanvas: React.FC<CircuitCanvasProps> = ({
  numQubits,
  initialBasis,
  maxSteps,
  circuit,
  onPlaceGate,
  onRemoveGate,
  selectedGateType,
}) => {
  const wireHeight = 64;
  const slotWidth = 72;
  const labelWidth = 60;
  const totalWidth = labelWidth + maxSteps * slotWidth + 40;
  const totalHeight = numQubits * wireHeight + 30;

  // Find gate at given wire and step
  const getGateAt = (wire: number, step: number) => {
    return circuit.find(g => g.targetWire === wire && g.step === step);
  };

  // Check if a gate passes through or controls this wire at this step
  const getControlledConnectionAt = (wire: number, step: number) => {
    return circuit.find(
      g =>
        g.step === step &&
        g.controlWires &&
        (g.controlWires.includes(wire) || g.targetWire === wire)
    );
  };

  return (
    <div
      style={{
        width: '100%',
        overflowX: 'auto',
        padding: '16px',
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        userSelect: 'none',
      }}
      data-ui-zone="circuit-canvas"
    >
      <svg
        width={totalWidth}
        height={totalHeight}
        style={{ display: 'block', margin: '0 auto' }}
      >
        {/* Step column headers */}
        {Array.from({ length: maxSteps }).map((_, stepIdx) => {
          const x = labelWidth + stepIdx * slotWidth + slotWidth / 2;
          return (
            <text
              key={stepIdx}
              x={x}
              y={16}
              textAnchor="middle"
              fontSize={11}
              fontWeight={600}
              fill="#8C95A0"
              fontFamily="var(--font-mono)"
            >
              t{stepIdx}
            </text>
          );
        })}

        {/* Wire lines and labels */}
        {Array.from({ length: numQubits }).map((_, wireIdx) => {
          const y = 35 + wireIdx * wireHeight + wireHeight / 2;
          const initialBit = initialBasis[wireIdx] || '0';

          return (
            <g key={wireIdx}>
              {/* Qubit Wire Label */}
              <text
                x={12}
                y={y + 4}
                fontSize={13}
                fontWeight={600}
                fill="#1C1E21"
                fontFamily="var(--font-mono)"
              >
                q{wireIdx}: |{initialBit}⟩
              </text>

              {/* Horizontal Wire Line */}
              <line
                x1={labelWidth}
                y1={y}
                x2={totalWidth - 20}
                y2={y}
                stroke="#D5CEBF"
                strokeWidth={1.8}
              />

              {/* Wire slots */}
              {Array.from({ length: maxSteps }).map((_, stepIdx) => {
                const x = labelWidth + stepIdx * slotWidth;
                const gate = getGateAt(wireIdx, stepIdx);

                return (
                  <rect
                    key={stepIdx}
                    x={x + 6}
                    y={y - 20}
                    width={slotWidth - 12}
                    height={40}
                    rx={6}
                    fill={gate ? 'transparent' : 'rgba(244, 241, 234, 0.4)'}
                    stroke={selectedGateType && !gate ? '#3B82F6' : '#E6E1D8'}
                    strokeDasharray={gate ? 'none' : '3 3'}
                    strokeWidth={1}
                    style={{ cursor: selectedGateType ? 'pointer' : 'default' }}
                    onClick={() => {
                      if (selectedGateType && !gate) {
                        onPlaceGate(wireIdx, stepIdx, selectedGateType);
                      }
                    }}
                  />
                );
              })}
            </g>
          );
        })}

        {/* Draw vertical control lines for CNOT and Toffoli */}
        {circuit.map(gate => {
          if (!gate.controlWires || gate.controlWires.length === 0) return null;
          const allWires = [...gate.controlWires, gate.targetWire];
          const minWire = Math.min(...allWires);
          const maxWire = Math.max(...allWires);
          const x = labelWidth + gate.step * slotWidth + slotWidth / 2;
          const y1 = 35 + minWire * wireHeight + wireHeight / 2;
          const y2 = 35 + maxWire * wireHeight + wireHeight / 2;

          return (
            <g key={`conn-${gate.id}`}>
              <line
                x1={x}
                y1={y1}
                x2={x}
                y2={y2}
                stroke="#3B82F6"
                strokeWidth={2}
              />
              {/* Control node dots */}
              {gate.controlWires.map(cw => {
                const cy = 35 + cw * wireHeight + wireHeight / 2;
                return (
                  <circle
                    key={cw}
                    cx={x}
                    cy={cy}
                    r={5}
                    fill="#3B82F6"
                    stroke="#FFFFFF"
                    strokeWidth={1.5}
                  />
                );
              })}
            </g>
          );
        })}

        {/* Draw Gate Boxes */}
        {circuit.map(gate => {
          const x = labelWidth + gate.step * slotWidth + slotWidth / 2;
          const y = 35 + gate.targetWire * wireHeight + wireHeight / 2;

          if (gate.type === 'CNOT' || gate.type === 'Toffoli') {
            // Target circle with plus
            return (
              <g
                key={gate.id}
                style={{ cursor: 'pointer' }}
                onClick={() => onRemoveGate(gate.id)}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={14}
                  fill="#FFFFFF"
                  stroke="#3B82F6"
                  strokeWidth={2}
                />
                <line x1={x - 14} y1={y} x2={x + 14} y2={y} stroke="#3B82F6" strokeWidth={2} />
                <line x1={x} y1={y - 14} x2={x} y2={y + 14} stroke="#3B82F6" strokeWidth={2} />
              </g>
            );
          }

          // Single qubit gate box
          const boxW = 38;
          const boxH = 34;

          return (
            <g
              key={gate.id}
              style={{ cursor: 'pointer' }}
              onClick={() => onRemoveGate(gate.id)}
            >
              <rect
                x={x - boxW / 2}
                y={y - boxH / 2}
                width={boxW}
                height={boxH}
                rx={6}
                fill="#FFFFFF"
                stroke="#1D5E99"
                strokeWidth={1.8}
                filter="drop-shadow(0 2px 4px rgba(29, 94, 153, 0.12))"
              />
              <text
                x={x}
                y={y + 5}
                textAnchor="middle"
                fontSize={15}
                fontWeight={700}
                fill="#1D5E99"
                fontFamily="var(--font-mono)"
              >
                {gate.type}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
