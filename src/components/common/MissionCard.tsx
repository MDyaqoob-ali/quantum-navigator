import React from 'react';
import { Target, Info, Lightbulb, RotateCcw, HelpCircle } from 'lucide-react';
import { LevelDefinition } from '../../core/types';

export interface MissionTelemetry {
  targetLabel?: string;
  targetValue: string;
  currentLabel?: string;
  currentValue: string;
  errorLabel?: string;
  errorValue: string;
  statusLabel?: string;
  statusValue: string;
  isMatched?: boolean;
}

interface MissionCardProps {
  level: LevelDefinition;
  telemetry?: MissionTelemetry;
  onOpenHint?: () => void;
  onReset?: () => void;
  energy?: number;
  onOpenConceptHelp?: () => void;
}

export const MissionCard: React.FC<MissionCardProps> = ({
  level,
  telemetry,
  onOpenHint,
  onReset,
  energy = 5,
  onOpenConceptHelp,
}) => {
  const getBadgeClass = (diff: string) => {
    switch (diff) {
      case 'Beginner':
        return 'badge-emerald';
      case 'Intermediate':
        return 'badge-blue';
      case 'Advanced':
        return 'badge-amber';
      case 'Expert':
        return 'badge-red';
      default:
        return 'badge-blue';
    }
  };

  return (
    <div className="mission-card" data-ui-zone="mission-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Top row: Title, badge, and quick actions */}
      <div className="mission-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className={`badge ${getBadgeClass(level.difficulty)}`}>
            {level.difficulty}
          </span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
            LEVEL {level.levelNumber.toString().padStart(2, '0')}: {level.title}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            — {level.subtitle}
          </span>
        </div>

        {/* Quick action buttons on card */}
        {(onOpenHint || onReset) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {onOpenHint && (
              <button
                className="btn btn-sm"
                onClick={onOpenHint}
                title="Consume 1 Energy Point for a live puzzle hint"
                style={{
                  fontSize: '11px',
                  padding: '3px 8px',
                  fontWeight: 700,
                  color: energy > 0 ? '#B45309' : 'var(--text-muted)',
                  backgroundColor: energy > 0 ? '#FEF3C7' : 'var(--bg-secondary)',
                  borderColor: energy > 0 ? 'rgba(180, 83, 9, 0.3)' : 'var(--border-subtle)',
                }}
              >
                <Lightbulb size={12} />
                <span>HINT ⚡</span>
              </button>
            )}
            {onReset && (
              <button
                className="btn btn-sm btn-secondary"
                onClick={onReset}
                title="Reset level to initial state"
                style={{ fontSize: '11px', padding: '3px 8px' }}
              >
                <RotateCcw size={12} />
                <span>RESET</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Mission line */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <Target size={16} style={{ color: 'var(--accent-blue)', marginTop: '2px', flexShrink: 0 }} />
        <div className="mission-objective" style={{ fontSize: '13px', lineHeight: 1.4 }}>
          <strong style={{ color: 'var(--text-primary)' }}>MISSION:</strong> {level.description}
        </div>
      </div>

      {/* Standardized Target Hierarchy: TARGET | CURRENT | ERROR | STATUS */}
      {telemetry && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '8px',
            backgroundColor: 'var(--bg-card)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-medium)',
            marginTop: '2px',
          }}
        >
          <div>
            <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {telemetry.targetLabel || 'TARGET'}
            </div>
            <div className="mono" style={{ fontSize: '13px', fontWeight: 700, color: '#15803D' }}>
              {telemetry.targetValue}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {telemetry.currentLabel || 'CURRENT'}
            </div>
            <div className="mono" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {telemetry.currentValue}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {telemetry.errorLabel || 'ERROR'}
            </div>
            <div className="mono" style={{ fontSize: '13px', fontWeight: 700, color: telemetry.isMatched ? '#15803D' : '#D97706' }}>
              {telemetry.errorValue}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {telemetry.statusLabel || 'STATUS'}
            </div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: telemetry.isMatched ? '#15803D' : 'var(--text-muted)' }}>
              {telemetry.isMatched ? '✓ TARGET MATCHED' : telemetry.statusValue || 'KEEP ADJUSTING'}
            </div>
          </div>
        </div>
      )}

      {/* Quantum Concept line */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <Info size={15} style={{ color: 'var(--text-muted)', marginTop: '2px', flexShrink: 0 }} />
          <div className="mission-concept" style={{ fontSize: '12px' }}>
            <strong>Learn:</strong> {level.educationalConcept}
          </div>
        </div>
        {onOpenConceptHelp && (
          <button
            onClick={onOpenConceptHelp}
            title="Read concept explanation (Free - No energy cost)"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--accent-blue)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 600,
            }}
          >
            <HelpCircle size={13} />
            <span>Explain</span>
          </button>
        )}
      </div>
    </div>
  );
};

