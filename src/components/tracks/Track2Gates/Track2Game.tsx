import React, { useState, useEffect, useMemo } from 'react';
import { GateLevelConfig } from '../../../core/levels/track2Levels';
import {
  PlacedGate,
  GateType,
  simulateCircuit,
  evaluateGateLevel,
} from '../../../core/engines/gateSimulationEngine';
import { EvaluationResult } from '../../../core/types';
import { CircuitCanvas } from './CircuitCanvas';
import { ResultPanel } from '../../common/ResultPanel';
import { formatComplex } from '../../../core/math/complex';
import { stateFidelity } from '../../../core/math/statevector';
import { Plus, Trash2, Cpu } from 'lucide-react';

interface Track2GameProps {
  level: GateLevelConfig;
  evaluation: EvaluationResult;
  onEvaluate: (result: EvaluationResult) => void;
  onRecordInteraction: () => void;
  onNextLevel: () => void;
}

export const Track2Game: React.FC<Track2GameProps> = ({
  level,
  evaluation,
  onEvaluate,
  onRecordInteraction,
  onNextLevel,
}) => {
  const [circuit, setCircuit] = useState<PlacedGate[]>([]);
  const [selectedGateType, setSelectedGateType] = useState<GateType | null>('X');
  
  // Controlled gate configuration options
  const [cnotControl, setCnotControl] = useState<number>(0);
  const [toffoliControls, setToffoliControls] = useState<[number, number]>([0, 1]);

  useEffect(() => {
    setCircuit([]);
    setSelectedGateType(level.gateLevel.allowedGates[0] || 'X');
    setCnotControl(0);
    setToffoliControls([0, 1]);
  }, [level.id]);

  // Handle placing a gate
  const handlePlaceGate = (wire: number, step: number, gateType: GateType) => {
    onRecordInteraction();

    const newGate: PlacedGate = {
      id: `gate_${Date.now()}_${Math.random()}`,
      type: gateType,
      targetWire: wire,
      step,
    };

    if (gateType === 'CNOT') {
      let ctrl = cnotControl;
      if (ctrl === wire) {
        // Pick an alternate wire
        ctrl = wire === 0 ? 1 : 0;
      }
      newGate.controlWires = [ctrl];
    } else if (gateType === 'Toffoli') {
      let c1 = toffoliControls[0];
      let c2 = toffoliControls[1];
      if (c1 === wire || c2 === wire) {
        // Adjust controls
        const available = [0, 1, 2].filter(w => w !== wire);
        c1 = available[0] ?? 0;
        c2 = available[1] ?? 1;
      }
      newGate.controlWires = [c1, c2];
    }

    // Replace if slot already occupied on this wire
    setCircuit(prev => {
      const filtered = prev.filter(g => !(g.targetWire === wire && g.step === step));
      return [...filtered, newGate];
    });
  };

  const handleRemoveGate = (gateId: string) => {
    onRecordInteraction();
    setCircuit(prev => prev.filter(g => g.id !== gateId));
  };

  const handleClearCircuit = () => {
    onRecordInteraction();
    setCircuit([]);
  };

  // Live simulation of current circuit
  const simResult = useMemo(() => {
    return simulateCircuit(circuit, level.gateLevel.numQubits, level.gateLevel.initialBasis);
  }, [circuit, level.gateLevel.numQubits, level.gateLevel.initialBasis]);

  const liveFidelity = useMemo(() => {
    return stateFidelity(simResult.finalState, level.gateLevel.targetState);
  }, [simResult.finalState, level.gateLevel.targetState]);

  // Run evaluation
  const handleRunCircuit = () => {
    const res = evaluateGateLevel({
      circuit,
      level: level.gateLevel,
      hasRun: true,
    });
    onEvaluate(res);
  };

  // Format quantum state amplitudes e.g. "0.707|00⟩ + 0.707|11⟩"
  const stateString = useMemo(() => {
    const n = level.gateLevel.numQubits;
    const parts: string[] = [];
    simResult.finalState.amplitudes.forEach((c, idx) => {
      const magSq = c.re * c.re + c.im * c.im;
      if (magSq > 0.001) {
        const bitStr = idx.toString(2).padStart(n, '0');
        const ampStr = formatComplex(c, 2);
        parts.push(`${ampStr}|${bitStr}⟩`);
      }
    });
    return parts.length > 0 ? parts.join(' + ') : '|0⟩';
  }, [simResult.finalState, level.gateLevel.numQubits]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="game-layout-grid">
        {/* Game Area: Quantum Circuit Canvas */}
        <div className="game-area-container" data-ui-zone="circuit-area">
          <div className="game-area-header">
            <span style={{ fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Cpu size={16} style={{ color: 'var(--accent-blue)' }} />
              Quantum Circuit ({circuit.length} Gate{circuit.length !== 1 ? 's' : ''})
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-blue">Click wire slot to place selected gate</span>
              <button
                className="btn btn-sm"
                onClick={handleClearCircuit}
                disabled={circuit.length === 0}
                title="Clear all gates from circuit"
              >
                <Trash2 size={13} />
                <span>Clear</span>
              </button>
            </div>
          </div>

          <div className="game-area-canvas-wrapper" style={{ padding: '24px' }}>
            <CircuitCanvas
              numQubits={level.gateLevel.numQubits}
              initialBasis={level.gateLevel.initialBasis}
              maxSteps={level.gateLevel.maxSteps}
              circuit={circuit}
              onPlaceGate={handlePlaceGate}
              onRemoveGate={handleRemoveGate}
              selectedGateType={selectedGateType}
            />
          </div>
        </div>

        {/* Control Panel: Gate Palette & Target State */}
        <div className="control-panel-container" data-ui-zone="gate-palette-panel">
          <div className="control-section-header">Gate Palette</div>

          {/* Palette Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {level.gateLevel.allowedGates.map(gateType => {
              const isSelected = selectedGateType === gateType;
              return (
                <button
                  key={gateType}
                  className={`btn ${isSelected ? 'btn-primary' : ''}`}
                  onClick={() => setSelectedGateType(gateType)}
                  style={{
                    minWidth: '56px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    fontSize: '15px',
                  }}
                >
                  [{gateType}]
                </button>
              );
            })}
          </div>

          {/* Controlled Gate Options */}
          {selectedGateType === 'CNOT' && level.gateLevel.numQubits >= 2 && (
            <div
              style={{
                padding: '12px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: '6px' }}>CNOT Control Wire:</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {Array.from({ length: level.gateLevel.numQubits }).map((_, w) => (
                  <button
                    key={w}
                    className={`btn btn-sm ${cnotControl === w ? 'btn-primary' : ''}`}
                    onClick={() => setCnotControl(w)}
                  >
                    Control: Wire {w}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedGateType === 'Toffoli' && level.gateLevel.numQubits >= 3 && (
            <div
              style={{
                padding: '12px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: '6px' }}>Toffoli Control Pair:</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className={`btn btn-sm ${toffoliControls[0] === 0 && toffoliControls[1] === 1 ? 'btn-primary' : ''}`}
                  onClick={() => setToffoliControls([0, 1])}
                >
                  Controls: Q0 & Q1
                </button>
                <button
                  className={`btn btn-sm ${toffoliControls[0] === 1 && toffoliControls[1] === 2 ? 'btn-primary' : ''}`}
                  onClick={() => setToffoliControls([1, 2])}
                >
                  Controls: Q1 & Q2
                </button>
              </div>
            </div>
          )}

          {/* Current State vs Target Box */}
          <div
            style={{
              padding: '14px',
              backgroundColor: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div>
              <span className="metric-label">Target State</span>
              <div className="mono" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--accent-blue)', marginTop: '2px' }}>
                {level.gateLevel.targetDescription}
              </div>
            </div>
            <div>
              <span className="metric-label">Circuit Produced State</span>
              <div className="mono" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginTop: '2px' }}>
                |ψ⟩ = {stateString}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Result Panel */}
      <ResultPanel
        evaluation={evaluation}
        metrics={[
          {
            label: 'State Fidelity',
            value: `${(liveFidelity * 100).toFixed(1)}%`,
            subtext: liveFidelity >= 0.999 ? 'Exact Match (F = 1.0)' : 'Requires F ≥ 99.9%',
            highlight: liveFidelity >= 0.999,
          },
          {
            label: 'Gate Count',
            value: `${circuit.length}`,
            subtext: `Optimal: ${level.gateLevel.optimalGateCount || 2} gates`,
          },
          {
            label: 'Register Size',
            value: `${level.gateLevel.numQubits} Qubit${level.gateLevel.numQubits > 1 ? 's' : ''}`,
            subtext: `Initial: |${level.gateLevel.initialBasis}⟩`,
          },
        ]}
        onSubmitOrRun={handleRunCircuit}
        runButtonLabel="Run Circuit"
        onNextLevel={onNextLevel}
        showNextLevelButton={evaluation.status === 'success'}
      />
    </div>
  );
};
