// Track 4 — Quantum Tunneling: Tunnel Run Main Game Component
// A real interactive quantum tunneling puzzle matching Schrödinger transmission models.

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { EvaluationResult } from '../../../core/types';
import type { TunnelLevelConfig } from '../../../core/levels/track4Levels';
import {
  calculateTunneling,
  evaluateTunnelingLevel,
  sampleBinomialExperiment,
  calculateKappa,
  BarrierConfig,
  TunnelingState,
} from '../../../core/engines/tunnelingEngine';
import { TunnelCanvas } from './TunnelCanvas';
import { soundEngine } from '../../../core/audio/soundEngine';
import {
  Sparkles,
  RotateCcw,
  Zap,
  HelpCircle,
  Play,
  Clock,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Layers,
  Activity,
  ArrowRight,
} from 'lucide-react';

interface Track4GameProps {
  level: TunnelLevelConfig;
  evaluation: EvaluationResult;
  onEvaluate: (result: EvaluationResult) => void;
  onRecordInteraction: () => void;
  onNextLevel: () => void;
  onOpenComponentHelp?: (componentId: string) => void;
}

export const Track4Game: React.FC<Track4GameProps> = ({
  level,
  evaluation,
  onEvaluate,
  onRecordInteraction,
  onNextLevel,
  onOpenComponentHelp,
}) => {
  const tunnelConfig = level.tunnelingLevel;

  // Local state initialized to level.initialState
  const [gameState, setGameState] = useState<TunnelingState>(() => ({
    particleEnergy: tunnelConfig.initialState.particleEnergy,
    barriers: tunnelConfig.initialState.barriers.map(b => ({ ...b })),
    selectedBarrierIndex: 0,
    isOverBarrierAllowed: tunnelConfig.isOverBarrierAllowed,
  }));

  const [viewMode, setViewMode] = useState<'quantum' | 'classical'>('quantum');
  const [movesCount, setMovesCount] = useState<number>(0);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    tunnelConfig.timeLimit || null
  );

  // Experiment mode modal/drawer
  const [experimentData, setExperimentData] = useState<{
    isOpen: boolean;
    trials: number;
    transmitted: number;
    reflected: number;
    theoreticalRate: number;
    observedRate: number;
  } | null>(null);

  // Reset when level changes
  useEffect(() => {
    setGameState({
      particleEnergy: tunnelConfig.initialState.particleEnergy,
      barriers: tunnelConfig.initialState.barriers.map(b => ({ ...b })),
      selectedBarrierIndex: 0,
      isOverBarrierAllowed: tunnelConfig.isOverBarrierAllowed,
    });
    setMovesCount(0);
    setHasInteracted(false);
    setTimeRemaining(tunnelConfig.timeLimit || null);
    setExperimentData(null);
  }, [level.id, tunnelConfig]);

  // Level Countdown Timer (for Level 10 or timed challenges)
  useEffect(() => {
    if (tunnelConfig.timeLimit && timeRemaining !== null && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [tunnelConfig.timeLimit, timeRemaining]);

  // Compute live physics transmission result
  const transmissionResult = useMemo(() => {
    return calculateTunneling(gameState);
  }, [gameState]);

  const currentT = transmissionResult.transmission;
  const targetT = tunnelConfig.targetTransmission;
  const tol = tunnelConfig.targetTolerance;
  const errorDelta = Math.abs(currentT - targetT);
  const isTargetMatched = errorDelta <= tol;

  // Primary barrier decay constant κ
  const primaryBarrier = gameState.barriers[0];
  const primaryKappa = useMemo(() => {
    return calculateKappa(gameState.particleEnergy, primaryBarrier?.height || 1.0);
  }, [gameState.particleEnergy, primaryBarrier?.height]);

  // Evaluate whenever state changes
  const runEvaluation = useCallback(
    (stateToEvaluate: TunnelingState, moves: number, interacted: boolean) => {
      const evalResult = evaluateTunnelingLevel(
        stateToEvaluate,
        tunnelConfig,
        moves,
        interacted
      );

      // Map to global EvaluationResult
      onEvaluate({
        status: evalResult.status,
        score: evalResult.score,
        progress: evalResult.progress,
        feedback: evalResult.feedback,
        details: {
          currentTransmission: evalResult.details.currentTransmission,
          targetTransmission: evalResult.details.targetTransmission,
          tolerance: evalResult.details.tolerance,
          error: evalResult.details.errorDelta,
          regime: evalResult.details.regime,
          particleEnergy: stateToEvaluate.particleEnergy,
          barrierCount: stateToEvaluate.barriers.length,
          movesUsed: moves,
        },
      });

      if (evalResult.status === 'success') {
        soundEngine.playSuccess();
      }
    },
    [tunnelConfig, onEvaluate]
  );

  // Slider change handler for Particle Energy
  const handleEnergyChange = (newEnergy: number) => {
    onRecordInteraction();
    soundEngine.playDragTick();
    setHasInteracted(true);
    const newMoves = movesCount + 1;
    setMovesCount(newMoves);

    // Limit energy below minimum barrier height if tunneling level
    const minHeight = Math.min(...gameState.barriers.map(b => b.height));
    let clampedEnergy = newEnergy;
    if (!tunnelConfig.isOverBarrierAllowed && clampedEnergy >= minHeight) {
      clampedEnergy = Math.max(0.1, minHeight - 0.01);
    }

    const nextState: TunnelingState = {
      ...gameState,
      particleEnergy: clampedEnergy,
    };
    setGameState(nextState);
    runEvaluation(nextState, newMoves, true);
  };

  // Slider change handler for Barrier Width
  const handleBarrierWidthChange = (barrierIndex: number, newWidth: number) => {
    onRecordInteraction();
    soundEngine.playDragTick();
    setHasInteracted(true);
    const newMoves = movesCount + 1;
    setMovesCount(newMoves);

    const updatedBarriers = gameState.barriers.map((b, idx) =>
      idx === barrierIndex ? { ...b, width: Math.max(0.1, newWidth) } : b
    );

    const nextState: TunnelingState = {
      ...gameState,
      barriers: updatedBarriers,
    };
    setGameState(nextState);
    runEvaluation(nextState, newMoves, true);
  };

  // Slider change handler for Barrier Height
  const handleBarrierHeightChange = (barrierIndex: number, newHeight: number) => {
    onRecordInteraction();
    soundEngine.playDragTick();
    setHasInteracted(true);
    const newMoves = movesCount + 1;
    setMovesCount(newMoves);

    const updatedBarriers = gameState.barriers.map((b, idx) =>
      idx === barrierIndex ? { ...b, height: Math.max(0.2, newHeight) } : b
    );

    // If new barrier height drops below current particle energy and tunneling mode is strict
    let updatedEnergy = gameState.particleEnergy;
    const minHeight = Math.min(...updatedBarriers.map(b => b.height));
    if (!tunnelConfig.isOverBarrierAllowed && updatedEnergy >= minHeight) {
      updatedEnergy = Math.max(0.1, minHeight - 0.01);
    }

    const nextState: TunnelingState = {
      ...gameState,
      particleEnergy: updatedEnergy,
      barriers: updatedBarriers,
    };
    setGameState(nextState);
    runEvaluation(nextState, newMoves, true);
  };

  // Reset current level
  const handleReset = () => {
    soundEngine.playReset();
    const initialState: TunnelingState = {
      particleEnergy: tunnelConfig.initialState.particleEnergy,
      barriers: tunnelConfig.initialState.barriers.map(b => ({ ...b })),
      selectedBarrierIndex: 0,
      isOverBarrierAllowed: tunnelConfig.isOverBarrierAllowed,
    };
    setGameState(initialState);
    setMovesCount(0);
    setHasInteracted(false);
    setTimeRemaining(tunnelConfig.timeLimit || null);
    setExperimentData(null);
    runEvaluation(initialState, 0, false);
  };

  // Run Binomial Experiment (100 trials)
  const handleRunExperiment = () => {
    soundEngine.playResonanceSweep();
    const sample = sampleBinomialExperiment(currentT, 100);
    setExperimentData({
      isOpen: true,
      trials: sample.trials,
      transmitted: sample.transmitted,
      reflected: sample.reflected,
      theoreticalRate: currentT,
      observedRate: sample.observedRate,
    });
    // Trigger verification evaluation
    runEvaluation(gameState, movesCount, true);
  };

  const openHelp = (id: string) => {
    if (onOpenComponentHelp) {
      onOpenComponentHelp(id);
    }
  };

  return (
    <div className="tunnel-game-root" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* TOP TARGET / MISSION CARD (Always Visible) */}
      <div
        className="card"
        style={{
          border: isTargetMatched ? '2px solid #10B981' : '1px solid var(--border-color)',
          backgroundColor: isTargetMatched ? '#F0FDF4' : '#FFFFFF',
          transition: 'border-color 0.3s ease, background-color 0.3s ease',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-purple" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Zap size={12} /> LEVEL {level.levelNumber}: {level.title.toUpperCase()}
              </span>
              <button
                type="button"
                className="btn-icon-sm"
                onClick={() => openHelp('target-probability')}
                title="Target Probability explanation"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <HelpCircle size={14} />
              </button>
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>
              Mission: Reach Target Transmission Probability
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              {level.description}
            </p>
          </div>

          {/* Constraints Indicators (Moves & Timer) */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {tunnelConfig.allowedMoves && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  backgroundColor: movesCount > tunnelConfig.allowedMoves ? '#FEE2E2' : '#F1F5F9',
                  color: movesCount > tunnelConfig.allowedMoves ? '#DC2626' : '#475569',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                <Sliders size={14} />
                <span>Moves: {movesCount} / {tunnelConfig.allowedMoves}</span>
              </div>
            )}

            {timeRemaining !== null && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  backgroundColor: timeRemaining < 15 ? '#FEE2E2' : '#F1F5F9',
                  color: timeRemaining < 15 ? '#DC2626' : '#475569',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                <Clock size={14} />
                <span>Timer: {timeRemaining}s</span>
              </div>
            )}
          </div>
        </div>

        {/* COMPARISON METERS: TARGET VS CURRENT */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            padding: '14px',
            backgroundColor: 'var(--bg-warm)',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
          }}
        >
          {/* Target Card Column */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748B', letterSpacing: '0.05em' }}>
                TARGET TRANSMISSION
              </span>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#7C3AED' }}>
                {(targetT * 100).toFixed(0)}% ± {(tol * 100).toFixed(0)}%
              </span>
            </div>
            {/* Visual target range meter */}
            <div
              style={{
                height: '14px',
                width: '100%',
                backgroundColor: '#E2E8F0',
                borderRadius: '7px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Target range highlight */}
              <div
                style={{
                  position: 'absolute',
                  left: `${Math.max(0, (targetT - tol) * 100)}%`,
                  width: `${tol * 2 * 100}%`,
                  height: '100%',
                  backgroundColor: 'rgba(124, 58, 237, 0.4)',
                  borderLeft: '1px solid #7C3AED',
                  borderRight: '1px solid #7C3AED',
                }}
              />
              {/* Center target indicator */}
              <div
                style={{
                  position: 'absolute',
                  left: `${targetT * 100}%`,
                  width: '2px',
                  height: '100%',
                  backgroundColor: '#6D28D9',
                }}
              />
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
              Acceptable Window: {((targetT - tol) * 100).toFixed(0)}% – {((targetT + tol) * 100).toFixed(0)}%
            </div>
          </div>

          {/* Current Probability Column */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748B', letterSpacing: '0.05em' }}>
                CURRENT PROBABILITY (LIVE)
              </span>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: isTargetMatched ? '#10B981' : '#0284C7',
                }}
              >
                {(currentT * 100).toFixed(1)}%
              </span>
            </div>
            {/* Live progress meter */}
            <div
              style={{
                height: '14px',
                width: '100%',
                backgroundColor: '#E2E8F0',
                borderRadius: '7px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(100, currentT * 100)}%`,
                  backgroundColor: isTargetMatched ? '#10B981' : '#0284C7',
                  transition: 'width 0.15s ease-out, background-color 0.2s ease',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '4px' }}>
              <span style={{ color: '#64748B' }}>
                Error: {(errorDelta * 100).toFixed(1)} pp
              </span>
              <span
                style={{
                  fontWeight: 'bold',
                  color: isTargetMatched ? '#10B981' : '#EA580C',
                }}
              >
                {isTargetMatched ? '✓ TARGET MATCHED' : 'KEEP ADJUSTING'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKSPACE: SIMULATION CANVAS + CONTROLS PANEL */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.4fr) minmax(280px, 1fr)', gap: '16px' }}>
        {/* LEFT COLUMN: SIMULATION CANVAS */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', margin: 0, color: 'var(--text-primary)' }}>
                Quantum Potential Simulator
              </h3>
              <button
                type="button"
                className="btn-icon-sm"
                onClick={() => openHelp('particle')}
                title="Particle & Barrier help"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <HelpCircle size={14} />
              </button>
            </div>

            {/* Classical vs Quantum Toggle */}
            <div
              style={{
                display: 'inline-flex',
                backgroundColor: '#F1F5F9',
                borderRadius: '6px',
                padding: '2px',
                border: '1px solid #E2E8F0',
              }}
            >
              <button
                type="button"
                onClick={() => setViewMode('quantum')}
                style={{
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 600,
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: viewMode === 'quantum' ? '#FFFFFF' : 'transparent',
                  color: viewMode === 'quantum' ? '#7C3AED' : '#64748B',
                  boxShadow: viewMode === 'quantum' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                Quantum View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('classical')}
                style={{
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 600,
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: viewMode === 'classical' ? '#FFFFFF' : 'transparent',
                  color: viewMode === 'classical' ? '#DC2626' : '#64748B',
                  boxShadow: viewMode === 'classical' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                Classical View
              </button>
            </div>
          </div>

          {/* Interactive Visual Canvas */}
          <TunnelCanvas
            particleEnergy={gameState.particleEnergy}
            barriers={gameState.barriers}
            transmissionResult={transmissionResult}
            viewMode={viewMode}
            isResonant={transmissionResult.isResonant}
          />

          {/* LIVE PHYSICS PARAMETERS BAR */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
              gap: '8px',
              padding: '10px',
              backgroundColor: '#F8FAFC',
              borderRadius: '6px',
              border: '1px solid #E2E8F0',
              textAlign: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 600 }}>PARTICLE ENERGY (E)</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0284C7' }}>
                {gameState.particleEnergy.toFixed(2)}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 600 }}>BARRIER HEIGHT (V₀)</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#7C3AED' }}>
                {primaryBarrier?.height.toFixed(2)}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 600 }}>BARRIER WIDTH (a)</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#8B5CF6' }}>
                {primaryBarrier?.width.toFixed(2)}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 600 }}>DECAY CONSTANT (κ)</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#475569' }}>
                {primaryKappa.toFixed(3)}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 600 }}>TRANSMISSION (T)</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: isTargetMatched ? '#10B981' : '#0F172A' }}>
                {(currentT * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          <div style={{ fontSize: '11px', color: '#64748B', fontStyle: 'italic', textAlign: 'center' }}>
            Visualization represents probability amplitude ψ(x). Energy and dimensions are normalized (m = 1, ħ = 1).
          </div>
        </div>

        {/* RIGHT COLUMN: PARAMETER ADJUSTMENT CONTROLS */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', margin: 0, color: 'var(--text-primary)' }}>
              Physical Controls
            </h3>
            <span style={{ fontSize: '12px', color: '#64748B' }}>
              Drag sliders to tune system
            </span>
          </div>

          {/* 1. Particle Energy Slider */}
          <div
            style={{
              padding: '12px',
              backgroundColor: tunnelConfig.adjustableEnergy ? '#F0F9FF' : '#F8FAFC',
              borderRadius: '8px',
              border: tunnelConfig.adjustableEnergy ? '1px solid #BAE6FD' : '1px solid #E2E8F0',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#0369A1' }}>
                  Particle Energy (E)
                </span>
                <button
                  type="button"
                  className="btn-icon-sm"
                  onClick={() => openHelp('particle-energy')}
                  title="Particle Energy explanation"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0284C7' }}
                >
                  <HelpCircle size={14} />
                </button>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#0369A1' }}>
                {gameState.particleEnergy.toFixed(2)}
              </span>
            </div>

            <input
              type="range"
              min={tunnelConfig.energyRange.min}
              max={tunnelConfig.energyRange.max}
              step={0.01}
              value={gameState.particleEnergy}
              disabled={!tunnelConfig.adjustableEnergy}
              onChange={e => handleEnergyChange(parseFloat(e.target.value))}
              style={{
                width: '100%',
                cursor: tunnelConfig.adjustableEnergy ? 'grab' : 'not-allowed',
                accentColor: '#0284C7',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748B', marginTop: '4px' }}>
              <span>Min: {tunnelConfig.energyRange.min.toFixed(2)}</span>
              <span>
                {tunnelConfig.adjustableEnergy ? 'Adjustable' : 'Fixed for this Level'}
              </span>
              <span>Max: {tunnelConfig.energyRange.max.toFixed(2)}</span>
            </div>
          </div>

          {/* 2. Barrier Parameters (Height & Width for each barrier) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {gameState.barriers.map((barrier, bIdx) => (
              <div
                key={barrier.id || bIdx}
                style={{
                  padding: '12px',
                  backgroundColor: '#FAF5FF',
                  borderRadius: '8px',
                  border: '1px solid #E9D5FF',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#6D28D9' }}>
                    Barrier {gameState.barriers.length > 1 ? `${bIdx + 1}` : ''}
                  </span>
                  <span style={{ fontSize: '11px', color: '#7C3AED' }}>
                    V₀ = {barrier.height.toFixed(2)} | a = {barrier.width.toFixed(2)}
                  </span>
                </div>

                {/* Barrier Height Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#581C87', fontWeight: 600 }}>
                        Height (V₀)
                      </span>
                      <button
                        type="button"
                        className="btn-icon-sm"
                        onClick={() => openHelp('barrier-height')}
                        title="Barrier Height explanation"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7C3AED' }}
                      >
                        <HelpCircle size={13} />
                      </button>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#6D28D9' }}>
                      {barrier.height.toFixed(2)}
                    </span>
                  </div>

                  <input
                    type="range"
                    min={barrier.minHeight ?? 0.5}
                    max={barrier.maxHeight ?? 2.5}
                    step={0.01}
                    value={barrier.height}
                    disabled={!barrier.adjustableHeight}
                    onChange={e => handleBarrierHeightChange(bIdx, parseFloat(e.target.value))}
                    style={{
                      width: '100%',
                      cursor: barrier.adjustableHeight ? 'grab' : 'not-allowed',
                      accentColor: '#7C3AED',
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#7C3AED' }}>
                    <span>{(barrier.minHeight ?? 0.5).toFixed(2)}</span>
                    <span>{barrier.adjustableHeight ? 'Adjustable' : 'Fixed'}</span>
                    <span>{(barrier.maxHeight ?? 2.5).toFixed(2)}</span>
                  </div>
                </div>

                {/* Barrier Width Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#581C87', fontWeight: 600 }}>
                        Width (a)
                      </span>
                      <button
                        type="button"
                        className="btn-icon-sm"
                        onClick={() => openHelp('barrier-width')}
                        title="Barrier Width explanation"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7C3AED' }}
                      >
                        <HelpCircle size={13} />
                      </button>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#6D28D9' }}>
                      {barrier.width.toFixed(2)}
                    </span>
                  </div>

                  <input
                    type="range"
                    min={barrier.minWidth ?? 0.2}
                    max={barrier.maxWidth ?? 2.0}
                    step={0.01}
                    value={barrier.width}
                    disabled={!barrier.adjustableWidth}
                    onChange={e => handleBarrierWidthChange(bIdx, parseFloat(e.target.value))}
                    style={{
                      width: '100%',
                      cursor: barrier.adjustableWidth ? 'grab' : 'not-allowed',
                      accentColor: '#8B5CF6',
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#7C3AED' }}>
                    <span>{(barrier.minWidth ?? 0.2).toFixed(2)}</span>
                    <span>{barrier.adjustableWidth ? 'Adjustable' : 'Fixed'}</span>
                    <span>{(barrier.maxWidth ?? 2.0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ACTION BUTTONS: RESET, RUN EXPERIMENT, NEXT LEVEL */}
          <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleReset}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <RotateCcw size={14} /> Reset
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleRunExperiment}
              style={{
                flex: 1.6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                backgroundColor: isTargetMatched ? '#10B981' : '#7C3AED',
                borderColor: isTargetMatched ? '#059669' : '#6D28D9',
              }}
            >
              <Play size={14} /> Run Experiment
            </button>
          </div>

          {isTargetMatched && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={onNextLevel}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                backgroundColor: '#10B981',
                borderColor: '#059669',
                padding: '10px',
                fontWeight: 'bold',
              }}
            >
              Proceed to Next Level <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>

      {/* EXPERIMENTAL RUN RESULTS CARD (When Experiment is Run) */}
      {experimentData && experimentData.isOpen && (
        <div
          className="card"
          style={{
            border: '1px solid #CBD5E1',
            backgroundColor: '#F8FAFC',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-teal">EXPERIMENT RESULTS</span>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                100 Simulated Quantum Particles
              </span>
            </div>
            <button
              type="button"
              onClick={() => setExperimentData(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', fontSize: '13px' }}
            >
              Dismiss
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              padding: '12px',
              backgroundColor: '#FFFFFF',
              borderRadius: '6px',
              border: '1px solid #E2E8F0',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>THEORETICAL PROBABILITY</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#7C3AED' }}>
                {(experimentData.theoreticalRate * 100).toFixed(1)}%
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>OBSERVED TRANSMISSION</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10B981' }}>
                {experimentData.transmitted} / {experimentData.trials} ({ (experimentData.observedRate * 100).toFixed(0) }%)
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>OBSERVED REFLECTION</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#DC2626' }}>
                {experimentData.reflected} / {experimentData.trials} ({ ((1 - experimentData.observedRate) * 100).toFixed(0) }%)
              </div>
            </div>
          </div>

          <p style={{ fontSize: '12px', color: '#475569', margin: '8px 0 0 0' }}>
            <strong>Scientific Insight:</strong> Individual quantum trials are probabilistic. The observed experimental frequency ({ (experimentData.observedRate * 100).toFixed(0) }%) fluctuates naturally around the calculated theoretical transmission probability ({ (experimentData.theoreticalRate * 100).toFixed(1) }%).
          </p>
        </div>
      )}
    </div>
  );
};
