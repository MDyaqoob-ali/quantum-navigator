import React from 'react';
import { ACTIVE_TRACKS, getTrackLevels } from '../../core/levels';
import { PlayerStats } from '../../core/types';
import { calculatePlayerLevel } from '../../core/gamification/scoringEngine';
import { StarRating } from '../common/StarRating';
import { Award, Star, CheckCircle, BarChart3 } from 'lucide-react';

interface ProgressViewProps {
  stats: PlayerStats;
}

export const ProgressView: React.FC<ProgressViewProps> = ({ stats }) => {
  const levelInfo = calculatePlayerLevel(stats.xp);

  let totalLevelsInGame = 0;
  ACTIVE_TRACKS.forEach(t => {
    totalLevelsInGame += getTrackLevels(t.id).length;
  });

  const totalCompleted = Object.values(stats.completedLevels).filter(Boolean).length;
  const overallPercent = Math.round((totalCompleted / totalLevelsInGame) * 100);

  return (
    <div className="page-container" data-ui-zone="progress-view">
      <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Player Quantum Mastery</h2>

      {/* Overview Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-blue)' }}>
            <Award size={18} />
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Player Rank</span>
          </div>
          <div className="mono" style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px' }}>
            Level {levelInfo.currentLevel}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {levelInfo.currentXp} / {levelInfo.xpForNext} XP to Next Rank
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#D97706' }}>
            <Star size={18} />
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Total Stars Earned</span>
          </div>
          <div className="mono" style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px', color: '#B45309' }}>
            {stats.totalStars}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Across all 5 learning tracks
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-emerald)' }}>
            <CheckCircle size={18} />
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Levels Completed</span>
          </div>
          <div className="mono" style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px', color: '#15803D' }}>
            {totalCompleted} / {totalLevelsInGame}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {overallPercent}% Curriculum Completion
          </div>
        </div>
      </div>

      {/* Track by Track Breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Track Progression Breakdown</h3>

        {ACTIVE_TRACKS.map(track => {
          const trackLevels = getTrackLevels(track.id);
          const completedInTrack = trackLevels.filter(
            l => !!stats.completedLevels[`${track.id}_${l.id}`]
          ).length;
          const trackPct = Math.round((completedInTrack / trackLevels.length) * 100);

          let starsInTrack = 0;
          trackLevels.forEach(l => {
            starsInTrack += stats.levelStars[`${track.id}_${l.id}`] || 0;
          });

          return (
            <div
              key={track.id}
              className="card"
              style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span className="track-number-chip">TRACK 0{track.trackNumber}</span>
                  <strong style={{ fontSize: '16px', marginLeft: '10px' }}>{track.title}</strong>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                    ({track.gameName})
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <StarRating stars={starsInTrack > 0 ? Math.min(5, Math.ceil(starsInTrack / trackLevels.length)) : 0} size={16} />
                  <span className="mono" style={{ fontWeight: 700, fontSize: '14px' }}>
                    {completedInTrack} / {trackLevels.length} Completed
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ width: `${trackPct}%`, height: '100%', backgroundColor: track.color, transition: 'width 0.3s ease' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
