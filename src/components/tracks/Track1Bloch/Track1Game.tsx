import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BlochLevelConfig } from '../../../core/levels/track1Levels';
import {
  BlochSphereState,
  calculateBlochResultant,
  evaluateBlochLevel,
} from '../../../core/engines/blochEngine';
import { EvaluationResult } from '../../../core/types';
import { BlochCanvas } from './BlochCanvas';
import { ResultPanel } from '../../common/ResultPanel';
import {
  sphericalToCartesian,
  cartesianToSpherical,
  angularDistanceDegrees,
  blochProbabilities,
} from '../../../core/math/vector3';

interface Track1GameProps {
  level: BlochLevelConfig;
  evaluation: EvaluationResult;
  onEvaluate: (result: EvaluationResult) => void;
  onRecordInteraction: () => void;
  onNextLevel: () => void;
}

export const Track1Game: React.FC<Track1GameProps> = ({
  level,
  evaluation,
  onEvaluate,
  onRecordInteraction,
  onNextLevel,
}) => {
  // Local state for player spheres
  const [currentSpheres, setCurrentSpheres] = useState<BlochSphereState[]>(() =>
    level.initialSpheres.map(s => ({ ...s }))
  );
  const [hasInteracted, setHasInteracted] = useState(false);

  // Synchronize when level changes
  useEffect(() => {
    setCurrentSpheres(level.initialSpheres.map(s => ({ ...s })));
    setHasInteracted(false);
  }, [level.id]);

  // Handle dragging a sphere
  const handleSphereChange = useCallback(
    (index: number, newTheta: number, newPhi: number) => {
      onRecordInteraction();
      setHasInteracted(true);
      setCurrentSpheres(prev => {
        const next = [...prev];
        next[index] = { ...next[index], theta: newTheta, phi: newPhi };
        return next;
      });
    },
    [onRecordInteraction]
  );

  // Compute live resultant and angular distance
  const liveResultant = useMemo(() => {
    return calculateBlochResultant(currentSpheres);
  }, [currentSpheres]);

  const targetCartesian = useMemo(() => {
    return sphericalToCartesian(level.targetTheta, level.targetPhi);
  }, [level.targetTheta, level.targetPhi]);

  const liveAngularError = useMemo(() => {
    return angularDistanceDegrees(liveResultant, targetCartesian);
  }, [liveResultant, targetCartesian]);

  const resultantSpherical = useMemo(() => {
    return cartesianToSpherical(liveResultant);
  }, [liveResultant]);

  const resultantProbs = useMemo(() => {
    return blochProbabilities(liveResultant);
  }, [liveResultant]);

  // Run evaluation
  const handleVerify = () => {
    const res = evaluateBlochLevel({
      currentSpheres,
      initialSpheres: level.initialSpheres,
      targetTheta: level.targetTheta,
      targetPhi: level.targetPhi,
      toleranceDegrees: level.toleranceDegrees,
      hasInteracted,
    });
    onEvaluate(res);
  };

  // Determine grid class based on sphere count
  const getGridClass = () => {
    switch (currentSpheres.length) {
      case 1:
        return 'bloch-grid-1';
      case 2:
        return 'bloch-grid-2';
      case 3:
        return 'bloch-grid-3';
      case 4:
        return 'bloch-grid-4';
      default:
        return 'bloch-grid-1';
    }
  };

  const sphereSize = currentSpheres.length >= 3 ? 240 : 280;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Primary Layout Grid */}
      <div className="game-layout-grid">
        {/* Game Area: Player Bloch Spheres */}
        <div className="game-area-container" data-ui-zone="bloch-spheres-area">
          <div className="game-area-header">
            <span style={{ fontSize: '14px', fontWeight: 600 }}>
              Active Qubit State Vectors ({currentSpheres.length} Sphere{currentSpheres.length > 1 ? 's' : ''})
            </span>
            <span className="badge badge-red">
              Drag endpoints (↻) on movable spheres
            </span>
          </div>

          <div className="game-area-canvas-wrapper">
            <div className={`bloch-multi-sphere-grid ${getGridClass()}`}>
              {currentSpheres.map((sphere, index) => (
                <BlochCanvas
                  key={sphere.id}
                  id={sphere.id}
                  name={sphere.name}
                  theta={sphere.theta}
                  phi={sphere.phi}
                  isFixed={sphere.isFixed}
                  size={sphereSize}
                  onChange={(th, ph) => handleSphereChange(index, th, ph)}
                  accentColor="#D32F2F"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Control & Target Comparison Panel */}
        <div className="control-panel-container" data-ui-zone="bloch-target-panel">
          <div className="control-section-header">
            Target Alignment & Resultant Synthesis
          </div>

          {/* Target & Resultant Previews Side-by-Side */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '12px',
              justifyItems: 'center',
            }}
          >
            <BlochCanvas
              id="target-sphere"
              name="Required Target"
              theta={level.targetTheta}
              phi={level.targetPhi}
              isTarget={true}
              size={200}
              accentColor="#1D5E99"
            />
            <BlochCanvas
              id="resultant-sphere"
              name="Combined Resultant"
              theta={resultantSpherical.theta}
              phi={resultantSpherical.phi}
              isFixed={true}
              size={200}
              accentColor="#D32F2F"
            />
          </div>

          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              fontSize: '12px',
              color: 'var(--text-secondary)',
            }}
          >
            <strong>Resultant Vector — Game Puzzle Rule:</strong>
            <div className="mono" style={{ marginTop: '2px', color: 'var(--text-primary)' }}>
              R = normalize(Σ w_i · r_i)
            </div>
            <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
              Rotates in real-time as you manipulate any movable vector.
            </div>
          </div>
        </div>
      </div>

      {/* Result & Evaluation Metrics */}
      <ResultPanel
        evaluation={evaluation}
        metrics={[
          {
            label: 'Angular Error',
            value: `${liveAngularError.toFixed(1)}°`,
            subtext: `Tolerance: ±${level.toleranceDegrees}°`,
            highlight: liveAngularError <= level.toleranceDegrees,
          },
          {
            label: 'Resultant Direction',
            value: `θ: ${((resultantSpherical.theta * 180) / Math.PI).toFixed(0)}°, φ: ${((resultantSpherical.phi * 180) / Math.PI).toFixed(0)}°`,
            subtext: `Target: ${((level.targetTheta * 180) / Math.PI).toFixed(0)}°, ${((level.targetPhi * 180) / Math.PI).toFixed(0)}°`,
          },
          {
            label: 'P(|0⟩) Probability',
            value: `${(resultantProbs.p0 * 100).toFixed(1)}%`,
            subtext: `P(|1⟩): ${(resultantProbs.p1 * 100).toFixed(1)}%`,
          },
        ]}
        onSubmitOrRun={handleVerify}
        runButtonLabel="Verify Alignment"
        onNextLevel={onNextLevel}
        showNextLevelButton={evaluation.status === 'success'}
      />
    </div>
  );
};
