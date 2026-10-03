import React from 'react';
import { RotateCcw, Lightbulb, BookOpen, Check } from 'lucide-react';
import { TrackMetadata, getTrackLevels } from '../../core/levels';
import { TrackId, PlayerStats } from '../../core/types';

interface TrackHeaderProps {
  trackMeta: TrackMetadata;
  activeLevelId: string;
  onSelectLevel: (trackId: TrackId, levelId: string) => void;
  isLevelUnlocked: (trackId: TrackId, levelId: string) => boolean;
  stats: PlayerStats;
  onReset: () => void;
  onOpenHint: () => void;
  onToggleTutorial: () => void;
}

export const TrackHeader: React.FC<TrackHeaderProps> = ({
  trackMeta,
  activeLevelId,
  onSelectLevel,
  isLevelUnlocked,
  stats,
  onReset,
  onOpenHint,
  onToggleTutorial,
}) => {
  const levels = getTrackLevels(trackMeta.id);

  return (
    <div className="track-header-bar" data-ui-zone="track-header">
      {/* Left: Track Information */}
      <div className="track-header-left">
        <span className="track-number-chip">TRACK {trackMeta.trackNumber}</span>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>
            {trackMeta.title}
          </h2>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            GAME: <strong>{trackMeta.gameName}</strong> — “{trackMeta.tagline}”
          </div>
        </div>
      </div>

      {/* Middle: Level Selection Chips */}
      <div className="level-select-bar">
        {levels.map((lvl, index) => {
          const isCurrent = lvl.id === activeLevelId;
          const isUnlocked = isLevelUnlocked(trackMeta.id, lvl.id);
          const isDone = !!stats.completedLevels[`${trackMeta.id}_${lvl.id}`];

          return (
            <button
              key={lvl.id}
              className={`level-chip-btn ${isCurrent ? 'active' : ''} ${isDone ? 'completed' : ''}`}
              disabled={!isUnlocked}
              onClick={() => onSelectLevel(trackMeta.id, lvl.id)}
              title={`${lvl.title} (${isUnlocked ? (isDone ? 'Completed' : 'Unlocked') : 'Locked'})`}
            >
              {isDone ? <Check size={14} strokeWidth={3} /> : index + 1}
            </button>
          );
        })}
      </div>

      {/* Right: Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          className="btn btn-sm btn-secondary"
          onClick={onToggleTutorial}
          title="Track Introduction, Rules & Interactive Walkthrough"
          style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <BookOpen size={14} />
          <span>? How To Play</span>
        </button>

        <button
          className="btn btn-sm"
          onClick={onOpenHint}
          title="Use 1 Quantum Energy point for a state-aware hint"
          style={{
            color: stats.quantumEnergy > 0 ? '#B45309' : 'var(--text-muted)',
            borderColor: stats.quantumEnergy > 0 ? 'rgba(180, 83, 9, 0.3)' : 'var(--border-subtle)',
            backgroundColor: stats.quantumEnergy > 0 ? '#FEF3C7' : 'var(--bg-secondary)',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          <Lightbulb size={14} />
          <span>HINT ⚡</span>
        </button>

        <button
          className="btn btn-sm"
          onClick={onReset}
          title="Reset current level state"
        >
          <RotateCcw size={14} />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};
