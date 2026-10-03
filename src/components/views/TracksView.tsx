import React, { useState } from 'react';
import { ACTIVE_TRACKS, getTrackLevels } from '../../core/levels';
import { TrackId, PlayerStats } from '../../core/types';
import { StarRating } from '../common/StarRating';
import { Lock, Check, Play, ArrowLeft } from 'lucide-react';

interface TracksViewProps {
  initialTrackId?: TrackId;
  onSelectLevel: (trackId: TrackId, levelId: string) => void;
  isLevelUnlocked: (trackId: TrackId, levelId: string) => boolean;
  stats: PlayerStats;
}

export const TracksView: React.FC<TracksViewProps> = ({
  initialTrackId = 'bloch-sphere',
  onSelectLevel,
  isLevelUnlocked,
  stats,
}) => {
  const [selectedTrackId, setSelectedTrackId] = useState<TrackId>(initialTrackId);

  const selectedTrackMeta = ACTIVE_TRACKS.find(t => t.id === selectedTrackId)!;
  const levels = getTrackLevels(selectedTrackId);

  return (
    <div className="page-container" data-ui-zone="tracks-view">
      {/* Track Selector Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
        }}
      >
        {ACTIVE_TRACKS.map(t => {
          const isSelected = t.id === selectedTrackId;
          return (
            <button
              key={t.id}
              className={`btn ${isSelected ? 'btn-primary' : ''}`}
              onClick={() => setSelectedTrackId(t.id)}
              style={{ flexShrink: 0 }}
            >
              <span>Track {t.trackNumber}: {t.title}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Track Banner */}
      <div
        style={{
          padding: '24px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <span className="track-number-chip">TRACK 0{selectedTrackMeta.trackNumber}</span>
        <h2 style={{ fontSize: '24px', fontWeight: 800, marginTop: '8px' }}>
          {selectedTrackMeta.title}
        </h2>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          GAME: <strong>{selectedTrackMeta.gameName}</strong> — “{selectedTrackMeta.tagline}”
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '8px', maxWidth: '720px' }}>
          {selectedTrackMeta.description}
        </p>
      </div>

      {/* Level List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Curriculum Levels</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
          {levels.map((lvl, idx) => {
            const isUnlocked = isLevelUnlocked(selectedTrackId, lvl.id);
            const isCompleted = !!stats.completedLevels[`${selectedTrackId}_${lvl.id}`];
            const starCount = stats.levelStars[`${selectedTrackId}_${lvl.id}`] || 0;
            const bestScore = stats.levelScores[`${selectedTrackId}_${lvl.id}`] || 0;

            return (
              <div
                key={lvl.id}
                className="card"
                style={{
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  opacity: isUnlocked ? 1 : 0.6,
                  backgroundColor: isCompleted ? 'var(--bg-card)' : 'var(--bg-card-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="mono" style={{ fontWeight: 700, fontSize: '13px', color: 'var(--accent-blue)' }}>
                      0{lvl.levelNumber}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{lvl.title}</span>
                  </div>
                  {isCompleted ? (
                    <span className="badge badge-emerald">
                      <Check size={12} /> Solved
                    </span>
                  ) : !isUnlocked ? (
                    <span className="badge">
                      <Lock size={12} /> Locked
                    </span>
                  ) : (
                    <span className="badge badge-blue">Unlocked</span>
                  )}
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {lvl.subtitle}
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {lvl.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', marginTop: 'auto' }}>
                  <StarRating stars={starCount} size={15} />
                  {isUnlocked ? (
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => onSelectLevel(selectedTrackId, lvl.id)}
                    >
                      <Play size={12} />
                      <span>{isCompleted ? 'Replay' : 'Play Level'}</span>
                    </button>
                  ) : (
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Solve previous level to unlock</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
