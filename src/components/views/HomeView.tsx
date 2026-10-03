import React from 'react';
import { ACTIVE_TRACKS, getTrackLevels } from '../../core/levels';
import { TrackId, PlayerStats } from '../../core/types';
import { StarRating } from '../common/StarRating';
import {
  Compass,
  Cpu,
  Activity,
  ShieldCheck,
  Radio,
  ArrowRight,
  Sparkles,
  Flame,
  Award,
} from 'lucide-react';

interface HomeViewProps {
  onSelectTrack: (trackId: TrackId) => void;
  onSelectLevel: (trackId: TrackId, levelId: string) => void;
  stats: PlayerStats;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectTrack,
  onSelectLevel,
  stats,
}) => {
  const getTrackIcon = (id: TrackId) => {
    switch (id) {
      case 'bloch-sphere':
        return <Compass size={24} style={{ color: 'var(--vector-red)' }} />;
      case 'quantum-gates':
        return <Cpu size={24} style={{ color: 'var(--accent-blue)' }} />;
      case 'quantum-interference':
        return <Activity size={24} style={{ color: 'var(--accent-teal)' }} />;
      case 'error-correction':
        return <ShieldCheck size={24} style={{ color: 'var(--accent-indigo)' }} />;
      case 'phase-estimation':
        return <Radio size={24} style={{ color: 'var(--accent-amber)' }} />;
    }
  };

  return (
    <div className="page-container" data-ui-zone="home-view">
      {/* Hero Banner */}
      <div
        style={{
          padding: '40px 32px',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '16px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }} className="badge badge-blue">
          <Sparkles size={14} />
          <span>Interactive Quantum Learning Platform</span>
        </div>

        <h1 style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
          QUANTUM NAVIGATOR
        </h1>

        <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '640px', lineHeight: 1.5 }}>
          “Learn Quantum Computing by Playing.” Master qubits, logic gates, interference, error correction, and phase estimation through verified interactive experiments.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '8px' }}>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => onSelectLevel('bloch-sphere', 't1_l1')}
          >
            <span>Play Track 1: Bloch Sphere</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Five Learning Tracks Grid */}
      <div style={{ marginTop: '8px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
          Active Learning Tracks
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
          }}
        >
          {ACTIVE_TRACKS.map(track => {
            const levels = getTrackLevels(track.id);
            const completedCount = levels.filter(
              l => !!stats.completedLevels[`${track.id}_${l.id}`]
            ).length;
            const progressPercent = Math.round((completedCount / levels.length) * 100);

            // Compute total stars for track
            let trackStars = 0;
            levels.forEach(l => {
              trackStars += stats.levelStars[`${track.id}_${l.id}`] || 0;
            });

            return (
              <div
                key={track.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '20px',
                  gap: '14px',
                  cursor: 'pointer',
                  borderTop: `4px solid ${track.color}`,
                }}
                onClick={() => onSelectTrack(track.id)}
              >
                {/* Track Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {getTrackIcon(track.id)}
                  </div>
                  <span className="track-number-chip">0{track.trackNumber}</span>
                </div>

                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 700 }}>{track.title}</h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    GAME: <strong>{track.gameName}</strong>
                  </div>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.45, flex: 1 }}>
                  {track.description}
                </p>

                {/* Progress bar & Stars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Progress: {completedCount}/{levels.length}</span>
                    <span className="mono" style={{ fontWeight: 600 }}>{progressPercent}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: track.color }} />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                  <StarRating stars={trackStars > 0 ? Math.min(5, Math.ceil(trackStars / levels.length)) : 0} size={15} />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-blue)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    Explore <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
