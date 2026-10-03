import React from 'react';
import { Target, Info } from 'lucide-react';
import { LevelDefinition } from '../../core/types';

interface MissionCardProps {
  level: LevelDefinition;
}

export const MissionCard: React.FC<MissionCardProps> = ({ level }) => {
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
    <div className="mission-card" data-ui-zone="mission-card">
      <div className="mission-title-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={`badge ${getBadgeClass(level.difficulty)}`}>
            {level.difficulty}
          </span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Level {level.levelNumber}: {level.title}
          </span>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            — {level.subtitle}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '4px' }}>
        <Target size={16} style={{ color: 'var(--accent-blue)', marginTop: '2px', flexShrink: 0 }} />
        <div className="mission-objective">
          <strong>Mission:</strong> {level.description}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '2px' }}>
        <Info size={15} style={{ color: 'var(--text-muted)', marginTop: '2px', flexShrink: 0 }} />
        <div className="mission-concept">
          <strong>Quantum Concept:</strong> {level.educationalConcept}
        </div>
      </div>
    </div>
  );
};
